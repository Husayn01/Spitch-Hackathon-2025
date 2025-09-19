/**
 * Spitch API Service
 * Handles text-to-speech, speech analysis, and tone marking
 * Uses actual Spitch API endpoints for Nigerian language learning
 */

const SPITCH_API_URL = 'https://api.spi-tch.com';

interface PronunciationResult {
  score: number;
  feedback: string[];
  details?: {
    accuracy: number;
    fluency: number;
    completeness: number;
  };
}

interface ToneMarkResult {
  request_id: string;
  text: string;
}

interface TranscriptionResult {
  request_id: string;
  text: string;
  timestamps?: Array<{
    text: string;
    start: number;
    end: number;
  }>;
}

// Voice mapping based on Spitch documentation
const VOICE_MAPPING = {
  yo: {
    male: ['segun', 'femi'],
    female: ['sade', 'funmi'],
    default: 'sade'
  },
  ig: {
    male: ['obinna', 'ebuka'],
    female: ['ngozi', 'amara'],
    default: 'ngozi'
  },
  ha: {
    male: ['aliyu', 'hasan'],
    female: ['amina', 'zainab'],
    default: 'amina'
  },
  en: {
    male: ['john', 'jude', 'henry'],
    female: ['lucy', 'lina', 'kani'],
    default: 'lina'
  }
};

class SpitchService {
  private proxyUrl: string;
  private audioCache: Map<string, Blob> = new Map();
  
