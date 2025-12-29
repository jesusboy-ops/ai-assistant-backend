const { supabase } = require('../config/supabase');
const TasksService = require('./tasks.service');
const RemindersService = require('./reminders.service');

/**
 * Life Obligations service for managing real-life responsibilities
 */
class LifeObligationsService {
  /**
   * Get life obligations with filtering and pagination
   */
  static async getObligations(userId, filters = {}) {
    const { status, category, type, limit = 50, offset = 0 } = filters;
    
    let query = supabase
      .from('life_obligations')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    
    if (category) {
      query = query.eq('category', category);
    }

    if (type) {
      query = query.eq('type', type);
    }

    return await query;
  }

  /**
   * Get a single obligation by ID
   */
  static async getObligationById(userId, obligationId) {
    return await supabase
      .from('life_obligations')
      .select('*')
      .eq('id', obligationId)
      .eq('user_id', userId)
      .single();
  }

  /**
   * Create a new life obligation with automatic task and reminder generation
   */
  static async createObligation(userId, obligationData) {
    const { data: obligation, error } = await supabase
      .from('life_obligations')
      .insert({
        user_id: userId,
        ...obligationData,
        status: obligationData.status || 'active'
      })
      .select()
      .single();

    if (error) return { error };

    // Generate preparation tasks and reminders
    await this.generatePreparationItems(userId, obligation);

    return { data: obligation };
  }

  /**
   * Update an existing obligation
   */
  static async updateObligation(userId, obligationId, updateData) {
    return await supabase
      .from('life_obligations')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', obligationId)
      .eq('user_id', userId)
      .select()
      .single();
  }

  /**
   * Delete an obligation
   */
  static async deleteObligation(userId, obligationId) {
    return await supabase
      .from('life_obligations')
      .delete()
      .eq('id', obligationId)
      .eq('user_id', userId);
  }

  /**
   * Complete an obligation and handle recurring logic
   */
  static async completeObligation(userId, obligationId) {
    const { data: obligation, error } = await this.getObligationById(userId, obligationId);
    
    if (error || !obligation) {
      return { error: error || 'Obligation not found' };
    }

    // Mark as completed
    const updateResult = await this.updateObligation(userId, obligationId, {
      status: 'completed',
      last_completed_at: new Date().toISOString()
    });

    if (updateResult.error) return updateResult;

    // Handle recurring obligations
    if (obligation.type === 'recurring' && obligation.frequency) {
      await this.generateNextRecurrence(userId, obligation);
    }

    return updateResult;
  }

  /**
   * Generate next recurrence for recurring obligations
   */
  static async generateNextRecurrence(userId, obligation) {
    const currentDueDate = new Date(obligation.due_date);
    let nextDueDate = new Date(currentDueDate);

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

    // Create new obligation for next cycle
    const newObligation = {
      title: obligation.title,
      category: obligation.category,
      type: obligation.type,
      frequency: obligation.frequency,
      due_date: nextDueDate.toISOString(),
      consequence: obligation.consequence,
      risk_level: obligation.risk_level
    };

    return await this.createObligation(userId, newObligation);
  }

