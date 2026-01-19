const { supabase } = require('../config/supabase');

class CalendarController {
  /**
   * Create calendar event
   * Frontend sends: {title, description, date, time, duration, color, location}
   * Returns: Created event object with exact frontend format
   */
  async createEvent(req, res, next) {
    try {
      const { 
        title, 
        description, 
        date, 
        time, 
        duration = 60, 
        color = '#667eea', 
        location 
      } = req.body;
      const userId = req.user.id;

      // Validate required fields
      if (!title || title.trim() === '') {
        return res.status(400).json({
          message: 'Title is required',
          error: 'VALIDATION_ERROR',
          errors: [{ field: 'title', message: 'Title is required' }]
        });
      }

      if (!date) {
        return res.status(400).json({
          message: 'Date is required',
          error: 'VALIDATION_ERROR',
          errors: [{ field: 'date', message: 'Date is required in YYYY-MM-DD format' }]
        });
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          message: 'Invalid date format',
          error: 'VALIDATION_ERROR',
          errors: [{ field: 'date', message: 'Date must be in YYYY-MM-DD format' }]
        });
      }

      // Validate time format (HH:MM) if provided
      if (time) {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(time)) {
          return res.status(400).json({
            message: 'Invalid time format',
            error: 'VALIDATION_ERROR',
            errors: [{ field: 'time', message: 'Time must be in HH:MM format' }]
          });
        }
      }

      // Create start_time and end_time from date and time
      const startDateTime = time ? `${date}T${time}:00.000Z` : `${date}T00:00:00.000Z`;
      const startTime = new Date(startDateTime);
      const endTime = new Date(startTime.getTime() + (duration * 60 * 1000));

      const { data: event, error } = await supabase
        .from('calendar_events')
        .insert([{
          user_id: userId,
          title: title.trim(),
          description: description || '',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          location: location || '',
          reminder: null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        return res.status(500).json({ 
          message: 'Failed to create calendar event',
          error: 'DATABASE_ERROR'
        });
      }

      // Return event in frontend format
      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.start_time.split('T')[0], // YYYY-MM-DD
        time: time || null, // HH:MM or null
        duration: duration,
        color: color,
        location: event.location || '',
        createdAt: event.created_at
      };

      res.status(201).json(formattedEvent);
    } catch (error) {
      console.error('Error in createEvent:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Get all events
   * Frontend expects: Array of event objects with specific format
   */
  async getEvents(req, res, next) {
    try {
      const userId = req.user.id;
      const { start, end } = req.query;

      let query = supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });

      if (start) {
        query = query.gte('start_time', start);
      }
      if (end) {
        query = query.lte('start_time', end);
      }

      const { data: events, error } = await query;

      if (error) {
        console.error('Error fetching calendar events:', error);
        return res.status(500).json({ 
          message: 'Failed to fetch calendar events',
          error: 'DATABASE_ERROR'
        });
      }

      // Transform data to match frontend format exactly
      const formattedEvents = events.map(event => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes
        
        // Extract time from start_time (HH:MM format)
        const timeString = startTime.getUTCHours().toString().padStart(2, '0') + ':' + 
                          startTime.getUTCMinutes().toString().padStart(2, '0');

        return {
          id: event.id,
          title: event.title,
          description: event.description || '',
          date: event.start_time.split('T')[0], // YYYY-MM-DD
          time: timeString !== '00:00' ? timeString : null,
          duration: duration,
          color: '#667eea', // Default color since not stored in current schema
          location: event.location || '',
          createdAt: event.created_at
        };
      });

      res.json(formattedEvents);
    } catch (error) {
      console.error('Error in getEvents:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Get single event
   */
  async getEvent(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data: event, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !event) {
        return res.status(404).json({ 
          message: 'Event not found',
          error: 'NOT_FOUND'
        });
      }

      // Transform to frontend format
      const startTime = new Date(event.start_time);
      const endTime = new Date(event.end_time);
      const duration = Math.round((endTime - startTime) / (1000 * 60));
      const timeString = startTime.getUTCHours().toString().padStart(2, '0') + ':' + 
                        startTime.getUTCMinutes().toString().padStart(2, '0');

      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.start_time.split('T')[0],
        time: timeString !== '00:00' ? timeString : null,
        duration: duration,
        color: '#667eea',
        location: event.location || '',
        createdAt: event.created_at
      };

      res.json(formattedEvent);
    } catch (error) {
      console.error('Error in getEvent:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Update event
   * Frontend sends: {title, description, date, time, duration, color, location}
   * Returns: Updated event object with exact frontend format
   */
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { 
        title, 
        description, 
        date, 
        time, 
        duration, 
        color, 
        location 
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
      if (location !== undefined) updateData.location = location || '';

      // Handle date and time updates
      if (date !== undefined || time !== undefined || duration !== undefined) {
        // Get current event to use existing values if not provided
        const { data: currentEvent } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (!currentEvent) {
          return res.status(404).json({ 
            message: 'Event not found',
            error: 'NOT_FOUND'
          });
        }

        const currentStartTime = new Date(currentEvent.start_time);
        const currentEndTime = new Date(currentEvent.end_time);
        const currentDuration = Math.round((currentEndTime - currentStartTime) / (1000 * 60));

        const eventDate = date || currentEvent.start_time.split('T')[0];
        const eventTime = time !== undefined ? time : 
          (currentStartTime.getUTCHours().toString().padStart(2, '0') + ':' + 
           currentStartTime.getUTCMinutes().toString().padStart(2, '0'));
        const eventDuration = duration !== undefined ? duration : currentDuration;

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(eventDate)) {
          return res.status(400).json({
            message: 'Invalid date format',
            error: 'VALIDATION_ERROR',
            errors: [{ field: 'date', message: 'Date must be in YYYY-MM-DD format' }]
          });
        }

        // Validate time format if provided
        if (eventTime && eventTime !== '00:00') {
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(eventTime)) {
            return res.status(400).json({
              message: 'Invalid time format',
              error: 'VALIDATION_ERROR',
              errors: [{ field: 'time', message: 'Time must be in HH:MM format' }]
            });
          }
        }

        // Update start_time and end_time
        const startDateTime = eventTime && eventTime !== '00:00' ? 
          `${eventDate}T${eventTime}:00.000Z` : `${eventDate}T00:00:00.000Z`;
        const startTime = new Date(startDateTime);
        const endTime = new Date(startTime.getTime() + (eventDuration * 60 * 1000));

        updateData.start_time = startTime.toISOString();
        updateData.end_time = endTime.toISOString();
      }

      const { data: event, error } = await supabase
        .from('calendar_events')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        return res.status(404).json({ 
          message: 'Event not found or update failed',
          error: 'NOT_FOUND'
        });
      }

      // Return event in frontend format
      const startTime = new Date(event.start_time);
      const endTime = new Date(event.end_time);
      const eventDuration = Math.round((endTime - startTime) / (1000 * 60));
      const timeString = startTime.getUTCHours().toString().padStart(2, '0') + ':' + 
                        startTime.getUTCMinutes().toString().padStart(2, '0');

      const formattedEvent = {
        id: event.id,
        title: event.title,
        description: event.description || '',
        date: event.start_time.split('T')[0],
        time: timeString !== '00:00' ? timeString : null,
        duration: eventDuration,
        color: color || '#667eea',
        location: event.location || '',
        createdAt: event.created_at
      };

      res.json(formattedEvent);
    } catch (error) {
      console.error('Error in updateEvent:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: 'SERVER_ERROR'
      });
    }
  }

  /**
   * Delete event
   * Returns: Success confirmation
   */
  async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting calendar event:', error);
        return res.status(404).json({ 
          message: 'Event not found',
          error: 'NOT_FOUND'
        });
      }

      res.json({ 
        message: 'Event deleted successfully',
        id: id
      });
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = new CalendarController();