  constructor() {
    this.proxyUrl = import.meta.env.VITE_SUPABASE_URL 
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spitch-proxy`
      : '/api/spitch-proxy';
  }

  /**
   * Generate speech audio from text using Spitch API
   */
  async generateSpeech(
    text: string, 
    language: 'yo' | 'ig' | 'ha' | 'en',
    voice?: string
  ): Promise<Blob> {
    try {
      // Check cache first
      const cacheKey = `${language}-${voice || 'default'}-${text}`;
      if (this.audioCache.has(cacheKey)) {
        return this.audioCache.get(cacheKey)!;
      }

      // For tonal languages, add tone marks first
      let processedText = text;
      if (language === 'yo') {
        try {
          processedText = await this.addToneMarks(text, language);
        } catch (error) {
          console.warn('Tone marking failed, using original text');
        }
      }

      // Select appropriate voice
      const selectedVoice = voice || VOICE_MAPPING[language].default;
      
      // Call actual Spitch API endpoint
      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: processedText,
          language: language,
          voice: selectedVoice,
          model: 'legacy'
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Spitch API error:', response.status, errorData);
        throw new Error(`Speech synthesis failed: ${response.status}`);
      }

      // The response should be audio/wav
      const audioBlob = await response.blob();
      
      // Cache the result
      this.audioCache.set(cacheKey, audioBlob);
      
      // Clear old cache entries if too many
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
      }

      return audioBlob;
    } catch (error) {
      console.error('Speech synthesis error:', error);
      throw error; // Don't fall back to browser TTS
    }
  }

  /**
   * Analyze pronunciation using Spitch API
   */
  async analyzePronunciation(
    audioBlob: Blob,
    expectedText: string,
    language: 'yo' | 'ig' | 'ha' | 'en'
  ): Promise<PronunciationResult> {
    try {
      // Create form data for audio upload
      const formData = new FormData();
      formData.append('content', audioBlob, 'recording.wav');
      formData.append('language', language);
      formData.append('model', 'legacy');
      
      // For special Nigerian names/words
      const specialWords = this.extractSpecialWords(expectedText);
      if (specialWords.length > 0) {
        formData.append('special_words', specialWords.join(','));
      }

      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/transcriptions`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const transcription: TranscriptionResult = await response.json();
      
      // Compare transcription with expected text
      const score = this.calculatePronunciationScore(
        transcription.text, 
        expectedText
      );
      
      // Generate feedback based on comparison
      const feedback = this.generateDetailedFeedback(
        score, 
        transcription.text, 
        expectedText, 
        language
      );

      return {
        score,
        feedback,
        details: {
          accuracy: score,
          fluency: score * 0.9, // Simplified for now
          completeness: this.calculateCompleteness(transcription.text, expectedText)
        }
      };
    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      // Return a more helpful error result instead of mock data
      throw new Error('Unable to analyze pronunciation. Please try again.');
    }
  }

  /**
   * Add tone marks to text for tonal languages
   */
  async addToneMarks(text: string, language: 'yo' | 'ig'): Promise<string> {
    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/tone-mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          language 
        })
      });

      if (!response.ok) {
        throw new Error('Tone marking failed');
      }

      const result: ToneMarkResult = await response.json();
      return result.text;
    } catch (error) {
      console.warn('Tone marking error:', error);
      return text; // Return original text if tone marking fails
    }
  }

  /**
   * Transcribe audio to text
   */
  async transcribeAudio(
    audioBlob: Blob, 
    language: 'yo' | 'ig' | 'ha' | 'en'
  ): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('content', audioBlob, 'audio.wav');
      formData.append('language', language);
      formData.append('model', 'legacy');

      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/transcriptions`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result: TranscriptionResult = await response.json();
      return result.text;
    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }

  /**
   * Get available voices for a language
   */
  getVoices(language: 'yo' | 'ig' | 'ha' | 'en'): Array<{id: string, name: string, gender: string}> {
    const voices = VOICE_MAPPING[language];
    const voiceList: Array<{id: string, name: string, gender: string}> = [];
    
    voices.male.forEach(id => {
      voiceList.push({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        gender: 'male'
      });
    });
    
    voices.female.forEach(id => {
      voiceList.push({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        gender: 'female'
      });
    });
    
    return voiceList;
  }

  /**
   * Calculate pronunciation score by comparing transcription with expected text
   */
  private calculatePronunciationScore(transcribed: string, expected: string): number {
    const transcribedWords = transcribed.toLowerCase().split(/\s+/);
    const expectedWords = expected.toLowerCase().split(/\s+/);
    
    let matchCount = 0;
    const maxLength = Math.max(transcribedWords.length, expectedWords.length);
    
    for (let i = 0; i < Math.min(transcribedWords.length, expectedWords.length); i++) {
      if (this.wordsMatch(transcribedWords[i], expectedWords[i])) {
        matchCount++;
      }
    }
    
    return matchCount / maxLength;
  }

  /**
   * Check if two words match (allowing for minor differences)
   */
  private wordsMatch(word1: string, word2: string): boolean {
    // Exact match
    if (word1 === word2) return true;
    
    // Remove tone marks and compare
    const normalized1 = this.removeToneMarks(word1);
    const normalized2 = this.removeToneMarks(word2);
    if (normalized1 === normalized2) return true;
    
    // Check Levenshtein distance for minor differences
    return this.levenshteinDistance(normalized1, normalized2) <= 1;
  }

  /**
   * Remove tone marks from text
   */
  private removeToneMarks(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate completeness score
   */
  private calculateCompleteness(transcribed: string, expected: string): number {
    const transcribedWords = transcribed.split(/\s+/).length;
    const expectedWords = expected.split(/\s+/).length;
    return Math.min(transcribedWords / expectedWords, 1);
  }

  /**
   * Extract special Nigerian words/names for better recognition
   */
  private extractSpecialWords(text: string): string[] {
    // Common Nigerian names and words that might need special handling
    const specialPatterns = [
      /[A-Z][a-z]+/g, // Capitalized words (likely names)
    ];
    
    const words = new Set<string>();
    specialPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(word => words.add(word));
      }
    });
    
    return Array.from(words);
  }

  /**
   * Generate detailed feedback based on pronunciation analysis
   */
  private generateDetailedFeedback(
    score: number, 
    transcribed: string,
    expected: string,
    language: 'yo' | 'ig' | 'ha' | 'en'
  ): string[] {
    const feedback: string[] = [];
    
    if (score >= 0.85) {
      feedback.push('Excellent pronunciation! Native speakers would understand you perfectly.');
      feedback.push('Your tone and rhythm are very natural.');
    } else if (score >= 0.7) {
      feedback.push('Good job! Your pronunciation is clear and understandable.');
      
      // Language-specific tips
      if (language === 'yo') {
        feedback.push('Remember that Yoruba is a tonal language - pay attention to the rising and falling tones.');
      } else if (language === 'ig') {
        feedback.push('Focus on the nasal sounds (ṅ, ñ) - they\'re distinctive in Igbo.');
      } else if (language === 'ha') {
        feedback.push('Work on the glottal stops (ƙ, ɗ, ƴ) - they\'re important in Hausa.');
      }
    } else {
      feedback.push('Keep practicing! You\'re making progress.');
      feedback.push('Try listening to the example again and mimic the pronunciation closely.');
      
      // Identify specific problem areas
      const transcribedWords = transcribed.toLowerCase().split(/\s+/);
      const expectedWords = expected.toLowerCase().split(/\s+/);
      
      for (let i = 0; i < expectedWords.length; i++) {
        if (!transcribedWords[i] || !this.wordsMatch(transcribedWords[i], expectedWords[i])) {
          feedback.push(`Pay special attention to pronouncing "${expectedWords[i]}"`);
          break;
        }
      }
    }
    
    return feedback;
  }

  /**
   * Clear audio cache
   */
  clearCache(): void {
    this.audioCache.clear();
  }
}

// Export singleton instance
export const spitchService = new SpitchService();

// Export types
export type { PronunciationResult, ToneMarkResult, TranscriptionResult };