const { supabase } = require('../config/supabase');
const openai = require('../config/openai');

/**
 * Get all reminders for the authenticated user
 * Frontend expects: Array of reminder objects with specific format
 */
const getReminders = async (req, res) => {
  try {
    const { active_only = 'true', limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('reminder_time', { ascending: true })
      .range(offset, offset + limit - 1);

    if (active_only === 'true') {
      query = query.eq('is_active', true);
    }

    const { data: reminders, error } = await query;

    if (error) {
      console.error('Error fetching reminders:', error);
      return res.status(500).json({ 
        message: 'Failed to fetch reminders',
        error: 'DATABASE_ERROR'
      });
    }

    // Transform data to match frontend format exactly
    const formattedReminders = reminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title,
      description: reminder.description || '',
      reminder_time: reminder.reminder_time, // ISO date string
      reminder_type: reminder.repeat_type === 'none' ? 'general' : reminder.repeat_type, // Map to frontend types
      priority: 'medium', // Default priority since not in current schema
      triggered: !reminder.is_active, // Map is_active to triggered (inverted)
      createdAt: reminder.created_at
    }));

    res.json(formattedReminders);
  } catch (error) {
    console.error('Error in getReminders:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Get upcoming reminders (configurable days ahead)
 */
const getUpcomingReminders = async (req, res) => {
  try {
    const { days = 1 } = req.query; // Default to 1 day if not specified
    const daysAhead = Math.min(Math.max(parseInt(days) || 1, 1), 365); // Limit between 1-365 days
    
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .gte('reminder_time', now.toISOString())
      .lte('reminder_time', futureDate.toISOString())
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming reminders:', error);
      return res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
    }

    res.json({ 
      reminders,
      days_ahead: daysAhead,
      date_range: {
        from: now.toISOString(),
        to: futureDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getUpcomingReminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a specific reminder by ID
 */
const getReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: reminder, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching reminder:', error);
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ reminder });
  } catch (error) {
    console.error('Error in getReminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new reminder
 * Frontend sends: {title, description, reminder_time, reminder_type, priority}
 * Returns: Created reminder object with exact frontend format
 */
const createReminder = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      reminder_time, 
      reminder_type = 'general',
      priority = 'medium'
    } = req.body;

    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({
        message: 'Title is required',
        error: 'VALIDATION_ERROR',
        errors: [{ field: 'title', message: 'Title is required' }]
      });
    }

    if (!reminder_time) {
      return res.status(400).json({
        message: 'Reminder time is required',
        error: 'VALIDATION_ERROR',
        errors: [{ field: 'reminder_time', message: 'Reminder time is required' }]
      });
    }

    // Validate reminder_time is a valid ISO date
    let parsedDate;
    try {
      parsedDate = new Date(reminder_time);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (dateError) {
      return res.status(400).json({
        message: 'Invalid reminder time format',
        error: 'VALIDATION_ERROR',
        errors: [{ field: 'reminder_time', message: 'Reminder time must be a valid ISO date string' }]
      });
    }

    // Map frontend reminder_type to backend repeat_type
    const repeat_type = reminder_type === 'general' ? 'none' : reminder_type;

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        user_id: req.user.id,
        title: title.trim(),
        description: description || '',
        reminder_time: parsedDate.toISOString(),
        repeat_type,
        repeat_interval: 1,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return res.status(500).json({ 
        message: 'Failed to create reminder',
        error: 'DATABASE_ERROR'
      });
    }

    // Return reminder in frontend format
    const formattedReminder = {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description || '',
      reminder_time: reminder.reminder_time,
      reminder_type: reminder.repeat_type === 'none' ? 'general' : reminder.repeat_type,
      priority: priority,
      triggered: false,
      createdAt: reminder.created_at
    };

    res.status(201).json(formattedReminder);
  } catch (error) {
    console.error('Error in createReminder:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Update an existing reminder
 * Frontend sends: {title, description, reminder_time, reminder_type, priority}
 * Returns: Updated reminder object with exact frontend format
 */
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      reminder_time, 
      reminder_type,
      priority
    } = req.body;

    // Validate title if provided
    if (title !== undefined && (!title || title.trim() === '')) {
      return res.status(400).json({
        message: 'Title cannot be empty',
        error: 'VALIDATION_ERROR',
        errors: [{ field: 'title', message: 'Title cannot be empty' }]
      });
    }

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description || '';
    
    // Validate and update reminder_time
    if (reminder_time !== undefined) {
      try {
        const parsedDate = new Date(reminder_time);
        if (isNaN(parsedDate.getTime())) {
          throw new Error('Invalid date');
        }
        updateData.reminder_time = parsedDate.toISOString();
      } catch (dateError) {
        return res.status(400).json({
          message: 'Invalid reminder time format',
          error: 'VALIDATION_ERROR',
          errors: [{ field: 'reminder_time', message: 'Reminder time must be a valid ISO date string' }]
        });
      }
    }

    // Map frontend reminder_type to backend repeat_type
    if (reminder_type !== undefined) {
      updateData.repeat_type = reminder_type === 'general' ? 'none' : reminder_type;
    }

    const { data: reminder, error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reminder:', error);
      return res.status(404).json({ 
        message: 'Reminder not found or update failed',
        error: 'NOT_FOUND'
      });
    }

    // Return reminder in frontend format
    const formattedReminder = {
      id: reminder.id,
      title: reminder.title,
      description: reminder.description || '',
      reminder_time: reminder.reminder_time,
      reminder_type: reminder.repeat_type === 'none' ? 'general' : reminder.repeat_type,
      priority: priority || 'medium',
      triggered: !reminder.is_active,
      createdAt: reminder.created_at
    };

    res.json(formattedReminder);
  } catch (error) {
    console.error('Error in updateReminder:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Delete a reminder
 * Returns: Success confirmation
 */
const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting reminder:', error);
      return res.status(404).json({ 
        message: 'Reminder not found',
        error: 'NOT_FOUND'
      });
    }

    res.json({ 
      message: 'Reminder deleted successfully',
      id: id
    });
  } catch (error) {
    console.error('Error in deleteReminder:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: 'SERVER_ERROR'
    });
  }
};

