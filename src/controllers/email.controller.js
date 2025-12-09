const aiService = require('../services/ai.service');
const emailService = require('../services/email.service');

class EmailController {
  /**
   * Generate email using AI
   */
  async generateEmail(req, res, next) {
    try {
      const { prompt, tone } = req.body;
      const result = await aiService.generateEmail(prompt, tone);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send email via SendGrid
   */
  async sendEmail(req, res, next) {
    try {
      const { to, subject, body } = req.body;
      const result = await emailService.sendCustomEmail(to, subject, body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate and send email
   */
  async generateAndSend(req, res, next) {
    try {
      const { to, prompt, tone } = req.body;

      // Generate email
      const generated = await aiService.generateEmail(prompt, tone);

      // Send email
      const result = await emailService.sendCustomEmail(to, generated.subject, generated.body);

      res.json({
        ...result,
        generated
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmailController();
