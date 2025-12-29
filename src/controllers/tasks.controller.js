const { supabase } = require('../config/supabase');
const openai = require('../config/openai');

/**
 * Get all tasks for the authenticated user
 */
const getTasks = async (req, res) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    res.json({ tasks });
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a specific task by ID
 */
const getTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching task:', error);
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Error in getTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const { title, description, priority = 'medium', due_date, tags = [] } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: req.user.id,
        title,
        description,
        priority,
        due_date,
        tags,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    res.status(201).json({ task });
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an existing task
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, due_date, tags } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (due_date !== undefined) updateData.due_date = due_date;
    if (tags !== undefined) updateData.tags = tags;

    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return res.status(404).json({ error: 'Task not found or update failed' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a task
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting task:', error);
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create tasks from a message using AI
 */
const createTasksFromMessage = async (req, res) => {
  try {
    const { message, messageId } = req.body;

    if (!openai) {
      return res.status(503).json({ error: 'AI service not available' });
    }

    // Use AI to extract tasks from the message
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a task extraction assistant. Extract actionable tasks from the user's message. 
          Return a JSON array of tasks with the following structure:
          [
            {
              "title": "Task title (required)",
              "description": "Task description (optional)",
              "priority": "low|medium|high|urgent (default: medium)",
              "due_date": "ISO date string (optional, only if mentioned)",
              "tags": ["tag1", "tag2"] (optional)
            }
          ]
          
          Only extract clear, actionable tasks. If no tasks are found, return an empty array.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3
    });

    let extractedTasks = [];
    try {
      extractedTasks = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (!Array.isArray(extractedTasks) || extractedTasks.length === 0) {
      return res.json({ tasks: [], message: 'No tasks found in the message' });
    }

    // Create tasks in database
    const tasksToInsert = extractedTasks.map(task => ({
      user_id: req.user.id,
      title: task.title,
      description: task.description || null,
      priority: task.priority || 'medium',
      due_date: task.due_date || null,
      tags: task.tags || [],
      ai_generated: true,
      source_message_id: messageId || null,
      status: 'pending'
    }));

    const { data: createdTasks, error } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (error) {
      console.error('Error creating AI tasks:', error);
      return res.status(500).json({ error: 'Failed to create tasks' });
    }

    res.status(201).json({ 
      tasks: createdTasks,
      message: `Created ${createdTasks.length} task(s) from your message`
    });
  } catch (error) {
    console.error('Error in createTasksFromMessage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get AI task suggestions based on user's existing tasks and patterns
 */
const getTaskSuggestions = async (req, res) => {
  try {
    const { context } = req.body;

    if (!openai) {
      return res.status(503).json({ error: 'AI service not available' });
    }

    // Get user's recent tasks for context
    const { data: recentTasks } = await supabase
      .from('tasks')
      .select('title, description, tags, priority, status')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a productivity assistant. Based on the user's recent tasks and current context, suggest helpful tasks they might want to add.
          
          Recent tasks: ${JSON.stringify(recentTasks || [])}
          
          Return a JSON array of suggested tasks with this structure:
          [
            {
              "title": "Task title",
              "description": "Why this task might be helpful",
              "priority": "low|medium|high",
              "tags": ["relevant", "tags"],
              "reason": "Brief explanation of why this is suggested"
            }
          ]
          
          Suggest 3-5 relevant, actionable tasks. Focus on productivity, follow-ups, and task completion.`
        },
        {
          role: "user",
          content: context || "Suggest some tasks based on my recent activity"
        }
      ],
      temperature: 0.7
    });

    let suggestions = [];
    try {
      suggestions = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI suggestions:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI suggestions' });
    }

    res.json({ suggestions });
  } catch (error) {
    console.error('Error in getTaskSuggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  createTasksFromMessage,
  getTaskSuggestions
};