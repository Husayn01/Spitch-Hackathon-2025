import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { PronunciationPractice } from '../components/learning/PronunciationPractice';
import { ConversationPractice } from '../components/learning/ConversationPractice';
import { CulturalAssistant } from '../components/learning/CulturalAssistant';
import { InteractiveStory } from '../components/cultural/InteractiveStory';
import { UserStats } from '../components/gamification/UserStats';
import { useGameStore } from '../stores/gameStore';
import { Icon } from '../utils/icons';
import { showToast } from '../utils/toast';

// Learning modes
type LearningMode = 'pronunciation' | 'conversation' | 'story' | 'culture';

const SAMPLE_LESSONS = {
  yoruba: {
    greeting: {
      title: 'Basic Greetings',
      phrases: [
        { text: 'Ẹ káàárọ̀', translation: 'Good morning', context: 'Used before noon' },
        { text: 'Ẹ káàsán', translation: 'Good afternoon', context: 'Used from noon to 4pm' },
        { text: 'Ẹ kúùrọ̀lẹ́', translation: 'Good evening', context: 'Used after 4pm' },
        { text: 'Báwo ni?', translation: 'How are you?', context: 'Informal greeting' },
      ]
    }
  }
};

const LearningPage = () => {
  const { language = 'yoruba' } = useParams();
  const [learningMode, setLearningMode] = useState<LearningMode>('pronunciation');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const { addXP, addCowries, updateStreak } = useGameStore();

  const lesson = SAMPLE_LESSONS[language as keyof typeof SAMPLE_LESSONS]?.greeting;
  const currentPhrase = lesson?.phrases[currentPhraseIndex];
  const languageCode = language === 'yoruba' ? 'yo' : 
                      language === 'igbo' ? 'ig' : 
                      language === 'hausa' ? 'ha' : 'en';

  const handlePronunciationComplete = async (score: number) => {
    const xpEarned = Math.round(score * 10);
    await addXP(xpEarned);
    
    if (score >= 0.8) {
      await addCowries(1);
    }

    await updateStreak();

    if (currentPhraseIndex < lesson.phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      showToast.success('Great! Moving to next phrase.');
    } else {
      showToast.celebration('Lesson completed! Well done!');
      await addXP(20); // Bonus XP for completion
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Lesson content coming soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Lesson Header */}
            <div className="cultural-card">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {lesson.title}
              </h1>
              <p className="text-gray-600">
                Practice your {language} pronunciation and conversation skills
              </p>
            </div>

            {/* Mode Selector */}
            <div className="flex gap-4 flex-wrap">
              {[
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
            {learningMode === 'pronunciation' && currentPhrase && (
              <div className="cultural-card">
                <h2 className="text-xl font-bold mb-4">
                  Practice: "{currentPhrase.text}"
                </h2>
                <p className="text-gray-600 mb-2">
                  Translation: {currentPhrase.translation}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {currentPhrase.context}
                </p>
                
                <PronunciationPractice
                  text={currentPhrase.text}
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
            
            {/* Quick Tips based on mode */}
            <div className="cultural-card">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon icon="tip" size="small" className="text-yellow-500" />
                Learning Tips
              </h3>
              
              {learningMode === 'pronunciation' && (
                <p className="text-sm text-gray-600">
                  Focus on the tone marks in Yoruba. The dots under letters 
                  (ẹ, ọ, ṣ) change the sound. Listen carefully to the examples!
                </p>
              )}
              
              {learningMode === 'conversation' && (
                <p className="text-sm text-gray-600">
                  In Nigerian conversations, greetings are very important. 
                  Always acknowledge others before starting any discussion.
                </p>
              )}
              
              {learningMode === 'story' && (
                <p className="text-sm text-gray-600">
                  Nigerian stories often contain moral lessons. Pay attention 
                  to the wisdom shared by elders in these tales.
                </p>
              )}
              
              {learningMode === 'culture' && (
                <p className="text-sm text-gray-600">
                  Understanding culture is key to mastering any language. 
                  Don't be shy - ask about anything you're curious about.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;