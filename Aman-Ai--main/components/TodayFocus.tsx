
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
    <section className="bg-white/40 dark:bg-base-800/40 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-soft-lg border border-white/20 dark:border-base-700/30 overflow-hidden relative group">
      {/* Dynamic Background Ornament */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] transition-transform duration-1000 group-hover:scale-125"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-end mb-10">
            <div>
                <h2 className="text-xs font-black tracking-[0.4em] text-primary-500 uppercase mb-2">Command Center</h2>
                <h3 className="text-3xl font-black text-base-900 dark:text-white tracking-tighter">Your Daily Vitals</h3>
            </div>
            <NavLink to="/analytics" className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-xl hover:bg-primary-500 hover:text-white transition-all border border-primary-500/20">
                Trends
            </NavLink>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Psychological Baseline */}
            <div className="bg-white/60 dark:bg-base-700/20 p-6 rounded-3xl border border-white/30 dark:border-base-700/50 flex flex-col h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group/card">
                <div className="flex items-center gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary-500/40 group-hover/card:rotate-12 transition-transform">01</span>
                    <h4 className="font-black text-base-900 dark:text-base-100 text-xs uppercase tracking-widest">{t('dashboard.mood.title')}</h4>
                </div>
                <div className="flex flex-col gap-3 mt-auto">
                    {(['happy', 'neutral', 'sad'] as const).map(mood => (
                        <button
                            key={mood}
                            onClick={() => onMoodSelect(mood)}
                            className={`w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-3 ${
                                selectedMood === mood 
                                ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/40 scale-[1.02]' 
                                : 'bg-transparent border-base-100 dark:border-base-800 text-base-600 dark:text-base-400 hover:border-primary-300 hover:bg-white/50'
                            }`}
                        >
                            <span className="text-xl filter drop-shadow-sm">{mood === 'happy' ? '😊' : mood === 'neutral' ? '😐' : '😔'}</span>
                            {t(`dashboard.mood.${mood}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Step 2: Therapeutic Action */}
            <div className="bg-white/60 dark:bg-base-700/20 p-6 rounded-3xl border border-white/30 dark:border-base-700/50 flex flex-col h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group/card">
                <div className="flex items-center gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary-500/40 group-hover/card:rotate-12 transition-transform">02</span>
                    <h4 className="font-black text-base-900 dark:text-base-100 text-xs uppercase tracking-widest">Active Task</h4>
                </div>
                {dailyChallenge && (
                    <div className="flex flex-col flex-grow">
                        <p className="text-xs font-black text-primary-600 dark:text-primary-400 mb-3 uppercase tracking-tighter leading-none">{dailyChallenge.title}</p>
                        <p className="text-sm text-base-600 dark:text-base-300 leading-relaxed mb-8 italic opacity-90 line-clamp-4">"{dailyChallenge.task}"</p>
                        <button 
                            onClick={onCompleteChallenge}
                            disabled={isChallengeCompleted}
                            className={`mt-auto w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${
                                isChallengeCompleted 
                                ? 'bg-accent-500 text-white border-accent-500 cursor-default' 
                                : 'bg-base-900 text-white dark:bg-base-100 dark:text-base-900 hover:bg-primary-500 hover:text-white'
                            }`}
                        >
                            {isChallengeCompleted ? 'Task Accomplished' : 'Complete Challenge'}
                        </button>
                    </div>
                )}
            </div>

            {/* Step 3: Cognitive Integration */}
            <div className="bg-white/60 dark:bg-base-700/20 p-6 rounded-3xl border border-white/30 dark:border-base-700/50 flex flex-col h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group/card">
                <div className="flex items-center gap-4 mb-6">
                    <span className="flex-shrink-0 w-8 h-8 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-primary-500/40 group-hover/card:rotate-12 transition-transform">03</span>
                    <h4 className="font-black text-base-900 dark:text-base-100 text-xs uppercase tracking-widest">Reflection</h4>
                </div>
                <p className="text-sm text-base-600 dark:text-base-300 leading-relaxed mb-8 italic opacity-70">
                    Process today's experience to build neural pathways for long-term sobriety.
                </p>
                <button onClick={onStartJournal} className="mt-auto w-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 border-primary-500/20 hover:bg-primary-500 hover:text-white transition-all shadow-md">
                    Secure Journal
                </button>
            </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TodayFocus);
