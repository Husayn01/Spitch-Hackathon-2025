import { useState, useRef } from 'react';
import { geminiService } from '../../services/gemini.service';
import { spitchService } from '../../services/spitch.service';
import { Icon } from '../../utils/icons';
import { showToast } from '../../utils/toast';
import { MessageCircle, Volume2, Mic, Send, Loader2, Eye, EyeOff, Play, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConversationPracticeProps {
  language: 'yo' | 'ig' | 'ha';
  level?: 'beginner' | 'intermediate' | 'advanced';
  topic?: string;
  onComplete?: (score: number) => void;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  audioUrl?: string;
}

export const ConversationPractice = ({
  language,
  level = 'beginner',
  topic = 'greetings',
  onComplete
}: ConversationPracticeProps) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showTranslations, setShowTranslations] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark') || 
                document.body.classList.contains('bg-gray-900') ||
                true; // Default to dark mode

  const languageData = {
    yo: { 
      name: 'Yoruba',
      color: 'from-emerald-500 to-teal-600',
      pattern: 'M10,10 L20,20 L30,10 L40,20',
      greeting: 'Ẹ káàbọ̀!'
    },
    ig: { 
      name: 'Igbo',
      color: 'from-orange-500 to-red-600',
      pattern: 'M15,15 m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0',
      greeting: 'Nnọọ!'
    },
    ha: { 
      name: 'Hausa',
      color: 'from-blue-500 to-indigo-600',
      pattern: 'M20,10 L30,20 L20,30 L10,20 Z',
      greeting: 'Sannu!'
    }
  };

  const currentLanguage = languageData[language];

  const startConversation = async () => {
    console.log('Start conversation clicked');
    setIsLoading(true);
    try {
      const initialPrompt = await geminiService.startConversation(
        language === 'yo' ? 'Yoruba' :
        language === 'ig' ? 'Igbo' : 'Hausa',
        level,
        topic
      );

      const audioBlob = await spitchService.generateSpeech(
        initialPrompt.text,
        language
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      setConversation([{
        role: 'assistant',
        content: initialPrompt.text,
        translation: initialPrompt.translation,
        audioUrl
      }]);
      setConversationStarted(true);
    } catch (error) {
      showToast.error('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      role: 'user',
      content: userInput
    };

    // Add user message to conversation
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    setUserInput('');
    setIsLoading(true);

    try {
      // Get AI response - pass the updated conversation
      const response = await geminiService.continueConversation(
        updatedConversation.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        language === 'yo' ? 'Yoruba' :
        language === 'ig' ? 'Igbo' : 'Hausa'
      );

      // Generate audio for response
      const audioBlob = await spitchService.generateSpeech(
        response.text,
        language
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      const assistantMessage: ConversationMessage = {
        role: 'assistant',
        content: response.text,
        translation: response.translation,
        audioUrl
      };

      // Add assistant message to conversation
      setConversation(prev => [...prev, assistantMessage]);

      // Check if conversation goal is met
      if (updatedConversation.length >= 6 && onComplete) {
        const score = 0.8; // Calculate based on actual performance
        onComplete(score);
        showToast.achievement('Conversation completed successfully!');
      }
    } catch (error) {
      console.error('Conversation error:', error);
      showToast.error('Failed to get response');
      // Remove the user message if there was an error
      setConversation(conversation);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioUrl: string, index: number) => {
    setPlayingAudio(index);
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      showToast.error('Failed to play audio');
    });
    audio.onended = () => setPlayingAudio(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        // Transcribe the audio and use as input
        try {
          const transcription = await spitchService.transcribeAudio(audioBlob, language);
          setUserInput(transcription);
          showToast.success('Recording transcribed');
        } catch (error) {
          showToast.error('Failed to transcribe audio');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast.info('Recording started - speak clearly!');
    } catch (error) {
      console.error('Microphone error:', error);
      showToast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!conversationStarted) {
    return (
      <motion.div 
        className={`rounded-2xl p-12 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl text-center relative overflow-hidden`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        style={{ zIndex: 1 }}
      >
        {/* Background Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" style={{ zIndex: 0 }}>
          <pattern id="start-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d={currentLanguage.pattern} stroke="currentColor" strokeWidth="1" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#start-pattern)" />
        </svg>

        <div className="relative" style={{ zIndex: 1 }}>
        <motion.div
          className={`relative w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${currentLanguage.color} flex items-center justify-center`}
          style={{ zIndex: 5 }}
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", duration: 0.8 }}
        >
          <MessageCircle size={40} className="text-white" />
        </motion.div>

        <motion.h2 
          className="text-3xl font-bold mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {currentLanguage.greeting}
        </motion.h2>
        
        <motion.p 
          className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-md mx-auto`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Practice real-life conversations in {currentLanguage.name} with our AI partner
        </motion.p>

        <motion.div
          className="flex flex-wrap gap-2 justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className={`px-3 py-1 rounded-full text-sm ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            Level: {(level || 'beginner').charAt(0).toUpperCase() + (level || 'beginner').slice(1)}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isDark ? 'bg-gray-700' : 'bg-gray-100'
          }`}>
            Topic: {(topic || 'greetings').charAt(0).toUpperCase() + (topic || 'greetings').slice(1)}
          </span>
        </motion.div>

        <motion.button
          onClick={startConversation}
          disabled={isLoading}
          className={`relative px-8 py-4 rounded-full font-semibold inline-flex items-center gap-3
                   bg-gradient-to-r ${currentLanguage.color} text-white
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-lg hover:shadow-2xl transition-all`}
          style={{ zIndex: 10 }}
          whileHover={!isLoading ? { scale: 1.05 } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isLoading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <MessageCircle size={24} />
              Start Conversation
            </>
          )}
        </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} relative overflow-hidden`}>
          {/* Background Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <pattern id="header-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d={currentLanguage.pattern} stroke="currentColor" strokeWidth="0.5" fill="none" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#header-pattern)" />
          </svg>

          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-10 h-10 rounded-full bg-gradient-to-br ${currentLanguage.color} flex items-center justify-center`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <MessageCircle className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold">Conversation Practice</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentLanguage.name} • {(topic || 'greetings').charAt(0).toUpperCase() + (topic || 'greetings').slice(1)}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={() => setShowTranslations(!showTranslations)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                       ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}
                       transition-colors`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showTranslations ? <EyeOff size={16} /> : <Eye size={16} />}
              {showTranslations ? 'Hide' : 'Show'} translations
            </motion.button>
          </div>
        </div>

        {/* Messages */}
        <div className={`p-6 h-96 overflow-y-auto ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
          <AnimatePresence>
            {conversation.map((message, idx) => (
              <motion.div
                key={idx}
                className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={`max-w-[75%] ${message.role === 'user' ? 'order-2' : ''}`}>
                  <motion.div
                    className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? `bg-gradient-to-r ${currentLanguage.color} text-white shadow-lg`
                        : isDark ? 'bg-gray-700' : 'bg-white shadow-md'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="font-medium">{message.content}</div>
                    <AnimatePresence>
                      {showTranslations && message.translation && (
                        <motion.div 
                          className={`text-sm mt-2 ${
                            message.role === 'user' ? 'text-white/80' : isDark ? 'text-gray-400' : 'text-gray-600'
                          } italic border-t ${
                            message.role === 'user' ? 'border-white/20' : isDark ? 'border-gray-600' : 'border-gray-200'
                          } pt-2`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          {message.translation}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  {message.audioUrl && (
                    <motion.button
                      onClick={() => playAudio(message.audioUrl!, idx)}
                      className={`mt-2 p-2 rounded-full flex items-center gap-2 text-sm
                               ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 
                                         'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                               transition-all`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Play audio"
                    >
                      {playingAudio === idx ? (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          <Volume2 size={20} className="text-emerald-500" />
                        </motion.div>
                      ) : (
                        <Play size={20} />
                      )}
                      <span>Play</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Loading Animation */}
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-700' : 'bg-white'} shadow-md flex items-center gap-3`}>
                  <div className="flex space-x-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-emerald-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                    Thinking...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className={`p-6 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="flex gap-3">
            <motion.input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={isLoading || isRecording}
              className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-600'
              } focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50`}
              whileFocus={{ scale: 1.01 }}
            />
            
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-3 rounded-xl transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                  : isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              whileHover={!isLoading && !isRecording ? { scale: 1.1 } : {}}
              whileTap={!isLoading ? { scale: 0.9 } : {}}
              title={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </motion.button>
            
            <motion.button
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
              className={`px-6 py-3 rounded-xl font-semibold bg-gradient-to-r ${currentLanguage.color} text-white
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
              whileHover={!(!userInput.trim() || isLoading) ? { scale: 1.05 } : {}}
              whileTap={!(!userInput.trim() || isLoading) ? { scale: 0.95 } : {}}
              title="Send message"
            >
              <Send size={24} />
            </motion.button>
          </div>

          {/* Conversation Tips */}
          <motion.div 
            className={`mt-4 p-4 rounded-xl ${
              isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className={`text-sm flex items-start gap-2 ${
              isDark ? 'text-yellow-300' : 'text-yellow-800'
            }`}>
              <Icon icon="tip" size="small" className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <span>
                {isRecording ? 
                  'Speak clearly into your microphone. Click the red button to stop.' :
                  'Try using greetings appropriate for the time of day. Remember to show respect when addressing elders!'}
              </span>
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};