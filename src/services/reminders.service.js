const { supabase } = require('../config/supabase');

/**
 * Reminders service functions for database operations
 */
class RemindersService {
  /**
   * Get reminders with filtering and pagination
   */
  static async getReminders(userId, filters = {}) {
    const { active_only = true, limit = 50, offset = 0 } = filters;
    
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('reminder_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (active_only) {
      query = query.eq('is_active', true);
    }

    return await query;
  }

  /**
   * Get upcoming reminders (next 24 hours)
   */
  static async getUpcomingReminders(userId, hours = 24) {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('reminder_time', now.toISOString())
      .lte('reminder_time', future.toISOString())
      .order('reminder_time', { ascending: true });
  }

  /**
   * Get overdue reminders
   */
  static async getOverdueReminders(userId) {
    const now = new Date();

    return await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('reminder_time', now.toISOString())
      .order('reminder_time', { ascending: false });
  }

  /**
   * Get a single reminder by ID
   */
  static async getReminderById(userId, reminderId) {
    return await supabase
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .eq('user_id', userId)
      .single();
  }

  /**
   * Create a new reminder
   */
  static async createReminder(userId, reminderData) {
    return await supabase
      .from('reminders')
      .insert({
        user_id: userId,
        ...reminderData,
        is_active: reminderData.is_active !== undefined ? reminderData.is_active : true
      })
      .select()
      .single();
  }

  /**
   * Update an existing reminder
   */
  static async updateReminder(userId, reminderId, updateData) {
    return await supabase
      .from('reminders')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', reminderId)
      .eq('user_id', userId)
      .select()
      .single();
  }

  /**
   * Delete a reminder
   */
  static async deleteReminder(userId, reminderId) {
    return await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('user_id', userId);
  }

  /**
   * Create multiple reminders (for AI-generated reminders)
   */
  static async createMultipleReminders(userId, remindersData) {
    const remindersToInsert = remindersData.map(reminder => ({
      user_id: userId,
      ...reminder,
      is_active: reminder.is_active !== undefined ? reminder.is_active : true
    }));

    return await supabase
      .from('reminders')
      .insert(remindersToInsert)
      .select();
  }

  /**
   * Snooze a reminder (add time to reminder_time)
   */
  static async snoozeReminder(userId, reminderId, minutes = 15) {
    const { data: reminder, error: fetchError } = await this.getReminderById(userId, reminderId);
    
    if (fetchError || !reminder) {
      return { error: fetchError || 'Reminder not found' };
    }

    const currentTime = new Date(reminder.reminder_time);
    const newTime = new Date(currentTime.getTime() + minutes * 60 * 1000);

    return await this.updateReminder(userId, reminderId, {
      reminder_time: newTime.toISOString()
    });
  }

  /**
   * Mark reminder as completed (deactivate)
   */
  static async completeReminder(userId, reminderId) {
    return await this.updateReminder(userId, reminderId, {
      is_active: false
    });
  }

  /**
   * Get reminder statistics
   */
  static async getReminderStats(userId) {
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('is_active, reminder_time, repeat_type')
      .eq('user_id', userId);

    if (error) return { error };

    const now = new Date();
    const summary = {
      total: reminders.length,
      active: reminders.filter(r => r.is_active).length,
      upcoming: reminders.filter(r => r.is_active && new Date(r.reminder_time) > now).length,
      overdue: reminders.filter(r => r.is_active && new Date(r.reminder_time) < now).length,
      recurring: reminders.filter(r => r.repeat_type !== 'none').length
    };

    return { data: summary };
  }
}

module.exports = RemindersService;