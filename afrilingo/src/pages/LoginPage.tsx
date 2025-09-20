import React, { useState, useEffect } from 'react';
import { PronunciationPractice } from '../components/learning/PronunciationPractice';
import { ConversationPractice } from '../components/learning/ConversationPractice';
import { CulturalAssistant } from '../components/learning/CulturalAssistant';
import { InteractiveStory } from '../components/cultural/InteractiveStory';
import { UserStats } from '../components/gamification/UserStats';
import { useGameStore } from '../stores/gameStore';
import { Icon } from '../utils/icons';
import { showToast } from '../utils/toast';
import { lessonService, type Lesson, type Exercise } from '../services/lessonService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Loader2, Volume2, MessageCircle, BookOpen, Globe, ChevronLeft, 
  ChevronRight, Sun, Moon, X, CheckCircle, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Learning modes
type LearningMode = 'lesson' | 'pronunciation' | 'conversation' | 'story' | 'culture';

const LearningPage = () => {
  // Get language from URL params
  const urlPath = window.location.pathname;
  const language = urlPath.split('/').pop() || 'yoruba';
  
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(true);
  const [learningMode, setLearningMode] = useState<LearningMode>('lesson');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  
  const { addXP, addCowries, updateStreak } = useGameStore();

  const languageCode = language === 'yoruba' ? 'yo' : 
                      language === 'igbo' ? 'ig' : 
                      language === 'hausa' ? 'ha' : 'en';

  const languageData = {
    yoruba: { 
      name: 'Yoruba', 
      nativeName: 'Yorùbá', 
      color: 'from-emerald-500 to-teal-600',
      pattern: 'M10,10 L20,20 L30,10 L40,20'
    },
    igbo: { 
      name: 'Igbo', 
      nativeName: 'Igbo', 
      color: 'from-orange-500 to-red-600',
      pattern: 'M15,15 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0'
    },
    hausa: { 
      name: 'Hausa', 
      nativeName: 'Hausa', 
      color: 'from-blue-500 to-indigo-600',
      pattern: 'M20,10 L30,20 L20,30 L10,20 Z'
    }
  };

  const currentLanguage = languageData[language as keyof typeof languageData];

  useEffect(() => {
    loadLessons();
  }, [languageCode]);

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const lessonsData = await lessonService.getLessonsByLanguage(languageCode);
      setLessons(lessonsData);
      
      if (lessonsData.length > 0 && user) {
        const progress = await lessonService.getUserProgress(user.id, languageCode);
        const nextLesson = progress.nextLesson || lessonsData[0];
        setCurrentLesson(nextLesson);
        
        const { exercises: exercisesData } = await lessonService.getLessonWithExercises(nextLesson.id);
        setExercises(exercisesData);
        
        const vocabData = await lessonService.getLessonVocabulary(nextLesson.id);
        setVocabulary(vocabData);
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
      showToast.error('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseAnswer = async (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    
    const currentExercise = exercises[currentExerciseIndex];
    const isCorrect = answer === currentExercise.correct_answer;
    
    if (isCorrect && user) {
      await lessonService.submitExercise(
        user.id,
        currentExercise.id,
        answer,
        true,
        currentExercise.points
      );
      
      await addXP(currentExercise.points);
      showToast.success('Correct! +' + currentExercise.points + ' XP');
    }

    setTimeout(() => {
      setSelectedAnswer(null);
      setShowFeedback(false);
      
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setLessonProgress(((currentExerciseIndex + 1) / exercises.length) * 100);
      } else {
        completeLesson();
      }
    }, 2000);
  };

  const completeLesson = async () => {
    if (!currentLesson || !user) return;
    
    const score = 85;
    const timeSpent = 600;
    
    await lessonService.completeLesson(
      user.id,
      currentLesson.id,
      score,
      timeSpent
    );
    
    await addXP(currentLesson.xp_reward);
    await addCowries(currentLesson.cowrie_reward);
    await updateStreak();
    
    showToast.celebration('Lesson completed! Well done!');
    
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
      setCurrentExerciseIndex(0);
      setLessonProgress(0);
    }
  };

  const handlePronunciationComplete = async (score: number) => {
    const xpEarned = Math.round(score * 10);
    await addXP(xpEarned);
    
    if (score >= 0.8) {
      await addCowries(1);
    }

    await updateStreak();
    showToast.success('Great pronunciation practice!');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading your lessons...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full opacity-5">
          <defs>
            <pattern id="learning-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d={currentLanguage.pattern} stroke="currentColor" fill="none" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#learning-pattern)" />
        </svg>
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-br ${currentLanguage.color} opacity-10`}
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className={`sticky top-0 z-50 ${isDark ? 'bg-gray-900/90' : 'bg-white/90'} backdrop-blur-lg border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => window.location.href = '/dashboard'}
                className={`p-2 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <motion.div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentLanguage.color} flex items-center justify-center text-white`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Globe className="w-5 h-5" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold">{currentLanguage.name}</h1>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentLesson?.title || 'Select a lesson'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </motion.button>
              <UserStats compact />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} overflow-hidden`}>
              <motion.div
                className={`h-full bg-gradient-to-r ${currentLanguage.color}`}
                animate={{ width: `${lessonProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Learning Modes */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-4`}>
              <h2 className="text-lg font-bold mb-4">Learning Modes</h2>
              
              {[
                { id: 'lesson', icon: BookOpen, label: 'Lessons' },
                { id: 'pronunciation', icon: Volume2, label: 'Pronunciation' },
                { id: 'conversation', icon: MessageCircle, label: 'Conversation' },
                { id: 'story', icon: BookOpen, label: 'Stories' },
                { id: 'culture', icon: Globe, label: 'Culture' }
              ].map((mode) => (
                <motion.button
                  key={mode.id}
                  onClick={() => setLearningMode(mode.id as LearningMode)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    learningMode === mode.id 
                      ? `bg-gradient-to-r ${currentLanguage.color} text-white` 
                      : isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <mode.icon className="w-5 h-5" />
                  <span className="font-medium">{mode.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Vocabulary Helper */}
            {vocabulary.length > 0 && learningMode === 'lesson' && (
              <motion.div 
                className={`mt-6 rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-bold mb-4">Key Vocabulary</h3>
                <div className="space-y-3">
                  {vocabulary.slice(0, 5).map((word, index) => (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <p className="font-semibold">{word.word}</p>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {word.translation}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Lesson Mode */}
              {learningMode === 'lesson' && currentLesson && exercises.length > 0 && (
                <motion.div
                  key="lesson"
                  className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {exercises[currentExerciseIndex] && (
                    <div className="max-w-2xl mx-auto">
                      {/* Question */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="flex items-center justify-between mb-6">
                          <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Question {currentExerciseIndex + 1} of {exercises.length}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isDark ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            {exercises[currentExerciseIndex].points} points
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-8">
                          {exercises[currentExerciseIndex].question}
                        </h3>

                        {/* Options */}
                        <div className="space-y-4">
                          {exercises[currentExerciseIndex].options?.map((option, index) => (
                            <motion.button
                              key={index}
                              onClick={() => !showFeedback && handleExerciseAnswer(option)}
                              disabled={showFeedback}
                              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                                showFeedback && option === exercises[currentExerciseIndex].correct_answer
                                  ? 'bg-green-500 text-white'
                                  : showFeedback && option === selectedAnswer && option !== exercises[currentExerciseIndex].correct_answer
                                  ? 'bg-red-500 text-white'
                                  : isDark
                                  ? 'bg-gray-700 hover:bg-gray-600'
                                  : 'bg-gray-100 hover:bg-gray-200'
                              } ${!showFeedback && 'hover:scale-105'}`}
                              whileHover={!showFeedback ? { x: 5 } : {}}
                              whileTap={!showFeedback ? { scale: 0.98 } : {}}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{option}</span>
                                {showFeedback && option === exercises[currentExerciseIndex].correct_answer && (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                                {showFeedback && option === selectedAnswer && option !== exercises[currentExerciseIndex].correct_answer && (
                                  <X className="w-5 h-5" />
                                )}
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        {/* Feedback */}
                        {showFeedback && exercises[currentExerciseIndex].explanation && (
                          <motion.div
                            className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-emerald-50'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                          >
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                              {exercises[currentExerciseIndex].explanation}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Pronunciation Mode */}
              {learningMode === 'pronunciation' && (
                <motion.div
                  key="pronunciation"
                  className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Pronunciation Practice</h2>
                  {vocabulary.length > 0 && (
                    <PronunciationPractice
                      text={vocabulary[0].word}
                      language={languageCode as 'yo' | 'ig' | 'ha' | 'en'}
                      onComplete={handlePronunciationComplete}
                    />
                  )}
                </motion.div>
              )}

              {/* Conversation Mode */}
              {learningMode === 'conversation' && (
                <motion.div
                  key="conversation"
                  className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Conversation Practice</h2>
                  <ConversationPractice
                    language={languageCode as 'yo' | 'ig' | 'ha'}
                    topic={currentLesson?.title || 'General conversation'}
                    onComplete={(score) => {
                      handlePronunciationComplete(score);
                    }}
                  />
                </motion.div>
              )}

              {/* Story Mode */}
              {learningMode === 'story' && (
                <motion.div
                  key="story"
                  className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Interactive Story</h2>
                  <InteractiveStory
                    language={languageCode as 'yo' | 'ig' | 'ha'}
                    level="beginner"
                    onComplete={(score) => {
                      handlePronunciationComplete(score / 5); // Convert to 0-1 range
                    }}
                  />
                </motion.div>
              )}

              {/* Culture Mode */}
              {learningMode === 'culture' && (
                <motion.div
                  key="culture"
                  className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Cultural Assistant</h2>
                  <CulturalAssistant
                    language={languageCode as 'yo' | 'ig' | 'ha'}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;