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

  /**
   * Split large task into smaller subtasks
   */
  static async splitLargeTask(userId, taskId, subtasks) {
    try {
      // Get the original task
      const { data: originalTask, error } = await this.getTaskById(userId, taskId);
      
      if (error || !originalTask) {
        return { error: 'Task not found' };
      }

      // Create subtasks
      const subtasksToCreate = subtasks.map((subtask, index) => ({
        title: subtask.title || `${originalTask.title} - Part ${index + 1}`,
        description: subtask.description || `Subtask of: ${originalTask.title}`,
        priority: subtask.priority || originalTask.priority,
        due_date: subtask.due_date || originalTask.due_date,
        tags: [...(originalTask.tags || []), 'subtask'],
        ai_generated: true
      }));

      const { data: createdSubtasks, error: createError } = await this.createMultipleTasks(userId, subtasksToCreate);

      if (createError) {
        return { error: createError };
      }

      // Update original task to indicate it has been split
      await this.updateTask(userId, taskId, {
        description: `${originalTask.description || ''}\n\n[SPLIT INTO SUBTASKS]`,
        status: 'in_progress',
        tags: [...(originalTask.tags || []), 'parent-task']
      });

      return { data: createdSubtasks };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Check for task overload and suggest rescheduling
   */
  static async checkTaskOverload(userId, date = null) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const { data: dayTasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', startOfDay.toISOString())
      .lte('due_date', endOfDay.toISOString());

    if (error) return { error };

    const highPriorityTasks = dayTasks.filter(t => t.priority === 'high' || t.priority === 'urgent');
    const isOverloaded = highPriorityTasks.length > 3;

    return {
      data: {
        total_tasks: dayTasks.length,
        high_priority_tasks: highPriorityTasks.length,
        is_overloaded: isOverloaded,
        suggestion: isOverloaded ? 'Consider rescheduling some tasks to reduce daily workload' : null
      }
    };
  }

  /**
   * Suggest task rescheduling
   */
  static async suggestRescheduling(userId, overloadedDate) {
    const { data: overloadCheck } = await this.checkTaskOverload(userId, overloadedDate);
    
    if (!overloadCheck.is_overloaded) {
      return { data: { message: 'No rescheduling needed' } };
    }

    // Get tasks for the overloaded date
    const targetDate = new Date(overloadedDate);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const { data: dayTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .gte('due_date', startOfDay.toISOString())
      .lte('due_date', endOfDay.toISOString())
      .order('priority', { ascending: false });

    // Suggest moving lower priority tasks to next available day
    const tasksToReschedule = dayTasks.slice(3); // Keep top 3 priority tasks
    const nextDay = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);

    return {
      data: {
        tasks_to_reschedule: tasksToReschedule.map(task => ({
          id: task.id,
          title: task.title,
          current_due_date: task.due_date,
          suggested_due_date: nextDay.toISOString()
        }))
      }
    };
  }

  /**
   * Auto-reschedule tasks to prevent overload
   */
  static async autoReschedule(userId, taskIds, newDate) {
    const updates = [];
    
    for (const taskId of taskIds) {
      const result = await this.updateTask(userId, taskId, {
        due_date: new Date(newDate).toISOString()
      });
      
      if (result.data) {
        updates.push(result.data);
      }
    }

    return { data: updates };
  }
}

module.exports = TasksService;