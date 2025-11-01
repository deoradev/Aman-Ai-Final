import React, { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { getSponsorInsight } from '../services/geminiService';
import { MoodEntry, AIInsight, JournalEntry, EchoAffirmation } from '../types';
import { playAndReturnAudio } from '../utils';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface SponsorInsightCardProps {
    moods: MoodEntry[];
    journalEntries: JournalEntry[];
    journalStreak: number;
    userName: string;
    currentDay: number;
    completedChallenges: number;
}

const SponsorInsightCard: React.FC<SponsorInsightCardProps> = ({ moods, journalEntries, journalStreak, userName, currentDay, completedChallenges }) => {
    const { t, language } = useLocalization();
    const { getScopedKey } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isPlayingEcho, setIsPlayingEcho] = useState(false);
    const currentAudioRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        return () => {
            currentAudioRef.current?.stop();
            currentAudioRef.current = null;
        }
    }, []);

    const handlePlayRandomEcho = async () => {
        if (isPlayingEcho) {
            currentAudioRef.current?.stop();
            currentAudioRef.current = null;
            setIsPlayingEcho(false);
            return;
        }

        const affirmations: EchoAffirmation[] = JSON.parse(localStorage.getItem(getScopedKey('echo-affirmations')) || '[]');
        if (affirmations.length === 0) {
            showToast("You haven't generated any Echoes yet! Go to the AI Toolkit to create your first one.", 'info');
            return;
        }

        setIsPlayingEcho(true);
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        
        currentAudioRef.current = await playAndReturnAudio(randomAffirmation.audioDataB64, () => {
            setIsPlayingEcho(false);
            currentAudioRef.current = null;
        });
    };

    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoading(true);
            try {
                const fetchedInsight = await getSponsorInsight({ 
                    moods, 
                    journalEntries, 
                    journalStreak, 
                    userName, 
                    language,
                    currentDay,
                    completedChallenges 
                });
                setInsight(fetchedInsight);
            } catch (error) {
                console.error("Failed to fetch AI sponsor insight:", error);
                setInsight({
                    type: 'encouragement',
                    title: t('dashboard.ai_sponsor.fallback_title'),
                    text: t('gemini.daily_focus_fallback')
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInsight();
    }, [moods, journalEntries, journalStreak, userName, language, t, currentDay, completedChallenges]);

    const getIcon = (type: AIInsight['type']) => {
        switch (type) {
            case 'celebration': return '🎉';
            case 'suggestion': return '💡';
            case 'reflection': return '🤔';
            case 'encouragement': return '💖';
            case 'garden': return '🌱';
            default: return '✨';
        }
    };

    return (
        <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft border-l-4 border-primary-500">
            <h2 className="text-xl font-bold text-primary-500 mb-4">{isLoading ? t('dashboard.ai_insight.loading') : insight?.title || t('dashboard.ai_sponsor.title')}</h2>
            {isLoading ? (
                 <div className="flex items-center gap-4">
                    <div className="animate-pulse rounded-full bg-base-200 dark:bg-base-700 h-8 w-8"></div>
                    <div className="animate-pulse space-y-2 flex-grow">
                        <div className="h-4 bg-base-200 dark:bg-base-700 rounded w-full"></div>
                        <div className="h-4 bg-base-200 dark:bg-base-700 rounded w-2/3"></div>
                    </div>
                </div>
            ) : insight ? (
                <>
                    <div className="flex items-start gap-4">
                        <div className="text-3xl mt-1">{getIcon(insight.type)}</div>
                        <div>
                            <p className="text-base-700 dark:text-base-300 text-md italic">"{insight.text}"</p>
                            <p className="text-right text-sm font-semibold text-primary-600 dark:text-primary-400 mt-2">- Aman AI</p>
                        </div>
                    </div>
                     <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                        <button 
                            onClick={handlePlayRandomEcho}
                            className="bg-secondary-500 text-white font-bold py-2 px-5 rounded-lg transition-colors hover:bg-secondary-600 flex-shrink-0 flex items-center justify-center gap-2"
                        >
                            {isPlayingEcho ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M18 3a1 1 0 00-1.447-.894L4 7.424V4a1 1 0 00-2 0v12a1 1 0 002 0v-3.424l12.553 5.318A1 1 0 0018 17V3z" /></svg>
                            )}
                            {t('dashboard.ai_sponsor.listen_echo_button')}
                        </button>
                         <button 
                            onClick={() => navigate('/toolkit')}
                            className="bg-base-200 text-base-800 dark:bg-base-700 dark:text-base-200 font-bold py-2 px-5 rounded-lg transition-colors hover:bg-base-300 dark:hover:bg-base-600 flex-shrink-0"
                        >
                            {t('dashboard.toolkit_prompt.button')}
                        </button>
                        <button 
                            onClick={() => navigate('/live-talk')}
                            className="bg-primary-500 text-white font-bold py-2 px-5 rounded-lg transition-colors hover:bg-primary-600 flex-shrink-0"
                        >
                            {t('dashboard.proactive_checkin.talk_button')}
                        </button>
                    </div>
                </>
            ) : null}
        </section>
    );
};

export default memo(SponsorInsightCard);