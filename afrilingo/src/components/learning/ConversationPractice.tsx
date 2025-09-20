import { useState, useRef } from 'react';
import { geminiService } from '../../services/gemini.service';
import { spitchService } from '../../services/spitch.service';
import { Icon } from '../../utils/icons';
import { showToast } from '../../utils/toast';
import { MessageCircle, Volume2, Mic, Send, Loader2 } from 'lucide-react';

interface ConversationPracticeProps {
  language: 'yo' | 'ig' | 'ha';
  level: 'beginner' | 'intermediate' | 'advanced';
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
  level,
  topic = 'greetings',
  onComplete
}: ConversationPracticeProps) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showTranslations, setShowTranslations] = useState(true);
  const [conversationStarted, setConversationStarted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startConversation = async () => {
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

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(err => {
      console.error('Audio playback error:', err);
      showToast.error('Failed to play audio');
    });
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
      <div className="cultural-card text-center py-12">
        <Icon icon="conversation" size="xlarge" className="text-nigeria-green mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Conversation Practice</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Practice real-life conversations in {
            language === 'yo' ? 'Yoruba' :
            language === 'ig' ? 'Igbo' : 'Hausa'
          } with our AI partner
        </p>
        <button
          onClick={startConversation}
          disabled={isLoading}
          className="btn-nigeria inline-flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <MessageCircle size={20} />
              Start Conversation
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="cultural-card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Icon icon="conversation" size="medium" className="text-nigeria-green" />
            Conversation Practice
          </h3>
          <button
            onClick={() => setShowTranslations(!showTranslations)}
            className="text-sm text-nigeria-green hover:underline"
          >
            {showTranslations ? 'Hide' : 'Show'} translations
          </button>
        </div>

        {/* Messages */}
        <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
          {conversation.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-nigeria-green text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{message.content}</div>
                  {showTranslations && message.translation && (
                    <div className="text-sm opacity-80 mt-1 italic">
                      {message.translation}
                    </div>
                  )}
                </div>
                {message.audioUrl && (
                  <button
                    onClick={() => playAudio(message.audioUrl!)}
                    className="mt-1 p-1 text-gray-600 hover:text-nigeria-green transition-colors"
                    title="Play audio"
                  >
                    <Volume2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-gray-600">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response..."
            disabled={isLoading || isRecording}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-nigeria-green
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-500 text-white animate-pulse' 
                : 'bg-gray-100 hover:bg-gray-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            <Mic size={20} />
          </button>
          <button
            onClick={sendMessage}
            disabled={!userInput.trim() || isLoading}
            className="btn-nigeria px-4 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Conversation Tips */}
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-sm text-gray-700 flex items-start gap-2">
            <Icon icon="tip" size="small" className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <span>
              {isRecording ? 
                'Speak clearly into your microphone. Click the red button to stop.' :
                'Try using greetings appropriate for the time of day. Remember to show respect when addressing elders!'
              }
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};