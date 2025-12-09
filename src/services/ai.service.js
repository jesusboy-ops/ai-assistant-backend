const openai = require('../config/openai');

class AIService {
  /**
   * Generate email content using GPT
   */
  async generateEmail(prompt, tone = 'professional') {
    try {
      const systemPrompt = `You are an expert email writer. Generate professional, well-structured emails based on the user's requirements. 
      Tone: ${tone}. 
      Format the email with a clear subject line, greeting, body, and closing.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const emailContent = completion.choices[0].message.content;

      // Parse subject and body
      const lines = emailContent.split('\n');
      let subject = 'Generated Email';
      let body = emailContent;

      // Try to extract subject
      const subjectLine = lines.find(line => line.toLowerCase().includes('subject:'));
      if (subjectLine) {
        subject = subjectLine.replace(/subject:/i, '').trim();
        body = emailContent.replace(subjectLine, '').trim();
      }

      return {
        subject,
        body,
        fullContent: emailContent
      };
    } catch (error) {
      console.error('AI email generation error:', error);
      throw error;
    }
  }

  /**
   * Generate text completion
   */
  async generateCompletion(prompt, options = {}) {
    try {
      const completion = await openai.chat.completions.create({
        model: options.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: options.systemPrompt || 'You are a helpful AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 500
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('AI completion error:', error);
      throw error;
    }
  }

  /**
   * Analyze text sentiment
   */
  async analyzeSentiment(text) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the given text. Respond with only: positive, negative, or neutral.'
          },
          { role: 'user', content: text }
        ],
        temperature: 0.3,
        max_tokens: 10
      });

      return completion.choices[0].message.content.toLowerCase().trim();
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
