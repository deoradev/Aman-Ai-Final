
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Onboarding from '../components/Onboarding';
import SEOMeta from '../components/SEOMeta';
import Logo from '../components/Logo';

const SecurityBadge: React.FC = () => (
    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-base-900/5 dark:bg-white/10 border border-base-900/10 dark:border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
        <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-900 dark:text-white">
            Encrypted & HIPAA-Compliant Architecture
        </span>
    </div>
);

const FounderQuoteSection: React.FC = () => (
    <section className="bg-primary-500 text-white py-24 px-6 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.4em] mb-12 text-primary-100 opacity-90 animate-on-scroll">
                The Spark Behind The Mission
            </p>
            <blockquote className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-16 animate-on-scroll delay-100">
                "This thought started from a son who believes in the power of kindness."
            </blockquote>
            <div className="flex flex-col items-center gap-2 animate-on-scroll delay-200">
                <cite className="text-2xl font-bold not-italic">— Devanshu Deora</cite>
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Founder, Aman AI Foundation</span>
            </div>
        </div>
        {/* Subtle texture or shine effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
    </section>
);

const ComparisonSection: React.FC = () => {
    const { t } = useLocalization();
    
    const CheckIcon = () => (
        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center mx-auto shadow-md shadow-primary-500/20">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
    );
    
    const CrossIcon = () => (
        <div className="w-6 h-6 bg-base-100 dark:bg-base-800 rounded-full flex items-center justify-center mx-auto">
             <svg className="w-3 h-3 text-base-300 dark:text-base-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </div>
    );

    return (
        <section className="py-24 bg-base-50 dark:bg-base-950 px-4">
            <div className="container mx-auto max-w-2xl text-center">
                <p className="text-primary-500 font-black uppercase tracking-[0.3em] text-[10px] mb-4">A Better Path</p>
                <h2 className="text-4xl md:text-6xl font-black mb-16 tracking-tighter text-base-900 dark:text-white leading-[0.9]">
                    A Better Path <br /><span className="text-primary-500">to Wellness.</span>
                </h2>
                
                <div className="bg-white dark:bg-base-900 border border-base-200 dark:border-base-800 rounded-[2.5rem] shadow-soft-xl overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 border-b border-base-100 dark:border-base-800 bg-base-50/50 dark:bg-base-900/50">
                        <div className="py-6 px-2 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-base-400">Values</span>
                        </div>
                        <div className="py-6 px-2 flex items-center justify-center border-x border-base-100 dark:border-base-800 bg-primary-50/50 dark:bg-primary-900/10">
                            <div className="bg-primary-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-primary-500/30">
                                <span className="text-[10px] font-black uppercase tracking-widest">Aman AI</span>
                            </div>
                        </div>
                        <div className="py-6 px-2 flex items-center justify-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-base-400">Traditional</span>
                        </div>
                    </div>

                    {/* Rows */}
                    <div className="text-sm font-bold text-base-900 dark:text-white">
                        <div className="grid grid-cols-3 border-b border-base-100 dark:border-base-800 hover:bg-base-50 dark:hover:bg-base-800/30 transition-colors">
                            <div className="py-6 px-4 flex items-center justify-start md:justify-center">Cost</div>
                            <div className="py-6 px-4 flex items-center justify-center border-x border-base-100 dark:border-base-800 bg-primary-50/10 dark:bg-primary-900/5 text-primary-600 dark:text-primary-400 font-black">
                                Free Forever
                            </div>
                            <div className="py-6 px-4 flex items-center justify-center opacity-50"><CrossIcon /></div>
                        </div>
                        
                        <div className="grid grid-cols-3 border-b border-base-100 dark:border-base-800 hover:bg-base-50 dark:hover:bg-base-800/30 transition-colors">
                            <div className="py-6 px-4 flex items-center justify-start md:justify-center">Availability</div>
                            <div className="py-6 px-4 flex items-center justify-center border-x border-base-100 dark:border-base-800 bg-primary-50/10 dark:bg-primary-900/5">
                                <CheckIcon />
                            </div>
                            <div className="py-6 px-4 flex items-center justify-center opacity-50"><CrossIcon /></div>
                        </div>

                        <div className="grid grid-cols-3 border-b border-base-100 dark:border-base-800 hover:bg-base-50 dark:hover:bg-base-800/30 transition-colors">
                            <div className="py-6 px-4 flex items-center justify-start md:justify-center">Privacy</div>
                            <div className="py-6 px-4 flex items-center justify-center border-x border-base-100 dark:border-base-800 bg-primary-50/10 dark:bg-primary-900/5">
                                <CheckIcon />
                            </div>
                            <div className="py-6 px-4 flex items-center justify-center opacity-50"><CrossIcon /></div>
                        </div>

                        <div className="grid grid-cols-3 hover:bg-base-50 dark:hover:bg-base-800/30 transition-colors">
                            <div className="py-6 px-4 flex items-center justify-start md:justify-center">Full Anonymity</div>
                            <div className="py-6 px-4 flex items-center justify-center border-x border-base-100 dark:border-base-800 bg-primary-50/10 dark:bg-primary-900/5">
                                <CheckIcon />
                            </div>
                            <div className="py-6 px-4 flex items-center justify-center opacity-50"><CrossIcon /></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const HomePage: React.FC = () => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('amandigitalcare-onboarding-completed');
    if (!onboardingCompleted && !currentUser) {
      setShowOnboarding(true);
    }
  }, [currentUser]);

  return (
    <>
    {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
    <SEOMeta title={t('seo.home.title')} description={t('seo.home.description')} />
    <div className="bg-white dark:bg-base-900">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden pt-20">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-100/40 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-100/30 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000"></div>
            </div>
            
            <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
                <SecurityBadge />

                <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.85] text-base-900 dark:text-white mb-8 animate-fade-in-up">
                    <span className="text-primary-500">Healing</span> <br /> 
                    Starts Here.
                </h1>
                
                <p className="text-xl md:text-2xl text-base-600 dark:text-base-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up animation-delay-300">
                    Your free, confidential AI companion for addiction recovery and mental wellness.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up animation-delay-500 w-full sm:w-auto">
                    <NavLink to="/dashboard" className="w-full sm:w-auto bg-primary-500 text-white font-black py-5 px-12 rounded-[2rem] text-xl hover:scale-105 transition-all shadow-2xl shadow-primary-500/30 uppercase tracking-widest active:scale-95">
                        {t('home.hero.button')}
                    </NavLink>
                    <NavLink to="/about" className="w-full sm:w-auto bg-white dark:bg-white/5 text-base-900 dark:text-white border border-base-200 dark:border-white/10 font-black py-5 px-12 rounded-[2rem] text-xl hover:bg-base-50 dark:hover:bg-white/10 transition-all uppercase tracking-widest">
                        Our Story
                    </NavLink>
                </div>
            </div>
        </section>

        <ComparisonSection />

        <FounderQuoteSection />

        {/* Feature Bento Grid (Simplified) */}
        <section className="py-24 px-4 bg-base-50 dark:bg-base-900">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-base-800/60 rounded-[2.5rem] p-10 shadow-soft border border-base-100 dark:border-white/5 flex flex-col justify-between min-h-[300px] group hover:border-primary-500/30 transition-all">
                        <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center text-3xl mb-6">💬</div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight mb-4 text-base-900 dark:text-white">24/7 Companion</h3>
                            <p className="text-lg text-base-600 dark:text-base-400 font-medium">Always awake, always listening. No judgment, just support whenever you need it.</p>
                        </div>
                    </div>
                    <div className="bg-base-900 text-white rounded-[2.5rem] p-10 shadow-soft border border-base-800 flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Logo size="large" />
                        </div>
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl mb-6 backdrop-blur-sm">🔒</div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-black tracking-tight mb-4">Local Privacy</h3>
                            <p className="text-lg text-base-400 font-medium">Your data stays on your device. We don't see your journals, logs, or chats.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 text-center px-4 bg-white dark:bg-base-950">
             <div className="max-w-4xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-black text-base-900 dark:text-white tracking-tighter mb-8 leading-[0.9]">
                    Ready to begin?
                </h2>
                <p className="text-base-600 dark:text-base-400 text-xl font-medium mb-12 max-w-xl mx-auto">
                    Enroll in a evidence-informed program today. <br/>100% Free. 100% Anonymous.
                </p>
                <NavLink to="/programs" className="inline-block bg-primary-500 text-white font-black py-6 px-16 rounded-[2.5rem] text-2xl hover:scale-105 transition-all shadow-2xl uppercase tracking-widest active:scale-95 shadow-primary-500/30">
                    Claim Your Program
                </NavLink>
            </div>
        </section>
    </div>

    <style>{`
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            display: inline-block;
            animation: marquee 40s linear infinite;
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-pulse-slow {
            animation: pulse-slow 10s infinite ease-in-out;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-300 { animation-delay: 0.3s; }
        .animation-delay-500 { animation-delay: 0.5s; }
        
        .animate-fade-in-up {
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-on-scroll {
            opacity: 0;
            animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            animation-delay: 0.2s; 
        }
        .delay-100 { animation-delay: 0.3s; }
        .delay-200 { animation-delay: 0.4s; }
    `}</style>
    </>
  );
};

export default HomePage;
