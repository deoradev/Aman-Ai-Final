import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ai } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import { buildSystemInstruction, getScopedKey } from '../utils';
import ConfirmModal from './ConfirmModal';

interface ChatbotProps {
    proactiveMessage?: string;
    personaId?: string; // New prop to track persona changes
}

const Chatbot: React.FC<ChatbotProps> = ({ proactiveMessage, personaId }) => {
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
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const suggestedPrompts = [
    t('chatbot.suggested_prompt_1'),
    t('chatbot.suggested_prompt_2'),
    t('chatbot.suggested_prompt_3'),
  ];
  
  // Re-run this effect whenever the personaId changes
  useEffect(() => {
    const initializeChat = async () => {
        setIsInitializing(true);
        try {
            const systemInstruction = await buildSystemInstruction();
            if (!systemInstruction) throw new Error("Could not load user context.");

            const storedHistory: ChatMessage[] = JSON.parse(localStorage.getItem(getScopedKey('chat-history')) || '[]');
            const historyForAI = storedHistory.length > 0 
                ? storedHistory
                    .filter((msg, index) => !(index === 0 && msg.role === 'model'))
                    .map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })) 
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
            setError("Failed to initialize. Check your connection.");
        } finally {
            setIsInitializing(false);
        }
    };
    initializeChat();
    
    return () => {
        const historyToSave = messagesRef.current;
        if (historyToSave.length > 1) {
            localStorage.setItem(getScopedKey('chat-history'), JSON.stringify(historyToSave.slice(-30)));
        }
    };
  }, [t, proactiveMessage, getScopedKey, personaId]); // Added personaId as dependency

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const streamResponse = async (textToSend: string) => {
    try {
      if (!chatSessionRef.current) throw new Error("Chat session not initialized.");
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
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { role: 'model', text: t('chatbot.error_message'), isError: true };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (textToSend.trim() === '' || isLoading || !isOnline || isInitializing) return;
    setMessages(prev => [...prev, { role: 'user', text: textToSend }, { role: 'model', text: '' }]);
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
        if (messages[i].isError) lastErrorIndex = i;
        if (messages[i].role === 'user' && lastErrorIndex === -1) {
            lastUserMessage = messages[i];
            break; 
        }
    }
    if (!lastUserMessage || lastErrorIndex === -1) return;
    setIsLoading(true);
    await streamResponse(lastUserMessage.text);
  };

  if (isInitializing) return (
     <div className="flex flex-col h-full bg-base-50/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700 items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  return (
    <>
    <ConfirmModal
      isOpen={isCrisisModalOpen}
      onClose={() => setIsCrisisModalOpen(false)}
      onConfirm={() => { handleSend("I am in a crisis right now."); setIsCrisisModalOpen(false); }}
      title={t('chatbot.crisis_button')}
      text={t('chatbot.crisis_confirm')}
      confirmText="Yes, I need help"
      cancelText="Cancel"
      variant="warning"
    />
    <div className="flex flex-col h-full bg-base-50/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
      <div className="p-4 bg-primary-500 text-white text-center">
        <h2 className="text-xl font-bold">{t('chatbot.title')}</h2>
        <p className="text-sm opacity-90">{t('chatbot.subtitle')}</p>
      </div>
      <div className="flex-grow p-4 overflow-y-auto bg-base-100/50 dark:bg-base-900/30">
        <div className="space-y-4" role="log" aria-live="polite">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-base-800 dark:bg-base-600 text-white rounded-br-none' : 'bg-white dark:bg-base-700 text-base-800 dark:text-base-200 border border-base-200 dark:border-base-600 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
            </div>
          ))}
          {showSuggestions && (
            <div className="flex flex-col items-start gap-2 pt-2">
              {suggestedPrompts.map((prompt, i) => (
                <button key={i} onClick={() => handleSend(prompt)} className="px-3 py-1.5 bg-white dark:bg-base-700 border border-base-300 dark:border-base-600 rounded-full text-sm text-primary-600 hover:bg-base-50 transition-colors">
                  {prompt}
                </button>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700">
        <div className="flex items-center space-x-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={t('chatbot.placeholder')} disabled={isLoading || !isOnline} className="flex-grow px-4 py-2 bg-base-100 dark:bg-base-700 border border-base-300 rounded-full" />
          <button onClick={() => handleSend()} disabled={isLoading || !input.trim() || !isOnline} className="bg-primary-500 text-white p-3 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Chatbot;