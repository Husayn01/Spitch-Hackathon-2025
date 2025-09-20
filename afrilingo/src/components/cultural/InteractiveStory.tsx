import { useState, useEffect } from 'react';
import { geminiService } from '../../services/gemini.service';
import { Icon } from '../../utils/icons';
import { showToast } from '../../utils/toast';
import { ChevronDown, ChevronUp, Check, X, BookOpen, Sparkles, RefreshCw, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [hoveredQuestion, setHoveredQuestion] = useState<number | null>(null);

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark') || 
                document.body.classList.contains('bg-gray-900') ||
                true; // Default to dark mode

  const languageData = {
    yo: { 
      name: 'Yoruba', 
      color: 'from-emerald-500 to-teal-600',
      pattern: 'M10,10 L20,20 L30,10 L40,20',
      icon: '📖'
    },
    ig: { 
      name: 'Igbo', 
      color: 'from-orange-500 to-red-600',
      pattern: 'M15,15 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0',
      icon: '📚'
    },
    ha: { 
      name: 'Hausa', 
      color: 'from-blue-500 to-indigo-600',
      pattern: 'M20,10 L30,20 L20,30 L10,20 Z',
      icon: '📘'
    }
  };

  const currentLanguage = languageData[language];
  const levelColors = {
    beginner: 'text-green-600',
    intermediate: 'text-yellow-600',
    advanced: 'text-red-600'
  };

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

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className={`rounded-2xl p-12 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl flex items-center justify-center h-96`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${currentLanguage.color} flex items-center justify-center`}
          >
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Weaving your story...
          </p>
        </div>
      </motion.div>
    );
  }

  if (!story) return null;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Story Card */}
      <motion.div 
        className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden`}
        {...fadeInUp}
      >
        {/* Header with Pattern */}
        <div className={`relative p-8 bg-gradient-to-br ${currentLanguage.color} text-white overflow-hidden`}>
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
            <pattern id="story-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d={currentLanguage.pattern} stroke="currentColor" strokeWidth="2" fill="none" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#story-pattern)" />
          </svg>
          
          <motion.div 
            className="relative"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
              <span className="text-4xl">{currentLanguage.icon}</span>
              {story.title}
            </h2>
            <div className="flex items-center gap-6 text-white/90">
              <span className="flex items-center gap-2">
                <Icon icon="story" size="small" />
                <span className={`capitalize font-semibold ${levelColors[level]}`}>
                  {level} level
                </span>
              </span>
              <span className="flex items-center gap-2">
                <BookOpen size={18} />
                {story.vocabulary.length} new words
              </span>
            </div>
          </motion.div>
        </div>

        <div className={`p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Vocabulary Toggle */}
          <motion.button
            onClick={() => setShowVocabulary(!showVocabulary)}
            className={`mb-6 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles className="w-4 h-4" />
            {showVocabulary ? 'Hide' : 'Show'} vocabulary
            {showVocabulary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </motion.button>

          {/* Vocabulary Helper */}
          <AnimatePresence>
            {showVocabulary && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className={`mb-6 p-6 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Key Vocabulary
                  </h3>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                  >
                    {story.vocabulary.map((word, idx) => (
                      <motion.div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${
                          isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                        } hover:shadow-lg transition-shadow`}
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className={`font-bold text-lg bg-gradient-to-r ${currentLanguage.color} bg-clip-text text-transparent`}>
                          {word.word}
                        </div>
                        <div className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {word.meaning}
                        </div>
                        <div className={`text-xs mt-2 italic ${isDark ? 'text-gray-400' : 'text-gray-500'} border-t ${
                          isDark ? 'border-gray-700' : 'border-gray-200'
                        } pt-2`}>
                          "{word.usage}"
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story Content */}
          <motion.div 
            className={`prose prose-lg max-w-none mb-8 ${isDark ? 'prose-invert' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className={`leading-relaxed whitespace-pre-line text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-800'
            }`}>
              {story.content}
            </p>
          </motion.div>

          {/* Moral Lesson */}
          <motion.div 
            className={`relative p-6 rounded-xl mb-8 overflow-hidden ${
              isDark ? 'bg-emerald-900/20 border border-emerald-700' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentLanguage.color} flex items-center justify-center flex-shrink-0`}>
                <Icon icon="tip" size="small" className="text-white" />
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  Moral Lesson
                </h3>
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  {story.moralLesson}
                </p>
              </div>
            </div>
            
            {/* Decorative Pattern */}
            <svg className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
              <circle cx="50" cy="50" r="30" stroke="currentColor" fill="none" strokeWidth="0.5" />
              <path d="M20,50 Q50,20 80,50 T140,50" stroke="currentColor" fill="none" strokeWidth="0.5"/>
            </svg>
          </motion.div>

          {/* Comprehension Questions */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-500" />
              Test Your Understanding
            </h3>
            
            <motion.div 
              className="space-y-4"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {story.comprehensionQuestions.map((question, idx) => (
                <motion.div
                  key={idx}
                  className={`p-6 rounded-xl transition-all ${
                    isDark ? 'bg-gray-700' : 'bg-gray-50'
                  } ${hoveredQuestion === idx ? 'shadow-lg' : ''}`}
                  variants={fadeInUp}
                  onMouseEnter={() => setHoveredQuestion(idx)}
                  onMouseLeave={() => setHoveredQuestion(null)}
                >
                  <p className="font-semibold text-lg mb-4 flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentLanguage.color} text-white flex items-center justify-center flex-shrink-0 text-sm`}>
                      {idx + 1}
                    </span>
                    {question}
                  </p>
                  
                  <div className="space-y-3 ml-11">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <motion.label 
                        key={option} 
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedAnswers[idx] === option
                            ? isDark ? 'bg-gray-600' : 'bg-white shadow-md'
                            : isDark ? 'hover:bg-gray-600' : 'hover:bg-white hover:shadow-sm'
                        }`}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <input
                          type="radio"
                          name={`question-${idx}`}
                          value={option}
                          checked={selectedAnswers[idx] === option}
                          onChange={() => handleAnswerSelect(idx, option)}
                          disabled={showResults}
                          className="w-5 h-5 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Option {option}
                        </span>
                        <AnimatePresence>
                          {showResults && selectedAnswers[idx] === option && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: "spring" }}
                            >
                              {Math.random() > 0.5 ? (
                                <Check size={20} className="text-green-500" />
                              ) : (
                                <X size={20} className="text-red-500" />
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div 
              className="flex justify-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <AnimatePresence mode="wait">
                {!showResults ? (
                  <motion.button
                    key="submit"
                    onClick={submitAnswers}
                    disabled={selectedAnswers.length !== story.comprehensionQuestions.length}
                    className={`px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-3
                             bg-gradient-to-r ${currentLanguage.color} text-white
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg hover:shadow-2xl transition-all`}
                    whileHover={selectedAnswers.length === story.comprehensionQuestions.length ? { scale: 1.05 } : {}}
                    whileTap={selectedAnswers.length === story.comprehensionQuestions.length ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Check className="w-6 h-6" />
                    Submit Answers
                  </motion.button>
                ) : (
                  <motion.button
                    key="retry"
                    onClick={() => {
                      setSelectedAnswers([]);
                      setShowResults(false);
                      loadStory();
                    }}
                    className={`px-8 py-4 rounded-full font-semibold text-lg inline-flex items-center gap-3
                             bg-gradient-to-r ${currentLanguage.color} text-white
                             shadow-lg hover:shadow-2xl transition-all`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <RefreshCw className="w-6 h-6" />
                    Try Another Story
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};