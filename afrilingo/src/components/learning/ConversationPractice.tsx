import { useState, useEffect } from 'react';
import { geminiService } from '../../services/gemini.service';
import { spitchService } from '../../services/spitch.service';
import { useGameStore } from '../../stores/gameStore';
import toast from 'react-hot-toast';

interface ConversationPracticeProps {
  language: 'yo' | 'ig' | 'ha' | 'en';
  topic: string;
  level: 'beginner' | 'intermediate' | 'advanced';
}

export const ConversationPractice = ({ 
  language, 
  topic, 
  level 
}: ConversationPracticeProps) => {
  const [scenario, setScenario] = useState<any>(null);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [showCulturalNotes, setShowCulturalNotes] = useState(false);
  const { addXP, addCowries } = useGameStore();

  // Load conversation scenario
  useEffect(() => {
    loadScenario();
  }, [topic, language, level]);

  const loadScenario = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.generateConversation(topic, {
        language: language === 'yo' ? 'Yoruba' : 
                  language === 'ig' ? 'Igbo' : 
                  language === 'ha' ? 'Hausa' : 'Nigerian English',
        userLevel: level,
        culturalContext: 'Modern Nigerian setting'
      });
      
      setScenario(result);
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const playAudioPrompt = async () => {
    if (!scenario) return;
    
    try {
      const audioBlob = await spitchService.generateSpeech(
        scenario.aiResponse,
        language
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      toast.error('Failed to play audio');
    }
  };

  const checkResponse = async () => {
    if (!userInput.trim() || !scenario) return;
    
    setIsLoading(true);
    try {
      const result = await geminiService.provideFeedback(
        userInput,
        scenario.expectedResponse,
        language === 'yo' ? 'Yoruba' : 
        language === 'ig' ? 'Igbo' : 
        language === 'ha' ? 'Hausa' : 'Nigerian English',
        scenario.userPrompt
      );
      
      setFeedback(result);
      
      // Award points based on correctness
      if (result.isCorrect) {
        await addXP(15);
        await addCowries(2);
        toast.success('Excellent response! 🎉');
      } else {
        await addXP(5);
        toast.info('Good try! Check the feedback below.');
      }
    } catch (error) {
      toast.error('Failed to check response');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !scenario) {
    return (
      <div className="cultural-card flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-nigeria-green 
                          border-t-transparent rounded-full animate-spin"></div>
            <span>Loading conversation...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Card */}
      {scenario && (
        <div className="cultural-card">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">
              Conversation Practice: {topic}
            </h3>
            <button
              onClick={() => setShowCulturalNotes(!showCulturalNotes)}
              className="text-sm text-nigeria-green hover:underline"
            >
              {showCulturalNotes ? 'Hide' : 'Show'} Cultural Notes
            </button>
          </div>

          {/* Scenario Description */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700 mb-3">
              <span className="font-medium">Scenario:</span> {scenario.userPrompt}
            </p>
            
            <button
              onClick={playAudioPrompt}
              className="text-sm text-nigeria-green hover:underline 
                       flex items-center gap-1"
            >
              <span>🔊</span> Listen to the Nigerian speaker
            </button>
          </div>

          {/* Cultural Notes */}
          {showCulturalNotes && scenario.culturalNotes && (
            <div className="bg-cowrie-shell/20 rounded-lg p-4 mb-4 space-y-2">
              <h4 className="font-medium text-gray-900 mb-2">
                📚 Cultural Context
              </h4>
              {scenario.culturalNotes.map((note: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-nigeria-green">•</span>
                  <span className="text-gray-700">{note}</span>
                </div>
              ))}
            </div>
          )}

          {/* User Response Area */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response:
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={`Type your response in ${
                  language === 'yo' ? 'Yoruba' : 
                  language === 'ig' ? 'Igbo' : 
                  language === 'ha' ? 'Hausa' : 'Nigerian English'
                }...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-nigeria-green
                         resize-none font-nigerian"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Try to respond naturally as you would in this situation
              </p>
            </div>

            <button
              onClick={checkResponse}
              disabled={!userInput.trim() || isLoading}
              className="btn-nigeria w-full disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Check My Response'}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Display */}
      {feedback && (
        <div className={`cultural-card border-l-4 ${
          feedback.isCorrect ? 'border-nigeria-green' : 'border-royal-gold'
        }`}>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {feedback.isCorrect ? (
              <>
                <span className="text-2xl">✅</span>
                Excellent Work!
              </>
            ) : (
              <>
                <span className="text-2xl">💡</span>
                Keep Learning!
              </>
            )}
          </h4>

          <div className="space-y-3">
            <p className="text-gray-700">{feedback.feedback}</p>

            {feedback.suggestions.length > 0 && (
              <div>
                <p className="font-medium text-gray-900 mb-1">Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {feedback.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-gray-700 text-sm">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-green-50 rounded-lg p-3 mt-3">
              <p className="text-green-800 text-sm italic">
                {feedback.encouragement}
              </p>
            </div>
          </div>

          <button
            onClick={loadScenario}
            className="mt-4 text-sm text-nigeria-green hover:underline"
          >
            Try Another Scenario →
          </button>
        </div>
      )}
    </div>
  );
};