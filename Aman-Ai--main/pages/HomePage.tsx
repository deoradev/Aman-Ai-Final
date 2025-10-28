import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Onboarding from '../components/Onboarding';
import { TESTIMONIALS } from '../constants';
import SEOMeta from '../components/SEOMeta';

const HeroSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="relative text-center py-20 md:py-32 overflow-hidden">
             <div className="absolute inset-0 bg-primary-500 opacity-20 dark:opacity-30"></div>
             <div className="absolute inset-0 animated-gradient-bg" style={{ zIndex: -1, animationDuration: '30s' }}></div>
            <div className="relative container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-extrapold text-base-900 dark:text-white leading-tight">
                    {t('home.hero.title')}
                </h1>
                <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-base-700 dark:text-base-300">
                    {t('home.hero.subtitle')}
                </p>
                <NavLink to="/dashboard" className="mt-8 inline-block bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg">
                    {t('home.hero.button')}
                </NavLink>
            </div>
        </section>
    );
};

const MissionSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="py-20 bg-base-50 dark:bg-base-800/50">
            <div className="container mx-auto px-4 text-center max-w-3xl">
                <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('home.mission.title')}</h2>
                <p className="text-lg text-base-600 dark:text-base-400 mb-6">{t('home.mission.subtitle')}</p>
                <div className="space-y-4 text-base-700 dark:text-base-300 leading-relaxed">
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
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('home.how_it_works.title')}</h2>
                    <p className="text-lg text-base-600 dark:text-base-400 mb-12">{t('home.how_it_works.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className="text-center p-6">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-500 text-white mx-auto mb-4">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{step.title}</h3>
                            <p className="text-base-600 dark:text-base-400">{step.description}</p>
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
        <section className="py-20 bg-base-50 dark:bg-base-800/50">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('home.safe_space.title')}</h2>
                    <p className="text-lg text-base-600 dark:text-base-400 mb-12">{t('home.safe_space.subtitle')}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {items.map((item, index) => (
                        <div key={index} className="bg-white/60 dark:bg-base-800/60 p-6 rounded-xl shadow-soft border-t-4 border-primary-400 text-center">
                            <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-500 mx-auto mb-4">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{item.title}</h3>
                            <p className="text-base-600 dark:text-base-400">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-12">{t('home.testimonials.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {TESTIMONIALS.slice(0, 3).map(testimonial => (
                        <div key={testimonial.id} className="bg-white/60 dark:bg-base-800/60 p-8 rounded-xl shadow-soft border-l-4 border-primary-400">
                            <p className="text-base-600 dark:text-base-300 italic mb-6">"{testimonial.quote}"</p>
                            <div className="text-right">
                                <p className="font-bold text-primary-500">{testimonial.author}</p>
                                <p className="text-sm text-base-500 dark:text-base-400">{testimonial.location}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FinalCTASection: React.FC = () => {
    const { t } = useLocalization();
    return (
        <section className="py-20 bg-primary-500">
            <div className="container mx-auto px-4 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">{t('home.final_cta.title')}</h2>
                <p className="mb-8 max-w-2xl mx-auto text-primary-100">{t('home.final_cta.subtitle')}</p>
                <NavLink to="/programs" className="inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-100 transition-transform hover:scale-105 shadow-lg">
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
    <div className="bg-base-100/50 dark:bg-base-900/95">
        <HeroSection />
        <MissionSection />
        <HowItWorksSection />
        <SafeSpaceSection />
        <TestimonialsSection />
        <FinalCTASection />
    </div>
    </>
  );
};

export default HomePage;
