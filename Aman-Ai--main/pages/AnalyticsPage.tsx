
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { MoodEntry, JournalEntry, Program, Milestone, WellnessEntry } from '../types';
import { calculateJournalStreak, calculateMilestones, getUserName } from '../utils';
import MoodTrendChart from '../components/MoodTrendChart';
import SEOMeta from '../components/SEOMeta';
import WellnessTrendChart from '../components/WellnessTrendChart';
import { useToast } from '../hooks/useToast';

const AnalyticsPage: React.FC = () => {
  const { t, language } = useLocalization();
  const { getScopedKey, currentUser } = useAuth();
  const { showToast } = useToast();
  const [program, setProgram] = useState<Program | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    try {
      const progStr = localStorage.getItem(getScopedKey('program'));
      if (progStr) {
        const prog: Program = JSON.parse(progStr);
        setProgram(prog);
        const enrollmentDateStr = localStorage.getItem(getScopedKey('enrollmentDate'));
        const day = Math.floor(Math.abs(new Date().getTime() - new Date(enrollmentDateStr!).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        setCurrentDay(day > 90 ? 90 : day);
        
        const journal: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]');
        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(getScopedKey('mood-history')) || '[]');
        const wellness: WellnessEntry[] = JSON.parse(localStorage.getItem(getScopedKey('wellness-log')) || '[]');
        const completed: number[] = JSON.parse(localStorage.getItem(getScopedKey('completedChallenges')) || '[]');
        
        setMoodHistory(moods);
        setWellnessHistory(wellness);
        setCompletedChallenges(completed.length);
        const streak = calculateJournalStreak(journal);
        setJournalStreak(streak);
        setMilestones(calculateMilestones({ currentDay: day, journalStreak: streak, completedChallenges: completed.length }));
      }
    } catch (e) { console.error(e); }
  }, [getScopedKey, language]);

  const shareRecoveryCard = async () => {
    const name = currentUser ? getUserName(currentUser) : "Champion";
    const text = `🚀 My Recovery Stats on Aman AI:
🔥 Streak: ${journalStreak} Days
✅ Challenges: ${completedChallenges}
🌱 Program: ${program?.name}

Aman AI is the digital therapeutic helping me heal in total privacy. #AmanAI #ForbesUnder30 #RecoveryRevolution`;
    
    if (navigator.share) {
        try {
            await navigator.share({ title: 'My Aman AI Progress', text, url: 'https://amandigitalcare.com' });
        } catch (err) {}
    } else {
        navigator.clipboard.writeText(text);
        showToast("Stats copied! Share them to inspire others.", "success");
    }
  };

  if (!program) return (
    <div className="flex items-center justify-center h-[70vh] text-center p-6 animate-fade-in">
        <div className="max-w-sm">
            <h1 className="text-4xl font-black text-base-900 dark:text-white mb-6 tracking-tighter uppercase">Mission Data Missing</h1>
            <NavLink to="/programs" className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-primary-500/20">Initialize Program</NavLink>
        </div>
    </div>
  );

  return (
    <>
    <SEOMeta title="Clinical Analytics | Aman AI" description="Advanced recovery tracking and impact metrics." noIndex={true} />
    <div className="py-12 container mx-auto px-4 lg:px-8 max-w-7xl animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
                <h1 className="text-6xl font-black text-base-900 dark:text-white uppercase tracking-tighter leading-none">
                    Impact <span className="text-primary-500">Report</span>
                </h1>
                <p className="text-base-500 font-bold mt-4 uppercase tracking-[0.3em] text-xs">Personal Health Data Terminal v4.0</p>
            </div>
            <button 
                onClick={shareRecoveryCard}
                className="bg-base-900 text-white dark:bg-white dark:text-base-900 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl"
            >
                <span>Export Impact Card</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <StatCard title="Recovery Velocity" value={`${journalStreak * 1.5}%`} trend="up" subtitle="Positive Neural Reinforcement" />
            <StatCard title="Engagement Ratio" value={`${Math.round((completedChallenges/currentDay)*100)}%`} trend="stable" subtitle="Active Therapeutic Participation" />
            <StatCard title="Estimated Savings" value={`$${completedChallenges * 45}`} trend="up" subtitle="Calculated Healthcare Value" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-soft-lg border border-white/20 dark:border-base-700/30">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-base-900 dark:text-white uppercase tracking-tighter">Mood Trajectory</h2>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary-500"></span>
                        <span className="text-[10px] font-bold text-base-500 uppercase">30-Day Period</span>
                    </div>
                </div>
                <MoodTrendChart data={moodHistory} />
            </div>

            <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-soft-lg border border-white/20 dark:border-base-700/30">
                <h2 className="text-xl font-black text-base-900 dark:text-white uppercase tracking-tighter mb-8">Wellness Correlation</h2>
                <WellnessTrendChart data={wellnessHistory} />
            </div>
          </div>
          
          <div className="lg:col-span-4 space-y-8">
             <section className="bg-gradient-to-br from-primary-500 to-primary-700 p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                <h2 className="text-xl font-black uppercase tracking-widest mb-8">Elite Milestones</h2>
                <div className="space-y-4">
                    {milestones.length > 0 ? milestones.slice(-5).reverse().map(m => (
                        <div key={m.id} className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-4 hover:bg-white/20 transition-all cursor-default">
                            <span className="text-3xl filter drop-shadow-md">{m.icon}</span>
                            <div>
                                <p className="font-black text-sm leading-tight uppercase">{m.title}</p>
                                <p className="text-[10px] opacity-70 mt-0.5">{m.description}</p>
                            </div>
                        </div>
                    )) : <p className="text-center py-10 font-bold opacity-60">Begin mission to unlock stats.</p>}
                </div>
                <NavLink to="/toolkit" className="mt-8 block text-center py-4 bg-white text-primary-600 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-base-50 transition-all">Strengthen Foundation</NavLink>
            </section>

            <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 dark:border-base-700/30">
                <h3 className="text-xs font-black text-base-400 uppercase tracking-widest mb-4">Clinical Context</h3>
                <p className="text-sm text-base-600 dark:text-base-400 leading-relaxed italic">
                    "Recovery velocity is calculated based on consistent journaling and challenge completion, representing the strengthening of prefrontal cortex regulation."
                </p>
            </div>
          </div>
        </div>
    </div>
    <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    `}</style>
    </>
  );
};

const StatCard = ({ title, value, subtitle, trend }: any) => (
    <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/20 dark:border-base-700/30 shadow-soft-lg group hover:-translate-y-1 transition-all">
        <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-black text-base-400 uppercase tracking-[0.2em]">{title}</p>
            <span className={`text-xs font-black ${trend === 'up' ? 'text-accent-500' : 'text-primary-500'}`}>
                {trend === 'up' ? '▲' : '●'}
            </span>
        </div>
        <p className="text-5xl font-black text-base-900 dark:text-white tracking-tighter mb-1">{value}</p>
        <p className="text-[10px] font-bold text-base-500 uppercase tracking-widest opacity-80">{subtitle}</p>
    </div>
);

export default AnalyticsPage;
