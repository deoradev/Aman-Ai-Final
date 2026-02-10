
import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ai } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import { buildSystemInstruction, getScopedKey } from '../utils';
import ConfirmModal from './ConfirmModal';
import { PERSONAS } from '../constants';

interface ChatbotProps {
    proactiveMessage?: string;
    personaId?: string; 
    onPersonaChange?: (id: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ proactiveMessage, personaId, onPersonaChange }) => {
  const { t } = useLocalization();
  const { isOnline } = useConnectivity();
  const { getScopedKey } = useAuth();
  
  // State to track the active persona internally
  const [currentPersonaId, setCurrentPersonaId] = useState(personaId || 'therapist');
  const [isPersonaMenuOpen, setIsPersonaMenuOpen] = useState(false);

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

  const activePersona = PERSONAS.find(p => p.id === currentPersonaId) || PERSONAS[0];

  const suggestedPrompts = [
    t('chatbot.suggested_prompt_1'),
    t('chatbot.suggested_prompt_2'),
    t('chatbot.suggested_prompt_3'),
  ];
  
  // Sync prop changes to internal state
  useEffect(() => {
      if (personaId) {
          setCurrentPersonaId(personaId);
      }
  }, [personaId]);

  // Initialize chat when currentPersonaId changes
  useEffect(() => {
    const initializeChat = async () => {
        setIsInitializing(true);
        try {
            // Ensure localStorage is updated so buildSystemInstruction picks up the correct persona
            localStorage.setItem(getScopedKey('persona'), currentPersonaId);

            const systemInstruction = await buildSystemInstruction();
            if (!systemInstruction) throw new Error("Could not load user context.");

            const storedHistory: ChatMessage[] = JSON.parse(localStorage.getItem(getScopedKey('chat-history')) || '[]');
            const historyForAI = storedHistory.length > 0 
                ? storedHistory
                    .filter((msg, index) => !(index === 0 && msg.role === 'model'))
                    .map(msg => ({ role: msg.role, parts: [{ text: msg.text }] })) 
                : [];
            
            chatSessionRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
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
  }, [t, proactiveMessage, getScopedKey, currentPersonaId]); 

  const handlePersonaSelect = (id: string) => {
      setCurrentPersonaId(id);
      setIsPersonaMenuOpen(false);
      localStorage.setItem(getScopedKey('persona'), id);
      if (onPersonaChange) {
          onPersonaChange(id);
      }
  };

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages]);

  const streamResponse = async (textToSend: string) => {
    try {
      if (!chatSessionRef.current) throw new Error("Chat session not initialized.");
      const stream = await chatSessionRef.current.sendMessageStream({ message: textToSend });
      let fullText = "";
      for await (const chunk of stream) {
        fullText += chunk.text || "";
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

  if (isInitializing && messages.length === 0) return (
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
    <div className="flex flex-col h-full bg-base-50/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700 relative">
      
      {/* Enhanced Header with Persona Selection */}
      <div className="p-4 bg-primary-500 text-white shadow-md relative z-20">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-xl text-white">
                    <div dangerouslySetInnerHTML={{ __html: activePersona.icon }} className="w-6 h-6 fill-current" />
                </div>
                <div>
                    <h2 className="font-bold leading-tight">{activePersona.name}</h2>
                    <p className="text-xs opacity-90 font-medium">AI Companion</p>
                </div>
            </div>
            <button 
                onClick={() => setIsPersonaMenuOpen(!isPersonaMenuOpen)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Change Persona"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </button>
        </div>

        {/* Persona Dropdown */}
        {isPersonaMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-base-800 shadow-xl rounded-b-2xl border-t border-base-100 dark:border-base-700 overflow-hidden animate-slide-down z-30">
                <div className="p-2 max-h-64 overflow-y-auto">
                    {PERSONAS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => handlePersonaSelect(p.id)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentPersonaId === p.id ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-base-100 dark:hover:bg-base-700 text-base-800 dark:text-base-200'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-base-200 dark:bg-base-600 flex items-center justify-center text-lg">
                                <div dangerouslySetInnerHTML={{ __html: p.icon }} className="w-5 h-5 fill-current" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-sm">{p.name}</p>
                                <p className="text-[10px] opacity-70 leading-tight line-clamp-1">{p.description}</p>
                            </div>
                            {currentPersonaId === p.id && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>

      <div className="flex-grow p-4 overflow-y-auto bg-base-100/50 dark:bg-base-900/30" onClick={() => setIsPersonaMenuOpen(false)}>
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
                <button key={i} onClick={() => handleSend(prompt)} className="px-3 py-1.5 bg-white dark:bg-base-700 border border-base-300 dark:border-base-600 rounded-full text-sm text-primary-600 dark:text-primary-400 hover:bg-base-50 transition-colors shadow-sm">
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
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={t('chatbot.placeholder')} disabled={isLoading || !isOnline} className="flex-grow px-4 py-2 bg-base-100 dark:bg-base-700 border border-base-300 dark:border-base-600 text-base-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <button onClick={() => handleSend()} disabled={isLoading || !input.trim() || !isOnline} className="bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 transition-colors shadow-md disabled:bg-base-300 dark:disabled:bg-base-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
        </div>
      </div>
      <style>{`
        @keyframes slide-down {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
            animation: slide-down 0.2s ease-out forwards;
        }
      `}</style>
    </div>
    </>
  );
};

export default Chatbot;
