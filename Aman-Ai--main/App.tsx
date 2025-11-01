import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalizationProvider, useLocalization } from './hooks/useLocalization';
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { ConnectivityProvider } from './hooks/useConnectivity';
import { PushNotificationsProvider } from './hooks/usePushNotifications';
import { useSponsorNotifications } from './hooks/useSponsorNotifications';
import PageWrapper from './components/PageWrapper';
import ErrorBoundary from './components/ErrorBoundary';

import { ToastContext, Toast, ToastType } from './hooks/useToast';
import { ToastContainer } from './components/ToastContainer';


// Lazy load all page components
const HomePage = lazy(() => import('./pages/HomePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const ProgramsPage = lazy(() => import('./pages/ProgramsPage'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ApproachPage = lazy(() => import('./pages/ApproachPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LiveTalkPage = lazy(() => import('./pages/LiveTalkPage'));
const ToolkitPage = lazy(() => import('./pages/ToolkitPage'));
const ConversationPracticePage = lazy(() => import('./pages/ConversationPracticePage'));
const GroupSessionPage = lazy(() => import('./pages/GroupSessionPage'));
const PreventionPlanPage = lazy(() => import('./pages/PreventionPlanPage'));
const SoberCirclePage = lazy(() => import('./pages/SoberCirclePage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'));
const DisclaimerPage = lazy(() => import('./pages/DisclaimerPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const PoliciesPage = lazy(() => import('./pages/PoliciesPage'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));

// Lazy load other non-page components for performance
const Header = lazy(() => import('./components/Header'));
const Footer = lazy(() => import('./components/Footer'));
const LanguageModal = lazy(() => import('./components/LanguageModal'));
const CrisisSupportModal = lazy(() => import('./components/CrisisSupportModal'));

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    );
};


const PageLoader: React.FC = () => (
  <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-8rem)]">
    <div className="flex items-center space-x-2">
      <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
      <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
    </div>
  </div>
);

const CrisisButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-warning-500 text-white w-16 h-16 rounded-full shadow-soft-lg flex items-center justify-center z-50 transform hover:scale-110 transition-transform focus:outline-none focus:ring-4 focus:ring-warning-300"
        aria-label="Crisis Support"
    >
        <span className="font-bold text-xl">SOS</span>
    </button>
);

