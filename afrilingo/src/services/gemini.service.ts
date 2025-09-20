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
  private model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
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
      // If parsing fails, return null
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
        
        Return ONLY a valid JSON object with this structure:
        {
          "title": "Story title in ${language}",
          "content": "Full story text (200-300 words)",
          "moralLesson": "The moral of the story",
          "vocabulary": [
            {"word": "word in ${language}", "meaning": "English meaning", "usage": "example sentence"}
          ],
          "comprehensionQuestions": ["question 1", "question 2", "question 3"]
        }
        
        DO NOT include any text outside the JSON object.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseJSONSafely(text);

      if (parsed) {
        return parsed;
      }

      // Fallback story
      return this.getFallbackStory(language);
    } catch (error) {
      console.error('Story generation error:', error);
      return this.getFallbackStory(language);
    }
  }

  private getFallbackStory(language: string): Story {
    const stories = {
      Yoruba: {
        title: 'Ìjàpá àti Ẹkùn',
        content: 'Ní ìgbà kan, Ìjàpá àti Ẹkùn jẹ́ ọ̀rẹ́. Ṣùgbọ́n Ìjàpá fẹ́ jẹ ọba igbó...',
        moralLesson: 'Ọgbọ́n ju agbára lọ',
        vocabulary: [
          { word: 'Ìjàpá', meaning: 'Tortoise', usage: 'Ìjàpá jẹ́ ọlọ́gbọ́n' },
          { word: 'Ẹkùn', meaning: 'Leopard', usage: 'Ẹkùn ní agbára' }
        ],
        comprehensionQuestions: [
          'Kí ni Ìjàpá fẹ́ ṣe?',
          'Tani ó ní agbára jù?',
          'Kí ni ẹ̀kọ́ ìtàn yìí?'
        ]
      },
      Igbo: {
        title: 'Mbe na Enyi',
        content: 'Otu oge, Mbe na Enyi bụ enyi. Mbe chọrọ ịbụ eze ọhịa...',
        moralLesson: 'Amamihe ka ike',
        vocabulary: [
          { word: 'Mbe', meaning: 'Tortoise', usage: 'Mbe nwere amamihe' },
          { word: 'Enyi', meaning: 'Elephant', usage: 'Enyi nwere ike' }
        ],
        comprehensionQuestions: [
          'Gịnị ka Mbe chọrọ?',
          'Onye nwere ike karịa?',
          'Gịnị bụ ihe mmụta?'
        ]
      },
      Hausa: {
        title: 'Kunkuru da Zaki',
        content: 'Wata rana, Kunkuru da Zaki suna abokantaka. Kunkuru yana son ya zama sarkin daji...',
        moralLesson: 'Hikima ta fi ƙarfi',
        vocabulary: [
          { word: 'Kunkuru', meaning: 'Tortoise', usage: 'Kunkuru yana da hikima' },
          { word: 'Zaki', meaning: 'Lion', usage: 'Zaki yana da ƙarfi' }
        ],
        comprehensionQuestions: [
          'Me Kunkuru yake so?',
          'Wane ne yake da ƙarfi?',
          'Menene darasin labarin?'
        ]
      }
    };

    return stories[language as keyof typeof stories] || stories.Yoruba;
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
          
          Provide ONLY valid JSON:
          {
            "explanation": "detailed explanation",
            "examples": ["example1", "example2"],
            "relatedPhrases": ["phrase1", "phrase2"],
            "culturalNotes": ["note1", "note2"]
          }
          
          DO NOT include any text outside the JSON.
        `;
        
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return this.parseJSONSafely(text);
      };

      const parsed = await this.retryWithBackoff(generateFn);
      if (parsed) return parsed;

      // Fallback
      return this.getFallbackCulturalExplanation(phrase, language);
    } catch (error) {
      return this.getFallbackCulturalExplanation(phrase, language);
    }
  }

  private getFallbackCulturalExplanation(phrase: string, language: string): CulturalExplanation {
    return {
      explanation: `"${phrase}" is an important expression in ${language} culture, often used to show respect and maintain social harmony.`,
      examples: [
        'Used when greeting elders',
        'Common in formal settings',
        'Shows cultural awareness'
      ],
      relatedPhrases: [
        `Other respectful greetings in ${language}`,
        'Traditional responses'
      ],
      culturalNotes: [
        'Respect for elders is paramount in Nigerian culture',
        'Greetings are very important for social interaction',
        'The tone and manner of greeting matters as much as the words'
      ]
    };
  }

  async startConversation(
    language: string,
    level: string,
    topic: string
  ): Promise<ConversationResponse> {
    try {
      const prompt = `
        You are a friendly Nigerian ${language} speaker starting a conversation with a ${level} learner.
        Topic: ${topic}
        
        Start with an appropriate greeting for the time of day and ask ONE simple question related to ${topic}.
        Keep it natural and culturally appropriate.
        
        Return ONLY this JSON structure:
        {
          "text": "Your greeting and question in ${language}",
          "translation": "English translation"
        }
        
        DO NOT include any other text or formatting.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseJSONSafely(text);

      if (parsed && parsed.text && parsed.translation) {
        return parsed;
      }

      // Fallback greetings
      return this.getFallbackGreeting(language, topic);
    } catch (error) {
      console.error('Conversation start error:', error);
      return this.getFallbackGreeting(language, topic);
    }
  }

  private getFallbackGreeting(language: string, topic: string): ConversationResponse {
    const greetings = {
      Yoruba: {
        greetings: {
          text: 'Ẹ káàárọ̀! Báwo ni ẹbí rẹ?',
          translation: 'Good morning! How is your family?'
        },
        market: {
          text: 'Ẹ káàárọ̀! Ṣé ẹ ti lọ sí ọjà lónìí?',
          translation: 'Good morning! Have you been to the market today?'
        },
        food: {
          text: 'Ẹ káàárọ̀! Kí ni ẹ jẹ lówùúrọ̀ yìí?',
          translation: 'Good morning! What did you eat this morning?'
        }
      },
      Igbo: {
        greetings: {
          text: 'Ụtụtụ ọma! Kedụ ka ndị ezinaụlọ gị mere?',
          translation: 'Good morning! How is your family?'
        },
        market: {
          text: 'Ụtụtụ ọma! Ị gara ahịa taa?',
          translation: 'Good morning! Did you go to the market today?'
        },
        food: {
          text: 'Ụtụtụ ọma! Gịnị ka ị riri n\'ụtụtụ a?',
          translation: 'Good morning! What did you eat this morning?'
        }
      },
      Hausa: {
        greetings: {
          text: 'Sannu! Ya gida?',
          translation: 'Hello! How is the family/household?'
        },
        market: {
          text: 'Sannu! Kun je kasuwa yau?',
          translation: 'Hello! Did you go to the market today?'
        },
        food: {
          text: 'Sannu! Me kuka ci da safe?',
          translation: 'Hello! What did you eat this morning?'
        }
      }
    };

    const langGreetings = greetings[language as keyof typeof greetings] || greetings.Hausa;
    return langGreetings[topic as keyof typeof langGreetings] || langGreetings.greetings;
  }

  async continueConversation(
    messages: ConversationMessage[],
    language: string
  ): Promise<ConversationResponse> {
    try {
      // Get the last user message
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role !== 'user') {
        throw new Error('Last message must be from user');
      }

      // Build conversation context
      const conversationContext = messages
        .map(msg => {
          const speaker = msg.role === 'user' ? 'Learner' : 'Teacher';
          return `${speaker}: ${msg.content}`;
        })
        .join('\n');

      const prompt = `
        You are a friendly Nigerian ${language} teacher having a natural conversation.
        
        Here is the conversation so far:
        ${conversationContext}
        
        The learner just said: "${lastUserMessage.content}"
        
        IMPORTANT INSTRUCTIONS:
        1. Respond ONLY as the Teacher to what the learner just said
        2. Keep your response natural and conversational
        3. If they gave a short answer, acknowledge it and ask a follow-up question
        4. Stay on topic but keep the conversation flowing naturally
        5. Use simple ${language} appropriate for a learner
        6. Be encouraging and culturally appropriate
        
        Return ONLY this JSON:
        {
          "text": "Your response in ${language}",
          "translation": "English translation"
        }
        
        DO NOT continue both sides of the conversation. ONLY respond as the teacher.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.parseJSONSafely(text);

      if (parsed && parsed.text && parsed.translation) {
        return parsed;
      }

      // Fallback response
      return this.getFallbackResponse(language, lastUserMessage.content);
    } catch (error) {
      console.error('Conversation continue error:', error);
      return this.getFallbackResponse(language, messages[messages.length - 1]?.content || '');
    }
  }

  private getFallbackResponse(language: string, userInput: string): ConversationResponse {
    // Analyze user input to provide appropriate response
    const lowerInput = userInput.toLowerCase();
    
    // Common responses in each language
    const responses = {
      Yoruba: {
        greeting: {
          text: 'Adúpẹ́! Ṣé dáadáa ni?',
          translation: 'Thank you! Is everything well?'
        },
        affirmative: {
          text: 'Ó dára! Kí ni orúkọ rẹ?',
          translation: 'That\'s good! What is your name?'
        },
        default: {
          text: 'Ó yẹ mi. Jọ̀wọ́ sọ síi.',
          translation: 'I understand. Please tell me more.'
        }
      },
      Igbo: {
        greeting: {
          text: 'Daalu! Ọ dị mma?',
          translation: 'Thank you! Is it well?'
        },
        affirmative: {
          text: 'Ọ dị mma! Kedụ aha gị?',
          translation: 'That\'s good! What is your name?'
        },
        default: {
          text: 'Aghọtara m. Biko gwa m karịa.',
          translation: 'I understand. Please tell me more.'
        }
      },
      Hausa: {
        greeting: {
          text: 'Nagode! Lafiya?',
          translation: 'Thank you! Are you well?'
        },
        affirmative: {
          text: 'Madalla! Menene sunanka?',
          translation: 'That\'s good! What is your name?'
        },
        default: {
          text: 'Na gane. Don Allah ka gaya mini ƙari.',
          translation: 'I understand. Please tell me more.'
        }
      }
    };

    const langResponses = responses[language as keyof typeof responses] || responses.Hausa;
    
    // Simple pattern matching for response selection
    if (lowerInput.includes('lafiya') || lowerInput.includes('fine') || lowerInput.includes('good')) {
      return langResponses.affirmative;
    } else if (lowerInput.includes('sannu') || lowerInput.includes('hello')) {
      return langResponses.greeting;
    }
    
    return langResponses.default;
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

    const encouragements = {
      Yoruba: {
        good: 'Ẹ kú iṣẹ́! O ṣe dáadáa!',
        tryAgain: 'Ẹ má dúró! Ẹ tún gbìyànjú!'
      },
      Igbo: {
        good: 'Ị mere nke ọma! Jisie ike!',
        tryAgain: 'Anwala ọzọ! Ị ga-eme ya!'
      },
      Hausa: {
        good: 'Ka yi kyau! Ci gaba!',
        tryAgain: 'Sake gwadawa! Za ka iya!'
      }
    };

    const langEncouragements = encouragements[language as keyof typeof encouragements] || encouragements.Yoruba;

    return {
      isCorrect,
      feedback: isCorrect 
        ? 'Excellent work! Your response captures the right meaning.' 
        : 'Good effort! Let\'s refine it a bit more.',
      suggestions: isCorrect 
        ? ['Try varying your expressions next time', 'Practice with different contexts'] 
        : [
            'Listen to the pronunciation again',
            'Pay attention to tone marks (if applicable)',
            'Try breaking down the sentence into smaller parts'
          ],
      encouragement: isCorrect ? langEncouragements.good : langEncouragements.tryAgain
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