import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { useAuth } from '../hooks/useAuth';
import { Chat } from '@google/genai';
import { ai, getConversationFeedback } from '../services/geminiService';
import { CONVERSATION_SCENARIOS } from '../constants';
import { ChatMessage, ConversationPracticeScenario, RolePlayPersona } from '../types';
import SEOMeta from '../components/SEOMeta';
import SimpleMarkdownRenderer from '../components/SimpleMarkdownRenderer';

type Step = 'selection' | 'chat' | 'feedback';

const ConversationPracticePage: React.FC = () => {
    const { t } = useLocalization();
    const [step, setStep] = useState<Step>('selection');
    const [selectedScenario, setSelectedScenario] = useState<ConversationPracticeScenario | null>(null);
    const [selectedPersona, setSelectedPersona] = useState<RolePlayPersona | null>(null);

    const handleStart = (scenario: ConversationPracticeScenario, persona: RolePlayPersona) => {
        setSelectedScenario(scenario);
        setSelectedPersona(persona);
        setStep('chat');
    };

    const handleEnd = (transcript: ChatMessage[]) => {
        setStep('feedback');
    };

    const handleRestart = () => {
        setSelectedScenario(null);
        setSelectedPersona(null);
        setStep('selection');
    };

    return (
        <>
            <SEOMeta
                title={t('seo.conversation_practice.title')}
                description={t('seo.conversation_practice.description')}
                noIndex={true}
            />
            <div className="py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {step === 'selection' && <SelectionScreen onStart={handleStart} />}
                    {step === 'chat' && selectedScenario && selectedPersona && (
                        <ChatScreen scenario={selectedScenario} persona={selectedPersona} onEnd={handleEnd} onBack={handleRestart} />
                    )}
                    {step === 'feedback' && selectedScenario && <FeedbackScreen onRestart={handleRestart} />}
                </div>
            </div>
        </>
    );
};

