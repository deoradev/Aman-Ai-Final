
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useConnectivity } from '../hooks/useConnectivity';
import { MoodEntry, JournalEntry, Program, Milestone, WellnessEntry, AIInsight } from '../types';
import { getAnalyticsInsights } from '../services/geminiService';
import { calculateJournalStreak, calculateMilestones } from '../utils';
import MoodTrendChart from '../components/MoodTrendChart';
import SEOMeta from '../components/SEOMeta';
import WellnessTrendChart from '../components/WellnessTrendChart';
import { useToast } from '../hooks/useToast';

const AnalyticsPage: React.FC = () => {
  const { t, language } = useLocalization();
  const { getScopedKey } = useAuth();
  const { isOnline } = useConnectivity();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    try {
      const prog: Program | null = JSON.parse(localStorage.getItem(getScopedKey('program')) || 'null');
      setProgram(prog);
      if (prog) {
        const enrollmentDateStr = localStorage.getItem(getScopedKey('enrollmentDate'));
        const startDate = new Date(enrollmentDateStr || new Date());
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCurrentDay(day > 90 ? 90 : day);

        const journal: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]');
        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(getScopedKey('mood-history')) || '[]');
        const wellness: WellnessEntry[] = JSON.parse(localStorage.getItem(getScopedKey('wellness-log')) || '[]');
        const completed: number[] = JSON.parse(localStorage.getItem(getScopedKey('completedChallenges')) || '[]');
        
        setJournalEntries(journal);
        setMoodHistory(moods);
        setWellnessHistory(wellness);
        setCompletedChallenges(completed.length);
        const streak = calculateJournalStreak(journal);
        setJournalStreak(streak);

        setMilestones(calculateMilestones({
          currentDay: day,
          journalStreak: streak,
          completedChallenges: completed.length
        }));
      }
    } catch (e) { console.error(e); }
  }, [getScopedKey, language]);

  const shareMilestone = async (m: Milestone) => {
    const shareData = {
        title: `I reached a recovery milestone: ${m.title}`,
        text: `I just unlocked the "${m.title}" milestone on Aman Digital Care! 🌟 It's a free and confidential AI companion for mental health. Check it out:`,
        url: 'https://amandigitalcare.com'
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
            showToast("Shared successfully!", "success");
        } catch (err) {
            console.log('Error sharing:', err);
        }
    } else {
        navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        showToast("Milestone copied to clipboard! Share it with your supporters.", "success");
    }
  };

  if (!program) {
    return (
        <div className="flex items-center justify-center h-screen text-center">
            <div>
                <p className="text-xl text-base-600 dark:text-base-400">{t('analytics.no_program')}</p>
                <NavLink to="/programs" className="text-primary-500 underline font-semibold">{t('analytics.select_program_link')}</NavLink>
            </div>
        </div>
    );
  }

  return (
    <>
    <SEOMeta
        title="My Recovery Progress | Aman Digital Care Journey"
        description="See your mood trends, journal streaks, and recovery milestones. Aman Digital Care helps you stay on track with private analytics."
        noIndex={true}
    />
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('analytics.title')}</h1>
          <p className="mt-3 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('analytics.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title={t('analytics.program_progress.title')} value={`${Math.round((currentDay/90)*100)}%`} subtitle={t('analytics.stat.progress_subtitle', { day: currentDay })} />
              <StatCard title={t('analytics.streak.title')} value={journalStreak.toString()} subtitle={t('analytics.streak.days')} />
              <StatCard title={t('dashboard.completion.challenges_completed')} value={completedChallenges.toString()} subtitle={t('analytics.stat.challenges_subtitle')} />
            </div>
            
            <Card title={t('analytics.mood.title')}>
                <MoodTrendChart data={moodHistory} />
            </Card>

            <Card title={t('analytics.wellness.title')}>
                <WellnessTrendChart data={wellnessHistory} />
            </Card>
          </div>
          
          <div className="space-y-6">
             <Card title={t('analytics.milestones.title')}>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {milestones.length > 0 ? (
                        [...milestones].reverse().map(m => (
                            <div key={m.id} className="flex items-center justify-between p-4 bg-base-50 dark:bg-base-700/50 rounded-xl group transition-all hover:bg-primary-50 dark:hover:bg-primary-900/10 border border-transparent hover:border-primary-200">
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{m.icon}</span>
                                    <div>
                                        <p className="font-bold text-base-800 dark:text-base-200 text-sm leading-tight">{m.title}</p>
                                        <p className="text-xs text-base-500 dark:text-base-400 mt-1">{m.description}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => shareMilestone(m)}
                                    className="p-2 text-primary-500 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-base-800 rounded-full shadow-sm"
                                    aria-label="Share this milestone"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-base-50 dark:text-base-400 py-4">{t('analytics.milestones.empty')}</p>
                    )}
                </div>
            </Card>

            <div className="bg-primary-600 text-white p-6 rounded-2xl shadow-soft">
                <h3 className="font-bold text-lg mb-2">Spread the Word</h3>
                <p className="text-sm opacity-90 mb-4">Aman AI is a free non-profit tool. Sharing your progress helps others find the support they need.</p>
                <NavLink to="/about" className="text-white font-bold text-sm underline hover:opacity-80">Learn about our mission &rarr;</NavLink>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft border border-base-200/50 dark:border-base-700/50">
        <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-4">{title}</h2>
        {children}
    </div>
);

const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-5 rounded-xl shadow-soft text-center border-b-2 border-primary-500">
        <p className="text-xs font-bold text-base-400 dark:text-base-500 uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-extrabold text-base-900 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-base-500 dark:text-base-400">{subtitle}</p>
    </div>
);

export default AnalyticsPage;