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
    <section className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md p-6 rounded-2xl shadow-soft border border-base-200 dark:border-base-700">
      <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('dashboard.today_focus.title')}</h2>
      
      <div className="space-y-6">
        {/* Step 1: Mood */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg">1</div>
          <div className="flex-grow">
            <h3 className="font-semibold text-base-800 dark:text-base-200">{t('dashboard.mood.title')}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {(['happy', 'neutral', 'sad'] as const).map(mood => (
                <button
                  key={mood}
                  onClick={() => onMoodSelect(mood)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border-2 transition-colors ${selectedMood === mood ? 'bg-base-800 border-base-800 text-white dark:bg-base-200 dark:border-base-200 dark:text-base-900' : 'border-base-300 dark:border-base-600 text-base-600 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}
                >
                  {t(`dashboard.mood.${mood}`)}
                </button>
              ))}
            </div>
             <div className="mt-3">
                <NavLink to="/analytics" className="text-sm font-bold text-primary-600 hover:underline">
                    {t('dashboard.today_focus.view_analytics_link')} &rarr;
                </NavLink>
            </div>
          </div>
        </div>

        {/* Step 2: Challenge */}
        {dailyChallenge && (
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg">2</div>
                <div className="flex-grow">
                    <h3 className="font-semibold text-base-800 dark:text-base-200">{t('dashboard.today_focus.challenge_title')} {dailyChallenge.title}</h3>
                    <p className="text-sm text-base-600 dark:text-base-300 mt-1">{dailyChallenge.task}</p>
                    <div className="mt-3">
                        <button 
                            onClick={onCompleteChallenge}
                            disabled={isChallengeCompleted}
                            className="bg-base-800 text-white dark:bg-base-200 dark:text-base-900 font-bold py-2 px-5 rounded-lg text-sm transition-colors disabled:bg-base-300 dark:disabled:bg-base-600 dark:disabled:text-base-400 disabled:cursor-not-allowed hover:bg-base-700 dark:hover:bg-base-300"
                        >
                            {isChallengeCompleted ? t('dashboard.challenge_button.completed') : t('dashboard.challenge_button.complete')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Step 3: Journal */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-lg">3</div>
          <div>
            <h3 className="font-semibold text-base-800 dark:text-base-200">{t('dashboard.today_focus.journal_title')}</h3>
            <p className="text-sm text-base-600 dark:text-base-300 mt-1">{t('dashboard.today_focus.journal_prompt')}</p>
            <button onClick={onStartJournal} className="mt-3 text-sm font-bold text-primary-600 hover:underline">
              {t('dashboard.today_focus.journal_button')} &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(TodayFocus);