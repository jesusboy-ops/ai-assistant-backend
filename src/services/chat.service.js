const openai = require('../config/openai');
const { supabase } = require('../config/supabase');
const { getRedisClient, safeRedisOperation } = require('../config/redis');

class ChatService {
  /**
   * Send message to GPT and get response
   */
  async sendMessage(userId, message, conversationId = null) {
    try {
      let conversation;

      // Get or create conversation
      if (conversationId) {
        const { data } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .eq('user_id', userId)
          .single();
        conversation = data;
      }

      if (!conversation) {
        // Create new conversation
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert([{
            user_id: userId,
            title: message.substring(0, 50),
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (error) throw error;
        conversation = newConv;
      }

      // Get conversation history
      const { data: history } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })
        .limit(20);

      // Build messages array for GPT
      const messages = [
        {
          role: 'system',
          content: 'You are JARVIS, an intelligent AI assistant. You are helpful, professional, and provide accurate information. You can help with various tasks including answering questions, providing advice, and assisting with productivity.'
        }
      ];

      // Add history
      if (history) {
        history.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      // Add current message
      messages.push({
        role: 'user',
        content: message
      });

      // Save user message
      await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        }]);

      // Get GPT response
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      });

      const assistantMessage = completion.choices[0].message.content;

      // Save assistant message
      await supabase
        .from('messages')
        .insert([{
          conversation_id: conversation.id,
          role: 'assistant',
          content: assistantMessage,
          created_at: new Date().toISOString()
        }]);

      return {
        conversationId: conversation.id,
        message: assistantMessage,
        usage: completion.usage
      };
    } catch (error) {
      console.error('Chat service error:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   */
  async getConversationHistory(userId, conversationId) {
    try {
      // Verify conversation belongs to user
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get messages
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return {
        conversation,
        messages
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all user conversations
   */
  async getUserConversations(userId) {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return conversations;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(userId, conversationId) {
    try {
      // Verify ownership
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Delete messages first
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      // Delete conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      return { message: 'Conversation deleted successfully' };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ChatService();
