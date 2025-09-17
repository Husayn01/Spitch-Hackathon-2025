import { useState, useRef, useEffect } from 'react';
import { spitchService } from '../../services/spitch.service';
import { showToast } from '../../utils/toast';
import { Icon } from '../../utils/icons';
import { Volume2, Mic, MicOff, RotateCcw, Check } from 'lucide-react';

interface PronunciationPracticeProps {
  text: string;
  language: 'yo' | 'ig' | 'ha' | 'en';
  onComplete?: (score: number) => void;
}

export const PronunciationPractice = ({ 
  text, 
  language, 
  onComplete 
}: PronunciationPracticeProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [hasListenedToExample, setHasListenedToExample] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Play example pronunciation
  const playExample = async () => {
    try {
      const audioBlob = await spitchService.generateSpeech(text, language);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
      setHasListenedToExample(true);
    } catch (error) {
      showToast.error('Failed to play example');
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      showToast.info('Recording started - speak clearly!');
    } catch (error) {
      showToast.error('Microphone access denied');
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
      showToast.error('Analysis failed. Please try again.');
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
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 flex items-start gap-2">
          <Icon icon="info" size="small" className="text-blue-600 mt-0.5" />
          <span>
            Listen to the example first, then record yourself saying the phrase.
            Pay attention to tone marks and pronunciation!
          </span>
        </p>
      </div>

      {/* Example Player */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900">Listen to Example</h4>
          <p className="text-sm text-gray-600">Click to hear native pronunciation</p>
        </div>
        <button
          onClick={playExample}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg
                   hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <Volume2 size={20} className="text-nigeria-green" />
          Play Example
        </button>
      </div>

      {/* Recording Controls */}
      <div className="text-center space-y-4">
        {!audioBlob ? (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!hasListenedToExample}
            className={`inline-flex items-center gap-3 px-6 py-4 rounded-full
                      text-white font-medium transition-all transform
                      ${isRecording 
                        ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse' 
                        : 'bg-nigeria-green hover:bg-green-700'
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
                className="btn-nigeria inline-flex items-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Icon icon="loading" size="small" className="animate-spin" />
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
          <p className="text-sm text-gray-500">
            Please listen to the example first before recording
          </p>
        )}
      </div>

      {/* Results */}
      {score !== null && (
        <div className="space-y-4">
          {/* Score Display */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full
                          bg-gradient-to-br from-nigeria-green to-green-600 text-white">
              <div className="text-center">
                <div className="text-3xl font-bold">{Math.round(score * 100)}%</div>
                <div className="text-sm">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {feedback.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Icon icon="tip" size="small" className="text-yellow-600" />
                Feedback
              </h4>
              <ul className="space-y-1">
                {feedback.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-nigeria-green mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          <div className={`p-4 rounded-lg text-center ${
            score >= 0.8 ? 'bg-green-50 text-green-800' :
            score >= 0.6 ? 'bg-yellow-50 text-yellow-800' :
            'bg-orange-50 text-orange-800'
          }`}>
            {score >= 0.8 && (
              <p className="font-medium">
                Excellent work! Your pronunciation is very good!
              </p>
            )}
            {score >= 0.6 && score < 0.8 && (
              <p className="font-medium">
                Good effort! Keep practicing to improve your accuracy.
              </p>
            )}
            {score < 0.6 && (
              <p className="font-medium">
                Don't give up! Pronunciation takes practice. Try again!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};