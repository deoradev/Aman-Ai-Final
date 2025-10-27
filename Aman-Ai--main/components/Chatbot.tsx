import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ai } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import { buildSystemInstruction, getScopedKey } from '../utils';

interface ChatbotProps {
    proactiveMessage?: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ proactiveMessage }) => {
  const { t } = useLocalization();
  const { isOnline } = useConnectivity();
  const { getScopedKey } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const suggestedPrompts = [
    t('chatbot.suggested_prompt_1'),
    t('chatbot.suggested_prompt_2'),
    t('chatbot.suggested_prompt_3'),
  ];
  
  useEffect(() => {
    const initializeChat = async () => {
        setIsInitializing(true);
        try {
            const systemInstruction = await buildSystemInstruction();
            if (!systemInstruction) {
                throw new Error("Could not load user context. Please ensure you are enrolled in a program on the dashboard.");
            }

            const storedHistory: ChatMessage[] = JSON.parse(localStorage.getItem(getScopedKey('chat-history')) || '[]');

            // Format history for the Gemini API. Exclude the initial default model message.
            const historyForAI = storedHistory.length > 0 
                ? storedHistory
                    .filter((msg, index) => !(index === 0 && msg.role === 'model'))
                    .map(msg => ({
                        role: msg.role,
                        parts: [{ text: msg.text }]
                    })) 
                : [];
            
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction },
                history: historyForAI
            });

            if (storedHistory.length > 0) {
                setMessages(storedHistory);
                setShowSuggestions(false);
            } else {
                setMessages([{ role: 'model', text: proactiveMessage || t('chatbot.initial_message') }]);
                setShowSuggestions(true);
            }
            setError(null);
        } catch (e) {
            console.error("Failed to initialize chat session", e);
            const errorMessage = e instanceof Error ? e.message : "Failed to initialize the AI companion. Please check your connection and try again.";
            setError(errorMessage);
        } finally {
            setIsInitializing(false);
        }
    };
    initializeChat();
    
    // Cleanup function to save history on unmount
    return () => {
        const historyToSave = messagesRef.current;
        if (historyToSave.length > 1) { // Don't save if it's just the initial message
            try {
                // Save the last 30 messages to keep storage manageable
                const limitedHistory = historyToSave.slice(-30);
                localStorage.setItem(getScopedKey('chat-history'), JSON.stringify(limitedHistory));
            } catch (e) {
                console.error("Failed to save chat history to localStorage", e);
            }
        }
    };
  }, [t, proactiveMessage, getScopedKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const streamResponse = async (textToSend: string) => {
    try {
      if (!chatSessionRef.current) {
          throw new Error("Chat session is not initialized.");
      }
      const stream = await chatSessionRef.current.sendMessageStream({ message: textToSend });
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk.text;
        setMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last && last.role === 'model' && !last.isError) {
            last.text = fullText;
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error("Error sending/streaming message to Gemini:", err);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;
        newMessages[lastMessageIndex] = {
          role: 'model',
          text: t('chatbot.error_message'),
          isError: true
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (textToSend.trim() === '' || isLoading || !isOnline || isInitializing) return;
    
    setMessages(prev => [
      ...prev,
      { role: 'user', text: textToSend },
      { role: 'model', text: '' }
    ]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    await streamResponse(textToSend);
  };

  const retryLastMessage = async () => {
    if (!isOnline || !chatSessionRef.current) return;
    
    let lastUserMessage: ChatMessage | null = null;
    let lastErrorIndex = -1;

    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].isError) {
            lastErrorIndex = i;
        }
        if (messages[i].role === 'user' && lastErrorIndex === -1) {
            lastUserMessage = messages[i];
            break; 
        }
    }

    if (!lastUserMessage || lastErrorIndex === -1) return;

    setIsLoading(true);

    // Rebuild history from messages before the failed attempt to ensure a clean state.
    const successfulHistory = messages
        .slice(1, lastErrorIndex - 1) // Exclude initial message and user message that led to error
        .filter(m => !m.isError)
        .map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

    const systemInstruction = await buildSystemInstruction();
    if (!systemInstruction) {
        setError("Could not reload user context for retry.");
        setIsLoading(false);
        return;
    }

    // Create a new chat session with the clean history.
    chatSessionRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: successfulHistory
    });

    // Reset UI state for retry, removing the error message and loading indicator.
    setMessages(prev => [
        ...prev.slice(0, lastErrorIndex - 1),
        lastUserMessage,
        { role: 'model', text: '' }
    ]);

    await streamResponse(lastUserMessage.text);
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSend(prompt);
  };

  const handleCrisis = () => {
    if (window.confirm(t('chatbot.crisis_confirm'))) {
      handleSend("I am in a crisis right now and need immediate help.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  if (isInitializing) {
      return (
         <div className="flex flex-col h-full bg-base-50/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700 items-center justify-center p-4">
             <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
         </div>
      );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-base-50/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700 items-center justify-center p-4 text-center">
        <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-warning-100 dark:bg-warning-900/30 border border-warning-300 dark:border-warning-500/50 text-warning-700 dark:text-warning-300">
          <p className="text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-base-50/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
      <div className="p-4 bg-primary-500 text-white text-center">
        <h2 className="text-xl font-bold">{t('chatbot.title')}</h2>
        <p className="text-sm opacity-90">{t('chatbot.subtitle')}</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-base-100/50 dark:bg-base-900/30">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.isError ? (
                <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-warning-100 dark:bg-warning-900/30 border border-warning-300 dark:border-warning-500/50 text-warning-700 dark:text-warning-300 rounded-bl-none flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm">{msg.text}</p>
                    <button
                      onClick={retryLastMessage}
                      className="mt-2 text-sm font-semibold text-warning-800 dark:text-warning-200 hover:underline focus:outline-none"
                      aria-label="Retry sending last message"
                      disabled={!isOnline}
                    >
                      {t('chatbot.retry_button')}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-base-800 dark:bg-base-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-base-700 text-base-800 dark:text-base-200 border border-base-200 dark:border-base-600 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-end">
                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                    {isLoading && index === messages.length - 1 && msg.text === '' && (
                      <div className="flex space-x-1 ml-2 mb-1 shrink-0">
                        <div className="w-1.5 h-1.5 bg-base-400 dark:bg-base-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 bg-base-400 dark:bg-base-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-base-400 dark:bg-base-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {showSuggestions && (
            <div className="flex flex-col items-start gap-2 pt-2">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(prompt)}
                  disabled={!isOnline}
                  className="px-3 py-1.5 bg-white dark:bg-base-700 border border-base-300 dark:border-base-600 rounded-full text-sm text-primary-600 dark:text-primary-300 hover:bg-base-100 dark:hover:bg-base-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700">
        {!isOnline && (
            <div className="text-center text-xs text-warning-600 dark:text-warning-300 mb-2 p-2 bg-warning-50 dark:bg-warning-900/30 rounded-md">
                {t('offline.chat_message')}
            </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            disabled={isLoading || !isOnline}
            className="flex-grow px-4 py-2 bg-base-100 dark:bg-base-700 border border-base-300 dark:border-base-600 text-base-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-base-200 dark:disabled:bg-base-800"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || input.trim() === '' || !isOnline}
            className="bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="text-center mt-3">
          <button onClick={handleCrisis} disabled={!isOnline} className="text-xs text-warning-500 hover:underline font-semibold px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed">
            {t('chatbot.crisis_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;