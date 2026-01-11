import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Onboarding from '../components/Onboarding';
import SEOMeta from '../components/SEOMeta';

const GlobalPulse: React.FC = () => {
    const [moments, setMoments] = useState(142080);
    const [activeNow, setActiveNow] = useState(1240);

    useEffect(() => {
        const interval = setInterval(() => {
            setMoments(prev => prev + Math.floor(Math.random() * 3));
            setActiveNow(prev => prev + (Math.random() > 0.5 ? 1 : -1));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-in-delayed">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-300">Moments of Strength</p>
                <p className="text-2xl font-black text-white tabular-nums">{moments.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-300">Healing Now</p>
                <p className="text-2xl font-black text-white tabular-nums">{activeNow.toLocaleString()}</p>
            </div>
        </div>
    );
};

const HeroSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="relative text-center py-20 md:py-32 overflow-hidden min-h-[80vh] flex flex-col justify-center">
             <div className="absolute inset-0 bg-primary-600/10 dark:bg-base-950/40"></div>
             <div className="absolute inset-0 animated-gradient-bg" style={{ zIndex: -1, animationDuration: '30s' }}></div>
            <div className="relative container mx-auto px-4 z-10">
                <div className="inline-block px-4 py-1.5 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6 animate-bounce-slow">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 dark:text-primary-400">The World's First Universal AI Companion</span>
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
        <section className="py-24 bg-white dark:bg-base-900 relative overflow-hidden">
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
        <section className="py-24 bg-base-50 dark:bg-base-950">
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
        <section className="py-24 bg-white dark:bg-base-900 relative">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white mb-4 tracking-tighter">{t('home.safe_space.title')}</h2>
                    <p className="text-lg text-base-600 dark:text-slate-400">{t('home.safe_space.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                    {items.map((item, index) => (
                        <div key={index} className="p-10 bg-base-50 dark:bg-base-800 rounded-[3rem] text-center border border-base-100 dark:border-base-700 transition-all hover:-translate-y-2">
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

const JourneyPreviewSection: React.FC = () => {
    const { t } = useLocalization();
    const [activeDay, setActiveDay] = useState<'day1' | 'day30' | 'day90'>('day1');

    const journeyData = {
        day1: {
            title: t('home.journey_preview.day1_title'),
            description: t('home.journey_preview.day1_desc'),
            task: t('home.journey_preview.day1_challenge_task'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 22v-7" /></svg>
        },
        day30: {
            title: t('home.journey_preview.day30_title'),
            description: t('home.journey_preview.day30_desc'),
            task: t('home.journey_preview.day30_challenge_task'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        },
        day90: {
            title: t('home.journey_preview.day90_title'),
            description: t('home.journey_preview.day90_desc'),
            task: t('home.journey_preview.day90_challenge_task'),
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
        },
    };

    const activeData = journeyData[activeDay];

    return (
        <section className="py-24 bg-base-50 dark:bg-base-950">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-base-900 dark:text-white mb-4 tracking-tighter">{t('home.journey_preview.title')}</h2>
                    <p className="text-lg text-base-600 dark:text-slate-400">{t('home.journey_preview.subtitle')}</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center border-b border-base-200 dark:border-base-800 mb-10">
                        {(['day1', 'day30', 'day90'] as const).map(day => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-10 py-4 font-black text-lg transition-all focus:outline-none relative ${
                                    activeDay === day
                                        ? 'text-primary-500'
                                        : 'text-base-400 hover:text-base-900 dark:hover:text-white'
                                }`}
                            >
                                {t(`home.journey_preview.${day}_tab`)}
                                {activeDay === day && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-500 rounded-full animate-grow-x"></div>}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-base-900 p-10 rounded-[3rem] shadow-soft border border-base-100 dark:border-base-800 animate-fade-in relative overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-10 items-center">
                            <div className="flex-shrink-0 text-primary-500 bg-primary-50 dark:bg-primary-500/10 p-6 rounded-[2rem]">
                                {activeData.icon}
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className="text-3xl font-black text-base-900 dark:text-white mb-4 tracking-tight">{activeData.title}</h3>
                                <p className="text-lg text-base-600 dark:text-slate-400 leading-relaxed">{activeData.description}</p>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-base-100 dark:border-base-800">
                            <h4 className="text-xs font-black text-primary-500 dark:text-primary-400 mb-4 uppercase tracking-[0.3em]">{t('home.journey_preview.sample_challenge_title')}</h4>
                            <div className="bg-base-50 dark:bg-base-800/50 p-6 rounded-2xl italic text-xl text-base-800 dark:text-slate-200 border-l-8 border-primary-500">
                                "{activeData.task}"
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes grow-x {
                    from { scale: 0 1; }
                    to { scale: 1 1; }
                }
                .animate-grow-x {
                    animation: grow-x 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </section>
    );
};

const FinalCTASection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="py-32 bg-primary-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="container mx-auto px-4 text-center text-white relative z-10">
                <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">{t('home.final_cta.title')}</h2>
                <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium text-white/90 leading-relaxed">{t('home.final_cta.subtitle')}</p>
                <NavLink to="/programs" className="inline-block bg-white text-base-900 font-black py-6 px-16 rounded-[2.5rem] text-xl hover:scale-110 transition-all shadow-2xl uppercase tracking-widest">
                    {t('home.final_cta.button')}
                </NavLink>
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": baseUrl + '/',
    "name": "Aman Digital Care",
    "description": t('home.hero.subtitle'),
    "publisher": {
        "@type": "Organization",
        "name": "Aman Digital Care",
        "url": baseUrl + '/',
        "logo": {
            "@type": "ImageObject",
            "url": `${baseUrl}/assets/icons/icon-512x512.png`
        }
    }
  };

  return (
    <>
    {showOnboarding && <Onboarding onClose={handleCloseOnboarding} />}
    <SEOMeta
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        keywords={t('seo.keywords.default')}
        canonicalUrl={baseUrl + '/'}
        schema={websiteSchema}
    />
    <div className="bg-base-100/50 dark:bg-base-900/95 overflow-hidden">
        <HeroSection />
        <MissionSection />
        <HowItWorksSection />
        <SafeSpaceSection />
        <JourneyPreviewSection />
        <FinalCTASection />
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