
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Onboarding from '../components/Onboarding';
import SEOMeta from '../components/SEOMeta';

const GlobalPulse: React.FC = () => {
    const legacyImpact = 200000; 
    const [aiSessions, setAiSessions] = useState(158420);

    useEffect(() => {
        const interval = setInterval(() => {
            setAiSessions(prev => prev + Math.floor(Math.random() * 5));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-10 mt-20 animate-fade-in-delayed">
            <div className="flex flex-wrap justify-center gap-8">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 px-10 py-6 rounded-[2.5rem] group hover:bg-white/10 transition-all shadow-2xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary-400 mb-2">Global NGO Legacy</p>
                    <p className="text-4xl font-black text-white tabular-nums">{legacyImpact.toLocaleString()}+</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase mt-2">Lives Restored Since 2001</p>
                </div>
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 px-10 py-6 rounded-[2.5rem] group hover:bg-white/10 transition-all shadow-2xl">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-accent-400 mb-2">A Son's Mission</p>
                    <p className="text-4xl font-black text-white tracking-tighter">Kindness</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase mt-2">The Foundation of Aman AI</p>
                </div>
            </div>
            <div className="flex items-center gap-4 px-8 py-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.25em] text-center">Encrypted & HIPAA-Compliant Architecture</span>
            </div>
        </div>
    );
};

const HeroSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="relative text-center py-28 md:py-48 overflow-hidden min-h-screen flex flex-col justify-center">
             <div className="absolute inset-0 bg-primary-600/5 dark:bg-black/90"></div>
             <div className="absolute inset-0 animated-gradient-bg" style={{ zIndex: -1, animationDuration: '40s' }}></div>
            <div className="relative container mx-auto px-4 z-10">
                <div className="inline-block px-8 py-3 bg-primary-500/10 border border-primary-500/20 rounded-full mb-10 animate-fade-in">
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-primary-600 dark:text-primary-400">The Gold Standard in Digital Recovery Support</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black text-base-900 dark:text-white leading-[0.85] tracking-tighter mb-10">
                    {t('home.hero.title')}
                </h1>
                <p className="mt-6 text-xl md:text-3xl max-w-4xl mx-auto text-base-700 dark:text-slate-200 leading-relaxed font-medium">
                    {t('home.hero.subtitle')}
                </p>
                <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8">
                    <NavLink to="/dashboard" className="w-full sm:w-auto bg-primary-500 text-white font-black py-7 px-20 rounded-[3rem] text-2xl hover:scale-105 hover:bg-primary-600 transition-all shadow-2xl shadow-primary-500/40 uppercase tracking-widest">
                        {t('home.hero.button')}
                    </NavLink>
                    <NavLink to="/our-approach" className="w-full sm:w-auto bg-white/40 dark:bg-white/5 backdrop-blur-2xl text-base-900 dark:text-white border border-base-200 dark:border-white/10 font-black py-7 px-20 rounded-[3rem] text-2xl hover:bg-white dark:hover:bg-white/10 transition-all uppercase tracking-widest">
                        Clinical Science
                    </NavLink>
                </div>
                <GlobalPulse />
            </div>
        </section>
    );
};

const VisionarySection: React.FC = () => {
    return (
        <section className="py-32 bg-primary-600 text-white relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
             <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
                 <p className="text-[12px] font-black uppercase tracking-[0.6em] mb-8 text-primary-200">The Spark Behind The Mission</p>
                 <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-10">
                     "This thought started from a son who believes in the power of kindness."
                 </h2>
                 <p className="text-2xl font-bold italic text-primary-100 mb-4">— Devanshu Deora</p>
                 <p className="text-lg font-medium opacity-80 uppercase tracking-widest">Founder, AMAN AI Foundation</p>
             </div>
        </section>
    );
}

const MissionSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="py-40 bg-white dark:bg-base-900 relative overflow-hidden border-y border-base-100 dark:border-base-800">
            <div className="absolute -left-20 top-0 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[150px]"></div>
            <div className="absolute -right-20 bottom-0 w-[500px] h-[500px] bg-accent-500/5 rounded-full blur-[150px]"></div>
            <div className="container mx-auto px-4 text-center max-w-5xl relative z-10">
                <h2 className="text-6xl md:text-8xl font-black text-base-900 dark:text-white mb-12 tracking-tighter">{t('home.mission.title')}</h2>
                <p className="text-3xl text-primary-600 dark:text-primary-400 font-black mb-16 uppercase tracking-[0.25em]">{t('home.mission.subtitle')}</p>
                <div className="space-y-10 text-2xl md:text-3xl text-base-500 dark:text-slate-400 leading-relaxed font-medium">
                    <p>{t('home.mission.p1')}</p>
                    <p>{t('home.mission.p2')}</p>
                </div>
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const baseUrl = "https://amandigitalcare.com";

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('amandigitalcare-onboarding-completed');
    if (!onboardingCompleted && !currentUser) {
      setShowOnboarding(true);
    }
  }, [currentUser]);

  const handleCloseOnboarding = () => {
    localStorage.setItem('amandigitalcare-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
    {showOnboarding && <Onboarding onClose={handleCloseOnboarding} />}
    <SEOMeta
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.keywords.default')}
        canonicalUrl={baseUrl + '/'}
    />
    <div className="bg-base-100/50 dark:bg-black overflow-hidden">
        <HeroSection />
        <VisionarySection />
        <MissionSection />
    </div>
    <style>{`
        @keyframes fade-in-delayed {
            0% { opacity: 0; transform: translateY(50px); }
            40% { opacity: 0; }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-delayed {
            animation: fade-in-delayed 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
    `}</style>
    </>
  );
};

export default HomePage;