  /**
   * Generate preparation tasks and reminders for an obligation
   */
  static async generatePreparationItems(userId, obligation) {
    const dueDate = new Date(obligation.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    // Generate preparation tasks if due date is more than 3 days away
    if (daysUntilDue > 3) {
      const preparationTasks = this.generatePreparationTasks(obligation, daysUntilDue);
      if (preparationTasks.length > 0) {
        await TasksService.createMultipleTasks(userId, preparationTasks);
      }
    }

    // Generate reminders based on risk level and due date
    const reminders = this.generateReminders(obligation, daysUntilDue);
    if (reminders.length > 0) {
      await RemindersService.createMultipleReminders(userId, reminders);
    }
  }

  /**
   * Generate preparation tasks based on obligation category and timeline
   */
  static generatePreparationTasks(obligation, daysUntilDue) {
    const tasks = [];
    const baseTitle = obligation.title;

    switch (obligation.category) {
      case 'education':
        if (daysUntilDue > 7) {
          tasks.push({
            title: `Gather documents for ${baseTitle}`,
            description: 'Collect all required documents and certificates',
            priority: 'medium',
            ai_generated: true
          });
        }
        if (daysUntilDue > 3) {
          tasks.push({
            title: `Review requirements for ${baseTitle}`,
            description: 'Double-check all requirements and deadlines',
            priority: 'high',
            ai_generated: true
          });
        }
        break;

      case 'finance':
        if (daysUntilDue > 7) {
          tasks.push({
            title: `Prepare financial documents for ${baseTitle}`,
            description: 'Gather bank statements, receipts, and financial records',
            priority: 'high',
            ai_generated: true
          });
        }
        break;

      case 'work':
        if (daysUntilDue > 5) {
          tasks.push({
            title: `Prepare for ${baseTitle}`,
            description: 'Review materials and prepare necessary items',
            priority: 'medium',
            ai_generated: true
          });
        }
        break;

      case 'health':
        if (daysUntilDue > 3) {
          tasks.push({
            title: `Prepare for ${baseTitle}`,
            description: 'Gather medical records and insurance information',
            priority: 'high',
            ai_generated: true
          });
        }
        break;
    }

    return tasks;
  }

  /**
   * Generate reminders based on risk level and timeline
   */
  static generateReminders(obligation, daysUntilDue) {
    const reminders = [];
    const dueDate = new Date(obligation.due_date);
    const baseTitle = obligation.title;

    // High risk obligations get more frequent reminders
    const reminderSchedule = obligation.risk_level === 'high' 
      ? [14, 7, 3, 1] 
      : obligation.risk_level === 'medium' 
        ? [7, 3, 1] 
        : [3, 1];

    reminderSchedule.forEach(daysBefore => {
      if (daysUntilDue > daysBefore) {
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - daysBefore);

        reminders.push({
          title: `Reminder: ${baseTitle}`,
          description: `${baseTitle} is due in ${daysBefore} day${daysBefore > 1 ? 's' : ''}. ${obligation.consequence ? 'Consequence: ' + obligation.consequence : ''}`,
          reminder_time: reminderDate.toISOString(),
          ai_generated: true
        });
      }
    });

    return reminders;
  }

  /**
   * Check for overdue obligations and update status
   */
  static async checkOverdueObligations() {
    const now = new Date();

    const { data: overdueObligations, error } = await supabase
      .from('life_obligations')
      .select('*')
      .eq('status', 'active')
      .lt('due_date', now.toISOString());

    if (error) return { error };

    // Update status to overdue
    if (overdueObligations.length > 0) {
      const obligationIds = overdueObligations.map(o => o.id);
      
      await supabase
        .from('life_obligations')
        .update({ status: 'overdue', updated_at: now.toISOString() })
        .in('id', obligationIds);
    }

    return { data: overdueObligations };
  }

  /**
   * Get obligations requiring immediate attention
   */
  static async getUrgentObligations(userId) {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return await supabase
      .from('life_obligations')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`due_date.lt.${tomorrow.toISOString()},risk_level.eq.high`)
      .order('due_date', { ascending: true });
  }

  /**
   * Get obligation statistics
   */
  static async getObligationStats(userId) {
    const { data: obligations, error } = await supabase
      .from('life_obligations')
      .select('status, category, risk_level, due_date')
      .eq('user_id', userId);

    if (error) return { error };

    const now = new Date();
    const summary = {
      total: obligations.length,
      active: obligations.filter(o => o.status === 'active').length,
      completed: obligations.filter(o => o.status === 'completed').length,
      overdue: obligations.filter(o => o.status === 'overdue').length,
      high_risk: obligations.filter(o => o.risk_level === 'high').length,
      due_soon: obligations.filter(o => {
        const dueDate = new Date(o.due_date);
        const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        return o.status === 'active' && daysUntilDue <= 7;
      }).length
    };

    return { data: summary };
  }
}

module.exports = LifeObligationsService;