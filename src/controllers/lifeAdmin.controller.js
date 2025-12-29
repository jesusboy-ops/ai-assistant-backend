const LifeObligationsService = require('../services/lifeObligations.service');
const TasksService = require('../services/tasks.service');
const RemindersService = require('../services/reminders.service');
const EmailService = require('../services/email.service');
const { validationResult } = require('express-validator');

/**
 * Life Admin Manager Controller
 * Handles obligations, not tasks - real-life responsibilities with consequences
 */
class LifeAdminController {
  /**
   * Get all life obligations for user
   */
  static async getObligations(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        status: req.query.status,
        category: req.query.category,
        type: req.query.type,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      };

      const { data, error } = await LifeObligationsService.getObligations(userId, filters);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ obligations: data });
    } catch (error) {
      console.error('Error fetching obligations:', error);
      res.status(500).json({ error: 'Failed to fetch obligations' });
    }
  }

  /**
   * Get single obligation by ID
   */
  static async getObligationById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { data, error } = await LifeObligationsService.getObligationById(userId, id);

      if (error) {
        return res.status(404).json({ error: 'Obligation not found' });
      }

      res.json({ obligation: data });
    } catch (error) {
      console.error('Error fetching obligation:', error);
      res.status(500).json({ error: 'Failed to fetch obligation' });
    }
  }

  /**
   * Create new life obligation
   */
  static async createObligation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const obligationData = req.body;

      const { data, error } = await LifeObligationsService.createObligation(userId, obligationData);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ 
        obligation: data,
        message: 'Obligation created with automatic tasks and reminders'
      });
    } catch (error) {
      console.error('Error creating obligation:', error);
      res.status(500).json({ error: 'Failed to create obligation' });
    }
  }

  /**
   * Update existing obligation
   */
  static async updateObligation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const { data, error } = await LifeObligationsService.updateObligation(userId, id, updateData);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ obligation: data });
    } catch (error) {
      console.error('Error updating obligation:', error);
      res.status(500).json({ error: 'Failed to update obligation' });
    }
  }

  /**
   * Delete obligation
   */
  static async deleteObligation(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { error } = await LifeObligationsService.deleteObligation(userId, id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Obligation deleted successfully' });
    } catch (error) {
      console.error('Error deleting obligation:', error);
      res.status(500).json({ error: 'Failed to delete obligation' });
    }
  }

  /**
   * Complete obligation (handles recurring logic)
   */
  static async completeObligation(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const { data, error } = await LifeObligationsService.completeObligation(userId, id);

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ 
        obligation: data,
        message: 'Obligation completed successfully'
      });
    } catch (error) {
      console.error('Error completing obligation:', error);
      res.status(500).json({ error: 'Failed to complete obligation' });
    }
  }

  /**
   * Generate structured plan from user input (AI Logic)
   */
  static async generatePlan(req, res) {
    try {
      const userId = req.user.id;
      const { input, context } = req.body;

      // AI Logic: Detect obligations, tasks, reminders from input
      const plan = await LifeAdminController.processUserInput(userId, input, context);

      res.json(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      res.status(500).json({ error: 'Failed to generate plan' });
    }
  }

  /**
   * Check deadlines and escalate reminders
   */
  static async checkDeadlines(req, res) {
    try {
      const userId = req.user.id;

      // Check for overdue obligations
      const { data: overdueObligations } = await LifeObligationsService.checkOverdueObligations();
      
      // Get urgent obligations
      const { data: urgentObligations } = await LifeObligationsService.getUrgentObligations(userId);

      // Generate escalated reminders for high-risk overdue items
      const escalatedReminders = [];
      if (overdueObligations) {
        for (const obligation of overdueObligations.filter(o => o.user_id === userId && o.risk_level === 'high')) {
          escalatedReminders.push({
            title: `URGENT: ${obligation.title} is overdue`,
            description: `This high-risk obligation was due on ${new Date(obligation.due_date).toLocaleDateString()}. ${obligation.consequence || 'Immediate action required.'}`,
            reminder_time: new Date().toISOString(),
            ai_generated: true
          });
        }
      }

      if (escalatedReminders.length > 0) {
        await RemindersService.createMultipleReminders(userId, escalatedReminders);
      }

      res.json({
        overdue_count: overdueObligations?.filter(o => o.user_id === userId).length || 0,
        urgent_count: urgentObligations?.length || 0,
        escalated_reminders: escalatedReminders.length
      });
    } catch (error) {
      console.error('Error checking deadlines:', error);
      res.status(500).json({ error: 'Failed to check deadlines' });
    }
  }

  /**
   * Renew recurring obligations
   */
  static async renewRecurring(req, res) {
    try {
      const userId = req.user.id;

      // Get completed recurring obligations that need renewal
      const { data: completedRecurring } = await LifeObligationsService.getObligations(userId, {
        status: 'completed',
        type: 'recurring'
      });

      let renewedCount = 0;
      if (completedRecurring) {
        for (const obligation of completedRecurring) {
          // Check if next cycle already exists
          const nextDueDate = this.calculateNextDueDate(obligation);
          const { data: existing } = await LifeObligationsService.getObligations(userId, {
            status: 'active'
          });

          const alreadyExists = existing?.some(o => 
            o.title === obligation.title && 
            new Date(o.due_date).toDateString() === nextDueDate.toDateString()
          );

          if (!alreadyExists) {
            await LifeObligationsService.generateNextRecurrence(userId, obligation);
            renewedCount++;
          }
        }
      }

      res.json({
        renewed_count: renewedCount,
        message: `${renewedCount} recurring obligations renewed`
      });
    } catch (error) {
      console.error('Error renewing recurring obligations:', error);
      res.status(500).json({ error: 'Failed to renew recurring obligations' });
    }
  }

  /**
   * Get obligation statistics
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.id;

      const { data: obligationStats } = await LifeObligationsService.getObligationStats(userId);
      const { data: taskStats } = await TasksService.getTaskStats(userId);
      const { data: reminderStats } = await RemindersService.getReminderStats(userId);

      res.json({
        obligations: obligationStats,
        tasks: taskStats,
        reminders: reminderStats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  /**
   * Process user input and generate structured actions (AI Logic)
   */
  static async processUserInput(userId, input, context = {}) {
    const actions = {
      obligations: [],
      tasks: [],
      reminders: [],
      emails: [],
      calendar_events: []
    };

    // Simple keyword-based detection (replace with actual AI/NLP)
    const inputLower = input.toLowerCase();

    // Detect obligations
    const obligationKeywords = ['deadline', 'due', 'renew', 'registration', 'application', 'payment', 'exam', 'appointment'];
    const hasObligationKeywords = obligationKeywords.some(keyword => inputLower.includes(keyword));

    if (hasObligationKeywords) {
      // Extract obligation details
      const obligation = this.extractObligationFromInput(input);
      if (obligation) {
        actions.obligations.push(obligation);
      }
    }

    // Detect tasks
    const taskKeywords = ['task', 'todo', 'need to', 'should', 'must', 'prepare', 'gather', 'review'];
    const hasTaskKeywords = taskKeywords.some(keyword => inputLower.includes(keyword));

    if (hasTaskKeywords) {
      const task = this.extractTaskFromInput(input);
      if (task) {
        actions.tasks.push(task);
      }
    }

    // Detect email requests
    const emailKeywords = ['email', 'send', 'write', 'contact', 'follow up'];
    const hasEmailKeywords = emailKeywords.some(keyword => inputLower.includes(keyword));

    if (hasEmailKeywords) {
      const email = this.extractEmailFromInput(input);
      if (email) {
        actions.emails.push(email);
      }
    }

    return actions;
  }

  /**
   * Extract obligation details from user input
   */
  static extractObligationFromInput(input) {
    // Simple extraction logic (replace with proper NLP)
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/;
    const dateMatch = input.match(dateRegex);

    return {
      title: input.substring(0, 100), // First 100 chars as title
      category: 'other', // Default category
      type: 'one_time',
      due_date: dateMatch ? new Date(dateMatch[1]).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      risk_level: 'medium'
    };
  }

  /**
   * Extract task details from user input
   */
  static extractTaskFromInput(input) {
    return {
      title: input.substring(0, 100),
      priority: 'medium',
      ai_generated: true
    };
  }

  /**
   * Extract email details from user input
   */
  static extractEmailFromInput(input) {
    return {
      subject: 'Follow-up Required',
      body: input,
      draft: true
    };
  }

  /**
   * Calculate next due date for recurring obligations
   */
  static calculateNextDueDate(obligation) {
    const currentDueDate = new Date(obligation.due_date);
    const nextDueDate = new Date(currentDueDate);

    switch (obligation.frequency) {
      case 'daily':
        nextDueDate.setDate(nextDueDate.getDate() + 1);
        break;
      case 'weekly':
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        break;
      case 'monthly':
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        break;
      case 'yearly':
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        break;
    }

    return nextDueDate;
  }
}

module.exports = LifeAdminController;