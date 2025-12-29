const TasksService = require('./tasks.service');
const RemindersService = require('./reminders.service');
const LifeObligationsService = require('./lifeObligations.service');

/**
 * Notes Enhancement Service
 * Analyzes notes content and suggests actions (tasks, reminders, obligations)
 */
class NotesEnhancementService {
  /**
   * Analyze note content and suggest actions
   */
  static async analyzeNoteContent(userId, noteContent) {
    const suggestions = {
      tasks: [],
      reminders: [],
      obligations: [],
      decisions: []
    };

    // Extract actionable items from note content
    const actions = this.extractActions(noteContent);
    const deadlines = this.extractDeadlines(noteContent);
    const decisions = this.extractDecisions(noteContent);

    // Generate task suggestions
    for (const action of actions) {
      suggestions.tasks.push({
        title: action.text,
        description: `Extracted from note: ${action.context}`,
        priority: action.urgent ? 'high' : 'medium',
        ai_generated: true
      });
    }

    // Generate reminder suggestions
    for (const deadline of deadlines) {
      if (deadline.isObligation) {
        suggestions.obligations.push({
          title: deadline.text,
          due_date: deadline.date,
          category: deadline.category || 'other',
          risk_level: deadline.urgent ? 'high' : 'medium'
        });
      } else {
        suggestions.reminders.push({
          title: `Reminder: ${deadline.text}`,
          description: `Deadline reminder from note`,
          reminder_time: new Date(new Date(deadline.date).getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
          ai_generated: true
        });
      }
    }

    // Extract decisions
    suggestions.decisions = decisions;

    return suggestions;
  }

  /**
   * Extract actionable items from text
   */
  static extractActions(text) {
    const actions = [];
    const actionPatterns = [
      /(?:need to|should|must|have to|todo|task)\s+([^.!?]+)/gi,
      /(?:action|next step|follow up):\s*([^.!?]+)/gi,
      /(?:remember to|don't forget to)\s+([^.!?]+)/gi
    ];

    actionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const actionText = match[1].trim();
        if (actionText.length > 5) { // Filter out very short matches
          actions.push({
            text: actionText,
            context: this.getContext(text, match.index, 50),
            urgent: this.isUrgent(actionText)
          });
        }
      }
    });

    return actions;
  }

  /**
   * Extract deadlines and dates from text
   */
  static extractDeadlines(text) {
    const deadlines = [];
    
    // Date patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{4}-\d{2}-\d{2})/g,
      /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/gi,
      /((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4})/gi
    ];

    // Deadline keywords
    const deadlineKeywords = [
      'due', 'deadline', 'expires', 'renewal', 'registration', 'application', 'payment', 'exam', 'appointment'
    ];

    datePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const dateStr = match[1];
        const context = this.getContext(text, match.index, 100);
        
        // Check if this is likely a deadline
        const isDeadline = deadlineKeywords.some(keyword => 
          context.toLowerCase().includes(keyword)
        );

        if (isDeadline) {
          const isObligation = this.isObligationContext(context);
          
          deadlines.push({
            text: this.extractDeadlineTitle(context),
            date: this.parseDate(dateStr),
            context,
            urgent: this.isUrgent(context),
            isObligation,
            category: this.categorizeObligation(context)
          });
        }
      }
    });

    return deadlines;
  }

  /**
   * Extract decisions from text
   */
  static extractDecisions(text) {
    const decisions = [];
    const decisionPatterns = [
      /(?:decided|decision|chose|choice|selected):\s*([^.!?]+)/gi,
      /(?:will|going to|plan to)\s+([^.!?]+)/gi
    ];

    decisionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const decisionText = match[1].trim();
        if (decisionText.length > 10) {
          decisions.push({
            text: decisionText,
            context: this.getContext(text, match.index, 100)
          });
        }
      }
    });

    return decisions;
  }

  /**
   * Get context around a match
   */
  static getContext(text, index, length) {
    const start = Math.max(0, index - length);
    const end = Math.min(text.length, index + length);
    return text.substring(start, end).trim();
  }

  /**
   * Check if text indicates urgency
   */
  static isUrgent(text) {
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'important', 'high priority'];
    return urgentKeywords.some(keyword => text.toLowerCase().includes(keyword));
  }

  /**
   * Check if context suggests this is an obligation rather than a simple reminder
   */
  static isObligationContext(context) {
    const obligationKeywords = [
      'registration', 'application', 'renewal', 'payment', 'exam', 'deadline', 'due date',
      'expires', 'certificate', 'license', 'insurance', 'tax', 'fee'
    ];
    
    return obligationKeywords.some(keyword => context.toLowerCase().includes(keyword));
  }

  /**
   * Categorize obligation based on context
   */
  static categorizeObligation(context) {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('school') || contextLower.includes('university') || contextLower.includes('exam') || contextLower.includes('course')) {
      return 'education';
    }
    if (contextLower.includes('tax') || contextLower.includes('payment') || contextLower.includes('bill') || contextLower.includes('insurance')) {
      return 'finance';
    }
    if (contextLower.includes('work') || contextLower.includes('job') || contextLower.includes('office') || contextLower.includes('meeting')) {
      return 'work';
    }
    if (contextLower.includes('doctor') || contextLower.includes('medical') || contextLower.includes('health') || contextLower.includes('appointment')) {
      return 'health';
    }
    
    return 'other';
  }

  /**
   * Extract deadline title from context
   */
  static extractDeadlineTitle(context) {
    // Simple extraction - take the sentence containing the deadline
    const sentences = context.split(/[.!?]/);
    const longestSentence = sentences.reduce((a, b) => a.length > b.length ? a : b);
    return longestSentence.trim().substring(0, 100); // Limit length
  }

  /**
   * Parse date string to ISO format
   */
  static parseDate(dateStr) {
    try {
      return new Date(dateStr).toISOString();
    } catch (error) {
      // If parsing fails, default to 7 days from now
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  /**
   * Create suggested actions from note analysis
   */
  static async createSuggestedActions(userId, suggestions) {
    const results = {
      tasks_created: 0,
      reminders_created: 0,
      obligations_created: 0
    };

    // Create tasks
    if (suggestions.tasks.length > 0) {
      const { data: createdTasks } = await TasksService.createMultipleTasks(userId, suggestions.tasks);
      results.tasks_created = createdTasks ? createdTasks.length : 0;
    }

    // Create reminders
    if (suggestions.reminders.length > 0) {
      const { data: createdReminders } = await RemindersService.createMultipleReminders(userId, suggestions.reminders);
      results.reminders_created = createdReminders ? createdReminders.length : 0;
    }

    // Create obligations
    if (suggestions.obligations.length > 0) {
      for (const obligation of suggestions.obligations) {
        await LifeObligationsService.createObligation(userId, obligation);
        results.obligations_created++;
      }
    }

    return results;
  }

  /**
   * Analyze note and return structured suggestions without creating them
   */
  static async suggestActionsFromNote(userId, noteContent) {
    const suggestions = await this.analyzeNoteContent(userId, noteContent);
    
    return {
      suggestions,
      summary: {
        total_suggestions: suggestions.tasks.length + suggestions.reminders.length + suggestions.obligations.length,
        tasks: suggestions.tasks.length,
        reminders: suggestions.reminders.length,
        obligations: suggestions.obligations.length,
        decisions: suggestions.decisions.length
      }
    };
  }
}

module.exports = NotesEnhancementService;