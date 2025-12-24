const { supabase } = require('../config/supabase');
const { openai } = require('../config/openai');
const multer = require('multer');
const path = require('path');

/**
 * Get all document summaries for the authenticated user
 */
const getDocumentSummaries = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const { data: summaries, error } = await supabase
      .from('document_summaries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching document summaries:', error);
      return res.status(500).json({ error: 'Failed to fetch document summaries' });
    }

    res.json({ summaries });
  } catch (error) {
    console.error('Error in getDocumentSummaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a specific document summary by ID
 */
const getDocumentSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: summary, error } = await supabase
      .from('document_summaries')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching document summary:', error);
      return res.status(404).json({ error: 'Document summary not found' });
    }

    res.json({ summary });
  } catch (error) {
    console.error('Error in getDocumentSummary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Extract text content from different file types
 */
const extractTextFromFile = async (fileBuffer, mimetype, filename) => {
  try {
    let text = '';
    
    if (mimetype.startsWith('text/')) {
      // Plain text files
      text = fileBuffer.toString('utf-8');
    } else if (mimetype === 'application/pdf') {
      // For PDF files, we'd need a PDF parser like pdf-parse
      // For now, return a placeholder
      text = `[PDF content extraction not implemented yet for ${filename}]`;
    } else if (mimetype.includes('word') || mimetype.includes('document')) {
      // For Word documents, we'd need a library like mammoth
      text = `[Word document content extraction not implemented yet for ${filename}]`;
    } else {
      throw new Error(`Unsupported file type: ${mimetype}`);
    }
    
    return text;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw error;
  }
};

/**
 * Summarize a document using AI
 */
const summarizeDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'AI service not available' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    
    // Extract text from the file
    let text;
    try {
      text = await extractTextFromFile(buffer, mimetype, originalname);
    } catch (extractError) {
      return res.status(400).json({ 
        error: 'Failed to extract text from file',
        details: extractError.message 
      });
    }

    // Truncate text if too long (OpenAI has token limits)
    const maxLength = 12000; // Roughly 3000 tokens
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '... [truncated]';
    }

    // Use AI to summarize the document
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a document summarization assistant. Analyze the provided document and create:
          1. A comprehensive summary (2-3 paragraphs)
          2. Key points (bullet points of main ideas)
          
          Return your response as JSON with this structure:
          {
            "summary": "Comprehensive summary text",
            "key_points": ["Key point 1", "Key point 2", "Key point 3", ...],
            "word_count": estimated_word_count,
            "main_topics": ["topic1", "topic2", ...]
          }`
        },
        {
          role: "user",
          content: `Please summarize this document:\n\nFilename: ${originalname}\n\nContent:\n${text}`
        }
      ],
      temperature: 0.3
    });

    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Upload file to Supabase Storage (optional)
    let fileUrl = null;
    try {
      const fileName = `${Date.now()}-${originalname}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(fileName, buffer, {
          contentType: mimetype,
          upsert: false
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('files')
          .getPublicUrl(fileName);
        fileUrl = urlData.publicUrl;
      }
    } catch (uploadError) {
      console.warn('File upload failed, continuing without URL:', uploadError);
    }

    // Save document summary to database
    const { data: summary, error } = await supabase
      .from('document_summaries')
      .insert({
        user_id: req.user.id,
        filename: originalname,
        original_url: fileUrl,
        summary: aiResponse.summary,
        key_points: aiResponse.key_points || [],
        word_count: aiResponse.word_count || Math.floor(text.length / 5),
        file_type: mimetype,
        processing_status: 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving document summary:', error);
      return res.status(500).json({ error: 'Failed to save document summary' });
    }

    res.status(201).json({ 
      summary,
      message: 'Document summarized successfully'
    });
  } catch (error) {
    console.error('Error in summarizeDocument:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Extract key points from a document using AI
 */
const extractKeyPoints = async (req, res) => {
  try {
    const { text, document_id } = req.body;

    if (!text && !document_id) {
      return res.status(400).json({ error: 'Either text or document_id is required' });
    }

    if (!openai) {
      return res.status(503).json({ error: 'AI service not available' });
    }

    let contentToAnalyze = text;

    // If document_id is provided, get the content from existing summary
    if (document_id && !text) {
      const { data: existingSummary, error } = await supabase
        .from('document_summaries')
        .select('summary')
        .eq('id', document_id)
        .eq('user_id', req.user.id)
        .single();

      if (error || !existingSummary) {
        return res.status(404).json({ error: 'Document not found' });
      }

      contentToAnalyze = existingSummary.summary;
    }

    // Use AI to extract key points
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a key point extraction assistant. Analyze the provided text and extract the most important key points.
          
          Return a JSON array of key points:
          [
            "Key point 1",
            "Key point 2", 
            "Key point 3",
            ...
          ]
          
          Focus on actionable items, main conclusions, important facts, and critical insights.
          Limit to 5-10 key points maximum.`
        },
        {
          role: "user",
          content: contentToAnalyze
        }
      ],
      temperature: 0.3
    });

    let keyPoints;
    try {
      keyPoints = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    res.json({ key_points: keyPoints });
  } catch (error) {
    console.error('Error in extractKeyPoints:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a document summary
 */
const deleteDocumentSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('document_summaries')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error deleting document summary:', error);
      return res.status(404).json({ error: 'Document summary not found' });
    }

    res.json({ message: 'Document summary deleted successfully' });
  } catch (error) {
    console.error('Error in deleteDocumentSummary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDocumentSummaries,
  getDocumentSummary,
  summarizeDocument,
  extractKeyPoints,
  deleteDocumentSummary
};