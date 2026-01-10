
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
                setInsight({ type: 'encouragement', title: 'A Daily Thought', text: t('gemini.daily_focus_fallback') });
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
            case 'reflection': return '🧠';
            case 'garden': return '🌱';
            default: return '✨';
        }
    };

    return (
        <section className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary-500" />
            <h2 className="text-lg font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-6">Aman's Deep Insight</h2>
            
            {isLoading ? (
                 <div className="flex flex-col gap-4">
                    <div className="h-4 bg-base-200 dark:bg-base-700 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-base-200 dark:bg-base-700 rounded-full w-full animate-pulse" />
                </div>
            ) : insight ? (
                <>
                    <div className="flex items-start gap-5">
                        <div className="text-4xl bg-base-100 dark:bg-base-900 p-3 rounded-2xl shadow-inner">{getIcon(insight.type)}</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base-900 dark:text-white text-lg leading-tight mb-2">{insight.title}</h3>
                            <p className="text-base-600 dark:text-base-300 text-sm leading-relaxed italic">"{insight.text}"</p>
                        </div>
                    </div>
                     <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button 
                            onClick={() => navigate('/toolkit')}
                            className="bg-base-900 text-white dark:bg-base-100 dark:text-base-900 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            Open Toolkit
                        </button>
                        <button 
                            onClick={() => navigate('/live-talk')}
                            className="bg-primary-500 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary-500/20"
                        >
                            Live Voice Chat
                        </button>
                    </div>
                </>
            ) : null}
        </section>
    );
};

export default memo(SponsorInsightCard);
