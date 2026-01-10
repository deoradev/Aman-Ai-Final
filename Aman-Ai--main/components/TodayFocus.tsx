
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
    <section className="bg-white/40 dark:bg-base-800/40 backdrop-blur-3xl p-10 rounded-[3rem] shadow-soft-lg border border-white/20 dark:border-base-700/30 overflow-hidden relative group">
      {/* Background Polish */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-80 h-80 bg-primary-500/5 rounded-full blur-[100px]"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
            <div>
                <h2 className="text-[10px] font-black tracking-[0.5em] text-primary-500 uppercase mb-3">Therapeutic Action</h2>
                <h3 className="text-4xl font-black text-base-900 dark:text-white tracking-tighter">Your Daily Vitals</h3>
            </div>
            <NavLink to="/analytics" className="text-[9px] font-black uppercase tracking-widest px-6 py-3 bg-white dark:bg-base-700 text-base-800 dark:text-white rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-xl border border-black/5">
                Full Report
            </NavLink>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Stage 1: Assessment */}
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                    <h4 className="font-black text-base-900 dark:text-base-100 text-[11px] uppercase tracking-widest">Assessment</h4>
                </div>
                <div className="flex flex-col gap-3">
                    {(['happy', 'neutral', 'sad'] as const).map(mood => (
                        <button
                            key={mood}
                            onClick={() => onMoodSelect(mood)}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all flex items-center justify-center gap-4 ${
                                selectedMood === mood 
                                ? 'bg-primary-500 border-primary-500 text-white shadow-2xl shadow-primary-500/30 scale-105' 
                                : 'bg-white/50 dark:bg-base-900/30 border-transparent text-base-600 dark:text-base-400 hover:border-primary-500/30'
                            }`}
                        >
                            <span className="text-xl">{mood === 'happy' ? '😊' : mood === 'neutral' ? '😐' : '😔'}</span>
                            {t(`dashboard.mood.${mood}`)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stage 2: Engagement */}
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                    <h4 className="font-black text-base-900 dark:text-base-100 text-[11px] uppercase tracking-widest">Protocol</h4>
                </div>
                {dailyChallenge && (
                    <div className="bg-white/30 dark:bg-base-900/20 p-6 rounded-3xl border border-white/20 h-full flex flex-col">
                        <p className="text-[11px] font-black text-primary-500 mb-3 uppercase tracking-widest">{dailyChallenge.title}</p>
                        <p className="text-sm text-base-700 dark:text-base-300 leading-relaxed mb-8 font-medium italic">"{dailyChallenge.task}"</p>
                        <button 
                            onClick={onCompleteChallenge}
                            disabled={isChallengeCompleted}
                            className={`mt-auto w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl ${
                                isChallengeCompleted 
                                ? 'bg-accent-500 text-white cursor-default' 
                                : 'bg-base-900 text-white dark:bg-white dark:text-base-900 hover:bg-primary-500 hover:text-white'
                            }`}
                        >
                            {isChallengeCompleted ? 'Completed ✓' : 'Execute Task'}
                        </button>
                    </div>
                )}
            </div>

            {/* Stage 3: Reflection */}
            <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full"></div>
                    <h4 className="font-black text-base-900 dark:text-base-100 text-[11px] uppercase tracking-widest">Integration</h4>
                </div>
                <div className="bg-white/30 dark:bg-base-900/20 p-6 rounded-3xl border border-white/20 h-full flex flex-col justify-between">
                    <p className="text-sm text-base-500 dark:text-base-400 leading-relaxed italic">
                        Cognitive integration through journaling increases long-term neuroplasticity and sobriety success rates.
                    </p>
                    <button onClick={onStartJournal} className="w-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] border-2 border-primary-500/20 hover:bg-primary-500 hover:text-white transition-all shadow-lg">
                        Open Journal
                    </button>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TodayFocus);
