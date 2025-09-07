import { useState, useEffect } from 'react';
import { geminiService } from '../../services/gemini.service';
import { spitchService } from '../../services/spitch.service';
import { useGameStore } from '../../stores/gameStore';
import toast from 'react-hot-toast';

interface InteractiveStoryProps {
  language: 'yo' | 'ig' | 'ha' | 'en';
  level: 'beginner' | 'intermediate' | 'advanced';
  theme?: string;
}

export const InteractiveStory = ({ 
  language, 
  level, 
  theme 
}: InteractiveStoryProps) => {
  const [story, setStory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const { addXP, addCowries } = useGameStore();

  useEffect(() => {
    loadStory();
  }, [language, level, theme]);

  const loadStory = async () => {
    setIsLoading(true);
    try {
      const result = await geminiService.generateStory(
        language === 'yo' ? 'Yoruba' : 
        language === 'ig' ? 'Igbo' : 
        language === 'ha' ? 'Hausa' : 'English',
        level,
        theme
      );
      
      setStory(result);
    } catch (error) {
      toast.error('Failed to load story');
    } finally {
      setIsLoading(false);
    }
  };

  const playStoryAudio = async () => {
    if (!story) return;
    
    try {
      const audioBlob = await spitchService.generateSpeech(
        story.story,
        language
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      toast.error('Failed to play story audio');
    }
  };

  const checkAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    // Simple scoring - in real app, would have correct answers from AI
    const isCorrect = Math.random() > 0.5; // Placeholder
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success('Correct! Well done! 🎉');
    } else {
      toast('Not quite right. Try the next question!', {
        icon: '💡',
        style: {
            background: '#FEF3C7',
            color: '#92400E',
        },
        });
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentQuestion < story.comprehensionQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        // Story completed
        completeStory();
      }
    }, 2000);
  };

  const completeStory = async () => {
    const percentage = (score / story.comprehensionQuestions.length) * 100;
    await addXP(20 + Math.round(percentage / 10));
    await addCowries(5);
    
    toast.success(`Story completed! You scored ${score}/${story.comprehensionQuestions.length}`);
  };

  if (isLoading) {
    return (
      <div className="cultural-card flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-nigeria-green 
                          border-t-transparent rounded-full animate-spin"></div>
            <span>Loading story...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="space-y-6">
      {/* Story Card */}
      <div className="cultural-card">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {story.title}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📚 {level} level</span>
            <button
              onClick={() => setShowVocabulary(!showVocabulary)}
              className="text-nigeria-green hover:underline"
            >
              {showVocabulary ? 'Hide' : 'Show'} Vocabulary
            </button>
            <button
              onClick={playStoryAudio}
              className="text-nigeria-green hover:underline flex items-center gap-1"
            >
              <span>🔊</span> Listen
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="prose prose-lg max-w-none mb-6">
          <p className="text-gray-700 leading-relaxed font-nigerian">
            {story.story}
          </p>
        </div>

        {/* Vocabulary Helper */}
        {showVocabulary && story.vocabulary.length > 0 && (
          <div className="bg-cowrie-shell/20 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              📖 Key Vocabulary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {story.vocabulary.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="font-nigerian font-semibold text-gray-900">
                    {item.word}:
                  </span>
                  <span className="text-gray-700">{item.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comprehension Questions */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Test Your Understanding
          </h3>
          
          <div className="space-y-4">
            <p className="text-gray-700">
              Question {currentQuestion + 1} of {story.comprehensionQuestions.length}:
            </p>
            <p className="text-lg font-medium text-gray-900">
              {story.comprehensionQuestions[currentQuestion]}
            </p>
            
            {/* Multiple choice options (simplified) */}
            <div className="space-y-2">
              {['Yes, that\'s correct', 'No, that\'s not right', 'The story doesn\'t say'].map((option, index) => (
                <button
                  key={index}
                  onClick={() => checkAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full text-left p-4 rounded-lg border transition-colors
                    ${selectedAnswer === index 
                      ? 'border-nigeria-green bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    } disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{currentQuestion + 1} / {story.comprehensionQuestions.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-nigeria-green h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentQuestion + 1) / story.comprehensionQuestions.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};