/**
 * Create reminders from a message using AI
 */
const createRemindersFromMessage = async (req, res) => {
  try {
    const { message, messageId } = req.body;

    if (!openai) {
      return res.status(503).json({ error: 'AI service not available' });
    }

    // Use AI to extract reminders from the message
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a reminder extraction assistant. Extract time-based reminders from the user's message.
          
          Return a JSON array of reminders with the following structure:
          [
            {
              "title": "Reminder title (required)",
              "description": "Reminder description (optional)",
              "reminder_time": "ISO date string (required)",
              "repeat_type": "none|daily|weekly|monthly|yearly (default: none)",
              "repeat_interval": 1 (number, default: 1)
            }
          ]
          
          Only extract clear time-based reminders. Parse relative times like "in 2 hours", "tomorrow at 3pm", "next week".
          Current time context: ${new Date().toISOString()}
          
          If no reminders are found, return an empty array.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3
    });

    let extractedReminders = [];
    try {
      extractedReminders = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (!Array.isArray(extractedReminders) || extractedReminders.length === 0) {
      return res.json({ reminders: [], message: 'No reminders found in the message' });
    }

    // Create reminders in database
    const remindersToInsert = extractedReminders.map(reminder => ({
      user_id: req.user.id,
      title: reminder.title,
      description: reminder.description || null,
      reminder_time: reminder.reminder_time,
      repeat_type: reminder.repeat_type || 'none',
      repeat_interval: reminder.repeat_interval || 1,
      ai_generated: true,
      source_message_id: messageId || null,
      is_active: true
    }));

    const { data: createdReminders, error } = await supabase
      .from('reminders')
      .insert(remindersToInsert)
      .select();

    if (error) {
      console.error('Error creating AI reminders:', error);
      return res.status(500).json({ error: 'Failed to create reminders' });
    }

    res.status(201).json({ 
      reminders: createdReminders,
      message: `Created ${createdReminders.length} reminder(s) from your message`
    });
  } catch (error) {
    console.error('Error in createRemindersFromMessage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getReminders,
  getUpcomingReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  createRemindersFromMessage
};