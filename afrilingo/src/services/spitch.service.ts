interface SpitchConfig {
  apiKey: string;
  apiUrl: string;
}

export interface TranscriptionResult {
  request_id: string;
  text: string;
  timestamps?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

export interface ToneMarkResult {
  request_id: string;
  text: string;
}

export interface TranslationResult {
  request_id: string;
  text: string;
}

export interface PronunciationAnalysis {
  score: number;
  feedback: string[];
  problemAreas: string[];
}

class SpitchService {
  private config: SpitchConfig;
  private proxyUrl: string;

  constructor() {
    this.config = {
      apiKey: import.meta.env.VITE_SPITCH_API_KEY || '',
      apiUrl: 'https://api.spi-tch.com',
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
   * Transcribe audio using the correct endpoint
   */
  async transcribeAudio(
    audioBlob: Blob,
    language: 'yo' | 'ig' | 'ha' | 'en' | 'am',
    options?: {
      timestamps?: 'sentence' | 'word' | 'none';
      specialWords?: string[];
    }
  ): Promise<TranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append('content', audioBlob, 'audio.wav');
      formData.append('language', language);
      
      // Model selection based on language
      if (language === 'en') {
        formData.append('model', 'mansa_v1');
      } else {
        formData.append('model', 'legacy');
      }
      
      // Add optional parameters
      if (options?.timestamps) {
        formData.append('timestamp', options.timestamps);
      } else {
        formData.append('timestamp', 'none');
      }
      
      if (options?.specialWords && options.specialWords.length > 0) {
        formData.append('special_words', options.specialWords.join(','));
      }

      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/transcriptions`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || error.message || 'Transcription failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Spitch transcription error:', error);
      throw error;
    }
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(
    text: string,
    language: 'yo' | 'ig' | 'ha' | 'en' | 'am',
    voice?: string
  ): Promise<Blob> {
    try {
      // Apply tone marks for Yoruba text before synthesis
      if (language === 'yo') {
        try {
          const tonedText = await this.addToneMarks(text, language);
          text = tonedText;
        } catch (error) {
          console.warn('Tone marking failed, using original text:', error);
        }
      }

      const requestBody = {
        text,
        language,
        voice: voice || this.getDefaultVoice(language),
        model: 'legacy' // Only model available for TTS
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

      // The response should be audio/wav
      return await response.blob();
    } catch (error) {
      console.error('Speech generation error:', error);
      throw error;
    }
  }

  /**
   * Add tone marks using the correct endpoint
   */
  async addToneMarks(text: string, language: 'yo'): Promise<string> {
    if (language !== 'yo') return text;
    
    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/diacritics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Tone marking failed');
      }

      const result: ToneMarkResult = await response.json();
      return result.text || text;
    } catch (error) {
      console.warn('Tone marking error, using fallback:', error);
      
      // Fallback to client-side tone marking
      return this.clientSideToneMarking(text);
    }
  }

  /**
   * Client-side tone marking fallback
   */
  private clientSideToneMarking(text: string): string {
    const toneMap: Record<string, string> = {
      'bawo ni': 'báwo ni',
      'bawo ni ololufe mi': 'báwo ni olólùfẹ́ mi',
      'e kaaro': 'ẹ káàárọ̀',
      'e kaasan': 'ẹ káàsán',
      'e kurole': 'ẹ kúurọ̀lẹ́',
      'o dabo': 'o dàbọ̀',
      'mo dupe': 'mo dúpẹ́',
      'eku': 'ẹkú',
      'ese': 'ẹ̀ṣé',
      'odun': 'ọdún',
    };
    
    let result = text.toLowerCase();
    Object.entries(toneMap).forEach(([plain, toned]) => {
      result = result.replace(new RegExp(`\\b${plain}\\b`, 'gi'), toned);
    });
    
    return result;
  }

  /**
   * Translate text between languages
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

      const result: TranslationResult = await response.json();
      return result.text;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Analyze pronunciation (client-side implementation)
   */
  async analyzePronunciation(
    userAudio: Blob,
    expectedText: string,
    language: 'yo' | 'ig' | 'ha' | 'en' | 'am'
  ): Promise<PronunciationAnalysis> {
    try {
      const transcription = await this.transcribeAudio(userAudio, language, {
        timestamps: 'word',
      });

      return this.comparePronunciation(
        transcription.text,
        expectedText,
        language
      );
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      throw error;
    }
  }

  /**
   * Compare pronunciation
   */
  private comparePronunciation(
    userText: string,
    expectedText: string,
    language: string
  ): PronunciationAnalysis {
    const normalizedUser = this.normalizeText(userText, language);
    const normalizedExpected = this.normalizeText(expectedText, language);
    const score = this.calculateSimilarity(normalizedUser, normalizedExpected);

    const feedback: string[] = [];
    const problemAreas: string[] = [];

    if (score >= 0.9) {
      feedback.push('Excellent pronunciation! 🎉');
    } else if (score >= 0.7) {
      feedback.push('Good job! Keep practicing.');
    } else {
      feedback.push('Keep trying! Listen to the example again.');
    }

    if (language === 'yo' && score < 0.9) {
      feedback.push('Pay attention to tone marks - they change meaning.');
      problemAreas.push('tonal accuracy');
    }

    return { score, feedback, problemAreas };
  }

  private normalizeText(text: string, language: string): string {
    let normalized = text.toLowerCase().trim();
    if (language !== 'yo') {
      normalized = normalized.replace(/[.,!?;:'"]/g, '');
    }
    return normalized.replace(/\s+/g, ' ');
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(' ').filter(w => w);
    const words2 = text2.split(' ').filter(w => w);
    
    if (!words1.length || !words2.length) return 0;
    
    let matches = 0;
    const minLength = Math.min(words1.length, words2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (words1[i] === words2[i]) matches++;
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

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

  getAvailableVoices(language: string): Array<{ id: string; name: string; gender: string }> {
    const voiceMap: Record<string, Array<{ id: string; name: string; gender: string }>> = {
      yo: [
        { id: 'sade', name: 'Sade', gender: 'female' },
        { id: 'funmi', name: 'Funmi', gender: 'female' },
        { id: 'segun', name: 'Segun', gender: 'male' },
        { id: 'femi', name: 'Femi', gender: 'male' },
      ],
      // ... other languages
    };
    return voiceMap[language] || [];
  }
}

export const spitchService = new SpitchService();