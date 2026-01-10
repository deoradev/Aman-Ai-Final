
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
    <section className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30 overflow-hidden relative group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tight text-base-900 dark:text-white uppercase opacity-80">{t('dashboard.today_focus.title')}</h2>
            <NavLink to="/analytics" className="text-xs font-bold px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full hover:bg-primary-500 hover:text-white transition-all">
                {t('dashboard.today_focus.view_analytics_link')}
            </NavLink>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Mood */}
            <div className="bg-white/50 dark:bg-base-700/20 p-5 rounded-2xl border border-white/20 dark:border-base-700/50 flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-black text-xs">01</span>
                    <h3 className="font-bold text-base-900 dark:text-base-100 text-sm">{t('dashboard.mood.title')}</h3>
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                    {(['happy', 'neutral', 'sad'] as const).map(mood => (
                        <button
                            key={mood}
                            onClick={() => onMoodSelect(mood)}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-2 ${
                                selectedMood === mood 
                                ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' 
                                : 'bg-transparent border-base-200 dark:border-base-700 text-base-600 dark:text-base-400 hover:border-primary-300'
                            }`}
                        >
                            <span className="text-lg">{mood === 'happy' ? '😊' : mood === 'neutral' ? '😐' : '😔'}</span>
                            {t(`dashboard.mood.${mood}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Challenge */}
            <div className="bg-white/50 dark:bg-base-700/20 p-5 rounded-2xl border border-white/20 dark:border-base-700/50 flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-black text-xs">02</span>
                    <h3 className="font-bold text-base-900 dark:text-base-100 text-sm">{t('dashboard.today_focus.challenge_title')}</h3>
                </div>
                {dailyChallenge && (
                    <>
                        <p className="text-xs font-bold text-primary-600 dark:text-primary-400 mb-2 uppercase tracking-widest">{dailyChallenge.title}</p>
                        <p className="text-xs text-base-600 dark:text-base-300 leading-relaxed mb-4 line-clamp-4">{dailyChallenge.task}</p>
                        <button 
                            onClick={onCompleteChallenge}
                            disabled={isChallengeCompleted}
                            className={`mt-auto w-full py-3 rounded-xl text-xs font-black transition-all ${
                                isChallengeCompleted 
                                ? 'bg-accent-500 text-white border-accent-500' 
                                : 'bg-base-900 text-white dark:bg-base-100 dark:text-base-900 hover:bg-primary-500'
                            }`}
                        >
                            {isChallengeCompleted ? 'COMPLETED' : t('dashboard.challenge_button.complete').toUpperCase()}
                        </button>
                    </>
                )}
            </div>

            {/* Step 3: Journal */}
            <div className="bg-white/50 dark:bg-base-700/20 p-5 rounded-2xl border border-white/20 dark:border-base-700/50 flex flex-col h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center font-black text-xs">03</span>
                    <h3 className="font-bold text-base-900 dark:text-base-100 text-sm">{t('dashboard.today_focus.journal_title')}</h3>
                </div>
                <p className="text-xs text-base-600 dark:text-base-300 leading-relaxed mb-6 italic opacity-75">
                    {t('dashboard.today_focus.journal_prompt')}
                </p>
                <button onClick={onStartJournal} className="mt-auto w-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 py-3 rounded-xl text-xs font-black border-2 border-primary-500/20 hover:bg-primary-500 hover:text-white transition-all uppercase tracking-wider">
                    {t('dashboard.today_focus.journal_button')}
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TodayFocus);
