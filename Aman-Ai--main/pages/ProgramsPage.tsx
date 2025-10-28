import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { PROGRAMS } from '../constants';
import { Program } from '../types';
import SEOMeta from '../components/SEOMeta';
import { getUserName } from '../utils';

const UPI_ID = '8800685335@pthdfc';
const QR_CODE_URL = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${UPI_ID}&pn=AMAN%20AI%20Foundation&cu=INR`;

const SOLANA_ADDRESS = '3M7txfqKNjWcofs9SNW1Aw6FKSqxDmHGFeh5UgUYgPaf';
const SOLANA_QR_CODE_BASE64 = 'data:image/jpeg;base64,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';

interface CertificateData {
    name: string;
    amount: string;
    message: string;
    date: string;
    method: 'UPI' | 'Crypto';
}

const Modal: React.FC<{
    onClose: () => void;
    children: React.ReactNode;
}> = ({ onClose, children }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
        <div className="bg-base-50 dark:bg-base-800 rounded-2xl shadow-soft-lg max-w-md w-full relative m-4 transform transition-all duration-300 scale-95 opacity-0 animate-enter">
            <button onClick={onClose} className="absolute top-3 right-3 p-1 text-base-400 hover:text-base-600 dark:hover:text-base-200" aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
            {children}
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

const DonationContent: React.FC<{ onDonated: (method: 'UPI' | 'Crypto') => void, onSkip: () => void }> = ({ onDonated, onSkip }) => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState<'upi' | 'crypto'>('upi');
  const [isUpiCopied, setIsUpiCopied] = useState(false);
  const [isSolCopied, setIsSolCopied] = useState(false);

  const handleUpiCopy = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setIsUpiCopied(true);
      setTimeout(() => setIsUpiCopied(false), 2000);
    });
  };
  
  const handleSolCopy = () => {
    navigator.clipboard.writeText(SOLANA_ADDRESS).then(() => {
      setIsSolCopied(true);
      setTimeout(() => setIsSolCopied(false), 2000);
    });
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-primary-500 mb-2">{t('programs.modal.donate.title')}</h2>
      <p className="text-base-600 dark:text-base-300 mb-6">{t('programs.modal.donate.text')}</p>

      <div className="flex justify-center mb-6 border-b border-base-200 dark:border-base-700">
        <button
          onClick={() => setActiveTab('upi')}
          className={`px-6 py-2 text-sm font-semibold transition-colors ${activeTab === 'upi' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-base-500 hover:text-base-700'}`}
        >
          {t('programs.modal.donate.upi_tab')}
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`px-6 py-2 text-sm font-semibold transition-colors ${activeTab === 'crypto' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-base-500 hover:text-base-700'}`}
        >
          {t('programs.modal.donate.crypto_tab')}
        </button>
      </div>

      {activeTab === 'upi' && (
        <div className="animate-fade-in">
          <div className="bg-base-100 dark:bg-base-700/50 p-4 rounded-lg mb-4">
            <label className="text-sm font-semibold text-base-600 dark:text-base-300">{t('programs.modal.donate.upi_label')}</label>
            <div className="flex items-center justify-center gap-2 mt-1">
                <p className="font-mono text-lg text-primary-600 dark:text-primary-300">{UPI_ID}</p>
                <button onClick={handleUpiCopy} className={`px-3 py-1 text-xs font-semibold rounded-full ${isUpiCopied ? 'bg-accent-500 text-white' : 'bg-base-200 dark:bg-base-600 text-base-700 dark:text-base-200'}`}>
                    {isUpiCopied ? t('programs.modal.donate.copied_button') : t('programs.modal.donate.copy_button')}
                </button>
            </div>
          </div>
          <p className="text-sm text-base-500 dark:text-base-400 mb-2">{t('programs.modal.donate.scan_qr')}</p>
          <div className="flex justify-center items-center bg-white p-2 rounded-lg w-[196px] h-[196px] mx-auto">
            <img src={QR_CODE_URL} alt="UPI QR Code" width="180" height="180" />
          </div>
        </div>
      )}

      {activeTab === 'crypto' && (
         <div className="animate-fade-in">
          <div className="bg-base-100 dark:bg-base-700/50 p-4 rounded-lg mb-4">
            <label className="text-sm font-semibold text-base-600 dark:text-base-300">{t('programs.modal.donate.sol_address_label')}</label>
            <div className="flex items-center justify-center gap-2 mt-1 flex-wrap break-all">
                <p className="font-mono text-md text-primary-600 dark:text-primary-300">{SOLANA_ADDRESS}</p>
                <button onClick={handleSolCopy} className={`px-3 py-1 text-xs font-semibold rounded-full ${isSolCopied ? 'bg-accent-500 text-white' : 'bg-base-200 dark:bg-base-600 text-base-700 dark:text-base-200'}`}>
                    {isSolCopied ? t('programs.modal.donate.copied_button') : t('programs.modal.donate.copy_button')}
                </button>
            </div>
          </div>
          <p className="text-sm text-base-500 dark:text-base-400 mb-2">{t('programs.modal.donate.sol_scan_qr')}</p>
          <div className="flex justify-center items-center bg-white p-2 rounded-lg w-[196px] h-[196px] mx-auto">
            <img src={SOLANA_QR_CODE_BASE64} alt="Solana QR Code" width="180" height="180" />
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-base-100 dark:bg-base-700/50 rounded-lg text-sm text-base-600 dark:text-base-300 border border-base-200 dark:border-base-700">
        <p>
            {t('programs.modal.donate.proof_text_start')}{' '}
            <a 
                href={`mailto:officialamanfoundation@gmail.com?subject=Donation%20Proof`}
                className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
                officialamanfoundation@gmail.com
            </a>
            . {t('programs.modal.donate.proof_text_end')}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => onDonated(activeTab === 'upi' ? 'UPI' : 'Crypto')} className="w-full px-4 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600">
          {t('programs.modal.donate.confirm_button')}
        </button>
        <button onClick={onSkip} className="w-full text-sm font-semibold text-base-600 dark:text-base-300 hover:underline">
          {t('programs.modal.donate.skip_button')}
        </button>
      </div>
      <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

const ConfirmationContent: React.FC<{ programName: string; onConfirm: () => void; onClose: () => void; }> = ({ programName, onConfirm, onClose }) => {
  const { t } = useLocalization();
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('programs.modal.title')}</h2>
      <p className="text-base-600 dark:text-base-300 mb-6">{t('programs.modal.text', { programName })}</p>
      <div className="flex justify-end space-x-4">
        <button onClick={onClose} className="px-4 py-2 bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-500">
          {t('programs.modal.cancel')}
        </button>
        <button onClick={onConfirm} className="px-4 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600">
          {t('programs.modal.confirm')}
        </button>
      </div>
    </div>
  );
};

