
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useConnectivity } from '../hooks/useConnectivity';
import { MoodEntry, JournalEntry, Program, Milestone, WellnessEntry } from '../types';
import { calculateJournalStreak, calculateMilestones } from '../utils';
import MoodTrendChart from '../components/MoodTrendChart';
import SEOMeta from '../components/SEOMeta';
import WellnessTrendChart from '../components/WellnessTrendChart';
import { useToast } from '../hooks/useToast';

const AnalyticsPage: React.FC = () => {
  const { t, language } = useLocalization();
  const { getScopedKey } = useAuth();
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

  const shareMilestone = async (m: Milestone) => {
    const text = `I just hit a massive recovery milestone: "${m.title}"! Aman AI is helping me heal in private. 🌟 Join the mission: https://amandigitalcare.com #AmanAI #MentalHealth #Recovery`;
    if (navigator.share) {
        try {
            await navigator.share({ title: 'My Recovery Progress', text, url: 'https://amandigitalcare.com' });
            showToast("Shared successfully!", "success");
        } catch (err) {}
    } else {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard! Share on Instagram or WhatsApp.", "success");
    }
  };

  if (!program) return (
    <div className="flex items-center justify-center h-[70vh] text-center p-6">
        <div className="max-w-sm">
            <h1 className="text-3xl font-black text-base-900 dark:text-white mb-4">No active journey found</h1>
            <NavLink to="/programs" className="bg-primary-500 text-white px-8 py-3 rounded-xl font-black uppercase text-xs">Choose a program</NavLink>
        </div>
    </div>
  );

  return (
    <>
    <SEOMeta title="My Progress Insights | Aman AI" description="Visualize your sobriety and mental health trends." noIndex={true} />
    <div className="py-12 container mx-auto px-4 lg:px-8">
        <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white uppercase tracking-tighter">Your Analytics</h1>
            <p className="text-base-500 font-bold mt-2">Personal data science for your mental wellness.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatTile title="Recovery Path" value={`${Math.round((currentDay/90)*100)}%`} subtitle={`${currentDay} of 90 Days`} />
              <StatTile title="Streak" value={journalStreak.toString()} subtitle="Consecutive Days" />
              <StatTile title="Success" value={completedChallenges.toString()} subtitle="Challenges Done" />
            </div>
            
            <ChartCard title="Mood Trajectory">
                <MoodTrendChart data={moodHistory} />
            </ChartCard>

            <ChartCard title="Wellness Correlation">
                <WellnessTrendChart data={wellnessHistory} />
            </ChartCard>
          </div>
          
          <div className="lg:col-span-4 space-y-8">
             <section className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30">
                <h2 className="text-xl font-black text-base-900 dark:text-white mb-6">Unlocked Achievements</h2>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {milestones.length > 0 ? milestones.slice().reverse().map(m => (
                        <div key={m.id} className="p-4 bg-base-100/50 dark:bg-base-900/50 rounded-2xl border border-white/10 flex items-center justify-between group transition-all hover:bg-primary-500/10">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl filter drop-shadow-md">{m.icon}</span>
                                <div>
                                    <p className="font-black text-base-900 dark:text-white text-sm leading-tight">{m.title}</p>
                                    <p className="text-[10px] uppercase font-bold text-base-500 mt-1">{m.description}</p>
                                </div>
                            </div>
                            <button onClick={() => shareMilestone(m)} className="bg-white dark:bg-base-700 p-2 rounded-xl shadow-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                                📤
                            </button>
                        </div>
                    )) : <p className="text-center text-base-400 py-10 font-bold">Start your first task to unlock!</p>}
                </div>
            </section>
          </div>
        </div>
    </div>
    </>
  );
};

const StatTile = ({ title, value, subtitle }: any) => (
    <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-6 rounded-3xl border border-white/20 dark:border-base-700/30 text-center shadow-soft">
        <p className="text-[10px] font-black text-base-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-4xl font-black text-primary-500">{value}</p>
        <p className="text-[10px] font-bold text-base-500 uppercase">{subtitle}</p>
    </div>
);

const ChartCard = ({ title, children }: any) => (
    <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30">
        <h2 className="text-lg font-black text-base-900 dark:text-white uppercase opacity-80 mb-6">{title}</h2>
        {children}
    </div>
);

export default AnalyticsPage;
