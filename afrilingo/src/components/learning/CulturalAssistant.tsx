import { useState } from 'react';
import { geminiService } from '../../services/gemini.service';
import { Icon } from '../../utils/icons';
import { showToast } from '../../utils/toast';
import { Send, Loader2, Sparkles, MessageCircle, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Check if dark mode is enabled
  const isDark = document.documentElement.classList.contains('dark') || 
                document.body.classList.contains('bg-gray-900') ||
                true; // Default to dark mode

  const languageColors = {
    Yoruba: 'from-emerald-500 to-teal-600',
    Igbo: 'from-orange-500 to-red-600',
    Hausa: 'from-blue-500 to-indigo-600'
  };

  const currentColor = languageColors[language as keyof typeof languageColors] || 'from-emerald-500 to-teal-600';

  const handleSubmit = async (e?: any) => {
    e?.preventDefault();
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

  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return (
          <h4 key={index} className="font-bold mt-4 mb-2 text-emerald-400">
            {line.replace(/\*\*/g, '')}
          </h4>
        );
      } else if (line.startsWith('•') || line.match(/^\d+\./)) {
        return (
          <p key={index} className={`ml-4 mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {line}
          </p>
        );
      } else if (line.trim()) {
        return (
          <p key={index} className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            {line}
          </p>
        );
      }
      return null;
    });
  };

  return (
    <motion.div 
      className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl overflow-hidden relative`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Pattern */}
      <svg className="absolute top-0 right-0 w-48 h-48 opacity-10 pointer-events-none">
        <pattern id="cultural-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="25" r="3" fill="currentColor" />
          <path d="M0,25 Q25,0 50,25 T100,25" stroke="currentColor" fill="none" strokeWidth="0.5"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#cultural-pattern)" />
      </svg>

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-6">
        <motion.div 
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${currentColor} flex items-center justify-center`}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <div>
          <h3 className="text-xl font-bold">Cultural Assistant</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Your guide to {language} culture
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className={`h-96 overflow-y-auto mb-4 pr-2 space-y-4 ${
        isDark ? 'scrollbar-dark' : 'scrollbar-light'
      }`}>
        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? `bg-gradient-to-r ${currentColor} text-white shadow-lg`
                    : isDark 
                      ? 'bg-gray-700 border border-gray-600' 
                      : 'bg-gray-100 border border-gray-200'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Book className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Cultural Guide
                    </span>
                  </div>
                )}
                <div className={message.role === 'assistant' ? '' : 'text-white'}>
                  {message.role === 'assistant' ? formatContent(message.content) : message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.role === 'user' 
                    ? 'text-white/70' 
                    : isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Loading Animation */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className={`rounded-2xl p-4 flex items-center gap-3 ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-emerald-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                    />
                  ))}
                </div>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Consulting the ancestors...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Suggested Questions */}
      <AnimatePresence>
        {messages.length === 1 && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Popular questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setInput(question)}
                  className={`text-sm px-4 py-2 rounded-full transition-all ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <MessageCircle className="w-3 h-3 inline mr-2" />
                  {question}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Form */}
      <div className="relative">
        <div className="flex gap-3">
          <motion.input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e: any) => e.key === 'Enter' && handleSubmit(e)}
            placeholder="Ask about Nigerian culture..."
            disabled={isLoading}
            className={`flex-1 px-5 py-3 rounded-xl border-2 transition-all ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500' 
                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-600'
            } focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50`}
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 
                     bg-gradient-to-r ${currentColor} text-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg hover:shadow-xl transition-all`}
            whileHover={!input.trim() || isLoading ? {} : { scale: 1.05 }}
            whileTap={!input.trim() || isLoading ? {} : { scale: 0.95 }}
          >
            <Send size={20} />
            <span className="hidden sm:inline">Send</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Add these styles to your global CSS for custom scrollbar
const scrollbarStyles = `
  .scrollbar-dark::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-dark::-webkit-scrollbar-track {
    background: #374151;
    border-radius: 4px;
  }
  .scrollbar-dark::-webkit-scrollbar-thumb {
    background: #4B5563;
    border-radius: 4px;
  }
  .scrollbar-dark::-webkit-scrollbar-thumb:hover {
    background: #6B7280;
  }
  .scrollbar-light::-webkit-scrollbar {
    width: 8px;
  }
  .scrollbar-light::-webkit-scrollbar-track {
    background: #F3F4F6;
    border-radius: 4px;
  }
  .scrollbar-light::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 4px;
  }
  .scrollbar-light::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }
`;