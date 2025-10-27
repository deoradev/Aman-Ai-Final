





import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useConnectivity } from '../hooks/useConnectivity';
import { MoodEntry, JournalEntry, Program, Milestone, WellnessEntry, AIInsight } from '../types';
import { getAnalyticsInsights } from '../services/geminiService';
import { calculateJournalStreak, calculateMilestones } from '../utils';
import MoodTrendChart from '../components/MoodTrendChart';
import SEOMeta from '../components/SEOMeta';
import WellnessTrendChart from '../components/WellnessTrendChart';

interface ActivityData {
    date: Date;
    hasJournal: boolean;
    hasCompletedChallenge: boolean;
}

const AnalyticsPage: React.FC = () => {
  const { t, language } = useLocalization();
  const { getScopedKey, currentUser } = useAuth();
  const { isOnline } = useConnectivity();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [wellnessHistory, setWellnessHistory] = useState<WellnessEntry[]>([]);
  
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState(false);
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  const handleRetryInsights = () => {
      if (!program || !isOnline) return;

      setInsightsLoading(true);
      setInsightsError(false);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentMoods = moodHistory.filter(m => new Date(m.date) >= thirtyDaysAgo);
      const recentJournals = journalEntries.filter(j => new Date(j.date) >= thirtyDaysAgo);
      
      const completedDays: number[] = JSON.parse(localStorage.getItem(getScopedKey('completedChallenges')) || '[]');

      let challengeAndHappyDays = 0;
      const moodMap = new Map(moodHistory.map(m => [new Date(m.date).toDateString(), m.mood]));
      const enrollmentDateStr = localStorage.getItem(getScopedKey('enrollmentDate'));
      const startDate = new Date(enrollmentDateStr || new Date());
      completedDays.forEach(dayNum => {
        const challengeDate = new Date(startDate);
        challengeDate.setDate(startDate.getDate() + dayNum - 1);
        if(moodMap.get(challengeDate.toDateString()) === 'happy') {
          challengeAndHappyDays++;
        }
      });

      getAnalyticsInsights({
          programName: program.name,
          journalCount: recentJournals.length,
          challengeCount: completedDays.length,
          moods: {
              happy: recentMoods.filter(m => m.mood === 'happy').length,
              neutral: recentMoods.filter(m => m.mood === 'neutral').length,
              sad: recentMoods.filter(m => m.mood === 'sad').length,
          },
          challengeAndHappyDays,
          language,
      }).then(setInsights).catch(() => setInsightsError(true)).finally(() => setInsightsLoading(false));
    };

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

        // Calculate milestones
        setMilestones(calculateMilestones({
          currentDay: day,
          journalStreak: streak,
          completedChallenges: completed.length
        }));

        if (!isOnline) {
          setInsightsError(true);
          setInsightsLoading(false);
          return;
        }

        // Fetch AI insights
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentMoods = moods.filter(m => new Date(m.date) >= thirtyDaysAgo);
        const recentJournals = journal.filter(j => new Date(j.date) >= thirtyDaysAgo);
        
        let challengeAndHappyDays = 0;
        const moodMap = new Map(moods.map(m => [new Date(m.date).toDateString(), m.mood]));
        completed.forEach(dayNum => {
          const challengeDate = new Date(startDate);
          challengeDate.setDate(startDate.getDate() + dayNum - 1);
          if(moodMap.get(challengeDate.toDateString()) === 'happy') {
            challengeAndHappyDays++;
          }
        });

        getAnalyticsInsights({
            programName: prog.name,
            journalCount: recentJournals.length,
            challengeCount: completed.length,
            moods: {
                happy: recentMoods.filter(m => m.mood === 'happy').length,
                neutral: recentMoods.filter(m => m.mood === 'neutral').length,
                sad: recentMoods.filter(m => m.mood === 'sad').length,
            },
            challengeAndHappyDays,
            language,
        }).then(setInsights).catch(() => setInsightsError(true)).finally(() => setInsightsLoading(false));

      }
    } catch (error) {
      console.error("Failed to parse analytics data from localStorage:", error);
    }
  }, [getScopedKey, currentUser, language, isOnline]);

  const moodDistribution = useMemo(() => {
    const happy = moodHistory.filter(m => m.mood === 'happy').length;
    const neutral = moodHistory.filter(m => m.mood === 'neutral').length;
    const sad = moodHistory.filter(m => m.mood === 'sad').length;
    return { happy, neutral, sad };
  }, [moodHistory]);

  const activityData: ActivityData[] = useMemo(() => {
    const journalDates = new Set(journalEntries.map(j => new Date(j.date).toDateString()));
    let completedChallengeDates = new Set<string>();
      if (program) {
        const enrollmentDateStr = localStorage.getItem(getScopedKey('enrollmentDate'));
        if (enrollmentDateStr) {
            const enrollmentDate = new Date(enrollmentDateStr);
            const completedDays: number[] = JSON.parse(localStorage.getItem(getScopedKey('completedChallenges')) || '[]');
            completedDays.forEach(dayNumber => {
                const challengeDate = new Date(enrollmentDate);
                challengeDate.setDate(enrollmentDate.getDate() + dayNumber - 1);
                completedChallengeDates.add(challengeDate.toDateString());
            });
        }
      }

    const calendarDays: ActivityData[] = [];
    for (let i = 34; i >= 0; i--) {
      const date = new Date();
      date.setDate(new Date().getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      calendarDays.push({
          date,
          hasJournal: journalDates.has(date.toDateString()),
          hasCompletedChallenge: completedChallengeDates.has(date.toDateString()),
      });
    }
    return calendarDays;
  }, [journalEntries, completedChallenges, program, getScopedKey]);
  
  const handleInsightAction = (action?: AIInsight['action']) => {
    switch (action) {
      case 'NAVIGATE_TOOLKIT':
        navigate('/toolkit');
        break;
      case 'NAVIGATE_GOALS':
        navigate('/dashboard'); // Goals are on the dashboard
        break;
      case 'NAVIGATE_RESOURCES':
        navigate('/resources');
        break;
      default:
        break;
    }
  };


  if (!program) {
    return (
        <div className="flex items-center justify-center h-screen text-center">
            <div>
                <p className="text-xl text-base-600 dark:text-base-400">{t('analytics.no_program')}</p>
                <a href="/#/programs" className="text-primary-500 underline font-semibold">{t('analytics.select_program_link')}</a>
            </div>
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
    <div className="py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('analytics.title')}</h1>
          <p className="mt-3 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('analytics.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard title={t('analytics.program_progress.title')} value={`${Math.round((currentDay/90)*100)}%`} subtitle={t('analytics.stat.progress_subtitle', { day: currentDay })} />
              <StatCard title={t('analytics.streak.title')} value={journalStreak.toString()} subtitle={t('analytics.streak.days')} />
              <StatCard title={t('dashboard.completion.challenges_completed')} value={completedChallenges.toString()} subtitle={t('analytics.stat.challenges_subtitle')} />
            </div>
            <Card title={t('analytics.insights.title')}>
              {insightsLoading ? (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-base-200 dark:bg-base-700 rounded w-3/4"></div>
                  <div className="h-4 bg-base-200 dark:bg-base-700 rounded w-1/2"></div>
                </div>
              ) : insightsError ? (
                 <div className="text-center">
                    <p className="text-warning-500 text-sm">{!isOnline ? t('offline.feature_unavailable') : t('analytics.insights.error')}</p>
                    {isOnline &&
                        <button onClick={handleRetryInsights} className="mt-2 text-sm font-semibold text-primary-600 hover:underline">
                            {t('chatbot.retry_button')}
                        </button>
                    }
                 </div>
              ) : (
                <ul className="space-y-4">
                  {insights.map((insight, i) => (
                    <li key={i} className="flex flex-col sm:flex-row items-start text-sm">
                      <div className="flex items-start flex-grow">
                        <span className="text-primary-500 mr-3 mt-1">💡</span>
                        <div className="flex-grow">
                            <p className="font-bold text-base-800 dark:text-base-200">{insight.title}</p>
                            <p className="text-base-700 dark:text-base-300">{insight.text}</p>
                        </div>
                      </div>
                      {insight.action && insight.cta && (
                        <button 
                            onClick={() => handleInsightAction(insight.action)}
                            className="mt-2 sm:mt-0 sm:ml-4 flex-shrink-0 bg-primary-500 text-white font-bold py-1.5 px-4 rounded-full text-xs hover:bg-primary-600 transition-colors"
                        >
                            {insight.cta}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card title={t('analytics.mood.title')}>
                <MoodTrendChart data={moodHistory} />
            </Card>
            <Card title={t('analytics.wellness.title')}>
                <WellnessTrendChart data={wellnessHistory} />
            </Card>
          </div>
          
          {/* Column 2 */}
          <div className="space-y-6">
            <Card title={t('analytics.milestones.title')}>
                <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {milestones.length > 0 ? (
                        [...milestones].reverse().map(m => (
                            <div key={m.id} className="flex items-start">
                                <span className="text-2xl mr-4">{m.icon}</span>
                                <div>
                                    <p className="font-semibold text-base-800 dark:text-base-200">{m.title}</p>
                                    <p className="text-sm text-base-500 dark:text-base-400">{m.description}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-base-500 dark:text-base-400 py-4">{t('analytics.milestones.empty')}</p>
                    )}
                </div>
            </Card>
            <Card title={t('analytics.mood_distribution.title')}>
              <MoodDistributionChart data={moodDistribution} />
            </Card>
            <Card title={t('analytics.recent_entries.title')}>
                 <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                    {journalEntries.length > 0 ? [...journalEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((entry, index) => (
                        <div key={index} className="bg-base-50 dark:bg-base-700/50 p-2 rounded-lg border-l-2 border-primary-400">
                            <p className="font-semibold text-base-600 dark:text-base-400 text-xs">{new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                            <p className="text-base-800 dark:text-base-300 text-sm truncate">{entry.text}</p>
                        </div>
                    )) : (
                        <p className="text-center text-base-500 dark:text-base-400 py-4">{t('analytics.no_journal_entries')}</p>
                    )}
                 </div>
            </Card>
          </div>
        </div>

        <div className="mt-6">
            <Card title={t('analytics.activity_calendar.title')}>
              <ActivityCalendar data={activityData} />
            </Card>
        </div>
      </div>
    </div>
    </>
  );
};

// --- Sub-components for AnalyticsPage ---

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
        <h2 className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-4">{title}</h2>
        {children}
    </div>
);

const StatCard: React.FC<{ title: string; value: string; subtitle: string }> = ({ title, value, subtitle }) => (
    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-5 rounded-xl shadow-soft text-center">
        <p className="text-sm font-medium text-base-500 dark:text-base-400">{title}</p>
        <p className="text-4xl font-bold text-base-900 dark:text-white mt-1">{value}</p>
        <p className="text-sm text-base-500 dark:text-base-400">{subtitle}</p>
    </div>
);

const MoodDistributionChart: React.FC<{ data: { happy: number, neutral: number, sad: number } }> = ({ data }) => {
    const { t } = useLocalization();
    const total = data.happy + data.neutral + data.sad;
    if (total === 0) return <p className="text-center text-base-500 dark:text-base-400 py-4">{t('analytics.no_mood_data')}</p>;
    
    const happyPercent = (data.happy / total) * 100;
    const neutralPercent = (data.neutral / total) * 100;
    
    return (
        <div className="space-y-3">
            <ProgressBar label={t('analytics.mood_dist.happy')} percent={happyPercent} color="bg-accent-400" value={data.happy} />
            <ProgressBar label={t('analytics.mood_dist.neutral')} percent={neutralPercent} color="bg-secondary-400" value={data.neutral} />
            <ProgressBar label={t('analytics.mood_dist.sad')} percent={100 - happyPercent - neutralPercent} color="bg-warning-400" value={data.sad} />
        </div>
    );
};

const ProgressBar: React.FC<{ label: string, percent: number, color: string, value: number }> = ({ label, percent, color, value }) => (
    <div>
        <div className="flex justify-between mb-1 text-sm font-medium text-base-700 dark:text-base-300">
            <span>{label}</span>
            <span>{value}</span>
        </div>
        <div className="w-full bg-base-200 dark:bg-base-700 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percent}%` }}></div>
        </div>
    </div>
);

const ActivityCalendar: React.FC<{ data: ActivityData[] }> = ({ data }) => {
    const { t } = useLocalization();
    const firstDayOfWeek = data.length > 0 ? data[0].date.getDay() : 0;
    const dayHeaders = t('analytics.calendar.days').split(',');
    
    return (
        <div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-base-500 dark:text-base-400 font-semibold mb-2">
                {dayHeaders.map((day, index) => (<div key={index} aria-hidden="true">{day}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-1" role="grid">
              {Array.from({ length: firstDayOfWeek }).map((_, index) => <div key={`spacer-${index}`} role="presentation" />)}
              {data.map(({ date, hasJournal, hasCompletedChallenge }, index) => {
                  let bgColor = 'bg-base-200 dark:bg-base-700';
                  let description = t('analytics.calendar.tooltip.no_activity', { date: date.toLocaleDateString() });
                  if (hasJournal && hasCompletedChallenge) {
                      bgColor = 'bg-primary-500';
                      description = t('analytics.calendar.tooltip.journal_challenge', { date: date.toLocaleDateString() });
                  } else if (hasJournal) {
                      bgColor = 'bg-base-600 dark:bg-base-500';
                      description = t('analytics.calendar.tooltip.journal', { date: date.toLocaleDateString() });
                  } else if (hasCompletedChallenge) {
                      bgColor = 'bg-primary-300 dark:bg-primary-800';
                      description = t('analytics.calendar.tooltip.challenge', { date: date.toLocaleDateString() });
                  }

                  return (
                      <div key={index} className="relative group" role="gridcell" aria-label={description}>
                          <div className={`w-full aspect-square rounded ${bgColor} opacity-75`}></div>
                          <div className="absolute z-10 bottom-full mb-2 w-max bg-base-800 dark:bg-base-200 text-white dark:text-base-900 text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              {description.split(': ')[1]}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-base-800 dark:border-t-base-200"></div>
                          </div>
                      </div>
                  )
              })}
            </div>
            <div className="flex justify-end flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-base-500 dark:text-base-400">
                <span className="flex items-center"><span className="w-3 h-3 rounded bg-base-200 dark:bg-base-700 mr-1.5"></span>{t('analytics.calendar.legend.none')}</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded bg-primary-300 dark:bg-primary-800 mr-1.5"></span>{t('analytics.calendar.legend.challenge')}</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded bg-base-600 dark:bg-base-500 mr-1.5"></span>{t('analytics.calendar.legend.journal')}</span>
                <span className="flex items-center"><span className="w-3 h-3 rounded bg-primary-500 mr-1.5"></span>{t('analytics.calendar.legend.both')}</span>
            </div>
        </div>
    );
};

export default AnalyticsPage;