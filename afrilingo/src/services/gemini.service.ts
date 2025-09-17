import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

interface Story {
  title: string;
  content: string;
  moralLesson: string;
  vocabulary: Array<{
    word: string;
    meaning: string;
    usage: string;
  }>;
  comprehensionQuestions: string[];
}

interface CulturalExplanation {
  explanation: string;
  examples: string[];
  relatedPhrases: string[];
  culturalNotes: string[];
}

interface ConversationResponse {
  text: string;
  translation: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  // Retry logic for API calls
  private async retryWithBackoff<T>(
    fn: () => Promise<T>, 
    maxRetries = 3
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('Max retries exceeded');
  }

  // Safe JSON parsing
  private parseJSONSafely(text: string): any {
    try {
      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      // If parsing fails, return a structured default
      return null;
    }
  }

  async generateStory(
    language: string,
    level: string
  ): Promise<Story> {
    try {
      const prompt = `
        Generate a traditional Nigerian story in ${language} for ${level} learners.
        Include cultural elements and moral lessons typical of Nigerian folklore.
        
        Return a valid JSON object with this structure:
        {
          "title": "Story title in ${language}",
          "content": "Full story text (200-300 words)",
          "moralLesson": "The moral of the story",
          "vocabulary": [
            {"word": "word in ${language}", "meaning": "English meaning", "usage": "example sentence"}
          ],
          "comprehensionQuestions": ["question 1", "question 2", "question 3"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseJSONSafely(text);

      if (parsed) {
        return parsed;
      }

      // Fallback story
      return {
        title: `Traditional ${language} Story`,
        content: 'Once upon a time in a Nigerian village...',
        moralLesson: 'Wisdom comes from listening to our elders.',
        vocabulary: [
          { word: 'village', meaning: 'small town', usage: 'I live in a village' }
        ],
        comprehensionQuestions: [
          'What happened in the story?',
          'Who were the main characters?',
          'What lesson did you learn?'
        ]
      };
    } catch (error) {
      console.error('Story generation error:', error);
      // Return fallback story
      return {
        title: `Traditional ${language} Story`,
        content: 'Once upon a time in a Nigerian village, there lived a wise elder...',
        moralLesson: 'Respect and wisdom go hand in hand.',
        vocabulary: [
          { word: 'elder', meaning: 'old person', usage: 'The elder gave advice' },
          { word: 'wisdom', meaning: 'knowledge', usage: 'Wisdom comes with age' }
        ],
        comprehensionQuestions: [
          'What happened in the story?',
          'What was the main lesson?',
          'How can you apply this to your life?'
        ]
      };
    }
  }

  async explainCulturalContext(
    phrase: string,
    language: string,
    situation?: string
  ): Promise<CulturalExplanation> {
    try {
      const generateFn = async () => {
        const prompt = `
          Explain the cultural significance of "${phrase}" in ${language}.
          ${situation ? `Situation: ${situation}` : ''}
          
          Provide valid JSON:
          {
            "explanation": "explanation",
            "examples": ["example1", "example2"],
            "relatedPhrases": ["phrase1"],
            "culturalNotes": ["note1"]
          }
        `;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return this.parseJSONSafely(text);
      };

      const parsed = await this.retryWithBackoff(generateFn);
      if (parsed) return parsed;

      // Fallback
      return {
        explanation: `"${phrase}" is an important expression in Nigerian culture.`,
        examples: ['Used in formal settings', 'Shows respect to elders'],
        relatedPhrases: [`Other greetings in ${language}`],
        culturalNotes: ['Respect is central to Nigerian culture']
      };
    } catch (error) {
      return {
        explanation: `"${phrase}" is an important expression in Nigerian culture.`,
        examples: ['Used in formal settings', 'Shows respect to elders'],
        relatedPhrases: [`Other greetings in ${language}`],
        culturalNotes: ['Respect is central to Nigerian culture']
      };
    }
  }

  async startConversation(
    language: string,
    level: string,
    topic: string
  ): Promise<ConversationResponse> {
    try {
      const prompt = `
        Start a natural conversation in ${language} for a ${level} learner about ${topic}.
        You are a friendly Nigerian speaker. Begin with an appropriate greeting and a simple question.
        
        Return JSON:
        {
          "text": "Your message in ${language}",
          "translation": "English translation"
        }
        
        Keep it simple and culturally appropriate. DO NOT use any markdown formatting.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseJSONSafely(text);

      if (parsed) {
        return parsed;
      }

      // Fallback based on language
      const fallbacks = {
        Yoruba: {
          text: 'Ẹ káàárọ̀! Báwo ni o ṣe máa ń lọ?',
          translation: 'Good morning! How are you doing?'
        },
        Igbo: {
          text: 'Ụtụtụ ọma! Kedụ ka ị mere?',
          translation: 'Good morning! How are you?'
        },
        Hausa: {
          text: 'Ina kwana! Yaya kake?',
          translation: 'Good morning! How are you?'
        }
      };

      return fallbacks[language as keyof typeof fallbacks] || {
        text: 'Hello! How are you?',
        translation: 'Hello! How are you?'
      };
    } catch (error) {
      console.error('Conversation start error:', error);
      return {
        text: 'Hello! How are you today?',
        translation: 'Hello! How are you today?'
      };
    }
  }

  async continueConversation(
    messages: ConversationMessage[],
    language: string
  ): Promise<ConversationResponse> {
    try {
      const conversationHistory = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `
        Continue this ${language} conversation naturally. You are a friendly Nigerian speaker helping someone learn.
        
        Conversation so far:
        ${conversationHistory}
        
        Respond appropriately in ${language}. Keep it simple and educational.
        
        Return JSON:
        {
          "text": "Your response in ${language}",
          "translation": "English translation"
        }
        
        Be encouraging and culturally appropriate. DO NOT use markdown.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseJSONSafely(text);

      if (parsed) {
        return parsed;
      }

      // Fallback response
      return {
        text: 'That\'s good! Keep practicing.',
        translation: 'That\'s good! Keep practicing.'
      };
    } catch (error) {
      console.error('Conversation continue error:', error);
      return {
        text: 'I understand. Let\'s continue.',
        translation: 'I understand. Let\'s continue.'
      };
    }
  }

  async provideFeedback(
    userResponse: string,
    expectedResponse: string,
    language: string,
    context?: string
  ): Promise<{
    isCorrect: boolean;
    feedback: string;
    suggestions: string[];
    encouragement: string;
  }> {
    const similarity = this.calculateSimilarity(userResponse, expectedResponse);
    const isCorrect = similarity > 0.7;

    return {
      isCorrect,
      feedback: isCorrect 
        ? 'Excellent work! Your response captures the right meaning.' 
        : 'Good effort! Let\'s refine it a bit more.',
      suggestions: isCorrect 
        ? ['Try varying your expressions next time'] 
        : ['Listen to the pronunciation again', 'Pay attention to tone marks'],
      encouragement: isCorrect 
        ? 'Ẹ kú iṣẹ́! Well done!' 
        : 'Ẹ má dúró! Don\'t give up!'
    };
  }

  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}

export const geminiService = new GeminiService();