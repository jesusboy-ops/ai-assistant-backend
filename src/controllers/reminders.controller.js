const { supabase } = require('../config/supabase');
const { openai } = require('../config/openai');

/**
 * Get all reminders for the authenticated user
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
      return res.status(500).json({ error: 'Failed to fetch reminders' });
    }

    res.json({ reminders });
  } catch (error) {
    console.error('Error in getReminders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get upcoming reminders (next 24 hours)
 */
const getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('is_active', true)
      .gte('reminder_time', now.toISOString())
      .lte('reminder_time', tomorrow.toISOString())
      .order('reminder_time', { ascending: true });

    if (error) {
      console.error('Error fetching upcoming reminders:', error);
      return res.status(500).json({ error: 'Failed to fetch upcoming reminders' });
    }

    res.json({ reminders });
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
 */
const createReminder = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      reminder_time, 
      repeat_type = 'none', 
      repeat_interval = 1 
    } = req.body;

    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        user_id: req.user.id,
        title,
        description,
        reminder_time,
        repeat_type,
        repeat_interval,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return res.status(500).json({ error: 'Failed to create reminder' });
    }

    res.status(201).json({ reminder });
  } catch (error) {
    console.error('Error in createReminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an existing reminder
 */
const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      reminder_time, 
      repeat_type, 
      repeat_interval, 
      is_active 
    } = req.body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (reminder_time !== undefined) updateData.reminder_time = reminder_time;
    if (repeat_type !== undefined) updateData.repeat_type = repeat_type;
    if (repeat_interval !== undefined) updateData.repeat_interval = repeat_interval;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: reminder, error } = await supabase
      .from('reminders')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating reminder:', error);
      return res.status(404).json({ error: 'Reminder not found or update failed' });
    }

    res.json({ reminder });
  } catch (error) {
    console.error('Error in updateReminder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a reminder
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
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error in deleteReminder:', error);
    res.status(500).json({ error: 'Internal server error' });
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