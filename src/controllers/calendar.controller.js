const supabase = require('../config/supabase');

class CalendarController {
  /**
   * Create calendar event
   */
  async createEvent(req, res, next) {
    try {
      const { title, description, start_time, end_time, location, reminder } = req.body;
      const userId = req.user.id;

      const { data: event, error } = await supabase
        .from('calendar_events')
        .insert([{
          user_id: userId,
          title,
          description,
          start_time,
          end_time,
          location,
          reminder,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all events
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

      if (error) throw error;

      res.json({ events });
    } catch (error) {
      next(error);
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
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json({ event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update event
   */
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      const { data: event, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json({ event });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete event
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

      if (error) throw error;

      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CalendarController();
