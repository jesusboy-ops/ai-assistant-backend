const openai = require('../config/openai');
const fs = require('fs').promises;
const path = require('path');

class VoiceController {
  /**
   * Convert text to speech using OpenAI TTS
   */
  async textToSpeech(req, res, next) {
    try {
      const { text, voice = 'alloy' } = req.body;

      // Generate speech
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: voice,
        input: text
      });

      // Convert to buffer
      const buffer = Buffer.from(await mp3.arrayBuffer());

      // Set headers for audio response
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length,
        'Content-Disposition': 'attachment; filename="speech.mp3"'
      });

      res.send(buffer);
    } catch (error) {
      console.error('TTS error:', error);
      next(error);
    }
  }

  /**
   * Convert speech to text (transcription)
   */
  async speechToText(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' });
      }

      // Save file temporarily
      const tempPath = path.join(__dirname, '../../temp', `${Date.now()}-${req.file.originalname}`);
      await fs.mkdir(path.dirname(tempPath), { recursive: true });
      await fs.writeFile(tempPath, req.file.buffer);

      // Transcribe
      const transcription = await openai.audio.transcriptions.create({
        file: await fs.readFile(tempPath),
        model: 'whisper-1'
      });

      // Clean up temp file
      await fs.unlink(tempPath);

      res.json({
        text: transcription.text
      });
    } catch (error) {
      console.error('STT error:', error);
      next(error);
    }
  }

  /**
   * Get available voices
   */
  async getVoices(req, res, next) {
    try {
      const voices = [
        { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced' },
        { id: 'echo', name: 'Echo', description: 'Male voice' },
        { id: 'fable', name: 'Fable', description: 'British accent' },
        { id: 'onyx', name: 'Onyx', description: 'Deep male voice' },
        { id: 'nova', name: 'Nova', description: 'Female voice' },
        { id: 'shimmer', name: 'Shimmer', description: 'Soft female voice' }
      ];

      res.json({ voices });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VoiceController();
