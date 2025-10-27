
import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useConnectivity } from '../hooks/useConnectivity';
import { GroupSessionMessage, GroupSessionTopic } from '../types';
import { getGroupSessionResponse } from '../services/geminiService';
import { GROUP_SESSION_TOPICS } from '../constants';
import SEOMeta from '../components/SEOMeta';

const TopicSelectionScreen: React.FC<{ onSelectTopic: (topic: GroupSessionTopic) => void }> = ({ onSelectTopic }) => {
    const { t } = useLocalization();

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('group_session.title')}</h1>
                <p className="mt-3 text-md text-base-600 dark:text-base-400">
                    {t('group_session.subtitle')}
                </p>
            </div>
            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-soft">
                <h2 className="text-2xl font-bold text-primary-500 mb-6 text-center">{t('group_session.select_topic_title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {GROUP_SESSION_TOPICS.map((topic) => (
                        <button
                            key={topic.key}
                            onClick={() => onSelectTopic(topic)}
                            className="text-left p-4 bg-base-50 dark:bg-base-700/50 rounded-xl hover:bg-primary-100 dark:hover:bg-primary-900/40 hover:ring-2 hover:ring-primary-500 transition-all transform hover:scale-105"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 text-primary-500" dangerouslySetInnerHTML={{ __html: topic.icon }} />
                                <div>
                                    <h3 className="font-bold text-lg text-base-800 dark:text-base-100">{t(`group_session_topics.${topic.key}.title`)}</h3>
                                    <p className="text-sm text-base-600 dark:text-base-400">{t(`group_session_topics.${topic.key}.description`)}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};


const ChatScreen: React.FC<{ topic: GroupSessionTopic, onBack: () => void }> = ({ topic, onBack }) => {
    const { t, language } = useLocalization();
    const { isOnline } = useConnectivity();
    const [messages, setMessages] = useState<GroupSessionMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const topicTitle = t(`group_session_topics.${topic.key}.title`);

    useEffect(() => {
        setMessages([
            {
                id: Date.now(),
                speaker: 'moderator',
                author: t('group_session.author_moderator'),
                text: t(`group_session_topics.${topic.key}.initial_message`),
            }
        ]);
    }, [t, topic.key]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading || !isOnline) return;

        const userMessage: GroupSessionMessage = {
            id: Date.now(),
            speaker: 'user',
            author: t('group_session.author_you'),
            text: input.trim(),
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await getGroupSessionResponse(userMessage.text, topicTitle, language);
            
            const moderatorMessage: GroupSessionMessage = {
                id: Date.now() + 1,
                speaker: 'moderator',
                author: t('group_session.author_moderator'),
                text: response.moderatorResponse,
            };
            setMessages(prev => [...prev, moderatorMessage]);

            response.simulatedPeerResponses.forEach((peer, index) => {
                setTimeout(() => {
                    const peerMessage: GroupSessionMessage = {
                        id: Date.now() + 2 + index,
                        speaker: 'peer',
                        author: t('group_session.author_peer'),
                        text: peer.text,
                    };
                    setMessages(prev => [...prev, peerMessage]);
                }, 1000 * (index + 1));
            });

        } catch (error) {
            console.error("Error in group session:", error);
             const errorMessage: GroupSessionMessage = {
                id: Date.now() + 1,
                speaker: 'moderator',
                author: t('group_session.author_moderator'),
                text: t('chatbot.error_message'),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft-lg flex-grow flex flex-col overflow-hidden">
            <div className="p-4 border-b border-base-200 dark:border-base-700 text-center relative">
                <button onClick={onBack} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 hover:text-primary-700">
                    &larr; {t('group_session.back_to_topics')}
                </button>
                <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400">{topicTitle}</h2>
                <p className="mt-1 text-xs text-base-500 dark:text-base-400 max-w-xl mx-auto">
                    {t('group_session.disclaimer')}
                </p>
            </div>
            <div className="p-4 bg-base-50/50 dark:bg-base-900/30 flex-grow overflow-y-auto">
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.speaker === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className={`text-xs px-2 mb-1 ${msg.speaker === 'user' ? 'text-right' : 'text-left'} ${msg.speaker === 'moderator' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-base-500 dark:text-base-400'}`}>
                                {msg.author}
                            </span>
                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${
                                msg.speaker === 'user' ? 'bg-base-800 dark:bg-base-600 text-white rounded-br-none' 
                                : msg.speaker === 'moderator' ? 'bg-primary-100 dark:bg-primary-900/30 text-base-800 dark:text-base-200 rounded-bl-none border border-primary-200 dark:border-primary-800'
                                : 'bg-base-200 dark:bg-base-700 text-base-800 dark:text-base-200 rounded-bl-none'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start flex-col">
                            <span className="text-xs px-2 mb-1 text-primary-600 dark:text-primary-400 font-semibold">{t('group_session.author_moderator')}</span>
                            <div className="px-4 py-2 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-base-800 dark:text-base-200 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    <span className="text-sm italic">{t('group_session.loading')}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
             <div className="p-4 bg-white/80 dark:bg-base-800/80 border-t border-base-200 dark:border-base-700">
                {!isOnline && (
                    <div className="text-center text-xs text-warning-600 dark:text-warning-300 mb-2 p-2 bg-warning-50 dark:bg-warning-900/30 rounded-md">
                        {t('offline.feature_unavailable')}
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={t('group_session.placeholder')}
                        disabled={isLoading || !isOnline}
                        className="flex-grow px-4 py-2 bg-base-100 dark:bg-base-700 border border-base-300 dark:border-base-600 text-base-800 dark:text-white rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-base-200 dark:disabled:bg-base-800"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || input.trim() === '' || !isOnline}
                        className="bg-primary-500 text-white p-3 rounded-full hover:bg-primary-600 disabled:bg-base-400 dark:disabled:bg-base-600 disabled:cursor-not-allowed transition-colors"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


const GroupSessionPage: React.FC = () => {
    const { t } = useLocalization();
    const [selectedTopic, setSelectedTopic] = useState<GroupSessionTopic | null>(null);

    return (
        <>
            <SEOMeta
                title={t('seo.group_session.title')}
                description={t('seo.group_session.description')}
                noIndex={true}
            />
            <div className="py-12 flex-grow flex flex-col">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col">
                    {selectedTopic ? (
                        <ChatScreen topic={selectedTopic} onBack={() => setSelectedTopic(null)} />
                    ) : (
                        <TopicSelectionScreen onSelectTopic={setSelectedTopic} />
                    )}
                </div>
            </div>
        </>
    );
};

export default GroupSessionPage;