const SelectionScreen: React.FC<{ onStart: (scenario: ConversationPracticeScenario, persona: RolePlayPersona) => void }> = ({ onStart }) => {
    const { t } = useLocalization();
    const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('conversation_practice.title')}</h1>
                <p className="mt-3 text-lg text-base-600 dark:text-base-300">{t('conversation_practice.subtitle')}</p>
            </div>
            <div className="space-y-4">
                {CONVERSATION_SCENARIOS.map(scenario => (
                    <div key={scenario.id} className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700">
                        <button onClick={() => setExpandedScenario(expandedScenario === scenario.id ? null : scenario.id)} className="w-full text-left p-6">
                            <h2 className="text-xl font-bold text-primary-500">{scenario.title}</h2>
                            <p className="text-base-600 dark:text-base-300 mt-1">{scenario.description}</p>
                        </button>
                        {expandedScenario === scenario.id && (
                            <div className="p-6 bg-base-50/50 dark:bg-base-900/30 border-t border-base-200 dark:border-base-700">
                                <h3 className="font-semibold text-base-800 dark:text-base-200 mb-3">{t('conversation_practice.choose_persona')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {scenario.personas.map(persona => (
                                        <button key={persona.id} onClick={() => onStart(scenario, persona)} className="text-left p-4 bg-base-100 dark:bg-base-700/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:ring-2 hover:ring-primary-500 transition-all">
                                            <p className="font-bold text-base-800 dark:text-base-100">{persona.name}</p>
                                            <p className="text-sm text-base-600 dark:text-base-400">{persona.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ChatScreen: React.FC<{
    scenario: ConversationPracticeScenario;
    persona: RolePlayPersona;
    onEnd: (transcript: ChatMessage[]) => void;
    onBack: () => void;
}> = ({ scenario, persona, onEnd, onBack }) => {
    const { t } = useLocalization();
    const { isOnline } = useConnectivity();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<Chat | null>(null);

    useEffect(() => {
        const systemInstruction = `${scenario.systemPrompt}\n\nYour persona: ${persona.systemPrompt}\n\nStart the conversation now by introducing yourself in character.`;
        
        chatSessionRef.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction }
        });

        const startConversation = async () => {
            setIsLoading(true);
            try {
                const stream = await chatSessionRef.current!.sendMessageStream({ message: "Hello." });
                let fullText = "";
                for await (const chunk of stream) {
                    fullText += chunk.text;
                }
                setMessages([{ role: 'model', text: fullText }]);
            } catch (error) {
                console.error("Error starting conversation:", error);
                setMessages([{ role: 'model', text: t('chatbot.error_message'), isError: true }]);
            } finally {
                setIsLoading(false);
            }
        };
        startConversation();
    }, [scenario, persona, t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSend = async () => {
        const textToSend = input.trim();
        if (textToSend === '' || isLoading || !isOnline) return;

        setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
        setInput('');
        setIsLoading(true);
        
        // Add a temporary loading message for the model
        setMessages(prev => [...prev, { role: 'model', text: '' }]);
        
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
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                const last = newMessages[newMessages.length - 1];
                if (last && last.role === 'model') {
                    last.text = t('chatbot.error_message');
                    last.isError = true;
                }
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-10rem)] bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg overflow-hidden border border-base-200 dark:border-base-700">
            <div className="p-4 border-b border-base-200 dark:border-base-700 text-center relative">
                 <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-700 text-sm">
                    &larr; {t('conversation_practice.back_button')}
                </button>
                <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400">{scenario.title}</h2>
                <p className="text-xs text-base-500 dark:text-base-400">{t('conversation_practice.practicing_with')} {persona.name}</p>
            </div>
            <div className="flex-grow p-4 overflow-y-auto bg-base-50/50 dark:bg-base-900/30">
                <div className="space-y-4">
                    {messages.map((msg, index) => (
                         <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-base-800 dark:bg-base-600 text-white rounded-br-none' : 'bg-white dark:bg-base-700 text-base-800 dark:text-base-200 rounded-bl-none'}`}>
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
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700">
                <div className="flex items-center space-x-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={t('chatbot.placeholder')} disabled={isLoading || !isOnline} className="flex-grow px-4 py-2 bg-base-100 dark:bg-base-700 border border-base-300 dark:border-base-600 text-base-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    <button onClick={handleSend} disabled={isLoading || input.trim() === '' || !isOnline} className="bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 disabled:bg-base-400 dark:disabled:bg-base-600 transition-colors" aria-label="Send"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg></button>
                </div>
                 <div className="text-center mt-3">
                    <button onClick={() => onEnd(messages)} disabled={isLoading} className="text-sm font-semibold text-primary-600 hover:underline disabled:opacity-50">
                        {t('conversation_practice.end_session_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FeedbackScreen: React.FC<{ onRestart: () => void }> = ({ onRestart }) => {
    const { t, language } = useLocalization();
    const { getScopedKey } = useAuth();
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFeedback = async () => {
            // NOTE: In a real app, we'd pass the transcript through state, not localStorage.
            // This is a simplification for this component structure.
            const transcript: ChatMessage[] = JSON.parse(sessionStorage.getItem('temp-transcript') || '[]');
            const scenarioTitle = sessionStorage.getItem('temp-scenario') || '';
            const personaName = sessionStorage.getItem('temp-persona') || '';
            
            if (transcript.length === 0) {
                setError(t('conversation_practice.feedback.error_no_transcript'));
                setIsLoading(false);
                return;
            }

            try {
                const response = await getConversationFeedback(transcript, scenarioTitle, personaName, language);
                setFeedback(response);
            } catch (err) {
                console.error("Error getting feedback:", err);
                setError(t('conversation_practice.feedback.error_generic'));
            } finally {
                setIsLoading(false);
                sessionStorage.removeItem('temp-transcript');
                sessionStorage.removeItem('temp-scenario');
                sessionStorage.removeItem('temp-persona');
            }
        };
        fetchFeedback();
    }, [t, language, getScopedKey]);

    return (
        <div className="max-w-2xl mx-auto bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg p-6 border border-base-200 dark:border-base-700">
            <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('conversation_practice.feedback.title')}</h2>
            {isLoading && (
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span className="text-base-600 dark:text-base-300">{t('conversation_practice.feedback.loading')}</span>
                </div>
            )}
            {error && <p className="text-warning-500">{error}</p>}
            {feedback && (
                <div className="bg-base-50/50 dark:bg-base-900/30 p-4 rounded-lg">
                    <SimpleMarkdownRenderer content={feedback} />
                </div>
            )}
            <div className="mt-6 text-center">
                <button onClick={onRestart} className="bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors">
                    {t('conversation_practice.feedback.practice_again_button')}
                </button>
            </div>
        </div>
    );
};

export default ConversationPracticePage;
