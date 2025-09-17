import { useState, useEffect } from 'react';
import { geminiService } from '../../services/gemini.service';
import { Icon } from '../../utils/icons';
import { showToast } from '../../utils/toast';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

interface InteractiveStoryProps {
  language: 'yo' | 'ig' | 'ha';
  level: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (score: number) => void;
}

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

export const InteractiveStory = ({ 
  language, 
  level, 
  onComplete 
}: InteractiveStoryProps) => {
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showVocabulary, setShowVocabulary] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    loadStory();
  }, [language, level]);

  const loadStory = async () => {
    setIsLoading(true);
    try {
      const storyData = await geminiService.generateStory(
        language === 'yo' ? 'Yoruba' :
        language === 'ig' ? 'Igbo' : 'Hausa',
        level
      );
      setStory(storyData);
    } catch (error) {
      showToast.error('Failed to load story. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answer;
    setSelectedAnswers(newAnswers);
  };

  const submitAnswers = () => {
    if (!story || selectedAnswers.length !== story.comprehensionQuestions.length) {
      showToast.error('Please answer all questions');
      return;
    }

    // For demo purposes, randomly determine correct answers
    const score = selectedAnswers.filter(() => Math.random() > 0.5).length;
    setShowResults(true);
    
    if (onComplete) {
      onComplete(score);
    }

    showToast.celebration(`You scored ${score}/${story.comprehensionQuestions.length}`);
  };

  if (isLoading) {
    return (
      <div className="cultural-card flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2">
            <Icon icon="loading" size="large" className="animate-spin text-nigeria-green" />
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
            <span className="flex items-center gap-1">
              <Icon icon="story" size="small" />
              {level} level
            </span>
            <button
              onClick={() => setShowVocabulary(!showVocabulary)}
              className="text-nigeria-green hover:underline flex items-center gap-1"
            >
              {showVocabulary ? (
                <>Hide vocabulary <ChevronUp size={16} /></>
              ) : (
                <>Show vocabulary <ChevronDown size={16} /></>
              )}
            </button>
          </div>
        </div>

        {/* Vocabulary Helper */}
        {showVocabulary && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-2">
              Key Vocabulary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {story.vocabulary.map((word, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                  <div className="font-medium text-gray-900">{word.word}</div>
                  <div className="text-sm text-gray-600">{word.meaning}</div>
                  <div className="text-xs text-gray-500 mt-1 italic">"{word.usage}"</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Story Content */}
        <div className="prose prose-lg max-w-none mb-6">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {story.content}
          </p>
        </div>

        {/* Moral Lesson */}
        <div className="bg-green-50 border-l-4 border-nigeria-green p-4 mb-6">
          <h3 className="font-semibold text-nigeria-green mb-1 flex items-center gap-2">
            <Icon icon="tip" size="small" />
            Moral Lesson
          </h3>
          <p className="text-gray-700">{story.moralLesson}</p>
        </div>

        {/* Comprehension Questions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            Test Your Understanding
          </h3>
          {story.comprehensionQuestions.map((question, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-3">
                {idx + 1}. {question}
              </p>
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${idx}`}
                      value={option}
                      checked={selectedAnswers[idx] === option}
                      onChange={() => handleAnswerSelect(idx, option)}
                      disabled={showResults}
                      className="w-4 h-4 text-nigeria-green focus:ring-nigeria-green"
                    />
                    <span className="text-gray-700">
                      Option {option}
                    </span>
                    {showResults && selectedAnswers[idx] === option && (
                      Math.random() > 0.5 ? (
                        <Check size={16} className="text-green-600" />
                      ) : (
                        <X size={16} className="text-red-600" />
                      )
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
          
          {!showResults && (
            <button
              onClick={submitAnswers}
              disabled={selectedAnswers.length !== story.comprehensionQuestions.length}
              className="btn-nigeria w-full disabled:opacity-50"
            >
              Submit Answers
            </button>
          )}
          
          {showResults && (
            <div className="text-center">
              <button
                onClick={() => {
                  setSelectedAnswers([]);
                  setShowResults(false);
                  loadStory();
                }}
                className="btn-nigeria inline-flex items-center gap-2"
              >
                <Icon icon="next" size="small" />
                Try Another Story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};