
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { MoodEntry, JournalEntry, Program, Goal, Milestone, WellnessEntry } from '../types';
import { calculateJournalStreak, calculateMilestones, formatTimeAgo } from '../utils';
import MoodTrendChart from '../components/MoodTrendChart';
import { getAnalyticsInsights } from '../services/geminiService';
import SEOMeta from '../components/SEOMeta';
import WellnessTrendChart from '../components/WellnessTrendChart';

const AnalyticsPage: React.FC = () => {
  const { t, language } = useLocalization();
  const { getScopedKey } = useAuth();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessEntry[]>([]);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  
  const [insights, setInsights] = useState<{ type: string; title: string; text: string; action?: string; cta?: string }[]>([]);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

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
        
        setJournalEntries(journal);
        setMoodHistory(moods);
        setWellnessHistory(wellness);
        setCompletedChallenges(completed);
        setMilestones(calculateMilestones({ currentDay: day, journalStreak: calculateJournalStreak(journal), completedChallenges: completed.length }));
      }
    } catch (e) { console.error(e); }
  }, [getScopedKey]);

  useEffect(() => {
    if (!program) return;

    const fetchInsights = async () => {
        setIsInsightsLoading(true);
        setInsightsError(null);
        try {
            const last30DaysMoods = moodHistory.slice(-30);
            const happyCount = last30DaysMoods.filter(m => m.mood === 'happy').length;
            const neutralCount = last30DaysMoods.filter(m => m.mood === 'neutral').length;
            const sadCount = last30DaysMoods.filter(m => m.mood === 'sad').length;
            
            const last30DaysChallenges = completedChallenges.filter(day => day > currentDay - 30);
            const challengeAndHappyDays = last30DaysMoods.filter(m => {
                const dayOfMood = Math.floor(Math.abs(new Date(m.date).getTime() - new Date(localStorage.getItem(getScopedKey('enrollmentDate'))!).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return m.mood === 'happy' && last30DaysChallenges.includes(dayOfMood);
            }).length;

            const analyticsData = {
                programName: program.name,
                journalCount: journalEntries.filter(j => new Date(j.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length,
                challengeCount: last30DaysChallenges.length,
                moods: { happy: happyCount, neutral: neutralCount, sad: sadCount },
                challengeAndHappyDays,
                language
            };

            const fetchedInsights = await getAnalyticsInsights(analyticsData);
            setInsights(fetchedInsights);
        } catch (error) {
            console.error(error);
            setInsightsError(t('analytics.insights.error'));
        } finally {
            setIsInsightsLoading(false);
        }
    };

    fetchInsights();
  }, [program, language, getScopedKey]);

  const moodDistribution = useMemo(() => {
    const total = moodHistory.length;
    if (total === 0) return { happy: 0, neutral: 0, sad: 0 };
    return {
      happy: Math.round((moodHistory.filter(m => m.mood === 'happy').length / total) * 100),
      neutral: Math.round((moodHistory.filter(m => m.mood === 'neutral').length / total) * 100),
      sad: Math.round((moodHistory.filter(m => m.mood === 'sad').length / total) * 100),
    };
  }, [moodHistory]);

  const handleActionClick = (action: string) => {
      switch(action) {
          case 'NAVIGATE_TOOLKIT': navigate('/toolkit'); break;
          case 'NAVIGATE_GOALS': navigate('/dashboard'); break;
          case 'NAVIGATE_RESOURCES': navigate('/resources'); break;
          default: break;
      }
  };

  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <h1 className="text-3xl font-bold text-base-800 dark:text-base-200 mb-4">{t('analytics.no_program')}</h1>
        <NavLink to="/programs" className="text-primary-600 dark:text-primary-400 font-bold text-lg hover:underline">
          {t('analytics.select_program_link')}
        </NavLink>
      </div>
    );
  }

  return (
    <>
    <SEOMeta
        title={t('seo.analytics.title')}
        description={t('seo.analytics.description')}
        noIndex={true}
    />
    <div className="py-12 bg-base-100/50 dark:bg-base-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('analytics.title')}</h1>
          <p className="mt-4 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('analytics.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard title={t('analytics.program_progress.title')} value={currentDay} subtitle={t('analytics.stat.progress_subtitle')} total={90} color="primary" />
            <StatCard title={t('dashboard.progress_title')} value={completedChallenges.length} subtitle={t('analytics.stat.challenges_subtitle')} total={90} color="accent" />
            <StatCard title={t('analytics.streak.title')} value={calculateJournalStreak(journalEntries)} subtitle={t('analytics.streak.days')} color="secondary" />
            <StatCard title={t('analytics.milestones.title')} value={milestones.length} subtitle="achieved" color="warning" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-base-800 dark:text-base-200 mb-6">{t('analytics.mood.title')}</h2>
                <MoodTrendChart data={moodHistory} />
            </div>

            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-base-800 dark:text-base-200 mb-6">{t('analytics.wellness.title')}</h2>
                <WellnessTrendChart data={wellnessHistory} />
            </div>

            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-base-800 dark:text-base-200 mb-6">{t('analytics.recent_entries.title')}</h2>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {journalEntries.length > 0 ? journalEntries.slice().reverse().map((entry, i) => (
                        <div key={i} className="p-4 bg-base-100/50 dark:bg-base-700/50 rounded-xl border border-base-200 dark:border-base-600">
                            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="text-base-700 dark:text-base-200 italic line-clamp-3">"{entry.text}"</p>
                        </div>
                    )) : <p className="text-base-500 dark:text-base-400 italic text-center py-4">{t('analytics.no_journal_entries')}</p>}
                </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-base-800 dark:text-base-200 mb-6">{t('analytics.insights.title')}</h2>
                {isInsightsLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="w-8 h-8 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
                    </div>
                ) : insightsError ? (
                    <p className="text-warning-500 text-sm italic">{insightsError}</p>
                ) : (
                    <div className="space-y-4">
                        {insights.map((insight, i) => (
                            <div key={i} className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border-l-4 border-primary-500">
                                <p className="font-bold text-primary-700 dark:text-primary-300 text-sm mb-1">{insight.title}</p>
                                <p className="text-sm text-base-700 dark:text-base-300">{insight.text}</p>
                                {insight.action && insight.cta && (
                                    <button onClick={() => handleActionClick(insight.action!)} className="mt-3 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline uppercase tracking-wider">
                                        {insight.cta} &rarr;
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-base-800 dark:text-base-200 mb-6">{t('analytics.mood_distribution.title')}</h2>
                <div className="space-y-4">
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-accent-600 bg-accent-100">{t('analytics.mood_dist.happy')}</div>
                            <div className="text-right text-xs font-semibold inline-block text-accent-600">{moodDistribution.happy}%</div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-accent-100">
                            <div style={{ width: `${moodDistribution.happy}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent-500"></div>
                        </div>
                    </div>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-secondary-600 bg-secondary-100">{t('analytics.mood_dist.neutral')}</div>
                            <div className="text-right text-xs font-semibold inline-block text-secondary-600">{moodDistribution.neutral}%</div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-secondary-100">
                            <div style={{ width: `${moodDistribution.neutral}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-secondary-500"></div>
                        </div>
                    </div>
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                            <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-warning-600 bg-warning-100">{t('analytics.mood_dist.sad')}</div>
                            <div className="text-right text-xs font-semibold inline-block text-warning-600">{moodDistribution.sad}%</div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-warning-100">
                            <div style={{ width: `${moodDistribution.sad}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-warning-500"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft">
                <h2 className="text-xl font-bold text-base-800 dark:text-base-200 mb-6">{t('analytics.milestones.title')}</h2>
                <div className="space-y-3">
                    {milestones.length > 0 ? milestones.slice().reverse().map(m => (
                        <div key={m.id} className="flex items-center gap-3 p-3 bg-base-100/50 dark:bg-base-700/50 rounded-xl border border-base-200 dark:border-base-600">
                            <span className="text-2xl">{m.icon}</span>
                            <div>
                                <p className="font-bold text-sm text-base-800 dark:text-base-100">{m.title}</p>
                                <p className="text-[10px] text-base-500 dark:text-base-400 leading-tight uppercase tracking-wider">{m.description}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-base-500 dark:text-base-400 italic">{t('analytics.milestones.empty')}</p>}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

const StatCard = ({ title, value, subtitle, total, color }: { title: string; value: number | string; subtitle: string; total?: number; color: 'primary' | 'accent' | 'secondary' | 'warning' }) => {
    const colorClasses = {
        primary: 'text-primary-600 bg-primary-100 dark:bg-primary-900/30',
        accent: 'text-accent-600 bg-accent-100 dark:bg-accent-900/30',
        secondary: 'text-secondary-600 bg-secondary-100 dark:bg-secondary-900/30',
        warning: 'text-warning-600 bg-warning-100 dark:bg-warning-900/30',
    };
    
    return (
        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft flex flex-col items-center text-center">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${colorClasses[color]}`}>{title}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-base-900 dark:text-white tracking-tighter">{value}</span>
                {total && <span className="text-base-400 font-bold">/{total}</span>}
            </div>
            <span className="text-xs font-bold text-base-500 mt-1 uppercase tracking-widest">{subtitle}</span>
        </div>
    );
};

export default AnalyticsPage;
