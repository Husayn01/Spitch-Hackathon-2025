import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { PronunciationPractice } from '../components/learning/PronunciationPractice';
import { ConversationPractice } from '../components/learning/ConversationPractice';
import { CulturalAssistant } from '../components/learning/CulturalAssistant';
import { InteractiveStory } from '../components/cultural/InteractiveStory';
import { UserStats } from '../components/gamification/UserStats';
import { useGameStore } from '../stores/gameStore';
import toast from 'react-hot-toast';

// Learning modes
type LearningMode = 'pronunciation' | 'conversation' | 'story' | 'culture';

const SAMPLE_LESSONS = {
  yoruba: {
    greeting: {
      title: 'Basic Greetings',
      phrases: [
        { text: 'Ẹ káàárọ̀', translation: 'Good morning', context: 'Used before noon' },
        { text: 'Ẹ káàsán', translation: 'Good afternoon', context: 'Used from noon to 4pm' },
        { text: 'Ẹ kúurọ̀lẹ́', translation: 'Good evening', context: 'Used after 4pm' },
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
      toast.success('Great! Moving to next phrase.');
    } else {
      toast.success('🎉 Lesson completed!');
      await addCowries(5);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Learn {language.charAt(0).toUpperCase() + language.slice(1)}
          </h1>
          
          {/* Learning Mode Tabs */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { mode: 'pronunciation', label: '🎤 Pronunciation', desc: 'Practice speaking' },
              { mode: 'conversation', label: '💬 Conversation', desc: 'Real-life dialogues' },
              { mode: 'story', label: '📖 Stories', desc: 'Cultural tales' },
              { mode: 'culture', label: '🎭 Culture', desc: 'Ask questions' },
            ].map(({ mode, label, desc }) => (
              <button
                key={mode}
                onClick={() => setLearningMode(mode as LearningMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors
                  ${learningMode === mode
                    ? 'bg-nigeria-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <span className="block">{label}</span>
                <span className="text-xs opacity-80">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Learning Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pronunciation Mode */}
            {learningMode === 'pronunciation' && lesson && currentPhrase && (
              <>
                <div className="cultural-card">
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-nigerian text-gray-900 mb-2">
                      {currentPhrase.text}
                    </h2>
                    <p className="text-xl text-gray-700">{currentPhrase.translation}</p>
                    <p className="text-sm text-gray-500 mt-2">{currentPhrase.context}</p>
                  </div>
                </div>

                <PronunciationPractice
                  text={currentPhrase.text}
                  language={languageCode as any}
                  onComplete={handlePronunciationComplete}
                />
              </>
            )}

            {/* Conversation Mode */}
            {learningMode === 'conversation' && (
              <ConversationPractice
                language={languageCode as any}
                topic="Market Shopping"
                level="beginner"
              />
            )}

            {/* Story Mode */}
            {learningMode === 'story' && (
              <InteractiveStory
                language={languageCode as any}
                level="beginner"
                theme="Traditional Wisdom"
              />
            )}

            {/* Culture Mode */}
            {learningMode === 'culture' && (
              <div className="space-y-6">
                <div className="cultural-card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Nigerian Cultural Guide
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Ask any question about Nigerian culture, traditions, etiquette, 
                    or language usage. Our AI elder is here to help you understand 
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
              <h3 className="font-semibold text-gray-900 mb-3">
                💡 Learning Tips
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
                  Don't be shy - ask about anything you're curious about!
                </p>
              )}
            </div>

            {/* Cultural Assistant (always visible) */}
            <CulturalAssistant language={language} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPage;