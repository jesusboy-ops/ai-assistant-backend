const chatService = require('../services/chat.service');

class ChatController {
  /**
   * Send message to AI
   */
  async sendMessage(req, res, next) {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user.id;

      const result = await chatService.sendMessage(userId, message, conversationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await chatService.getConversationHistory(userId, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all conversations
   */
  async getConversations(req, res, next) {
    try {
      const userId = req.user.id;
      const conversations = await chatService.getUserConversations(userId);
      res.json({ conversations });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await chatService.deleteConversation(userId, id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
