class SpitchService {
  private config: SpitchConfig;
  private proxyUrl: string;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_SPITCH_API_KEY || '',
      apiUrl: 'https://api.spi-tch.com', // Correct URL with hyphen
    };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('VITE_SUPABASE_URL is not configured');
    }
    
    this.proxyUrl = `${supabaseUrl}/functions/v1/spitch-proxy`;

    if (!this.config.apiKey) {
      console.warn('Spitch API key not configured');
    }
  }

  /**
   * Transcribe audio - Updated for correct endpoint
   */
  async transcribeAudio(
    audioBlob: Blob,
    language: 'yo' | 'ig' | 'ha' | 'en' | 'am',
    options?: {
      timestamps?: 'sentence' | 'word';
      specialWords?: string[];
    }
  ): Promise<TranscriptionResult> {
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      formData.append('content', audioBlob, 'audio.wav');
      formData.append('language', language);
      
      // Use mansa_v1 model for English
      if (language === 'en') {
        formData.append('model', 'mansa_v1');
      } else {
        formData.append('model', 'legacy');
      }
      
      if (options?.timestamps) {
        formData.append('timestamp', options.timestamps);
      }
      
      if (options?.specialWords && options.specialWords.length > 0) {
        formData.append('special_words', options.specialWords.join(','));
      }

      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/transcriptions`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Transcription failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Spitch transcription error:', error);
      throw error;
    }
  }

  /**
   * Generate speech - Updated for correct endpoint
   */
  async generateSpeech(
    text: string,
    language: 'yo' | 'ig' | 'ha' | 'en' | 'am',
    voice?: string
  ): Promise<Blob> {
    try {
      // Note: The API doesn't have a tone marking endpoint
      // We'll need to handle tone marks client-side or find another solution
      
      const requestBody = {
        text,
        language,
        voice: voice || this.getDefaultVoice(language),
        model: 'legacy' // The only model available for TTS
      };

      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Speech generation failed: ${error}`);
      }

      // The response is audio/wav
      return await response.blob();
    } catch (error) {
      console.error('Speech generation error:', error);
      throw error;
    }
  }

  /**
   * Translate text - New method for translation endpoint
   */
  async translateText(
    text: string,
    sourceLang: 'yo' | 'ig' | 'ha' | 'en' | 'am',
    targetLang: 'yo' | 'ig' | 'ha' | 'en' | 'am'
  ): Promise<string> {
    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source: sourceLang,
          target: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Add tone marks - Client-side implementation since API doesn't have this
   */
  async addToneMarks(text: string, language: 'yo'): Promise<string> {
    if (language !== 'yo') return text;
    
    // Simple client-side tone marking for common words
    const toneMap: Record<string, string> = {
      'bawo ni': 'báwo ni',
      'e kaaro': 'ẹ káàárọ̀',
      'e kaasan': 'ẹ káàsán',
      'e kurole': 'ẹ kúurọ̀lẹ́',
      'o dabo': 'o dàbọ̀',
      'mo dupe': 'mo dúpẹ́',
      'oluwa': 'olúwa',
      'yoruba': 'yorùbá',
    };
    
    let result = text.toLowerCase();
    Object.entries(toneMap).forEach(([plain, toned]) => {
      result = result.replace(new RegExp(plain, 'gi'), toned);
    });
    
    return result;
  }

  /**
   * Get default voice for language
   */
  private getDefaultVoice(language: string): string {
    const voices: Record<string, string> = {
      yo: 'sade',
      ig: 'amara',
      ha: 'zainab',
      en: 'lina',
      am: 'hana',
    };
    
    return voices[language] || 'lina';
  }
}

export const spitchService = new SpitchService();