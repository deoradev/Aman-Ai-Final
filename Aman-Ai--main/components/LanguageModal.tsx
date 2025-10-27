import React, { useState, useMemo } from 'react';
import { ALL_LANGUAGES } from '../constants';
import Logo from './Logo';
import { useLocalization } from '../hooks/useLocalization';

interface LanguageModalProps {
  onSelectLanguage: (language: string) => void;
}

const LanguageModal: React.FC<LanguageModalProps> = ({ onSelectLanguage }) => {
  const { t } = useLocalization();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchTerm) {
      return ALL_LANGUAGES;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return ALL_LANGUAGES.filter(lang =>
      lang.name.toLowerCase().includes(lowercasedFilter) ||
      lang.code.toLowerCase().includes(lowercasedFilter)
    );
  }, [searchTerm]);

  return (
    <div className="fixed inset-0 bg-base-900 bg-opacity-80 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16" role="dialog" aria-modal="true" aria-labelledby="language-modal-title">
      <div className="bg-white dark:bg-base-800 rounded-2xl shadow-soft-lg w-full max-w-2xl m-4 transform transition-all duration-300 scale-95 opacity-0 animate-enter flex flex-col max-h-[90vh]">
        <div className="p-6 md:p-8 text-center border-b border-base-200 dark:border-base-700">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <h1 id="language-modal-title" className="text-2xl md:text-3xl font-bold text-base-800 dark:text-base-200 mb-2">
            {t('language_modal.title')}
          </h1>
          <p className="text-base-600 dark:text-base-300 mb-6 text-lg">
            {t('language_modal.subtitle')}
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder={t('language_modal.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-base-300 dark:border-base-600 rounded-full bg-base-100 dark:bg-base-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
             <svg className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredLanguages.map(({ code, name }) => (
              <button
                key={code}
                onClick={() => onSelectLanguage(code)}
                className="w-full text-center py-3 px-2 border border-base-300 dark:border-base-600 rounded-lg text-base-700 dark:text-base-200 bg-base-50 dark:bg-base-700 hover:bg-primary-500 hover:text-white dark:hover:bg-primary-500 dark:hover:text-white transition-all duration-200 transform hover:scale-105"
              >
                <span className="font-semibold">{name}</span>
              </button>
            ))}
             {filteredLanguages.length === 0 && (
                <p className="col-span-full text-center text-base-500 dark:text-base-400 py-8">No languages found.</p>
            )}
          </div>
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

export default LanguageModal;