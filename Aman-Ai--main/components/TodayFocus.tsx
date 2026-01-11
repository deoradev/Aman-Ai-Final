
import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { DailyChallenge, MoodEntry } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface TodayFocusProps {
  dailyChallenge: DailyChallenge | null;
  isChallengeCompleted: boolean;
  onCompleteChallenge: () => void;
  selectedMood: MoodEntry['mood'] | null;
  onMoodSelect: (mood: MoodEntry['mood']) => void;
  onStartJournal: () => void;
}

const TodayFocus: React.FC<TodayFocusProps> = ({
  dailyChallenge,
  isChallengeCompleted,
  onCompleteChallenge,
  selectedMood,
  onMoodSelect,
  onStartJournal
}) => {
  const { t } = useLocalization();

  return (
    <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-soft border border-base-200 dark:border-base-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{t('dashboard.today_focus.title')}</h2>
            <NavLink to="/analytics" className="text-sm font-semibold text-primary-500 hover:underline">
                {t('dashboard.today_focus.view_analytics_link')} &rarr;
            </NavLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Mood & Challenge */}
            <div className="space-y-6">
                <div>
                    <h3 className="text-sm font-bold uppercase text-base-500 dark:text-base-400 mb-3 tracking-wider">{t('dashboard.mood.title')}</h3>
                    <div className="flex gap-2">
                        {(['happy', 'neutral', 'sad'] as const).map(mood => (
                            <button
                                key={mood}
                                onClick={() => onMoodSelect(mood)}
                                className={`flex-1 py-3 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                    selectedMood === mood 
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-md scale-105' 
                                    : 'bg-white dark:bg-base-700 border-base-200 dark:border-base-600 text-base-600 dark:text-base-300 hover:border-primary-300'
                                }`}
                            >
                                <span className="text-2xl">{mood === 'happy' ? '😊' : mood === 'neutral' ? '😐' : '😔'}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">{t(`dashboard.mood.${mood}`)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {dailyChallenge && (
                    <div className="p-5 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-100 dark:border-primary-800">
                        <h3 className="text-xs font-black uppercase text-primary-600 dark:text-primary-400 mb-2 tracking-widest">{t('dashboard.today_focus.challenge_title')}</h3>
                        <p className="font-bold text-base-900 dark:text-base-100 mb-1">{dailyChallenge.title}</p>
                        <p className="text-sm text-base-600 dark:text-base-400 italic mb-4">"{dailyChallenge.task}"</p>
                        <button 
                            onClick={onCompleteChallenge}
                            disabled={isChallengeCompleted}
                            className={`w-full py-3 rounded-lg font-bold text-sm transition-colors ${
                                isChallengeCompleted 
                                ? 'bg-accent-500 text-white cursor-default' 
                                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md'
                            }`}
                        >
                            {isChallengeCompleted ? t('dashboard.challenge_button.completed') : t('dashboard.challenge_button.complete')}
                        </button>
                    </div>
                )}
            </div>

            {/* Right Column: Journal Prompt */}
            <div className="flex flex-col justify-center p-6 bg-base-50 dark:bg-base-900/30 rounded-xl border border-base-100 dark:border-base-700">
                <div className="text-center">
                    <div className="w-12 h-12 bg-white dark:bg-base-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-base-800 dark:text-base-100 mb-2">{t('dashboard.today_focus.journal_title')}</h3>
                    <p className="text-sm text-base-600 dark:text-base-400 mb-6">{t('dashboard.today_focus.journal_prompt')}</p>
                    <button onClick={onStartJournal} className="inline-block px-8 py-3 bg-base-800 text-white dark:bg-base-200 dark:text-base-900 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                        {t('dashboard.today_focus.journal_button')}
                    </button>
                </div>
            </div>
        </div>
    </section>
  );
};

export default memo(TodayFocus);
