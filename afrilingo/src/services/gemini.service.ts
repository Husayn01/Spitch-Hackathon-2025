import { GoogleGenerativeAI } from '@google/generative-ai';

interface ConversationContext {
  language: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  culturalContext?: string;
  previousMessages?: Array<{ role: string; content: string }>;
}

interface CulturalExplanation {
  explanation: string;
  examples: string[];
  relatedPhrases?: string[];
  culturalNotes?: string[];
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not configured');
    }
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use the stable model version
    this.model = this.genAI.getGenerativeModel({ 
      model: 'models/gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });
  }

  /**
   * Retry logic for API calls
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>, 
    retries = 3, 
    delay = 1000
  ): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries <= 0) throw error;
      
      // If model is overloaded, wait longer
      if (error.message?.includes('overloaded')) {
        await new Promise(resolve => setTimeout(resolve, delay * 2));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  /**
   * Parse JSON safely with fallback
   */
  private parseJSONSafely(text: string, fallback: any = {}): any {
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.warn('Failed to parse JSON, using fallback:', error);
      
      // Try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch {
          return fallback;
        }
      }
      
      return fallback;
    }
  }

  /**
   * Generate a culturally-aware conversation
   */
  async generateConversation(
    topic: string,
    context: ConversationContext
  ): Promise<{ userPrompt: string; aiResponse: string; culturalNotes: string[] }> {
    const prompt = `
      You are a Nigerian language and culture tutor helping someone learn ${context.language}.
      Generate a realistic conversation scenario about "${topic}" that would happen in Nigeria.
      
      User Level: ${context.userLevel}
      Cultural Context: ${context.culturalContext || 'General Nigerian setting'}
      
      Create:
      1. A situation/prompt the user should respond to in ${context.language}
      2. An appropriate response they could give
      3. 2-3 cultural notes about this interaction
      
      Format your response as valid JSON:
      {
        "userPrompt": "The situation in English",
        "expectedResponse": "What they should say in ${context.language} with translation",
        "aiResponse": "How a Nigerian would naturally respond",
        "culturalNotes": ["note1", "note2", "note3"]
      }
      
      Make it authentic to Nigerian culture. Ensure the JSON is valid.
    `;

    try {
      const generateFn = async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return this.parseJSONSafely(text, {
          userPrompt: `You're at a Nigerian ${topic}. Someone greets you.`,
          aiResponse: `Good ${topic} interaction!`,
          culturalNotes: ['Always be respectful', 'Greetings are important']
        });
      };

      return await this.retryWithBackoff(generateFn);
    } catch (error) {
      console.error('Gemini conversation generation error:', error);
      
      // Return fallback content
      return {
        userPrompt: `You're at a Nigerian market. The seller greets you saying "Ẹ káàárọ̀!"`,
        aiResponse: `Ẹ káàárọ̀ má/sà! Kí ni ẹ fẹ́ rà?`,
        culturalNotes: [
          'Always respond to greetings before business',
          'Use "má" for women, "sà" for men',
          'Morning greetings are crucial in Nigerian culture'
        ]
      };
    }
  }

  /**
   * Generate a culturally relevant story with better error handling
   */
  async generateStory(
    language: string,
    level: 'beginner' | 'intermediate' | 'advanced',
    theme?: string
  ): Promise<{
    title: string;
    story: string;
    vocabulary: Array<{ word: string; meaning: string }>;
    comprehensionQuestions: string[];
  }> {
    const prompt = `
      Create a short Nigerian folktale or modern story for ${language} learners.
      Level: ${level}
      ${theme ? `Theme: ${theme}` : 'Any Nigerian cultural theme'}
      
      Format as valid JSON:
      {
        "title": "Story title",
        "story": "The complete story",
        "vocabulary": [
          {"word": "word1", "meaning": "meaning1"}
        ],
        "comprehensionQuestions": ["question1", "question2", "question3"]
      }
      
      Keep the story short (3-4 paragraphs). Ensure valid JSON.
    `;

    try {
      const generateFn = async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return this.parseJSONSafely(text, {
          title: 'The Wise Tortoise',
          story: 'A classic Nigerian folktale about wisdom and patience...',
          vocabulary: [
            { word: 'Ìjàpá', meaning: 'Tortoise' },
            { word: 'Ọgbọ́n', meaning: 'Wisdom' }
          ],
          comprehensionQuestions: [
            'What did the tortoise learn?',
            'Why is patience important?',
            'What does this teach us?'
          ]
        });
      };

      return await this.retryWithBackoff(generateFn);
    } catch (error) {
      console.error('Story generation error:', error);
      
      // Return fallback story
      return {
        title: 'The Patient Farmer | Àgbẹ̀ Onísùúrù',
        story: `There was once a farmer in a Nigerian village who planted yam seedlings. His neighbors laughed, saying the rains were late. But the farmer said, "Sùúrù ni baba ìwà" (Patience is the father of character). He watered his plants daily. When the rains finally came, his yams grew the biggest in the village. His patience was rewarded with a bountiful harvest.`,
        vocabulary: [
          { word: 'Àgbẹ̀', meaning: 'Farmer' },
          { word: 'Sùúrù', meaning: 'Patience' },
          { word: 'Ìwà', meaning: 'Character' },
          { word: 'Èso', meaning: 'Harvest/Fruit' }
        ],
        comprehensionQuestions: [
          'What virtue did the farmer show?',
          'What happened when the rains came?',
          'What lesson does this story teach?'
        ]
      };
    }
  }

  // Update other methods with similar error handling...
  async explainCulturalContext(
    phrase: string,
    language: string,
    situation?: string
  ): Promise<CulturalExplanation> {
    // Implementation with retry logic and fallback
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

      return await this.retryWithBackoff(generateFn);
    } catch (error) {
      return {
        explanation: `"${phrase}" is an important expression in Nigerian culture.`,
        examples: ['Used in formal settings', 'Shows respect to elders'],
        relatedPhrases: [`Other greetings in ${language}`],
        culturalNotes: ['Respect is central to Nigerian culture']
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
    // Simple implementation with fallback
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
    // Simple word-based similarity
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }
}

export const geminiService = new GeminiService();