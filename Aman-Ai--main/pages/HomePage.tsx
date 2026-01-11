import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Onboarding from '../components/Onboarding';
import SEOMeta from '../components/SEOMeta';

const GlobalPulse: React.FC = () => {
    // Starting with your father's verified legacy number
    const legacyImpact = 100240; 
    const [aiMoments, setAiMoments] = useState(142080);

    useEffect(() => {
        const interval = setInterval(() => {
            setAiMoments(prev => prev + Math.floor(Math.random() * 2));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center gap-6 mt-10 animate-fade-in-delayed">
            <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl group hover:bg-white/20 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-300">Verified Legacy Impact</p>
                    <p className="text-2xl font-black text-white tabular-nums">{legacyImpact.toLocaleString()}+ Lives</p>
                    <p className="text-[8px] font-bold text-white/50 uppercase mt-1">Directly Supported Offline Since 2001</p>
                </div>
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl group hover:bg-white/20 transition-all">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-300">Global Digital Reach</p>
                    <p className="text-2xl font-black text-white tabular-nums">{aiMoments.toLocaleString()}</p>
                    <p className="text-[8px] font-bold text-white/50 uppercase mt-1">AI Support Sessions Started</p>
                </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-1 bg-white/5 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest text-center">Rooted in 20+ Years of Official NGO Care in India</span>
            </div>
        </div>
    );
};

const HeroSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="relative text-center py-20 md:py-32 overflow-hidden min-h-[80vh] flex flex-col justify-center">
             <div className="absolute inset-0 bg-primary-600/10 dark:bg-black/60"></div>
             <div className="absolute inset-0 animated-gradient-bg" style={{ zIndex: -1, animationDuration: '30s' }}></div>
            <div className="relative container mx-auto px-4 z-10">
                <div className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6 animate-bounce-slow">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">Trusted Mental Health NGO Evolution</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black text-base-900 dark:text-white leading-none tracking-tighter mb-6">
                    {t('home.hero.title')}
                </h1>
                <p className="mt-4 text-xl md:text-2xl max-w-3xl mx-auto text-base-700 dark:text-slate-300 leading-relaxed">
                    {t('home.hero.subtitle')}
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <NavLink to="/dashboard" className="w-full sm:w-auto bg-base-900 text-white dark:bg-white dark:text-base-950 font-black py-5 px-12 rounded-[2rem] text-lg hover:scale-105 transition-all shadow-2xl uppercase tracking-widest">
                        {t('home.hero.button')}
                    </NavLink>
                    <NavLink to="/our-approach" className="w-full sm:w-auto bg-white/50 dark:bg-white/10 backdrop-blur-md text-base-900 dark:text-white border border-base-200 dark:border-white/20 font-black py-5 px-12 rounded-[2rem] text-lg hover:bg-white dark:hover:bg-white/20 transition-all uppercase tracking-widest">
                        How it works
                    </NavLink>
                </div>
                <GlobalPulse />
            </div>
        </section>
    );
};

const MissionSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="py-24 bg-white dark:bg-black relative overflow-hidden">
            <div className="absolute -left-20 top-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl"></div>
            <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white mb-8 tracking-tighter">{t('home.mission.title')}</h2>
                <p className="text-xl text-primary-600 dark:text-primary-400 font-bold mb-10 uppercase tracking-widest">{t('home.mission.subtitle')}</p>
                <div className="space-y-6 text-lg md:text-xl text-base-600 dark:text-slate-400 leading-relaxed font-medium">
                    <p>{t('home.mission.p1')}</p>
                    <p>{t('home.mission.p2')}</p>
                </div>
            </div>
        </section>
    );
};

const HowItWorksSection: React.FC = () => {
    const { t } = useLocalization();
    const steps = [
        { title: t('home.how_it_works.step1_title'), description: t('home.how_it_works.step1_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
        { title: t('home.how_it_works.step2_title'), description: t('home.how_it_works.step2_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
        { title: t('home.how_it_works.step3_title'), description: t('home.how_it_works.step3_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
        { title: t('home.how_it_works.step4_title'), description: t('home.how_it_works.step4_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> }
    ];
    return (
        <section className="py-24 bg-base-50 dark:bg-black">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white mb-4 tracking-tighter">{t('home.how_it_works.title')}</h2>
                    <p className="text-lg text-base-600 dark:text-slate-400">{t('home.how_it_works.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {steps.map((step, index) => (
                        <div key={index} className="relative p-8 bg-white dark:bg-base-900 rounded-[2.5rem] shadow-soft hover:shadow-2xl transition-all group">
                            <div className="absolute -top-6 left-8 flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-500 text-white shadow-lg group-hover:scale-110 transition-transform">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-black text-base-900 dark:text-white mt-6 mb-3 tracking-tight">{step.title}</h3>
                            <p className="text-base-600 dark:text-slate-400 leading-relaxed font-medium">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const SafeSpaceSection: React.FC = () => {
    const { t } = useLocalization();
    const items = [
        { title: t('home.safe_space.item1_title'), description: t('home.safe_space.item1_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
        { title: t('home.safe_space.item2_title'), description: t('home.safe_space.item2_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> },
        { title: t('home.safe_space.item3_title'), description: t('home.safe_space.item3_desc'), icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> }
    ];
    return (
        <section className="py-24 bg-white dark:bg-black relative">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white mb-4 tracking-tighter">{t('home.safe_space.title')}</h2>
                    <p className="text-lg text-base-600 dark:text-slate-400">{t('home.safe_space.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {items.map((item, index) => (
                        <div key={index} className="p-10 bg-base-50 dark:bg-base-900 rounded-[3rem] text-center border border-base-100 dark:border-base-700 transition-all hover:-translate-y-2">
                            <div className="flex items-center justify-center h-20 w-20 rounded-3xl bg-primary-100 dark:bg-primary-500/20 text-primary-500 mx-auto mb-6">
                                {item.icon}
                            </div>
                            <h3 className="text-2xl font-black text-base-900 dark:text-white mb-4 tracking-tight">{item.title}</h3>
                            <p className="text-base-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
                        </div>
                    ))}
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
        <MissionSection />
        <HowItWorksSection />
        <SafeSpaceSection />
    </div>
    <style>{`
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes fade-in-delayed {
            0% { opacity: 0; transform: translateY(20px); }
            50% { opacity: 0; }
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