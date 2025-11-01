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
        <div className="fixed bottom-24 right-6 bg-primary-500 text-white p-4 rounded-xl shadow-soft-lg z-[100] max-w-sm animate-fade-in-up">
            <div className="flex items-start">
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-semibold">{t('dashboard.new_features_toast')}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={onClose} className="inline-flex text-primary-200 hover:text-white">
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};


const useDashboardLogic = () => {
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

  // Mood and Journal State
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isJournalSaved, setIsJournalSaved] = useState(false);
  const [hasJournaledToday, setHasJournaledToday] = useState(false);
  const [journalReflection, setJournalReflection] = useState<string | null>(null);

  // Goals State
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoalText, setNewGoalText] = useState('');
  const [editingGoal, setEditingGoal] = useState<{ id: number; text: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);

  // Persona State
  const [selectedPersona, setSelectedPersona] = useState<string>('therapist');

  // New Feature States
  const [suggestedResource, setSuggestedResource] = useState<Resource | null>(null);
  const [newMilestones, setNewMilestones] = useState<Milestone[]>([]);
  const [wellnessLog, setWellnessLog] = useState<WellnessEntry | null>(null);
  const [preventionPlan, setPreventionPlan] = useState<PreventionPlan | null>(null);
  const [showNewFeaturesToast, setShowNewFeaturesToast] = useState(false);


  useEffect(() => {
    try {
      const storedProgram = localStorage.getItem(getScopedKey('program'));
      const enrollmentDate = localStorage.getItem(getScopedKey('enrollmentDate'));
      const storedPersona = localStorage.getItem(getScopedKey('persona')) || 'therapist';
      const storedPlan = localStorage.getItem(getScopedKey('prevention-plan'));

      if (storedPlan) {
        setPreventionPlan(JSON.parse(storedPlan));
      }
      
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
        
        const journalStreak = calculateJournalStreak(journals);
        setCompletedChallengesCount(completedChallenges.length);
        setJournalEntriesCount(journals.length);
        setJournalStreak(journalStreak);

        const startDate = new Date(enrollmentDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - startDate.getTime());
        const day = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Milestone Logic
        const allMilestones = calculateMilestones({ currentDay: day, journalStreak, completedChallenges: completedChallenges.length });
        const seenMilestones: string[] = JSON.parse(localStorage.getItem(getScopedKey('seenMilestones')) || '[]');
        const unseen = allMilestones.filter(m => !seenMilestones.includes(m.id));
        if (unseen.length > 0) {
            setNewMilestones(unseen);
        }

        if (day > 90) {
            setIsProgramCompleted(true);
        } else {
            setIsProgramCompleted(false);
            setCurrentDay(day);
            const todayStr = new Date().toISOString().split('T')[0];

            const challenge = parsedProgram.dailyChallenges.find(c => c.day === day);
            setDailyChallenge(challenge || null);
            setIsChallengeCompleted(completedChallenges.includes(day));
            
            const todaysMood = moods.find(m => m.date === todayStr);
            if (todaysMood) setSelectedMood(todaysMood.mood);

            const todaysWellness = wellnessHistory.find(w => w.date === todayStr);
            setWellnessLog(todaysWellness || { date: todayStr, sleepHours: 8, activityLevel: 'moderate' });
            
            const todaysJournal = journals.find(j => j.date === todayStr);
            if (todaysJournal) {
              setJournalText(todaysJournal.text);
              setHasJournaledToday(true);
            } else {
              setHasJournaledToday(false);
            }

            const storedGoals = localStorage.getItem(getScopedKey('goals'));
            if (storedGoals) {
                setGoals(JSON.parse(storedGoals));
            }
        }
      } else {
        navigate('/programs');
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
      localStorage.removeItem(getScopedKey('program'));
      localStorage.removeItem(getScopedKey('enrollmentDate'));
      navigate('/programs');
    }
    
    // Check for new features toast
    const hasSeenToast = localStorage.getItem(NEW_FEATURES_FLAG);
    if (!hasSeenToast) {
        setShowNewFeaturesToast(true);
    }

  }, [navigate, language, getScopedKey, currentUser, t]);

  const handleCompleteChallenge = () => {
    if (program && dailyChallenge) {
      const key = getScopedKey('completedChallenges');
      const completed: number[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!completed.includes(dailyChallenge.day)) {
          completed.push(dailyChallenge.day);
          localStorage.setItem(key, JSON.stringify(completed));
          setCompletedChallengesCount(completed.length);
      }
      setIsChallengeCompleted(true);
    }
  };

  const handleMoodSelect = (mood: MoodEntry['mood']) => {
    setSelectedMood(mood);
    const todayStr = new Date().toISOString().split('T')[0];
    const key = getScopedKey('mood-history');
    const moods: MoodEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
    const newMoods = moods.filter(m => m.date !== todayStr);
    newMoods.push({ date: todayStr, mood });
    localStorage.setItem(key, JSON.stringify(newMoods));
    setMoodHistory(newMoods);
  }

  const handleSaveJournal = async () => {
    if (journalText.trim() === '' || !program) return;
    setJournalReflection(null); // Clear previous reflection

    const todayStr = new Date().toISOString().split('T')[0];
    const key = getScopedKey('journal-entries');
    const journals: JournalEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
    const newJournals = journals.filter(j => j.date !== todayStr);
    newJournals.push({ date: todayStr, text: journalText });
    localStorage.setItem(key, JSON.stringify(newJournals));
    setJournalEntries(newJournals);
    setJournalEntriesCount(newJournals.length);
    setJournalStreak(calculateJournalStreak(newJournals));
    setIsJournalSaved(true);
    setHasJournaledToday(true);

    // Get AI Reflection
    const reflection = await getJournalReflection(journalText, language);
    if (reflection) {
        setJournalReflection(reflection);
    }

    setSuggestedResource(null);
    const resource = await getSuggestedResource(journalText, program.name, RESOURCES, language);
    if (resource) {
        setSuggestedResource(resource);
    }

    setTimeout(() => setIsJournalSaved(false), 2000);
  }
  
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoalText.trim() && program) {
        const newGoal: Goal = { id: Date.now(), text: newGoalText.trim(), completed: false };
        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        localStorage.setItem(getScopedKey('goals'), JSON.stringify(updatedGoals));
        setNewGoalText('');
    }
  };

  const handleToggleGoal = (id: number) => {
    if (program) {
        const updatedGoals = goals.map(goal => goal.id === id ? { ...goal, completed: !goal.completed } : goal);
        setGoals(updatedGoals);
        localStorage.setItem(getScopedKey('goals'), JSON.stringify(updatedGoals));
    }
  };

  const handleEditClick = (goal: Goal) => {
    setEditingGoal({ id: goal.id, text: goal.text });
  };
  
  const handleCancelEdit = () => {
    setEditingGoal(null);
  };
  
  const handleSaveEdit = () => {
    if (editingGoal && editingGoal.text.trim()) {
      const updatedGoals = goals.map(g =>
        g.id === editingGoal.id ? { ...g, text: editingGoal.text.trim() } : g
      );
      setGoals(updatedGoals);
      localStorage.setItem(getScopedKey('goals'), JSON.stringify(updatedGoals));
      setEditingGoal(null);
    }
  };

  const handleDeleteGoal = (id: number) => {
    setGoalToDelete(id);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDeleteGoal = () => {
    if (program && goalToDelete !== null) {
      const updatedGoals = goals.filter(goal => goal.id !== goalToDelete);
      setGoals(updatedGoals);
      localStorage.setItem(getScopedKey('goals'), JSON.stringify(updatedGoals));
    }
    setGoalToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const cancelDeleteGoal = () => {
    setGoalToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handlePersonaChange = (personaId: string) => {
    setSelectedPersona(personaId);
    localStorage.setItem(getScopedKey('persona'), personaId);
  };
  
  const dismissMilestone = (milestoneId: string) => {
    const key = getScopedKey('seenMilestones');
    const seen: string[] = JSON.parse(localStorage.getItem(key) || '[]');
    seen.push(milestoneId);
    localStorage.setItem(key, JSON.stringify(seen));
    setNewMilestones(prev => prev.filter(m => m.id !== milestoneId));
  }

  const handleSaveWellness = () => {
      if (!wellnessLog) return;
      const todayStr = new Date().toISOString().split('T')[0];
      const key = getScopedKey('wellness-log');
      const logs: WellnessEntry[] = JSON.parse(localStorage.getItem(key) || '[]');
      const newLogs = logs.filter(l => l.date !== todayStr);
      newLogs.push(wellnessLog);
      localStorage.setItem(key, JSON.stringify(newLogs));
      // You could add a "saved" confirmation state here if desired
  };

  const handleDismissNewFeatures = () => {
    localStorage.setItem(NEW_FEATURES_FLAG, 'true');
    setShowNewFeaturesToast(false);
  }

  return {
    t, currentUser, program, currentDay, dailyChallenge, isChallengeCompleted,
    isProgramCompleted, completedChallengesCount, journalEntriesCount, journalStreak, selectedMood,
    moodHistory, journalText, setJournalText, isJournalSaved, hasJournaledToday, journalReflection, goals, newGoalText, setNewGoalText,
    editingGoal, setEditingGoal, selectedPersona, suggestedResource, journalEntries,
    setSuggestedResource, newMilestones, dismissMilestone, wellnessLog, setWellnessLog, preventionPlan, showNewFeaturesToast,
    isDeleteModalOpen, 
    handleCompleteChallenge, handleMoodSelect, handleSaveJournal, handleSaveWellness,
    handleAddGoal, handleToggleGoal, handleEditClick, handleCancelEdit, handleSaveEdit, handleDeleteGoal, confirmDeleteGoal, cancelDeleteGoal,
    handlePersonaChange, handleDismissNewFeatures, navigate
  };
};

const ProgramCompletionView: React.FC<{
    program: Program;
    completedChallenges: number;
    journalEntriesCount: number;
}> = ({ program, completedChallenges, journalEntriesCount }) => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white dark:bg-base-800 p-8 rounded-2xl shadow-soft-lg text-center border-t-8 border-accent-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-accent-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-12v4m-2-2h4m5 4v4m-2-2h4M12 3v18" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2z" transform="rotate(-15 12 12)" />
                </svg>
                <h1 className="text-3xl font-bold text-primary-500 mt-4">{t('dashboard.completion.title')}</h1>
                <p className="mt-4 text-base-600 dark:text-base-300">
                    {t('dashboard.completion.subtitle', { programName: program.name })}
                </p>

                <div className="mt-8 bg-base-50 dark:bg-base-700/50 p-6 rounded-xl">
                    <h2 className="text-xl font-semibold text-primary-500 mb-4">{t('dashboard.completion.summary_title')}</h2>
                    <div className="flex justify-around text-lg">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-base-900 dark:text-white">{completedChallenges}</p>
                            <p className="text-base-600 dark:text-base-400 text-sm">{t('dashboard.completion.challenges_completed')}</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-base-900 dark:text-white">{journalEntriesCount}</p>
                            <p className="text-base-600 dark:text-base-400 text-sm">{t('dashboard.completion.journal_entries')}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/programs')}
                        className="bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors"
                    >
                        {t('dashboard.completion.button_new_program')}
                    </button>
                    <button
                        onClick={() => navigate('/analytics')}
                        className="bg-base-800 text-white font-bold py-3 px-6 rounded-lg hover:bg-base-700 dark:bg-base-200 dark:text-base-900 dark:hover:bg-base-300 transition-colors"
                    >
                        {t('dashboard.completion.button_review_journey')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuggestedResourceCard: React.FC<{ resource: Resource, onClose: () => void }> = ({ resource, onClose }) => {
    const { t } = useLocalization();
    return (
        <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft border-l-4 border-primary-500 relative">
             <button onClick={onClose} className="absolute top-2 right-2 p-1 text-base-400 hover:text-base-600 dark:hover:text-base-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            <h2 className="text-xl font-bold text-primary-500 mb-2">{t('dashboard.suggested_resource.title')}</h2>
            <div className="bg-base-50/50 dark:bg-base-700/30 p-4 rounded-lg">
                <p className="font-semibold">{resource.title}</p>
                <p className="text-sm text-base-600 dark:text-base-300 mt-1">{resource.description}</p>
                <a href={resource.link} className="text-sm font-bold text-primary-600 hover:underline mt-2 inline-block">{t('resources.read_more')}</a>
            </div>
        </section>
    );
}

const MilestoneAlert: React.FC<{ milestone: Milestone; onDismiss: () => void; }> = ({ milestone, onDismiss }) => {
    const { t } = useLocalization();
    return (
        <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-4 rounded-xl shadow-soft border-l-4 border-accent-500 flex items-start gap-4">
            <span className="text-4xl">{milestone.icon}</span>
            <div className="flex-grow">
                <h2 className="text-lg font-bold text-primary-500">{t('dashboard.milestone_unlocked.title')}</h2>
                <p className="font-semibold text-base-800 dark:text-base-200">{milestone.title}</p>
                <p className="text-sm text-base-600 dark:text-base-300">{milestone.description}</p>
            </div>
            <button onClick={onDismiss} className="text-sm text-base-500 hover:text-base-800 dark:hover:text-base-200 font-semibold">{t('dashboard.milestone_unlocked.dismiss')}</button>
        </div>
    );
}

const WellnessLogCard: React.FC<{
    log: WellnessEntry;
    onUpdate: (log: WellnessEntry) => void;
    onSave: () => void;
}> = ({ log, onUpdate, onSave }) => {
    const { t } = useLocalization();
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        onSave();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    }
    
    return (
        <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
            <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('dashboard.wellness.title')}</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-base-700 dark:text-base-300 mb-1">{t('dashboard.wellness.sleep')}: {log.sleepHours}h</label>
                    <input
                        type="range"
                        min="0"
                        max="16"
                        step="0.5"
                        value={log.sleepHours}
                        onChange={(e) => onUpdate({ ...log, sleepHours: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-base-200 rounded-lg appearance-none cursor-pointer dark:bg-base-700"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-base-700 dark:text-base-300 mb-2">{t('dashboard.wellness.activity')}</label>
                    <div className="flex justify-between gap-2">
                        {(['low', 'moderate', 'high'] as const).map(level => (
                            <button
                                key={level}
                                onClick={() => onUpdate({ ...log, activityLevel: level })}
                                className={`w-full py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${log.activityLevel === level ? 'bg-primary-500 text-white border-primary-500' : 'bg-transparent border-base-300 dark:border-base-600 text-base-600 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}
                            >
                                {t(`dashboard.wellness.activity_${level}`)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 text-right">
                <button
                    onClick={handleSave}
                    className="bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors min-w-[120px]"
                >
                    {saved ? t('dashboard.wellness.saved') : t('dashboard.wellness.save')}
                </button>
            </div>
        </section>
    );
};

const PreventionPlanCard: React.FC<{ plan: PreventionPlan | null }> = ({ plan }) => {
    const { t } = useLocalization();
    const navigate = useNavigate();

    return (
        <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
            <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('dashboard.prevention_plan.title')}</h2>
            {plan ? (
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-base-800 dark:text-base-200">{t('dashboard.prevention_plan.my_why')}</h3>
                        <p className="text-base-600 dark:text-base-400 italic">"{plan.myWhy}"</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-base-800 dark:text-base-200">{t('dashboard.prevention_plan.top_triggers')}</h3>
                        <ul className="list-disc list-inside text-base-600 dark:text-base-400">
                            {plan.triggers.slice(0, 2).map((trigger, i) => <li key={i}>{trigger}</li>)}
                        </ul>
                    </div>
                    <button onClick={() => navigate('/prevention-plan')} className="w-full mt-4 bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-2 px-6 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors">
                        {t('dashboard.prevention_plan.review_button')}
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-base-600 dark:text-base-300 mb-4">{t('dashboard.prevention_plan.description')}</p>
                    <button onClick={() => navigate('/prevention-plan')} className="w-full bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors">
                        {t('dashboard.prevention_plan.create_button')}
                    </button>
                </div>
            )}
        </section>
    );
};


const DashboardPage: React.FC = () => {
  const {
    t, currentUser, program, currentDay, dailyChallenge, isChallengeCompleted,
    isProgramCompleted, completedChallengesCount, journalEntriesCount, journalStreak, selectedMood,
    moodHistory, journalText, setJournalText, isJournalSaved, hasJournaledToday, journalReflection, goals, newGoalText, setNewGoalText,
    editingGoal, setEditingGoal, selectedPersona, suggestedResource, journalEntries,
    setSuggestedResource, newMilestones, dismissMilestone, wellnessLog, setWellnessLog, preventionPlan, showNewFeaturesToast,
    isDeleteModalOpen, 
    handleCompleteChallenge, handleMoodSelect, handleSaveJournal, handleSaveWellness,
    handleAddGoal, handleToggleGoal, handleEditClick, handleCancelEdit, handleSaveEdit, handleDeleteGoal, confirmDeleteGoal, cancelDeleteGoal,
    handlePersonaChange, handleDismissNewFeatures, navigate
  } = useDashboardLogic();
  
  const journalSectionRef = useRef<HTMLDivElement>(null);
  const journalTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartJournal = () => {
    journalSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Add a small delay to ensure the scroll has finished before focusing
    setTimeout(() => {
        journalTextareaRef.current?.focus();
    }, 500);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!program) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>{t('dashboard.loading')}</p>
      </div>
    );
  }
  
  if (isProgramCompleted) {
      return <ProgramCompletionView 
                program={program} 
                completedChallenges={completedChallengesCount} 
                journalEntriesCount={journalEntriesCount}
              />;
  }

  const userDisplayName = currentUser ? getUserName(currentUser) : t('utils.user_name.guest');

  return (
    <>
    {showNewFeaturesToast && <NewFeaturesToast onClose={handleDismissNewFeatures} />}
    <SEOMeta
        title="Your Dashboard | AMAN AI"
        description="Track your recovery progress, complete daily challenges, and chat with your AI companion."
        noIndex={true}
    />
    <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={cancelDeleteGoal}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        text={t('dashboard.goals.delete_confirm')}
        confirmText="Delete"
        cancelText="Cancel"
        variant="warning"
    />
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">{getGreeting(t)}, {userDisplayName}!</h1>
          <p className="text-lg text-base-600 dark:text-base-400">{t('dashboard.program_status', { day: currentDay, programName: program.name })}</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">

             {newMilestones.map(milestone => (
                <MilestoneAlert key={milestone.id} milestone={milestone} onDismiss={() => dismissMilestone(milestone.id)} />
             ))}
            
            <TodayFocus
                dailyChallenge={dailyChallenge}
                isChallengeCompleted={isChallengeCompleted}
                onCompleteChallenge={handleCompleteChallenge}
                selectedMood={selectedMood}
                onMoodSelect={handleMoodSelect}
                onStartJournal={handleStartJournal}
            />

            <SponsorInsightCard 
                moods={moodHistory} 
                journalEntries={journalEntries}
                journalStreak={journalStreak}
                userName={userDisplayName}
                currentDay={currentDay}
                completedChallenges={completedChallengesCount}
            />

            <PreventionPlanCard plan={preventionPlan} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
                    <h2 className="text-xl font-bold text-primary-500 mb-2">{t('dashboard.garden.title')}</h2>
                    <p className="text-xs text-base-500 dark:text-base-400 mb-2">{t('dashboard.garden.description')}</p>
                    <GrowthGarden 
                        day={currentDay}
                        journalStreak={journalStreak}
                        completedChallenges={completedChallengesCount}
                    />
                </section>
                 <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft flex flex-col justify-center">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-primary-500 mb-2">{t('analytics.streak.title')}</h2>
                        <p className="text-6xl font-bold text-primary-500">{journalStreak}</p>
                        <p className="text-lg text-base-500 dark:text-base-400">{t('analytics.streak.days')}</p>
                    </div>
                </section>
            </div>
            
            {wellnessLog && <WellnessLogCard log={wellnessLog} onUpdate={setWellnessLog} onSave={handleSaveWellness} />}
            
            {suggestedResource && (
                <SuggestedResourceCard 
                    resource={suggestedResource}
                    onClose={() => setSuggestedResource(null)}
                />
            )}

             <section ref={journalSectionRef} className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
                    <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('dashboard.journal.title')}</h2>
                    {!hasJournaledToday && journalText.trim() === '' && (
                        <p className="text-sm text-base-600 dark:text-base-400 mb-2 italic">{t('dashboard.journal.reminder')}</p>
                    )}
                    <textarea 
                        ref={journalTextareaRef}
                        value={journalText}
                        onChange={(e) => setJournalText(e.target.value)}
                        placeholder={t('dashboard.journal.placeholder')}
                        rows={3}
                        className="w-full p-2 border border-base-300 dark:border-base-600 rounded-md focus:ring-primary-500 focus:border-primary-500 bg-white/50 dark:bg-base-700/50 text-base-800 dark:text-white"
                    />
                    <div className="mt-4 text-right">
                        <button onClick={handleSaveJournal} className="bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center min-w-[120px]">
                             {isJournalSaved ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    {t('dashboard.journal.saved')}
                                </>
                             ) : t('dashboard.journal.save')}
                        </button>
                    </div>
                    {journalReflection && (
                        <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-lg border-l-4 border-primary-400" aria-live="polite">
                            <p className="text-sm italic text-primary-800 dark:text-primary-200">{journalReflection}</p>
                        </div>
                    )}
                </section>

            <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
                <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('dashboard.goals.title')}</h2>
                <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
                    <input 
                        type="text"
                        value={newGoalText}
                        onChange={(e) => setNewGoalText(e.target.value)}
                        placeholder={t('dashboard.goals.placeholder')}
                        className="flex-grow px-3 py-2 bg-base-100 dark:bg-base-700 text-base-800 dark:text-white border border-base-300 dark:border-base-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button type="submit" className="bg-primary-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors">{t('dashboard.goals.add')}</button>
                </form>
                <ul className="space-y-2">
                    {goals.map(goal => (
                        <li key={goal.id} className="bg-base-50/50 dark:bg-base-700/30 p-3 rounded-md min-h-[56px] flex items-center">
                            {editingGoal?.id === goal.id ? (
                                <div className="flex items-center gap-2 w-full">
                                    <input 
                                        type="text"
                                        value={editingGoal.text}
                                        onChange={(e) => setEditingGoal({ ...editingGoal, text: e.target.value })}
                                        className="flex-grow px-3 py-2 bg-white dark:bg-base-600 text-base-800 dark:text-white border border-base-300 dark:border-base-500 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit();
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                        autoFocus
                                    />
                                    <button onClick={handleSaveEdit} className="p-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors" aria-label={t('dashboard.goals.save')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={handleCancelEdit} className="p-2 bg-base-500 text-white rounded-lg hover:bg-base-600 transition-colors" aria-label={t('dashboard.goals.cancel')}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center flex-grow mr-4">
                                        <input 
                                            type="checkbox" 
                                            checked={goal.completed} 
                                            onChange={() => handleToggleGoal(goal.id)} 
                                            className="h-5 w-5 rounded text-primary-500 focus:ring-primary-500 flex-shrink-0" 
                                            aria-labelledby={`goal-text-${goal.id}`}
                                        />
                                        <span id={`goal-text-${goal.id}`} className={`ml-3 text-base-700 dark:text-base-300 break-all ${goal.completed ? 'line-through text-base-500 dark:text-base-500' : ''}`}>{goal.text}</span>
                                    </div>
                                    <div className="flex items-center flex-shrink-0 space-x-1">
                                        <button onClick={() => handleEditClick(goal)} className="text-base-500 dark:text-base-400 hover:text-primary-500 dark:hover:text-primary-400 p-2 rounded-full" aria-label={t('dashboard.goals.edit')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDeleteGoal(goal.id)} className="text-base-500 dark:text-base-400 hover:text-warning-500 dark:hover:text-warning-400 p-2 rounded-full" aria-label="Delete goal">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
            
            <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
                <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('dashboard.progress_title')}</h2>
                <div className="w-full bg-base-200 dark:bg-base-700 rounded-full h-4">
                    <div 
                        className="bg-primary-500 h-4 rounded-full" 
                        style={{ width: `${(currentDay / 90) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm text-base-600 dark:text-base-400 mt-2">
                    <span>{t('dashboard.progress_day_1')}</span>
                    <span>{t('dashboard.progress_day_current', { day: currentDay })}</span>
                    <span>{t('dashboard.progress_day_90')}</span>
                </div>
            </section>

            <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-xl shadow-soft">
                <h2 className="text-2xl font-bold text-primary-500 mb-2">{t('dashboard.persona.title')}</h2>
                <p className="text-base-600 dark:text-base-300 mb-4">{t('dashboard.persona.description')}</p>
                <div className="space-y-2">
                    {PERSONAS.map(persona => (
                        <label key={persona.id} className="flex items-center p-3 bg-base-50/50 dark:bg-base-700/30 rounded-lg cursor-pointer hover:bg-base-100 dark:hover:bg-base-700 border-2 border-transparent has-[:checked]:border-primary-500">
                            <input
                                type="radio"
                                name="persona"
                                value={persona.id}
                                checked={selectedPersona === persona.id}
                                onChange={() => handlePersonaChange(persona.id)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="ml-3">
                                <p className="font-semibold text-base-800 dark:text-base-200">{persona.name}</p>
                                <p className="text-sm text-base-600 dark:text-base-400">{persona.description}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </section>
          </div>
          
          <aside className="lg:col-span-1 lg:sticky top-24 flex flex-col max-h-[80vh]">
            <Chatbot key={selectedPersona} />
          </aside>
        </div>

        <div className="mt-12 text-center">
            <NavLink to="/programs" className="text-primary-600 hover:underline">
                {t('dashboard.change_program_link')}
            </NavLink>
        </div>
      </div>
    </div>
    </PullToRefresh>
    </>
  );
};

export default DashboardPage;