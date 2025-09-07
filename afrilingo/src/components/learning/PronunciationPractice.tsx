import { useState, useRef, useEffect } from 'react';
import { spitchService } from '../../services/spitch.service';
import toast from 'react-hot-toast';

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
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Play example pronunciation
  const playExample = async () => {
    try {
      const audioBlob = await spitchService.generateSpeech(text, language);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (error) {
      toast.error('Failed to play example');
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
    } catch (error) {
      toast.error('Microphone access denied');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
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
        toast.success(`Great job! ${Math.round(result.score * 100)}% accuracy`);
      }
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        Pronunciation Practice
      </h3>

      {/* Target Text */}
      <div className="mb-6">
        <p className="text-lg font-nigerian text-gray-800 mb-2">{text}</p>
        <button
          onClick={playExample}
          className="text-sm text-nigeria-green hover:underline flex items-center gap-1"
        >
          <span>🔊</span> Listen to example
        </button>
      </div>

      {/* Recording Controls */}
      <div className="flex gap-4 mb-6">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex-1 btn-nigeria flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🎤</span>
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg 
                     hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-2xl animate-pulse">⏹️</span>
            Stop Recording
          </button>
        )}

        {audioBlob && !isRecording && (
          <button
            onClick={analyzePronunciation}
            disabled={isAnalyzing}
            className="flex-1 bg-royal-gold text-gray-900 px-6 py-3 rounded-lg 
                     hover:bg-yellow-500 transition-colors disabled:opacity-50
                     flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent 
                              rounded-full animate-spin"></div>
                Analyzing...
              </>
            ) : (
              <>
                <span className="text-2xl">🎯</span>
                Check Pronunciation
              </>
            )}
          </button>
        )}
      </div>

      {/* Results */}
      {score !== null && (
        <div className="space-y-4">
          {/* Score Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Accuracy Score</span>
              <span className="text-2xl font-bold text-nigeria-green">
                {Math.round(score * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-nigeria-green h-3 rounded-full transition-all duration-500"
                style={{ width: `${score * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Feedback */}
          {feedback.length > 0 && (
            <div className="space-y-2">
              {feedback.map((item, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span>💡</span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};