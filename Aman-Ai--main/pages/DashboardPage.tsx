
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Program, DailyChallenge, MoodEntry, JournalEntry, Goal, Resource, Milestone, WellnessEntry, PreventionPlan } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { getSuggestedResource, getJournalReflection } from '../services/geminiService';
import Chatbot from '../components/Chatbot';
import { PERSONAS, RESOURCES } from '../constants';
import SEOMeta from '../components/SEOMeta';
import { calculateJournalStreak, getUserName, calculateMilestones } from '../utils';
import GrowthGarden from '../components/GrowthGarden';
import SponsorInsightCard from '../components/AIInsightCard';
import TodayFocus from '../components/TodayFocus';
import PullToRefresh from '../components/PullToRefresh';
import ConfirmModal from '../components/ConfirmModal';

const getGreeting = (t: (key: string) => string) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.greeting.morning');
  if (hour < 18) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
};

const NEW_FEATURES_FLAG = 'amandigitalcare-new-features-seen-v2';

const NewFeaturesToast: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLocalization();
    return (
        <div className="fixed bottom-24 right-6 bg-primary-600/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl z-[100] max-w-sm animate-fade-in-up border border-white/20">
            <div className="flex items-start gap-4">
                <div className="bg-white/20 p-2 rounded-lg">✨</div>
                <div className="flex-1">
                    <p className="text-sm font-bold leading-tight">{t('dashboard.new_features_toast')}</p>
                </div>
                <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
            </div>
        </div>
    );
};

