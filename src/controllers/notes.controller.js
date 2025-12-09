const supabase = require('../config/supabase');

class NotesController {
  /**
   * Create note
   */
  async createNote(req, res, next) {
    try {
      const { title, content, tags } = req.body;
      const userId = req.user.id;

      const { data: note, error } = await supabase
        .from('notes')
        .insert([{
          user_id: userId,
          title,
          content,
          tags: tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ note });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all notes
   */
  async getNotes(req, res, next) {
    try {
      const userId = req.user.id;
      const { search, tag } = req.query;

      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      if (tag) {
        query = query.contains('tags', [tag]);
      }

      const { data: notes, error } = await query;

      if (error) throw error;

      res.json({ notes });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single note
   */
  async getNote(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { data: note, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      res.json({ note });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update note
   */
  async updateNote(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = {
        ...req.body,
        updated_at: new Date().toISOString()
      };

      const { data: note, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      res.json({ note });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete note
   */
  async deleteNote(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotesController();
