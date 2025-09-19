import { useState, useRef, useEffect } from 'react';
import { spitchService } from '../../services/spitch.service';
import { showToast } from '../../utils/toast';
import { Icon } from '../../utils/icons';
import { Volume2, Mic, MicOff, RotateCcw, Check, Loader2 } from 'lucide-react';

interface PronunciationPracticeProps {
  text: string;
  language: 'yo' | 'ig' | 'ha' | 'en';
  onComplete?: (score: number) => void;
  voice?: string; // Optional voice override
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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load available voices on mount
  useEffect(() => {
    const voices = spitchService.getVoices(language);
    setAvailableVoices(voices);
    setSelectedVoice(voice || voices[0]?.id || '');
  }, [language, voice]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Play example pronunciation
  const playExample = async () => {
    setIsLoadingExample(true);
    
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audioBlob = await spitchService.generateSpeech(text, language, selectedVoice);
      const audioUrl = URL.createObjectURL(audioBlob);
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
      setHasListenedToExample(true);
      showToast.success('Playing native speaker example');
    } catch (error) {
      console.error('Failed to play example:', error);
      showToast.error('Failed to play example. Please check your connection and API key.');
    } finally {
      setIsLoadingExample(false);
    }
  };

  // Start recording
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

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      showToast.info('Recording stopped');
    }
  };

  // Analyze pronunciation
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

      // Award XP based on score
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

  // Reset practice
  const resetPractice = () => {
    setAudioBlob(null);
    setScore(null);
    setFeedback([]);
    setHasListenedToExample(false);
    
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <Icon icon="info" size="small" className="text-blue-600 mt-0.5 flex-shrink-0" />
          <span>
            Listen to the native speaker example first, then record yourself saying the phrase.
            {language === 'yo' && ' Pay special attention to tone marks!'}
            {language === 'ig' && ' Focus on nasal sounds and pronunciation.'}
            {language === 'ha' && ' Notice the glottal stops and intonation.'}
          </span>
        </p>
      </div>

      {/* Voice Selection */}
      {availableVoices.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Voice:</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-nigeria-green focus:border-transparent"
          >
            {availableVoices.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.gender})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Example Player */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
        <div>
          <h4 className="font-medium text-gray-900">Listen to Native Speaker</h4>
          <p className="text-sm text-gray-600">
            {hasListenedToExample ? 'Click to play again' : 'Click to hear correct pronunciation'}
          </p>
        </div>
        <button
          onClick={playExample}
          disabled={isLoadingExample}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg
                   hover:bg-gray-50 transition-all duration-200 border border-gray-200
                   disabled:opacity-50 disabled:cursor-not-allowed
                   shadow-sm hover:shadow-md"
        >
          {isLoadingExample ? (
            <Loader2 size={20} className="animate-spin text-gray-600" />
          ) : (
            <Volume2 size={20} className="text-nigeria-green" />
          )}
          {isLoadingExample ? 'Loading...' : 'Play Example'}
        </button>
      </div>

      {/* Recording Controls */}
      <div className="text-center space-y-4">
        {!audioBlob ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!hasListenedToExample}
            className={`inline-flex items-center gap-3 px-6 py-4 rounded-full
                      text-white font-medium transition-all duration-300 transform
                      ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse shadow-lg' 
                        : 'bg-nigeria-green hover:bg-green-700 hover:scale-105 shadow-md hover:shadow-lg'
                      } ${!hasListenedToExample ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <>
                <MicOff size={24} />
                Stop Recording
              </>
            ) : (
              <>
                <Mic size={24} />
                Start Recording
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center gap-3">
              <button
                onClick={analyzePronunciation}
                disabled={isAnalyzing}
                className="btn-nigeria inline-flex items-center gap-2 px-6 py-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Analyze Pronunciation
                  </>
                )}
              </button>
              <button
                onClick={resetPractice}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg
                         hover:bg-gray-300 transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw size={20} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {!hasListenedToExample && !isRecording && (
          <p className="text-sm text-gray-500 animate-pulse">
            👆 Please listen to the example first before recording
          </p>
        )}
      </div>

      {/* Results */}
      {score !== null && (
        <div className="space-y-4 animate-fade-in">
          {/* Score Display */}
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full
                          bg-gradient-to-br text-white shadow-lg transform transition-all duration-500
                          ${score >= 0.8 ? 'from-green-500 to-green-600' :
                            score >= 0.6 ? 'from-yellow-500 to-yellow-600' :
                            'from-orange-500 to-orange-600'}`}>
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round(score * 100)}%</div>
                <div className="text-sm">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Icon icon="tip" size="small" className="text-yellow-600" />
                Feedback
              </h4>
              <ul className="space-y-2">
                {feedback.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-nigeria-green mt-0.5 flex-shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          <div className={`p-4 rounded-lg text-center ${
            score >= 0.8 ? 'bg-green-50 text-green-800 border border-green-200' :
            score >= 0.6 ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
            'bg-orange-50 text-orange-800 border border-orange-200'
          }`}>
            {score >= 0.8 && (
              <div>
                <p className="font-medium">🎉 Excellent work!</p>
                <p className="text-sm mt-1">Your pronunciation is very good! Native speakers would understand you perfectly.</p>
              </div>
            )}
            {score >= 0.6 && score < 0.8 && (
              <div>
                <p className="font-medium">👏 Good effort!</p>
                <p className="text-sm mt-1">You're doing well! Keep practicing to improve your accuracy.</p>
              </div>
            )}
            {score < 0.6 && (
              <div>
                <p className="font-medium">💪 Keep practicing!</p>
                <p className="text-sm mt-1">Don't give up! Pronunciation takes time. Try listening to the example again.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};