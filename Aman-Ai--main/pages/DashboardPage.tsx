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
import ClinicalSyncCard from '../components/ClinicalSyncCard';
import PullToRefresh from '../components/PullToRefresh';
import ConfirmModal from '../components/ConfirmModal';

const getGreeting = (t: (key: string) => string) => {
  const hour = new Date().getHours();
  if (hour < 12) return t('dashboard.greeting.morning');
  if (hour < 18) return t('dashboard.greeting.afternoon');
  return t('dashboard.greeting.evening');
};

const ProgressRing: React.FC<{ percentage: number; day: number }> = ({ percentage, day }) => (
    <div className="relative flex items-center justify-center w-32 h-32 group transition-transform duration-500 hover:scale-105">
        <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-base-200 dark:text-base-700" />
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * Math.min(percentage, 100)) / 100}
                className="text-primary-500 transition-all duration-1000 ease-out"
                strokeLinecap="round"
            />
        </svg>
        <div className="absolute flex flex-col items-center">
            <span className="text-3xl font-black text-base-900 dark:text-white tracking-tighter">{day}</span>
            <span className="text-[10px] uppercase font-black text-base-500 tracking-widest">Day</span>
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
  const [completedChallengesCount, setCompletedChallengesCount] = useState(0);
  const [journalStreak, setJournalStreak] = useState(0);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isJournalSaved, setIsJournalSaved] = useState(false);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);
  const [selectedPersona] = useState<string>('therapist');

  const journalSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedProgram = localStorage.getItem(getScopedKey('program'));
      const enrollmentDate = localStorage.getItem(getScopedKey('enrollmentDate'));
      
      if (storedProgram && enrollmentDate) {
        const parsedProgram: Program = JSON.parse(storedProgram);
        setProgram(parsedProgram);

        const completedChallenges: number[] = JSON.parse(localStorage.getItem(getScopedKey('completedChallenges')) || '[]');
        const journals: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]');
        const moods: MoodEntry[] = JSON.parse(localStorage.getItem(getScopedKey('mood-history')) || '[]');
        
        setMoodHistory(moods);
        setJournalEntries(journals);
        setJournalStreak(calculateJournalStreak(journals));
        setCompletedChallengesCount(completedChallenges.length);

        const startDate = new Date(enrollmentDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        const allMilestones = calculateMilestones({ currentDay: day, journalStreak: calculateJournalStreak(journals), completedChallenges: completedChallenges.length });
        const seenMilestones: string[] = JSON.parse(localStorage.getItem(getScopedKey('seenMilestones')) || '[]');
        const unseen = allMilestones.filter(m => !seenMilestones.includes(m.id));
        if (unseen.length > 0) setNewMilestones(unseen);

        setCurrentDay(day > 90 ? 90 : day);
        const todayStr = new Date().toISOString().split('T')[0];
        setDailyChallenge(parsedProgram.dailyChallenges.find(c => c.day === day) || null);
        setIsChallengeCompleted(completedChallenges.includes(day));
        const todaysMood = moods.find(m => m.date === todayStr);
        if (todaysMood) setSelectedMood(todaysMood.mood);
        const todaysJournal = journals.find(j => j.date === todayStr);
        if (todaysJournal) setJournalText(todaysJournal.text);
      } else {
        navigate('/programs');
      }
    } catch (e) { navigate('/programs'); }
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
    setTimeout(() => setIsJournalSaved(false), 3000);
  };

  const userDisplayName = currentUser ? getUserName(currentUser) : t('utils.user_name.guest');

  if (!program) return null;

  return (
    <>
      <SEOMeta title="Wellness Command Center | Aman AI" description="Confidential digital therapeutic dashboard." noIndex={true} />
      <PullToRefresh onRefresh={() => window.location.reload()}>
        <div className="min-h-screen py-10 px-4 lg:px-8">
          <div className="container mx-auto">
            {/* Forbes-Class Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8 animate-fade-in-up">
              <div>
                <h1 className="text-5xl md:text-6xl font-black text-base-900 dark:text-white leading-none tracking-tighter">
                  {getGreeting(t)}, <span className="text-primary-500">{userDisplayName}</span>
                </h1>
                <div className="flex items-center gap-3 mt-4">
                    <span className="px-3 py-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary-500/20">
                        {program.name} Journey
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-base-300"></span>
                    <span className="text-xs font-bold text-base-500 italic">Day {currentDay} of 90</span>
                </div>
              </div>
              <div className="bg-white/40 dark:bg-base-800/40 backdrop-blur-3xl p-5 rounded-[2.5rem] shadow-soft-lg border border-white/20 dark:border-base-700/30 flex items-center gap-8 group">
                <ProgressRing percentage={(currentDay/90)*100} day={currentDay} />
                <div className="border-l border-base-200 dark:border-base-700 h-16" />
                <div className="text-center pr-6">
                    <p className="text-4xl font-black text-primary-500 tracking-tighter group-hover:scale-110 transition-transform">{journalStreak}</p>
                    <p className="text-[10px] uppercase font-black text-base-400 tracking-widest mt-1">Streak</p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                {newMilestones.map(m => (
                    <div key={m.id} className="animate-enter bg-gradient-to-r from-primary-500 to-primary-600 text-white p-8 rounded-[2rem] shadow-2xl flex items-center gap-8 border-b-8 border-primary-700 relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 text-white/10 text-9xl font-black rotate-12 group-hover:rotate-45 transition-transform duration-1000 uppercase select-none">Top</div>
                        <span className="text-7xl filter drop-shadow-2xl">{m.icon}</span>
                        <div className="relative z-10">
                            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-white/70">Elite Milestone Unlocked</p>
                            <h2 className="text-3xl font-black tracking-tight mt-1">{m.title}</h2>
                            <div className="flex gap-4 mt-4">
                                <button onClick={() => {
                                    const seen = JSON.parse(localStorage.getItem(getScopedKey('seenMilestones')) || '[]');
                                    localStorage.setItem(getScopedKey('seenMilestones'), JSON.stringify([...seen, m.id]));
                                    setNewMilestones(prev => prev.filter(x => x.id !== m.id));
                                }} className="bg-white text-primary-600 font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-primary-50 transition-all">Dismiss</button>
                                <NavLink to="/analytics" className="bg-primary-700/30 backdrop-blur-md text-white border border-white/20 font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest hover:bg-primary-700 transition-all">View Story</NavLink>
                            </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <SponsorInsightCard moods={moodHistory} journalEntries={journalEntries} journalStreak={journalStreak} userName={userDisplayName} currentDay={currentDay} completedChallenges={completedChallengesCount} />
                    <ClinicalSyncCard moods={moodHistory} journals={journalEntries} programName={program.name} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-10">
                    <section className="bg-white/30 dark:bg-base-800/30 backdrop-blur-3xl p-8 rounded-[2rem] shadow-soft border border-white/20 dark:border-base-700/30">
                        <h2 className="text-xs font-black text-base-400 uppercase tracking-[0.3em] mb-6">Garden Evolution</h2>
                        <GrowthGarden day={currentDay} journalStreak={journalStreak} completedChallenges={completedChallengesCount} />
                    </section>
                </div>

                <section ref={journalSectionRef} className="bg-white/50 dark:bg-base-800/50 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-soft border border-white/20 dark:border-base-700/30">
                    <h2 className="text-3xl font-black text-base-900 dark:text-white tracking-tighter mb-8">Clinical Reflection</h2>
                    <textarea 
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        placeholder="Write your private thoughts here. Stored only on your device."
                        rows={5}
                        className="w-full p-6 border border-base-200 dark:border-base-700 rounded-3xl focus:ring-8 focus:ring-primary-500/10 bg-white/40 dark:bg-base-900/40 text-base-800 dark:text-white transition-all text-lg leading-relaxed"
                    />
                    <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-base-400 uppercase tracking-widest">End-to-End Local Encryption Active</span>
                        </div>
                        <button onClick={handleSaveJournal} className="w-full sm:w-auto bg-base-900 text-white dark:bg-base-100 dark:text-base-900 font-black py-4 px-12 rounded-2xl hover:bg-primary-500 hover:text-white transition-all shadow-xl hover:-translate-y-1 active:scale-95 text-xs uppercase tracking-[0.2em]">
                             {isJournalSaved ? 'Entry Secured ✓' : 'Lock Entry'}
                        </button>
                    </div>
                </section>
              </div>

              <div className="lg:col-span-4 h-[85vh] lg:sticky top-28">
                  <Chatbot key={selectedPersona} />
              </div>
            </div>
          </div>
        </div>
      </PullToRefresh>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-enter { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
};

export default DashboardPage;