const LoginPromptContent: React.FC<{ onClose: () => void; onLogin: () => void; }> = ({ onClose, onLogin }) => {
  const { t } = useLocalization();
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-primary-500 mb-4">{t('programs.login_prompt.title')}</h2>
      <p className="text-base-600 dark:text-base-300 mb-6">{t('programs.login_prompt.text')}</p>
      <div className="flex justify-center space-x-4">
        <button onClick={onClose} className="px-6 py-2 bg-base-200 dark:bg-base-600 text-base-800 dark:text-base-200 rounded-lg hover:bg-base-300 dark:hover:bg-base-500">
          {t('programs.login_prompt.cancel')}
        </button>
        <button onClick={onLogin} className="px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600">
          {t('programs.login_prompt.login_button')}
        </button>
      </div>
    </div>
  );
};

const CertificateSVG: React.FC<{ data: CertificateData }> = ({ data }) => {
    const { t } = useLocalization();

    const recognitionText = t('certificate.recognition_text', { amount: data.amount, method: data.method });
    const words = recognitionText.split(' ');
    const lines = words.reduce((acc, word) => {
        if (acc.length === 0) return [word];
        let lastLine = acc[acc.length - 1];
        if (lastLine.length + word.length + 1 > 70) {
            acc.push(word);
        } else {
            acc[acc.length - 1] = lastLine + ' ' + word;
        }
        return acc;
    }, [] as string[]);

    return (
      <svg id="certificate-svg" viewBox="0 0 800 600" width="100%" xmlns="http://www.w3.org/2000/svg" fontFamily="Inter, sans-serif">
        <defs>
          <linearGradient id="certBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#certBg)" />
        <rect x="15" y="15" width="770" height="570" fill="none" stroke="#0ea5e9" strokeWidth="2" />
        <rect x="20" y="20" width="760" height="560" fill="none" stroke="#7dd3fc" strokeWidth="8" />
        
        <g transform="translate(50, 50) scale(1.5)">
           <path fill="#0ea5e9" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z M12 7 L 8 11 L 10 16 L 12 14 L 14 16 L 16 11 Z" />
        </g>
        <text x="400" y="80" textAnchor="middle" fontSize="24" fill="#0c4a6e" fontWeight="bold">Aman Digital Care</text>

        <text x="400" y="150" textAnchor="middle" fontSize="36" fill="#075985" fontWeight="800" letterSpacing="2">{t('certificate.title')}</text>
        
        <text x="400" y="210" textAnchor="middle" fontSize="18" fill="#0369a1">{t('certificate.presented_to')}</text>
        <text x="400" y="260" textAnchor="middle" fontSize="32" fill="#0c4a6e" fontWeight="600">{data.name}</text>
        
        <text x="400" y="310" textAnchor="middle" fontSize="16" fill="#0369a1">
            {lines.map((line, i) => <tspan key={i} x="400" dy={i === 0 ? 0 : "1.4em"}>{line}</tspan>)}
        </text>

        {data.message && (
            <text x="400" y="400" textAnchor="middle" fontStyle="italic" fontSize="16" fill="#075985">"{data.message}"</text>
        )}

        <line x1="100" y1="500" x2="300" y2="500" stroke="#0c4a6e" strokeWidth="1" />
        <text x="200" y="520" textAnchor="middle" fontSize="14" fill="#0369a1">{t('certificate.foundation_name')}</text>

        <line x1="500" y1="500" x2="700" y2="500" stroke="#0c4a6e" strokeWidth="1" />
        <text x="600" y="520" textAnchor="middle" fontSize="14" fill="#0369a1">{t('certificate.issued_on')} {data.date}</text>

        <g transform="translate(280, 480)">
          <circle cx="0" cy="0" r="40" fill="#e0f2fe" stroke="#0ea5e9" strokeWidth="2" />
          <circle cx="0" cy="0" r="35" fill="none" stroke="#7dd3fc" strokeWidth="1" />
          <g transform="scale(1.2) translate(-12, -12)">
            <circle cx="12" cy="12" r="10" strokeWidth="1.5" stroke="#0ea5e9" fill="none"/>
            <text x="12" y="12.5" fontFamily="sans-serif" fontSize="9" fontWeight="bold" textAnchor="middle" dominantBaseline="central" fill="#0ea5e9">A+</text>
          </g>
        </g>
      </svg>
    );
};

