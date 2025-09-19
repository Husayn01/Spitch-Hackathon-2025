/**
 * Spitch API Service
 * Handles text-to-speech and speech analysis
 * 
 * NOTE: This version includes mock pronunciation scoring
 * until the actual Spitch API implementation is ready
 */

const SPITCH_PROXY_URL = '/api/spitch-proxy';

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
  text: string;
  confidence: number;
}

class SpitchService {
  private proxyUrl: string;
  
  constructor() {
    this.proxyUrl = import.meta.env.VITE_SUPABASE_URL 
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/spitch-proxy`
      : SPITCH_PROXY_URL;
  }

  /**
   * Generate speech audio from text
   */
  async generateSpeech(
    text: string, 
    language: 'yo' | 'ig' | 'ha' | 'en'
  ): Promise<Blob> {
    try {
      // For now, use the browser's speech synthesis as fallback
      if ('speechSynthesis' in window) {
        // Create a mock audio blob
        return this.createMockAudioBlob(text, language);
      }
      
      // Actual Spitch API call (when ready)
      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language: this.mapLanguageCode(language),
          voice: 'default',
          speed: 1.0,
          pitch: 1.0
        })
      });

      if (!response.ok) {
        throw new Error('Speech synthesis failed');
      }

      return await response.blob();
    } catch (error) {
      console.warn('Speech synthesis error, using fallback:', error);
      return this.createMockAudioBlob(text, language);
    }
  }

  /**
   * Analyze pronunciation and return score with feedback
   * MOCK IMPLEMENTATION - Returns realistic but random scores
   */
  async analyzePronunciation(
    audioBlob: Blob,
    expectedText: string,
    language: 'yo' | 'ig' | 'ha' | 'en'
  ): Promise<PronunciationResult> {
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate realistic mock scores
    const baseScore = 0.6 + Math.random() * 0.3; // 60-90% range
    const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
    const finalScore = Math.max(0.5, Math.min(1, baseScore + variation));
    
    // Generate appropriate feedback based on score
    const feedback = this.generateFeedback(finalScore, expectedText, language);
    
    // Mock detailed scores
    const details = {
      accuracy: finalScore + (Math.random() - 0.5) * 0.1,
      fluency: finalScore + (Math.random() - 0.5) * 0.15,
      completeness: expectedText.split(' ').length > 3 ? 0.95 : 1.0
    };
    
    return {
      score: finalScore,
      feedback,
      details
    };
  }

  /**
   * Generate contextual feedback based on score and language
   */
  private generateFeedback(
    score: number, 
    text: string, 
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
        feedback.push('Pay attention to the tone marks - Yoruba is a tonal language.');
      } else if (language === 'ig') {
        feedback.push('Focus on the nasal sounds - they\'re important in Igbo.');
      } else if (language === 'ha') {
        feedback.push('Work on the glottal stops - they make a difference in Hausa.');
      }
    } else {
      feedback.push('Keep practicing! You\'re making progress.');
      feedback.push('Try listening to the example again and mimic the pronunciation.');
      feedback.push('Speak a bit slower and focus on each syllable.');
    }
    
    // Add specific feedback for common issues
    if (text.length > 20) {
      feedback.push('For longer phrases, try breaking them into smaller parts first.');
    }
    
    return feedback;
  }

  /**
   * Add tone marks to text (for tonal languages)
   */
  async addToneMarks(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.proxyUrl}?endpoint=/v1/tone-mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Tone marking failed');
      }

      const result: ToneMarkResult = await response.json();
      return result.text;
    } catch (error) {
      console.warn('Tone marking error, returning original text:', error);
      return text;
    }
  }

  /**
   * Convert internal language codes to Spitch format
   */
  private mapLanguageCode(language: 'yo' | 'ig' | 'ha' | 'en'): string {
    const mapping = {
      'yo': 'yo-NG',  // Yoruba
      'ig': 'ig-NG',  // Igbo  
      'ha': 'ha-NG',  // Hausa
      'en': 'en-NG'   // Nigerian English
    };
    return mapping[language] || 'en-NG';
  }

  /**
   * Create a mock audio blob for testing
   */
  private createMockAudioBlob(text: string, language: string): Blob {
    // Use Web Speech API as fallback
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.mapLanguageCode(language as any);
      utterance.rate = 0.9; // Slightly slower for language learning
      window.speechSynthesis.speak(utterance);
    }
    
    // Create a small silent audio blob as placeholder
    const arrayBuffer = new ArrayBuffer(44100 * 2); // 1 second of silence
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  /**
   * Get available voices for a language
   */
  async getVoices(language: 'yo' | 'ig' | 'ha' | 'en'): Promise<string[]> {
    // Mock implementation - return realistic voice options
    const voices = {
      'yo': ['Adunni (Female)', 'Babatunde (Male)', 'Funke (Female, Young)'],
      'ig': ['Adaeze (Female)', 'Emeka (Male)', 'Nneka (Female, Elder)'],
      'ha': ['Amina (Female)', 'Musa (Male)', 'Fatima (Female, Young)'],
      'en': ['Kemi (Female, Nigerian)', 'Femi (Male, Nigerian)']
    };
    
    return voices[language] || ['Default'];
  }

  /**
   * Transcribe audio to text (for future implementation)
   */
  async transcribeAudio(
    audioBlob: Blob, 
    language: 'yo' | 'ig' | 'ha' | 'en'
  ): Promise<string> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'Transcription will be available soon';
  }
}

// Export singleton instance
export const spitchService = new SpitchService();

// Export types
export type { PronunciationResult, ToneMarkResult };