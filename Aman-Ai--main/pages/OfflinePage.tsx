import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const OfflinePage: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
        <svg className="w-24 h-24 text-primary-400 dark:text-primary-500 mb-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M15 15h.01M9 15h.01M18 12h.01M6 12h.01M15 9h.01M9 9h.01"/>
        </svg>
        <h1 className="text-3xl font-bold text-base-800 dark:text-base-200">
            You're Currently Offline
        </h1>
        <p className="mt-4 text-lg text-base-600 dark:text-base-300 max-w-md mx-auto">
            It looks like you've lost your connection. Some features may be unavailable, but you can still access your dashboard and other cached content.
        </p>
        <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
        >
            Try Reloading
        </button>
    </div>
  );
};

export default OfflinePage;