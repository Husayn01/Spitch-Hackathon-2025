import React, { useState, useRef, useEffect } from 'react';
import { spitchService } from '../../services/spitch.service';
import { showToast } from '../../utils/toast';
import { Icon } from '../../utils/icons';
import { Volume2, Mic, MicOff, RotateCcw, Check, Loader2, Zap, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PronunciationPracticeProps {
  text: string;
  language: 'yo' | 'ig' | 'ha' | 'en';
  onComplete?: (score: number) => void;
  voice?: string;
}

export const PronunciationPractice = ({ 
  text, 
  language, 
  onComplete,
  voice 
}: PronunciationPracticeProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [hasListenedToExample, setHasListenedToExample] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<Array<{id: string, name: string, gender: string}>>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark') || 
                document.body.classList.contains('bg-gray-900') ||
                true; // Default to dark mode

  useEffect(() => {
    const voices = spitchService.getVoices(language);
    setAvailableVoices(voices);
    setSelectedVoice(voice || voices[0]?.id || '');
  }, [language, voice]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const playExample = async () => {
    setIsLoadingExample(true);
    setIsPlaying(true);
    
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioBlob = await spitchService.generateSpeech(text, language, selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      };
      
      await audioRef.current.play();
      setHasListenedToExample(true);
      showToast.success('Playing native speaker example');
    } catch (error) {
      console.error('Failed to play example:', error);
      showToast.error('Failed to play example. Please check your connection and API key.');
      setIsPlaying(false);
    } finally {
      setIsLoadingExample(false);
    }
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
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast.info('Recording started - speak clearly!');
    } catch (error) {
      console.error('Microphone access error:', error);
      showToast.error('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      showToast.info('Recording stopped');
    }
  };

  const analyzePronunciation = async () => {
    if (!audioBlob) return;

    setIsAnalyzing(true);
    setScore(null);
    setFeedback([]);
    
    try {
      const result = await spitchService.analyzePronunciation(
        audioBlob,
        text,
        language
      );

      setScore(result.score);
      setFeedback(result.feedback);

      if (result.score >= 0.7 && onComplete) {
        onComplete(result.score);
        showToast.success(`Great job! ${Math.round(result.score * 100)}% accuracy`);
      } else if (result.score < 0.7) {
        showToast.info('Keep practicing! You\'re getting there.');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      showToast.error('Analysis failed. Please ensure your API key is configured correctly.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetPractice = () => {
    setAudioBlob(null);
    setScore(null);
    setFeedback([]);
    setHasListenedToExample(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'from-emerald-500 to-teal-600';
    if (score >= 0.6) return 'from-yellow-500 to-orange-600';
    return 'from-orange-500 to-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 0.9) return '🎉';
    if (score >= 0.8) return '🌟';
    if (score >= 0.7) return '👏';
    if (score >= 0.6) return '💪';
    return '🎯';
  };

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <motion.div 
        className={`p-6 rounded-2xl ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border ${
          isDark ? 'border-gray-600' : 'border-blue-200'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start gap-3">
          <Zap className={`w-5 h-5 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-blue-600'}`} />
          <div className="flex-1">
            <h4 className={`font-semibold mb-1 ${isDark ? 'text-yellow-400' : 'text-blue-900'}`}>
              Practice Tips
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
              Listen to the native speaker example first, then record yourself saying the phrase.
              {language === 'yo' && ' Pay special attention to tone marks!'}
              {language === 'ig' && ' Focus on nasal sounds and pronunciation.'}
              {language === 'ha' && ' Notice the glottal stops and intonation.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Voice Selection */}
      {availableVoices.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Choose Voice
          </label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className={`w-full px-4 py-2 rounded-xl border-2 transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-600 text-white focus:border-emerald-500' 
                : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-600'
            } focus:outline-none focus:ring-4 focus:ring-emerald-500/20`}
          >
            {availableVoices.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gender})
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Text Display */}
      <motion.div 
        className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-3xl font-bold mb-2 font-nigerian">{text}</h3>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Practice saying this phrase
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Listen Button */}
        <motion.button
          onClick={playExample}
          disabled={isLoadingExample || isPlaying}
          className={`relative overflow-hidden p-6 rounded-2xl font-semibold transition-all ${
            hasListenedToExample
              ? isDark 
                ? 'bg-emerald-600/20 text-emerald-400 border-2 border-emerald-600' 
                : 'bg-emerald-50 text-emerald-700 border-2 border-emerald-300'
              : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
          } ${isLoadingExample || isPlaying ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
          whileHover={!isLoadingExample && !isPlaying ? { scale: 1.05 } : {}}
          whileTap={!isLoadingExample && !isPlaying ? { scale: 0.95 } : {}}
        >
          <div className="flex items-center justify-center gap-3">
            {isLoadingExample ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
            <span>{isPlaying ? 'Playing...' : 'Listen to Native Speaker'}</span>
          </div>
          {hasListenedToExample && (
            <motion.div
              className="absolute top-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}
        </motion.button>

        {/* Record Button */}
        <motion.button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!hasListenedToExample}
          className={`relative overflow-hidden p-6 rounded-2xl font-semibold transition-all ${
            !hasListenedToExample
              ? isDark
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isRecording
                ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white animate-pulse'
                : audioBlob
                  ? isDark
                    ? 'bg-orange-600/20 text-orange-400 border-2 border-orange-600'
                    : 'bg-orange-50 text-orange-700 border-2 border-orange-300'
                  : isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
          }`}
          whileHover={hasListenedToExample && !isRecording ? { scale: 1.05 } : {}}
          whileTap={hasListenedToExample && !isRecording ? { scale: 0.95 } : {}}
        >
          <div className="flex items-center justify-center gap-3">
            {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span>
              {isRecording ? 'Stop Recording' : audioBlob ? 'Record Again' : 'Record Your Voice'}
            </span>
          </div>
          {audioBlob && !isRecording && (
            <motion.div
              className="absolute top-2 right-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Analyze Button */}
      <AnimatePresence>
        {audioBlob && (
          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.button
              onClick={analyzePronunciation}
              disabled={isAnalyzing}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl
                       hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-3"
              whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
              whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Analyze Pronunciation
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={resetPractice}
              className={`px-6 py-4 rounded-xl font-semibold flex items-center gap-2 ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-5 h-5" />
              Try Again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {score !== null && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            {/* Score Display */}
            <motion.div 
              className={`text-center p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
            >
              <motion.div
                className={`inline-flex items-center justify-center w-40 h-40 rounded-full
                          bg-gradient-to-br ${getScoreColor(score)} text-white shadow-2xl mb-4`}
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-5xl font-bold">{Math.round(score * 100)}%</div>
                  <div className="text-sm mt-1">Accuracy</div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-3xl mb-2">{getScoreEmoji(score)}</p>
                <p className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {score >= 0.9 ? 'Perfect!' :
                   score >= 0.8 ? 'Excellent!' :
                   score >= 0.7 ? 'Good job!' :
                   score >= 0.6 ? 'Keep practicing!' :
                   'Try again!'}
                </p>
              </motion.div>
            </motion.div>

            {/* Feedback */}
            {feedback.length > 0 && (
              <motion.div
                className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Icon icon="tip" size="small" className="text-yellow-500" />
                  Pronunciation Tips
                </h4>
                <ul className="space-y-3">
                  {feedback.map((item, idx) => (
                    <motion.li
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg ${
                        isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                    >
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {item}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};