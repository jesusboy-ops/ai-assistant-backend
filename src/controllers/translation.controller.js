const axios = require('axios');

/**
 * Translate text using LibreTranslate API
 */
const translateText = async (req, res) => {
  try {
    const { text, source = 'auto', target = 'en' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text is required for translation' 
      });
    }

    // Call LibreTranslate API
    const response = await axios.post('https://libretranslate.de/translate', {
      q: text,
      source: source,
      target: target,
      format: 'text'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    res.json({
      translatedText: response.data.translatedText,
      sourceLanguage: response.data.detectedLanguage || source,
      targetLanguage: target,
      originalText: text
    });

  } catch (error) {
    console.error('Translation error:', error.message);
    
    if (error.response) {
      // LibreTranslate API error
      return res.status(error.response.status).json({
        error: 'Translation service error',
        message: error.response.data?.error || 'Translation failed'
      });
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return res.status(408).json({
        error: 'Translation timeout',
        message: 'Translation service took too long to respond'
      });
    } else {
      // Network or other error
      return res.status(503).json({
        error: 'Translation service unavailable',
        message: 'Could not connect to translation service'
      });
    }
  }
};

/**
 * Get supported languages from LibreTranslate
 */
const getSupportedLanguages = async (req, res) => {
  try {
    const response = await axios.get('https://libretranslate.de/languages', {
      timeout: 5000
    });

    res.json({
      languages: response.data
    });

  } catch (error) {
    console.error('Error fetching languages:', error.message);
    
    // Return a fallback list of common languages
    res.json({
      languages: [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ar', name: 'Arabic' },
        { code: 'hi', name: 'Hindi' }
      ],
      fallback: true,
      message: 'Using fallback language list due to service unavailability'
    });
  }
};

/**
 * Detect language of given text
 */
const detectLanguage = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Text is required for language detection' 
      });
    }

    const response = await axios.post('https://libretranslate.de/detect', {
      q: text
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    res.json({
      detectedLanguage: response.data[0]?.language || 'unknown',
      confidence: response.data[0]?.confidence || 0,
      text: text
    });

  } catch (error) {
    console.error('Language detection error:', error.message);
    
    res.status(503).json({
      error: 'Language detection unavailable',
      message: 'Could not detect language',
      detectedLanguage: 'unknown',
      confidence: 0
    });
  }
};

module.exports = {
  translateText,
  getSupportedLanguages,
  detectLanguage
};