const ProgressRing: React.FC<{ percentage: number; day: number }> = ({ percentage, day }) => (
    <div className="relative flex items-center justify-center w-32 h-32 group">
        <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-base-200 dark:text-base-700" />
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * percentage) / 100}
                className="text-primary-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
            />
        </svg>
        <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-black text-base-900 dark:text-white">{day}</span>
            <span className="text-[10px] uppercase font-bold text-base-500 tracking-tighter">Day of 90</span>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLocalization();
  const { getScopedKey, currentUser } = useAuth();

  const [program, setProgram] = useState<Program | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [isChallengeCompleted, setIsChallengeCompleted] = useState(false);
  const [isProgramCompleted, setIsProgramCompleted] = useState(false);
  const [completedChallengesCount, setCompletedChallengesCount] = useState(0);
  const [journalEntriesCount, setJournalEntriesCount] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isJournalSaved, setIsJournalSaved] = useState(false);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [journalReflection, setJournalReflection] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [editingGoal, setEditingGoal] = useState<{ id: number; text: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string>('therapist');
  const [suggestedResource, setSuggestedResource] = useState<Resource | null>(null);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);
  const [wellnessLog, setWellnessLog] = useState<WellnessEntry | null>(null);
  const [preventionPlan, setPreventionPlan] = useState<PreventionPlan | null>(null);
  const [showNewFeaturesToast, setShowNewFeaturesToast] = useState(false);

  const journalSectionRef = useRef<HTMLDivElement>(null);
  const journalTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const storedProgram = localStorage.getItem(getScopedKey('program'));
      const enrollmentDate = localStorage.getItem(getScopedKey('enrollmentDate'));
      const storedPersona = localStorage.getItem(getScopedKey('persona')) || 'therapist';
      const storedPlan = localStorage.getItem(getScopedKey('prevention-plan'));

      if (storedPlan) setPreventionPlan(JSON.parse(storedPlan));
      
      if (storedProgram && enrollmentDate) {
        const parsedProgram: Program = JSON.parse(storedProgram);
        setProgram(parsedProgram);
        setSelectedPersona(storedPersona);

        const completedChallenges: number[] = JSON.parse(localStorage.getItem(getScopedKey('completedChallenges')) || '[]');
        const journals: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]');
        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(getScopedKey('mood-history')) || '[]');
        const wellnessHistory: WellnessEntry[] = JSON.parse(localStorage.getItem(getScopedKey('wellness-log')) || '[]');
        
        setMoodHistory(moods);
        setJournalEntries(journals);
        setJournalStreak(calculateJournalStreak(journals));
        setCompletedChallengesCount(completedChallenges.length);
        setJournalEntriesCount(journals.length);

        const startDate = new Date(enrollmentDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const allMilestones = calculateMilestones({ currentDay: day, journalStreak: calculateJournalStreak(journals), completedChallenges: completedChallenges.length });
        const seenMilestones: string[] = JSON.parse(localStorage.getItem(getScopedKey('seenMilestones')) || '[]');
        const unseen = allMilestones.filter(m => !seenMilestones.includes(m.id));
        if (unseen.length > 0) setNewMilestones(unseen);

        if (day > 90) {
            setIsProgramCompleted(true);
        } else {
            setCurrentDay(day);
            const todayStr = new Date().toISOString().split('T')[0];
            setDailyChallenge(parsedProgram.dailyChallenges.find(c => c.day === day) || null);
            setIsChallengeCompleted(completedChallenges.includes(day));
            const todaysMood = moods.find(m => m.date === todayStr);
            if (todaysMood) setSelectedMood(todaysMood.mood);
            const todaysWellness = wellnessHistory.find(w => w.date === todayStr);
            setWellnessLog(todaysWellness || { date: todayStr, sleepHours: 8, activityLevel: 'moderate' });
            const todaysJournal = journals.find(j => j.date === todayStr);
            if (todaysJournal) { setJournalText(todaysJournal.text); setHasJournaledToday(true); }
            const storedGoals = localStorage.getItem(getScopedKey('goals'));
            if (storedGoals) setGoals(JSON.parse(storedGoals));
        }
      } else {
        navigate('/programs');
      }
    } catch (e) { navigate('/programs'); }
    if (!localStorage.getItem(NEW_FEATURES_FLAG)) setShowNewFeaturesToast(true);
  }, [navigate, language, getScopedKey, currentUser]);

  const handleMoodSelect = (mood: MoodEntry['mood']) => {
    setSelectedMood(mood);
    const todayStr = new Date().toISOString().split('T')[0];
    const key = getScopedKey('mood-history');
    const moods: MoodEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
    const newMoods = moods.filter(m => m.date !== todayStr);
    newMoods.push({ date: todayStr, mood });
    localStorage.setItem(key, JSON.stringify(newMoods));
    setMoodHistory(newMoods);
  };

  const handleSaveJournal = async () => {
    if (journalText.trim() === '' || !program) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const key = getScopedKey('journal-entries');
    const journals: JournalEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
    const newJournals = [...journals.filter(j => j.date !== todayStr), { date: todayStr, text: journalText }];
    localStorage.setItem(key, JSON.stringify(newJournals));
    setJournalEntries(newJournals);
    setJournalStreak(calculateJournalStreak(newJournals));
    setIsJournalSaved(true);
    setHasJournaledToday(true);
    const reflection = await getJournalReflection(journalText, language);
    if (reflection) setJournalReflection(reflection);
    const resource = await getSuggestedResource(journalText, program.name, RESOURCES, language);
    if (resource) setSuggestedResource(resource);
    setTimeout(() => setIsJournalSaved(false), 2000);
  };

  const handleRefresh = () => window.location.reload();
  const userDisplayName = currentUser ? getUserName(currentUser) : t('utils.user_name.guest');

  if (!program) return null;

  return (
    <>
      <SEOMeta title="My Wellness Command Center | Aman AI" description="Confidential digital therapeutic dashboard." noIndex={true} />
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="min-h-screen py-10">
          <div className="container mx-auto px-4 lg:px-8">
            {/* World-Class Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white leading-none tracking-tight">
                  {getGreeting(t)}, <span className="text-primary-500">{userDisplayName}</span>
                </h1>
                <p className="mt-4 text-base-500 font-medium uppercase tracking-[0.2em] text-xs">
                  Day {currentDay} of Your {program.name} Journey
                </p>
              </div>
              <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-4 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30 flex items-center gap-6">
                <ProgressRing percentage={(currentDay/90)*100} day={currentDay} />
                <div className="hidden sm:block border-l border-base-200 dark:border-base-700 h-16 mx-2" />
                <div className="text-center pr-4">
                    <p className="text-3xl font-black text-primary-500">{journalStreak}</p>
                    <p className="text-[10px] uppercase font-bold text-base-500">Day Streak</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content (LHS) */}
              <div className="lg:col-span-8 space-y-8">
                {newMilestones.map(m => (
                    <div key={m.id} className="animate-fade-in-up bg-primary-500 text-white p-6 rounded-3xl shadow-soft-lg flex items-center gap-6 border-b-4 border-primary-700">
                        <span className="text-5xl">{m.icon}</span>
                        <div>
                            <p className="text-xs uppercase font-black opacity-70">Milestone Unlocked!</p>
                            <h2 className="text-2xl font-black">{m.title}</h2>
                            <button onClick={() => {
                                const seen = JSON.parse(localStorage.getItem(getScopedKey('seenMilestones')) || '[]');
                                localStorage.setItem(getScopedKey('seenMilestones'), JSON.stringify([...seen, m.id]));
                                setNewMilestones(prev => prev.filter(x => x.id !== m.id));
                            }} className="mt-2 text-sm font-bold underline">Dismiss</button>
                        </div>
                    </div>
                ))}

                <TodayFocus
                    dailyChallenge={dailyChallenge}
                    isChallengeCompleted={isChallengeCompleted}
                    onCompleteChallenge={() => {
                        const key = getScopedKey('completedChallenges');
                        const completed = JSON.parse(localStorage.getItem(key) || '[]');
                        if (!completed.includes(currentDay)) {
                            localStorage.setItem(key, JSON.stringify([...completed, currentDay]));
                            setCompletedChallengesCount(completed.length + 1);
                        }
                        setIsChallengeCompleted(true);
                    }}
                    selectedMood={selectedMood}
                    onMoodSelect={handleMoodSelect}
                    onStartJournal={() => journalSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <SponsorInsightCard moods={moodHistory} journalEntries={journalEntries} journalStreak={journalStreak} userName={userDisplayName} currentDay={currentDay} completedChallenges={completedChallengesCount} />
                    <section className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-6 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30">
                        <h2 className="text-xl font-black text-base-900 dark:text-white uppercase opacity-80 mb-4">Garden Progress</h2>
                        <GrowthGarden day={currentDay} journalStreak={journalStreak} completedChallenges={completedChallengesCount} />
                    </section>
                </div>

                <section ref={journalSectionRef} className="bg-white/40 dark:bg-base-800/40 backdrop-blur-xl p-8 rounded-3xl shadow-soft border border-white/20 dark:border-base-700/30">
                    <h2 className="text-2xl font-black text-base-900 dark:text-white mb-6">Daily Reflection</h2>
                    <textarea 
                        ref={journalTextareaRef}
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        placeholder="Private space for your thoughts..."
                        rows={4}
                        className="w-full p-4 border border-base-200 dark:border-base-700 rounded-2xl focus:ring-4 focus:ring-primary-500/20 bg-white/50 dark:bg-base-900/50 text-base-800 dark:text-white"
                    />
                    <div className="mt-4 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-base-400 uppercase">Stored locally on your device</span>
                        <button onClick={handleSaveJournal} className="bg-primary-500 text-white font-black py-3 px-10 rounded-xl hover:bg-primary-600 transition-all shadow-lg active:scale-95">
                             {isJournalSaved ? 'Saved! ✓' : 'Lock Entry'}
                        </button>
                    </div>
                </section>
              </div>

              {/* Chat Sidebar (RHS) */}
              <div className="lg:col-span-4 space-y-8">
                <div className="lg:sticky top-24 h-[75vh]">
                    <Chatbot key={selectedPersona} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>
      {showNewFeaturesToast && <NewFeaturesToast onClose={() => { localStorage.setItem(NEW_FEATURES_FLAG, 'true'); setShowNewFeaturesToast(false); }} />}
    </>
  );
};

export default DashboardPage;
