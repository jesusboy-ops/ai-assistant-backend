const Bull = require('bull');
const LifeObligationsService = require('./lifeObligations.service');
const RemindersService = require('./reminders.service');
const NotificationService = require('./notification.service');

// Create job queues
const deadlineQueue = new Bull('deadline monitoring', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

const recurringQueue = new Bull('recurring obligations', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  }
});

/**
 * Cron Jobs Service for Life Admin Manager
 * Handles scheduled tasks for deadline monitoring and recurring obligations
 */
class CronJobsService {
  /**
   * Initialize all cron jobs
   */
  static async initializeCronJobs() {
    console.log('Initializing Life Admin cron jobs...');

    // Daily deadline monitoring job
    await deadlineQueue.add('check-deadlines', {}, {
      repeat: { cron: '0 9 * * *' }, // Every day at 9 AM
      removeOnComplete: 10,
      removeOnFail: 5
    });

    // Hourly urgent deadline check
    await deadlineQueue.add('check-urgent-deadlines', {}, {
      repeat: { cron: '0 * * * *' }, // Every hour
      removeOnComplete: 5,
      removeOnFail: 3
    });

    // Daily recurring obligations renewal
    await recurringQueue.add('renew-recurring', {}, {
      repeat: { cron: '0 8 * * *' }, // Every day at 8 AM
      removeOnComplete: 10,
      removeOnFail: 5
    });

    // Process deadline monitoring jobs
    deadlineQueue.process('check-deadlines', this.processDeadlineCheck);
    deadlineQueue.process('check-urgent-deadlines', this.processUrgentDeadlineCheck);

    // Process recurring obligations jobs
    recurringQueue.process('renew-recurring', this.processRecurringRenewal);

    console.log('Life Admin cron jobs initialized successfully');
  }

  /**
   * Process daily deadline check
   */
  static async processDeadlineCheck(job) {
    try {
      console.log('Running daily deadline check...');

      // Check for overdue obligations
      const { data: overdueObligations, error } = await LifeObligationsService.checkOverdueObligations();

      if (error) {
        throw new Error(`Failed to check overdue obligations: ${error.message}`);
      }

      let processedCount = 0;

      if (overdueObligations && overdueObligations.length > 0) {
        // Group by user for batch processing
        const userObligations = {};
        overdueObligations.forEach(obligation => {
          if (!userObligations[obligation.user_id]) {
            userObligations[obligation.user_id] = [];
          }
          userObligations[obligation.user_id].push(obligation);
        });

        // Process each user's overdue obligations
        for (const [userId, obligations] of Object.entries(userObligations)) {
          await this.processUserOverdueObligations(userId, obligations);
          processedCount += obligations.length;
        }
      }

      console.log(`Daily deadline check completed. Processed ${processedCount} overdue obligations.`);
      return { processed: processedCount };

    } catch (error) {
      console.error('Error in daily deadline check:', error);
      throw error;
    }
  }

  /**
   * Process urgent deadline check (hourly)
   */
  static async processUrgentDeadlineCheck(job) {
    try {
      console.log('Running urgent deadline check...');

      // Get all users with active obligations (simplified - in production, you'd want to optimize this)
      const { data: allObligations, error } = await LifeObligationsService.getObligations('*', {
        status: 'active',
        limit: 1000
      });

      if (error) {
        throw new Error(`Failed to get active obligations: ${error.message}`);
      }

      let urgentCount = 0;

      if (allObligations && allObligations.length > 0) {
        // Group by user
        const userObligations = {};
        allObligations.forEach(obligation => {
          if (!userObligations[obligation.user_id]) {
            userObligations[obligation.user_id] = [];
          }
          userObligations[obligation.user_id].push(obligation);
        });

        // Check each user's urgent obligations
        for (const [userId, obligations] of Object.entries(userObligations)) {
          const urgent = await this.identifyUrgentObligations(obligations);
          if (urgent.length > 0) {
            await this.processUrgentObligations(userId, urgent);
            urgentCount += urgent.length;
          }
        }
      }

      console.log(`Urgent deadline check completed. Processed ${urgentCount} urgent obligations.`);
      return { urgent: urgentCount };

    } catch (error) {
      console.error('Error in urgent deadline check:', error);
      throw error;
    }
  }

