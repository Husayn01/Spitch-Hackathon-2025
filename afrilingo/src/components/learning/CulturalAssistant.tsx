import { useState } from 'react';
import { geminiService } from '../../services/gemini.service';
import { ChevronRightIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CulturalAssistantProps {
  language: string;
}

export const CulturalAssistant = ({ language }: CulturalAssistantProps) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  
  const commonQuestions = [
    'How do I greet an elder respectfully?',
    'What should I know about Nigerian naming ceremonies?',
    'How do traditional Nigerian weddings work?',
    'What are important festival greetings?'
  ];

  const askQuestion = async (q?: string) => {
    const queryText = q || question;
    if (!queryText.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await geminiService.explainCulturalContext(
        queryText,
        language === 'yo' ? 'Yoruba' : 
        language === 'ig' ? 'Igbo' : 
        language === 'ha' ? 'Hausa' : 'Nigerian culture',
        'General cultural question'
      );
      
      setExplanation(result);
      if (q) setQuestion(q);
    } catch (error) {
      toast.error('Failed to get explanation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cultural-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          🧑‍🏫 Ask the Cultural Elder
        </h3>
        {isExpanded ? (
          <ChevronDownIcon className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Question Input */}
          <div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about Nigerian culture, traditions, or proper etiquette..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-nigeria-green
                       resize-none text-sm"
              rows={2}
            />
            <button
              onClick={() => askQuestion()}
              disabled={!question.trim() || isLoading}
              className="mt-2 px-4 py-2 bg-nigeria-green text-white rounded-lg
                       hover:bg-green-700 transition-colors text-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Thinking...' : 'Ask Elder'}
            </button>
          </div>

          {/* Common Questions */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Common questions:</p>
            <div className="flex flex-wrap gap-2">
              {commonQuestions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => askQuestion(q)}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-700
                           rounded-full hover:bg-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Explanation Display */}
          {explanation && (
            <div className="border-t pt-4 space-y-3">
              {/* Main Explanation */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Understanding:</h4>
                <p className="text-sm text-gray-700">{explanation.explanation}</p>
              </div>

              {/* Examples */}
              {explanation.examples.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Examples:</h4>
                  <ul className="space-y-1">
                    {explanation.examples.map((example: string, index: number) => (
                      <li key={index} className="text-sm text-gray-700 
                                               flex items-start gap-2">
                        <span className="text-nigeria-green">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Phrases */}
              {explanation.relatedPhrases && explanation.relatedPhrases.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Related Phrases to Learn:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.relatedPhrases.map((phrase: string, index: number) => (
                      <span key={index} 
                            className="text-sm px-3 py-1 bg-cowrie-shell/30 
                                     text-gray-700 rounded-full font-nigerian">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Notes */}
              {explanation.culturalNotes && explanation.culturalNotes.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <h4 className="font-medium text-amber-900 mb-1 text-sm">
                    ⚠️ Important Cultural Notes:
                  </h4>
                  <ul className="space-y-1">
                    {explanation.culturalNotes.map((note: string, index: number) => (
                      <li key={index} className="text-sm text-amber-800">
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};