const AppUpdateToast: React.FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
    const { t } = useLocalization();

    const handleReload = () => {
        window.location.reload();
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-24 right-6 bg-base-800 text-white p-4 rounded-xl shadow-soft-lg z-[100] max-w-sm animate-fade-in-up">
            <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                    <svg className="h-6 w-6 text-accent-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.13-4.13" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 15a9 9 0 01-14.13 4.13" />
                    </svg>
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-semibold">{t('app_update.title')}</p>
                    <p className="mt-1 text-sm text-base-300">{t('app_update.message')}</p>
                    <div className="mt-3">
                        <button onClick={handleReload} className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-800 focus:ring-primary-500">
                            {t('app_update.reload')}
                        </button>
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={onClose} className="inline-flex text-base-400 hover:text-white">
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


const AppContent: React.FC = () => {
  const { setLanguage, isLoaded } = useLocalization();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  
  useSponsorNotifications();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('amandigitalcare-language');
    if (!storedLanguage) {
      setShowLanguageModal(true);
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const handleServiceWorkerMessage = (event: MessageEvent) => {
        if (event.data && event.data.type === 'APP_UPDATED') {
          setShowUpdateToast(true);
        }
      };
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      };
    }
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };
  
  // Display a global loader until the initial language file is loaded.
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen bg-base-50 dark:bg-base-900 justify-center items-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-50 dark:bg-base-900 text-base-800 dark:text-base-200">
      <div className="animated-gradient-bg"></div>
      <Suspense fallback={null}>
        {showLanguageModal && <LanguageModal onSelectLanguage={handleLanguageSelect} />}
        {showCrisisModal && <CrisisSupportModal onClose={() => setShowCrisisModal(false)} />}
      </Suspense>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <main className="flex-grow flex flex-col z-10">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper><DashboardPage /></PageWrapper>} />
            <Route path="/analytics" element={<PageWrapper><AnalyticsPage /></PageWrapper>} />
            <Route path="/programs" element={<PageWrapper><ProgramsPage /></PageWrapper>} />
            <Route path="/resources" element={<PageWrapper><ResourcesPage /></PageWrapper>} />
            <Route path="/community" element={<PageWrapper><CommunityPage /></PageWrapper>} />
            <Route path="/group-session" element={<PageWrapper><GroupSessionPage /></PageWrapper>} />
            <Route path="/live-talk" element={<PageWrapper><LiveTalkPage /></PageWrapper>} />
            <Route path="/toolkit" element={<PageWrapper><ToolkitPage /></PageWrapper>} />
            <Route path="/conversation-practice" element={<PageWrapper><ConversationPracticePage /></PageWrapper>} />
            <Route path="/prevention-plan" element={<PageWrapper><PreventionPlanPage /></PageWrapper>} />
            <Route path="/sober-circle" element={<PageWrapper><SoberCirclePage /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} />
            <Route path="/our-approach" element={<PageWrapper><ApproachPage /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
            <Route path="/profile" element={<PageWrapper><ProfilePage /></PageWrapper>} />
            <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicyPage /></PageWrapper>} />
            <Route path="/terms-of-service" element={<PageWrapper><TermsOfServicePage /></PageWrapper>} />
            <Route path="/disclaimer" element={<PageWrapper><DisclaimerPage /></PageWrapper>} />
            <Route path="/cookie-policy" element={<PageWrapper><CookiePolicyPage /></PageWrapper>} />
            <Route path="/policies" element={<PageWrapper><PoliciesPage /></PageWrapper>} />
            <Route path="/offline" element={<PageWrapper><OfflinePage /></PageWrapper>} />
          </Routes>
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <CrisisButton onClick={() => setShowCrisisModal(true)} />
      <AppUpdateToast show={showUpdateToast} onClose={() => setShowUpdateToast(false)} />
      <style>{`
        @keyframes fade-in-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
        .animated-gradient-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: radial-gradient(circle at 10% 20%, theme(colors.primary.100 / 0.7), transparent 40%),
                      radial-gradient(circle at 80% 90%, theme(colors.secondary.100 / 0.6), transparent 50%),
                      radial-gradient(circle at 50% 50%, theme(colors.base.50), theme(colors.base.100) 80%);
          background-color: theme(colors.base.50);
          background-size: 200% 200%;
          background-position: 0% 50%;
        }
        html.dark .animated-gradient-bg {
          background: radial-gradient(circle at 10% 20%, theme(colors.primary.900 / 0.7), transparent 40%),
                      radial-gradient(circle at 80% 90%, theme(colors.secondary.900 / 0.6), transparent 50%),
                      radial-gradient(circle at 50% 50%, theme(colors.base.900), theme(colors.base.800) 80%);
          background-color: theme(colors.base.900);
        }
        @media (prefers-reduced-motion: no-preference) {
          .animated-gradient-bg {
            animation: gradient-animation 25s ease infinite;
          }
        }
        @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}

// Top-level providers
const App: React.FC = () => {
    return (
      <Router>
        <ConnectivityProvider>
          <AuthProvider>
            <ThemeProvider>
              <LocalizationProvider>
                <PushNotificationsProvider>
                  <ToastProvider>
                    <ErrorBoundary>
                        <AppContent />
                    </ErrorBoundary>
                  </ToastProvider>
                </PushNotificationsProvider>
              </LocalizationProvider>
            </ThemeProvider>
          </AuthProvider>
        </ConnectivityProvider>
      </Router>
    )
}

export default App;