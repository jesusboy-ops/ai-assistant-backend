const webpush = require('web-push');
const supabase = require('../config/supabase');
const Bull = require('bull');
const { getRedisClient } = require('../config/redis');

class NotificationService {
  constructor() {
    // Initialize Bull queue for notifications
    const redisClient = getRedisClient();
    if (redisClient) {
      this.notificationQueue = new Bull('notifications', {
        redis: process.env.REDIS_URL || 'redis://localhost:6379'
      });

      // Process notification jobs
      this.notificationQueue.process(async (job) => {
        return await this.processNotification(job.data);
      });
    }
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(userId, subscription) {
    try {
      // Save subscription to database
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert([{
          user_id: userId,
          subscription: subscription,
          created_at: new Date().toISOString()
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;

      return { message: 'Subscribed to notifications', data };
    } catch (error) {
      console.error('Subscription error:', error);
      throw error;
    }
  }

  /**
   * Send push notification to user
   */
  async sendPushNotification(userId, payload) {
    try {
      // Get user's subscription
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .eq('user_id', userId)
        .single();

      if (!subscription) {
        console.log('No subscription found for user:', userId);
        return;
      }

      // Send notification
      await webpush.sendNotification(
        subscription.subscription,
        JSON.stringify(payload)
      );

      console.log('Push notification sent to user:', userId);
    } catch (error) {
      console.error('Push notification error:', error);
      
      // If subscription is invalid, remove it
      if (error.statusCode === 410) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', userId);
      }
    }
  }

  /**
   * Queue notification for processing
   */
  async queueNotification(userId, payload, delay = 0) {
    try {
      if (!this.notificationQueue) {
        // If Redis not available, send immediately
        return await this.sendPushNotification(userId, payload);
      }

      await this.notificationQueue.add(
        { userId, payload },
        { delay }
      );

      console.log('Notification queued for user:', userId);
    } catch (error) {
      console.error('Queue notification error:', error);
    }
  }

  /**
   * Process notification from queue
   */
  async processNotification(data) {
    const { userId, payload } = data;
    await this.sendPushNotification(userId, payload);
  }

  /**
   * Send notification to multiple users
   */
  async broadcastNotification(userIds, payload) {
    try {
      const promises = userIds.map(userId => 
        this.queueNotification(userId, payload)
      );
      await Promise.all(promises);
      
      return { message: `Notification sent to ${userIds.length} users` };
    } catch (error) {
      console.error('Broadcast notification error:', error);
      throw error;
    }
  }

  /**
   * Get VAPID public key
   */
  getVapidPublicKey() {
    return process.env.VAPID_PUBLIC_KEY;
  }

  /**
   * Unsubscribe user from notifications
   */
  async unsubscribe(userId) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      return { message: 'Unsubscribed from notifications' };
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
