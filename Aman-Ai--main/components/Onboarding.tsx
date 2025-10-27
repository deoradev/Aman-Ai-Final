import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import Logo from './Logo';

interface OnboardingProps {
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const { t } = useLocalization();
  const navigate = useNavigate();

  const handleNext = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const handleExplore = () => {
    onClose();
    navigate('/programs');
  };

  const handleSignup = () => {
    onClose();
    navigate('/profile');
  };

  const steps = [
    {
      icon: <Logo size="large" />,
      title: t('onboarding.welcome.title'),
      text: t('onboarding.welcome.text'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
      title: t('onboarding.programs.title'),
      text: t('onboarding.programs.text'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
      title: t('onboarding.ai.title'),
      text: t('onboarding.ai.text'),
    },
    {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      title: t('onboarding.tracking.title'),
      text: t('onboarding.tracking.text'),
    },
     {
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
      title: t('onboarding.cta.title'),
      text: t('onboarding.cta.text'),
    },
  ];

  const currentStepData = steps[step];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16 transition-opacity duration-300" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-soft-lg w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-enter">
        <div className="p-8 text-center">
            <div className="flex justify-center items-center h-24 text-primary-500 mb-6">
              {currentStepData.icon}
            </div>
          
            <h2 id="onboarding-title" className="text-2xl font-bold text-primary-500 mb-3">{currentStepData.title}</h2>
            <p className="text-base-600 dark:text-base-300 min-h-[72px]">{currentStepData.text}</p>
        </div>

        <div className="px-6 pb-6">
            <div className="flex justify-center items-center mb-6">
                {steps.map((_, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full mx-1 transition-colors ${i === step ? 'bg-primary-500' : 'bg-base-300 dark:bg-base-600'}`}></div>
                ))}
            </div>

            {step === steps.length - 1 ? (
                <div className="flex flex-col gap-3">
                    <button onClick={handleExplore} className="w-full bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors">
                        {t('onboarding.button.explore')}
                    </button>
                    <button onClick={handleSignup} className="w-full bg-base-800 text-white dark:text-base-900 dark:bg-base-200 font-bold py-3 px-6 rounded-lg hover:bg-base-700 dark:hover:bg-base-300 transition-colors">
                        {t('onboarding.button.signup')}
                    </button>
                </div>
            ) : (
                <div className="flex justify-between items-center">
                    <button onClick={handleBack} disabled={step === 0} className="px-5 py-2 rounded-lg text-sm font-medium text-base-600 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700 disabled:opacity-50 transition-colors">
                        {t('onboarding.button.back')}
                    </button>
                    <button onClick={handleNext} className="bg-primary-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-600 transition-colors">
                        {t('onboarding.button.next')}
                    </button>
                </div>
            )}
        </div>
        
        <div className="text-center pb-5">
            <button onClick={onClose} className="text-sm text-base-500 dark:text-base-400 hover:underline">
                {step === steps.length - 1 ? t('onboarding.button.finish') : t('onboarding.button.skip')}
            </button>
        </div>

      </div>
      <style>{`
        @keyframes enter {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-enter {
          animation: enter 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Onboarding;