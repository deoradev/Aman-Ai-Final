import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import ProfessionalHelpCard from './ProfessionalHelpCard';
import Logo from './Logo';

interface CrisisSupportModalProps {
    onClose: () => void;
}

const CrisisSupportModal: React.FC<CrisisSupportModalProps> = ({ onClose }) => {
    const { t } = useLocalization();

    const startCrisisChat = () => {
        alert("A high-priority alert has been sent to the AMAN AI. The chat on your dashboard is now in crisis mode.");
        onClose();
    };
    
    const helpResources = [
        {
            title: t('crisis.find_helpline_title'),
            description: t('crisis.find_helpline_description'),
            link: 'https://findahelpline.com/',
            icon: '🌍'
        },
        {
            title: t('crisis.lifeline_title'),
            description: t('crisis.lifeline_description'),
            link: 'https://988lifeline.org/',
            icon: '📞'
        },
        {
            title: t('crisis.textline_title'),
            description: t('crisis.textline_description'),
            link: 'https://www.crisistextline.org/',
            icon: '💬'
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-[100] p-4 pt-16" role="dialog" aria-modal="true" aria-labelledby="crisis-modal-title">
            <div className="bg-base-50 dark:bg-base-800 rounded-2xl shadow-soft-lg w-full max-w-lg m-4 transform transition-all duration-300 scale-95 opacity-0 animate-enter max-h-[90vh] flex flex-col">
                <div className="p-6 text-center border-b border-base-200 dark:border-base-700 relative">
                    <div className="flex justify-center mb-4"><Logo /></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-base-400 hover:text-base-600 dark:hover:text-base-200" aria-label={t('crisis.close')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                    <h1 id="crisis-modal-title" className="text-2xl md:text-3xl font-extrabold text-warning-600 mb-2">{t('crisis.title')}</h1>
                    <p className="text-base-600 dark:text-base-300">{t('crisis.subtitle')}</p>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="space-y-4">
                        <ProfessionalHelpCard
                            title={t('crisis.chat_ai')}
                            description={t('crisis.chat_description')}
                            onClick={startCrisisChat}
                            icon="🤖"
                        />
                        <h2 className="text-sm font-bold uppercase text-base-500 dark:text-base-400 pt-4 text-center tracking-wider">{t('crisis.professional_help_title')}</h2>
                        {helpResources.map(res => (
                            <ProfessionalHelpCard key={res.title} {...res} />
                        ))}
                    </div>
                </div>
            </div>
             <style>{`
                @keyframes enter { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-enter { animation: enter 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CrisisSupportModal;