const CertificateDisplayContent: React.FC<{ data: CertificateData, onFinish: () => void }> = ({ data, onFinish }) => {
    const { t } = useLocalization();

    const handleDownload = () => {
        const svgElement = document.getElementById('certificate-svg');
        if (svgElement) {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            const blob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `AmanDigitalCare_Certificate_${data.name.replace(/\s/g, '_')}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };
    
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-primary-500 mb-2 text-center">{t('programs.modal.certificate_display.title')}</h2>
            <p className="text-base-600 dark:text-base-300 mb-4 text-center">{t('programs.modal.certificate_display.text')}</p>
            <div className="bg-base-100 dark:bg-base-700/50 p-2 rounded-lg">
                <CertificateSVG data={data} />
            </div>
            <div className="mt-6 flex flex-col gap-3">
                <button onClick={handleDownload} className="w-full px-4 py-3 bg-accent-500 text-white font-bold rounded-lg hover:bg-accent-600">
                    {t('programs.modal.certificate_display.download_button')}
                </button>
                <button onClick={onFinish} className="w-full text-sm font-semibold text-base-600 dark:text-base-300 hover:underline">
                    {t('programs.modal.certificate_display.finish_button')}
                </button>
            </div>
        </div>
    );
};


const CertificateFormContent: React.FC<{ onSubmit: (data: Omit<CertificateData, 'date' | 'method'> & { method: 'UPI' | 'Crypto'}) => void, method: 'UPI' | 'Crypto' }> = ({ onSubmit, method }) => {
    const { t } = useLocalization();
    const { currentUser } = useAuth();
    const [name, setName] = useState(() => currentUser ? getUserName(currentUser) : '');
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name: name.trim() || t('certificate.anonymous_donor'),
            amount: amount.trim() || t('certificate.a_generous_donation'),
            message: message.trim(),
            method,
        });
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-primary-500 mb-2 text-center">{t('programs.modal.certificate_form.title')}</h2>
            <p className="text-base-600 dark:text-base-300 mb-6 text-center">{t('programs.modal.certificate_form.text')}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="cert-name" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('programs.modal.certificate_form.name_label')}</label>
                    <input type="text" id="cert-name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-base-700/50 border border-base-300 dark:border-base-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                </div>
                <div>
                    <label htmlFor="cert-amount" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('programs.modal.certificate_form.amount_label')}</label>
                    <input type="text" id="cert-amount" value={amount} onChange={e => setAmount(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-base-700/50 border border-base-300 dark:border-base-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"/>
                </div>
                <div>
                    <label htmlFor="cert-message" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('programs.modal.certificate_form.message_label')}</label>
                    <textarea id="cert-message" value={message} onChange={e => setMessage(e.target.value)} rows={2} placeholder={t('programs.modal.certificate_form.message_placeholder')} className="mt-1 block w-full px-3 py-2 bg-white/50 dark:bg-base-700/50 border border-base-300 dark:border-base-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"></textarea>
                </div>
                <div className="pt-2">
                    <button type="submit" className="w-full bg-primary-500 text-white font-bold py-3 rounded-lg hover:bg-primary-600">
                        {t('programs.modal.certificate_form.button')}
                    </button>
                </div>
            </form>
        </div>
    );
};


const ProgramCard: React.FC<{ program: Program; onEnroll: (program: Program) => void; }> = ({ program, onEnroll }) => {
  const { t } = useLocalization();
  return (
    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-2xl shadow-soft overflow-hidden border border-base-200 dark:border-base-700 flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{program.name}</h2>
        <p className="mt-2 text-base-600 dark:text-base-300 flex-grow">{program.description}</p>
        <p className="mt-4 font-semibold text-accent-600 dark:text-accent-400">{t('programs.success_rate', { rate: program.successRate })}</p>
      </div>
      <div className="p-6 bg-base-100/50 dark:bg-base-700/30">
        <h3 className="font-semibold text-base-800 dark:text-base-200 mb-2">Key Features:</h3>
        <ul className="space-y-1 text-sm text-base-700 dark:text-base-300">
          {program.features.map((feature, i) => <li key={i} className="flex items-start"><span className="text-primary-500 mr-2 mt-1">&#10003;</span> {feature}</li>)}
        </ul>
      </div>
      <div className="p-6 mt-auto">
        <button onClick={() => onEnroll(program)} className="w-full bg-primary-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-600 transition-colors">
          {t('programs.enroll')}
        </button>
      </div>
    </div>
  );
};

const ProgramsPage: React.FC = () => {
    const { t } = useLocalization();
    const { currentUser, getScopedKey } = useAuth();
    const navigate = useNavigate();
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [modalStep, setModalStep] = useState<'confirm' | 'donate' | 'certificateForm' | 'certificateDisplay' | 'loginPrompt' | null>(null);
    const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
    const [donationMethod, setDonationMethod] = useState<'UPI' | 'Crypto'>('UPI');
    const baseUrl = "https://amandigitalcare.com";

    const programsSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": t('programs.title'),
      "description": t('programs.subtitle'),
      "itemListElement": PROGRAMS.map((program, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Course",
          "name": program.name,
          "description": program.description,
          "courseCode": program.id,
          "provider": {
            "@type": "Organization",
            "name": "Aman Digital Care"
          }
        }
      }))
    };

    const handleEnrollClick = (program: Program) => {
        if (!currentUser) {
            setModalStep('loginPrompt');
            return;
        }
        setSelectedProgram(program);
        setModalStep('confirm');
    };
    
    const handleConfirmEnrollment = () => {
        setModalStep('donate');
    };

    const handleDonated = (method: 'UPI' | 'Crypto') => {
        setDonationMethod(method);
        setModalStep('certificateForm');
    };
    
    const handleSkipDonation = () => {
        finishEnrollment();
    };

    const handleCertificateSubmit = (data: Omit<CertificateData, 'date' | 'method'> & { method: 'UPI' | 'Crypto'}) => {
        const fullData = {
            ...data,
            date: new Date().toLocaleDateString(),
        };
        setCertificateData(fullData);
        setModalStep('certificateDisplay');
    };

    const finishEnrollment = () => {
        if (selectedProgram && currentUser) {
            localStorage.setItem(getScopedKey('program'), JSON.stringify(selectedProgram));
            localStorage.setItem(getScopedKey('enrollmentDate'), new Date().toISOString());
            // Clear old progress
            localStorage.removeItem(getScopedKey('completedChallenges'));
            navigate('/dashboard');
        }
        closeModal();
    };

    const closeModal = () => {
        setSelectedProgram(null);
        setModalStep(null);
        setCertificateData(null);
    };

    const renderModalContent = () => {
        if (!modalStep) return null;
        
        switch(modalStep) {
            case 'loginPrompt':
                return <LoginPromptContent onClose={closeModal} onLogin={() => navigate('/profile')} />;
            case 'confirm':
                return selectedProgram && <ConfirmationContent programName={selectedProgram.name} onConfirm={handleConfirmEnrollment} onClose={closeModal} />;
            case 'donate':
                return <DonationContent onDonated={handleDonated} onSkip={handleSkipDonation} />;
            case 'certificateForm':
                return <CertificateFormContent onSubmit={handleCertificateSubmit} method={donationMethod} />;
            case 'certificateDisplay':
                return certificateData && <CertificateDisplayContent data={certificateData} onFinish={finishEnrollment} />;
            default:
                return null;
        }
    };

    return (
        <>
        <SEOMeta
            title={t('seo.programs.title')}
            description={t('seo.programs.description')}
            keywords={`recovery programs, ${t('seo.keywords.default')}`}
            canonicalUrl={`${baseUrl}/#/programs`}
            schema={programsSchema}
        />
        <div className="py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('programs.title')}</h1>
                    <p className="mt-4 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('programs.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {PROGRAMS.map(program => (
                        <ProgramCard key={program.id} program={program} onEnroll={handleEnrollClick} />
                    ))}
                </div>
            </div>
        </div>
        {modalStep && <Modal onClose={modalStep === 'certificateDisplay' ? finishEnrollment : closeModal}>{renderModalContent()}</Modal>}
        </>
    );
};

export default ProgramsPage;