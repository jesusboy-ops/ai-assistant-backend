const notificationService = require('../services/notification.service');

class NotificationController {
  /**
   * Subscribe to push notifications
   */
  async subscribe(req, res, next) {
    try {
      const { subscription } = req.body;
      const userId = req.user.id;

      const result = await notificationService.subscribe(userId, subscription);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await notificationService.unsubscribe(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get VAPID public key
   */
  async getVapidPublicKey(req, res, next) {
    try {
      const publicKey = notificationService.getVapidPublicKey();
      res.json({ publicKey });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(req, res, next) {
    try {
      const userId = req.user.id;
      const { title, body } = req.body;

      await notificationService.sendPushNotification(userId, {
        title: title || 'Test Notification',
        body: body || 'This is a test notification from AI Assistant',
        icon: '/icon.png'
      });

      res.json({ message: 'Test notification sent' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