  /**
   * Process recurring obligations renewal
   */
  static async processRecurringRenewal(job) {
    try {
      console.log('Running recurring obligations renewal...');

      // Get all completed recurring obligations
      const { data: completedRecurring, error } = await LifeObligationsService.getObligations('*', {
        status: 'completed',
        type: 'recurring',
        limit: 1000
      });

      if (error) {
        throw new Error(`Failed to get completed recurring obligations: ${error.message}`);
      }

      let renewedCount = 0;

      if (completedRecurring && completedRecurring.length > 0) {
        for (const obligation of completedRecurring) {
          // Check if it's time to renew (based on frequency and last completion)
          if (this.shouldRenewObligation(obligation)) {
            await LifeObligationsService.generateNextRecurrence(obligation.user_id, obligation);
            renewedCount++;
          }
        }
      }

      console.log(`Recurring renewal completed. Renewed ${renewedCount} obligations.`);
      return { renewed: renewedCount };

    } catch (error) {
      console.error('Error in recurring renewal:', error);
      throw error;
    }
  }

  /**
   * Process overdue obligations for a specific user
   */
  static async processUserOverdueObligations(userId, obligations) {
    const escalatedReminders = [];

    for (const obligation of obligations) {
      // Create escalated reminder for high-risk obligations
      if (obligation.risk_level === 'high') {
        const daysPastDue = Math.ceil((new Date() - new Date(obligation.due_date)) / (1000 * 60 * 60 * 24));
        
        escalatedReminders.push({
          title: `URGENT: ${obligation.title} is ${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue`,
          description: `High-risk obligation overdue. ${obligation.consequence || 'Immediate action required.'}`,
          reminder_time: new Date().toISOString(),
          ai_generated: true
        });

        // Send push notification for high-risk overdue items
        try {
          await NotificationService.sendNotification(userId, {
            title: 'Urgent: Overdue Obligation',
            body: `${obligation.title} is ${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue`,
            data: { obligationId: obligation.id, type: 'overdue' }
          });
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError);
        }
      }
    }

    // Create escalated reminders
    if (escalatedReminders.length > 0) {
      await RemindersService.createMultipleReminders(userId, escalatedReminders);
    }
  }

  /**
   * Identify urgent obligations (due within 24 hours or high-risk)
   */
  static identifyUrgentObligations(obligations) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return obligations.filter(obligation => {
      const dueDate = new Date(obligation.due_date);
      return (dueDate <= tomorrow && dueDate > now) || obligation.risk_level === 'high';
    });
  }

  /**
   * Process urgent obligations
   */
  static async processUrgentObligations(userId, urgentObligations) {
    const urgentReminders = [];

    for (const obligation of urgentObligations) {
      const dueDate = new Date(obligation.due_date);
      const now = new Date();
      const hoursUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60));

      if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
        urgentReminders.push({
          title: `URGENT: ${obligation.title} due in ${hoursUntilDue} hour${hoursUntilDue > 1 ? 's' : ''}`,
          description: `${obligation.consequence || 'Action required soon.'}`,
          reminder_time: new Date().toISOString(),
          ai_generated: true
        });
      }
    }

    if (urgentReminders.length > 0) {
      await RemindersService.createMultipleReminders(userId, urgentReminders);
    }
  }

  /**
   * Check if a recurring obligation should be renewed
   */
  static shouldRenewObligation(obligation) {
    if (!obligation.last_completed_at || !obligation.frequency) {
      return false;
    }

    const lastCompleted = new Date(obligation.last_completed_at);
    const now = new Date();
    
    let renewalInterval;
    switch (obligation.frequency) {
      case 'daily':
        renewalInterval = 24 * 60 * 60 * 1000; // 1 day
        break;
      case 'weekly':
        renewalInterval = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'monthly':
        renewalInterval = 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      case 'yearly':
        renewalInterval = 365 * 24 * 60 * 60 * 1000; // 365 days
        break;
      default:
        return false;
    }

    return (now - lastCompleted) >= renewalInterval;
  }

  /**
   * Get job queue statistics
   */
  static async getQueueStats() {
    const deadlineStats = await deadlineQueue.getJobCounts();
    const recurringStats = await recurringQueue.getJobCounts();

    return {
      deadline_queue: deadlineStats,
      recurring_queue: recurringStats
    };
  }

  /**
   * Clean up completed jobs
   */
  static async cleanupJobs() {
    await deadlineQueue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24 hours
    await deadlineQueue.clean(24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 24 hours
    await recurringQueue.clean(24 * 60 * 60 * 1000, 'completed');
    await recurringQueue.clean(24 * 60 * 60 * 1000, 'failed');
  }
}

module.exports = CronJobsService;