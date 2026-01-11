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
    <div className="relative">
      <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

const CrisisButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 bg-warning-500 text-white w-16 h-16 rounded-full shadow-soft-lg flex items-center justify-center z-50 transform hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-warning-300 group"
        aria-label="Crisis Support"
    >
        <span className="font-black text-xl group-hover:animate-bounce">SOS</span>
    </button>
);

const AppContent: React.FC = () => {
  const { setLanguage, isLoaded } = useLocalization();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  
  useSponsorNotifications();

  useEffect(() => {
    const storedLanguage = localStorage.getItem('amandigitalcare-language');
    if (!storedLanguage) {
      setShowLanguageModal(true);
    }
  }, []);

  const handleLanguageSelect = (lang: string) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };
  
  if (!isLoaded) {
    return (
      <div className="flex flex-col min-h-screen bg-base-50 dark:bg-black justify-center items-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-base-50 dark:bg-black text-base-800 dark:text-base-200 selection:bg-primary-500/30">
      <div className="animated-gradient-bg"></div>
      <Suspense fallback={null}>
        {showLanguageModal && <LanguageModal onSelectLanguage={handleLanguageSelect} />}
        {showCrisisModal && <CrisisSupportModal onClose={() => setShowCrisisModal(false)} />}
      </Suspense>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <main className="flex-grow flex flex-col z-10 relative">
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
            <Route path="/sober-circle" element={<Route element={<SoberCirclePage />} />} />
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
      <style>{`
        .animated-gradient-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          background: radial-gradient(circle at 10% 20%, theme(colors.primary.100 / 0.5), transparent 40%),
                      radial-gradient(circle at 80% 90%, theme(colors.secondary.100 / 0.4), transparent 50%),
                      theme(colors.base.50);
          background-size: 200% 200%;
        }
        html.dark .animated-gradient-bg {
          background: radial-gradient(circle at 10% 20%, theme(colors.primary.900 / 0.3), transparent 40%),
                      radial-gradient(circle at 80% 90%, theme(colors.secondary.900 / 0.2), transparent 50%),
                      #000000;
        }
        @media (prefers-reduced-motion: no-preference) {
          .animated-gradient-bg {
            animation: gradient-animation 20s ease-in-out infinite;
          }
        }
        @keyframes gradient-animation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        body {
            line-height: 1.6;
            letter-spacing: -0.011em;
            text-rendering: optimizeLegibility;
            -webkit-font-smoothing: antialiased;
        }
      `}</style>
    </div>
  )
}

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