import { useState } from 'react';
import { geminiService } from '../../services/gemini.service';
import { Icon } from '../../utils/icons';
import { showToast } from '../../utils/toast';
import { Send, Loader2 } from 'lucide-react';

interface CulturalAssistantProps {
  language: string;
  context?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const CulturalAssistant = ({ 
  language,
  context 
}: CulturalAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Ẹ káàbọ̀! Welcome! I am your cultural guide for ${language} language and Nigerian culture. Ask me about greetings, customs, proverbs, or any cultural context you'd like to understand better.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const explanation = await geminiService.explainCulturalContext(
        input,
        language,
        context
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: formatCulturalResponse(explanation),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      showToast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCulturalResponse = (explanation: any): string => {
    let response = explanation.explanation || '';
    
    if (explanation.examples?.length > 0) {
      response += '\n\n**Examples:**\n';
      explanation.examples.forEach((example: string, idx: number) => {
        response += `${idx + 1}. ${example}\n`;
      });
    }

    if (explanation.culturalNotes?.length > 0) {
      response += '\n\n**Cultural Notes:**\n';
      explanation.culturalNotes.forEach((note: string) => {
        response += `• ${note}\n`;
      });
    }

    if (explanation.relatedPhrases?.length > 0) {
      response += '\n\n**Related Phrases:**\n';
      explanation.relatedPhrases.forEach((phrase: string) => {
        response += `• ${phrase}\n`;
      });
    }

    return response;
  };

  const suggestedQuestions = [
    "What's the proper way to greet elders?",
    "Explain the significance of kola nuts",
    "What are common Nigerian proverbs?",
    "How do naming ceremonies work?"
  ];

  return (
    <div className="cultural-card">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="info" size="medium" className="text-nigeria-green" />
        <h3 className="text-lg font-semibold text-gray-900">
          Cultural Assistant
        </h3>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-nigeria-green text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <Icon icon="info" size="small" className="text-nigeria-green" />
                  <span className="text-sm font-medium">Cultural Guide</span>
                </div>
              )}
              <div className="whitespace-pre-line">{message.content}</div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
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

      {/* Suggested Questions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 
                         px-3 py-1 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Nigerian culture..."
          disabled={isLoading}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-nigeria-green
                   disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-nigeria px-4 py-2 disabled:opacity-50 
                   flex items-center gap-2"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};