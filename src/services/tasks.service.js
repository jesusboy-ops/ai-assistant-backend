const { supabase } = require('../config/supabase');

/**
 * Task service functions for database operations
 */
class TasksService {
  /**
   * Get tasks with filtering and pagination
   */
  static async getTasks(userId, filters = {}) {
    const { status, priority, limit = 50, offset = 0 } = filters;
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }

    return await query;
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(userId, taskId) {
    return await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', userId)
      .single();
  }

  /**
   * Create a new task
   */
  static async createTask(userId, taskData) {
    return await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        ...taskData,
        status: taskData.status || 'pending'
      })
      .select()
      .single();
  }

  /**
   * Update an existing task
   */
  static async updateTask(userId, taskId, updateData) {
    return await supabase
      .from('tasks')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single();
  }

  /**
   * Delete a task
   */
  static async deleteTask(userId, taskId) {
    return await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);
  }

  /**
   * Create multiple tasks (for AI-generated tasks)
   */
  static async createMultipleTasks(userId, tasksData) {
    const tasksToInsert = tasksData.map(task => ({
      user_id: userId,
      ...task,
      status: task.status || 'pending'
    }));

    return await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();
  }

  /**
   * Get recent tasks for AI context
   */
  static async getRecentTasks(userId, limit = 10) {
    return await supabase
      .from('tasks')
      .select('title, description, tags, priority, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(userId) {
    const { data: stats, error } = await supabase
      .from('tasks')
      .select('status, priority')
      .eq('user_id', userId);

    if (error) return { error };

    const summary = {
      total: stats.length,
      pending: stats.filter(t => t.status === 'pending').length,
      in_progress: stats.filter(t => t.status === 'in_progress').length,
      completed: stats.filter(t => t.status === 'completed').length,
      high_priority: stats.filter(t => t.priority === 'high' || t.priority === 'urgent').length
    };

    return { data: summary };
  }
}

module.exports = TasksService;