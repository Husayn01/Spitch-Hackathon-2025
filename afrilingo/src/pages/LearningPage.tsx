import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';

// Learning modes
type LearningMode = 'lesson' | 'pronunciation' | 'conversation' | 'story' | 'culture';

const LearningPage = () => {
  const { language = 'yoruba' } = useParams();
  const { user } = useAuth();
  const [learningMode, setLearningMode] = useState<LearningMode>('lesson');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  
  const { addXP, addCowries, updateStreak } = useGameStore();

  const languageCode = language === 'yoruba' ? 'yo' : 
                      language === 'igbo' ? 'ig' : 
                      language === 'hausa' ? 'ha' : 'en';

  // Load lessons on mount or language change
  useEffect(() => {
    loadLessons();
  }, [language]);

  // Load exercises when lesson changes
  useEffect(() => {
    if (currentLesson) {
      loadLessonContent();
    }
  }, [currentLesson]);

  const loadLessons = async () => {
    setIsLoading(true);
    try {
      const lessonData = await lessonService.getLessonsByLanguage(languageCode);
      setLessons(lessonData);
      
      // Set first lesson as current if available
      if (lessonData.length > 0) {
        setCurrentLesson(lessonData[0]);
      }
    } catch (error) {
      showToast.error('Failed to load lessons');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLessonContent = async () => {
    if (!currentLesson) return;
    
    try {
      const { exercises: exerciseData } = await lessonService.getLessonWithExercises(currentLesson.id);
      setExercises(exerciseData);
      
      // Load vocabulary if it's a vocabulary lesson
      if (currentLesson.lesson_type === 'vocabulary') {
        const vocab = await lessonService.getLessonVocabulary(currentLesson.id);
        setVocabulary(vocab);
      }
    } catch (error) {
      showToast.error('Failed to load lesson content');
    }
  };

  const handleExerciseComplete = async (isCorrect: boolean) => {
    if (!currentLesson || !user) return;
    
    const currentExercise = exercises[currentExerciseIndex];
    
    // Submit exercise attempt
    await lessonService.submitExercise(
      user.id,
      currentExercise.id,
      { /* user's response */ },
      isCorrect
    );
    
    // Award points if correct
    if (isCorrect) {
      await addXP(currentExercise.points || 10);
    }
    
    // Move to next exercise or complete lesson
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setLessonProgress((currentExerciseIndex + 1) / exercises.length * 100);
    } else {
      // Lesson complete!
      await completeLesson();
    }
  };

  const completeLesson = async () => {
    if (!currentLesson || !user) return;
    
    const score = 85; // Calculate based on correct answers
    const timeSpent = 600; // Track actual time
    
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
    
    // Move to next lesson
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-nigeria-green mx-auto mb-4" />
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No lessons available for this language yet.</p>
        </div>
      </div>
    );
  }

  const currentExercise = exercises[currentExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lesson Header */}
            <div className="cultural-card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentLesson.title}
                  </h1>
                  <p className="text-gray-600">
                    {currentLesson.description}
                  </p>
                </div>
                <select
                  value={currentLesson.id}
                  onChange={(e) => {
                    const lesson = lessons.find(l => l.id === e.target.value);
                    if (lesson) {
                      setCurrentLesson(lesson);
                      setCurrentExerciseIndex(0);
                      setLessonProgress(0);
                    }
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  {lessons.map(lesson => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.lesson_order}. {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-nigeria-green h-2 rounded-full transition-all duration-300"
                  style={{ width: `${lessonProgress}%` }}
                />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-4 flex-wrap">
              {[
                { mode: 'lesson', label: 'Lesson', icon: 'story' },
                { mode: 'pronunciation', label: 'Pronunciation', icon: 'pronunciation' },
                { mode: 'conversation', label: 'Conversation', icon: 'conversation' },
                { mode: 'story', label: 'Stories', icon: 'story' },
                { mode: 'culture', label: 'Culture', icon: 'info' }
              ].map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => setLearningMode(mode as LearningMode)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors
                            flex items-center gap-2
                            ${learningMode === mode 
                              ? 'bg-nigeria-green text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon icon={icon as keyof typeof import('../utils/icons').Icons} size="small" />
                  {label}
                </button>
              ))}
            </div>

            {/* Learning Content */}
            {learningMode === 'lesson' && currentExercise && (
              <div className="cultural-card">
                {/* Vocabulary Display */}
                {currentLesson.lesson_type === 'vocabulary' && vocabulary.length > 0 && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Vocabulary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {vocabulary.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                          <span className="font-medium">{item.word}</span>
                          <span className="text-gray-600">{item.translation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Current Exercise */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Exercise {currentExerciseIndex + 1} of {exercises.length}
                  </h2>
                  <p className="text-lg text-gray-800">{currentExercise.question}</p>
                  
                  {/* Multiple Choice */}
                  {currentExercise.exercise_type === 'multiple_choice' && currentExercise.options && (
                    <div className="space-y-2">
                      {currentExercise.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleExerciseComplete(option === currentExercise.correct_answer)}
                          className="w-full text-left p-4 rounded-lg border border-gray-300 
                                   hover:border-nigeria-green hover:bg-gray-50 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Other exercise types... */}
                </div>
              </div>
            )}

            {learningMode === 'pronunciation' && vocabulary.length > 0 && (
              <div className="cultural-card">
                <h2 className="text-xl font-bold mb-4">
                  Practice: "{vocabulary[0]?.word}"
                </h2>
                <p className="text-gray-600 mb-2">
                  Translation: {vocabulary[0]?.translation}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Pronunciation: {vocabulary[0]?.pronunciation}
                </p>
                
                <PronunciationPractice
                  text={vocabulary[0]?.word || ''}
                  language={languageCode as 'yo' | 'ig' | 'ha' | 'en'}
                  onComplete={handlePronunciationComplete}
                />
              </div>
            )}

            {learningMode === 'conversation' && (
              <ConversationPractice 
                language={languageCode as 'yo' | 'ig' | 'ha'}
                level="beginner"
              />
            )}

            {learningMode === 'story' && (
              <InteractiveStory 
                language={languageCode as 'yo' | 'ig' | 'ha'}
                level="beginner"
              />
            )}

            {learningMode === 'culture' && (
              <div className="cultural-card">
                <div className="text-center py-8">
                  <Icon icon="info" size="xlarge" className="text-nigeria-green mx-auto mb-4" />
                  <h2 className="text-xl font-bold mb-2">
                    Cultural Context
                  </h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Our AI elder is here to help you understand 
                    the rich cultural context behind the language.
                  </p>
                </div>
                
                <CulturalAssistant language={language} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <UserStats />
            
            {/* Lesson Info */}
            <div className="cultural-card">
              <h3 className="font-semibold text-gray-900 mb-3">
                Lesson Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{currentLesson.lesson_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span>{'⭐'.repeat(currentLesson.difficulty)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP Reward:</span>
                  <span className="text-green-600">+{currentLesson.xp_reward} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span>{currentLesson.estimated_time} min</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="cultural-card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon icon="tip" size="small" className="text-yellow-500" />
                Learning Tips
              </h3>
              
              <p className="text-sm text-gray-600">
                {currentLesson.lesson_type === 'vocabulary' && 
                  'Focus on pronunciation. Repeat each word several times!'}
                {currentLesson.lesson_type === 'grammar' && 
                  'Understanding sentence structure is key to fluency.'}
                {currentLesson.lesson_type === 'conversation' && 
                  'Practice makes perfect. Try using these phrases daily!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;