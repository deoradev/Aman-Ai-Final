import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import Onboarding from '../components/Onboarding';
import { TESTIMONIALS } from '../constants';
import SEOMeta from '../components/SEOMeta';

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => (
    <div className="text-center p-6">
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-500 text-white mx-auto mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{title}</h3>
        <p className="text-base-600 dark:text-base-400">{description}</p>
    </div>
);

const HomePage: React.FC = () => {
  const { t } = useLocalization();
  const { currentUser } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
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

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const subject = `New Aman Digital Care Subscription - ${email}`;
      const body = `New user signup: ${email} signed up on ${new Date().toLocaleDateString()}`;
      window.location.href = `mailto:officialamanfoundation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setIsSubmitted(true);
      setEmail('');
    }
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

  const features = [
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        title: t('home.features.programs.title'),
        description: t('home.features.programs.description'),
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
        title: t('home.features.ai.title'),
        description: t('home.features.ai.description'),
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        title: t('home.features.tracking.title'),
        description: t('home.features.tracking.description'),
    },
    {
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>,
        title: t('home.features.resources.title'),
        description: t('home.features.resources.description'),
    }
  ];

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
    <div className="bg-base-100/50 dark:bg-base-900">
      {/* Hero Section */}
      <section className="relative bg-primary-500 text-white text-center py-20 md:py-32">
        <div className="absolute inset-0 bg-base-900 opacity-30"></div>
        <div className="relative container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            {t('home.hero.title')}
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-primary-100">
            {t('home.hero.subtitle')}
          </p>
          <NavLink to="/dashboard" className="mt-8 inline-block bg-white text-primary-600 font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-100 transition-transform hover:scale-105 shadow-lg">
            {t('home.hero.button')}
          </NavLink>
        </div>
      </section>

      {/* Banner */}
      <div className="bg-base-800 text-base-100 text-center py-3 font-semibold">
        <p>{t('home.banner')}</p>
      </div>
      
      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-12">{t('home.features.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-base-100 dark:bg-base-800/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-4xl font-bold text-primary-500">{t('home.stats.users')}</h3>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-base-900 dark:text-white">{t('home.stats.success')}</h3>
            </div>
            <div className="p-6">
              <h3 className="text-4xl font-bold text-primary-500">{t('home.stats.programs')}</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Signup Section */}
      <section className="bg-primary-500 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">{t('home.signup.title')}</h2>
          <p className="mb-8 max-w-2xl mx-auto text-primary-100">{t('home.signup.cta')}</p>
          <form onSubmit={handleSignup} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('home.signup.placeholder')}
                required
                className="flex-grow px-4 py-3 rounded-full text-base-800 bg-white focus:outline-none focus:ring-4 focus:ring-primary-300"
              />
              <button type="submit" className="bg-base-800 text-white font-bold py-3 px-8 rounded-full hover:bg-base-700 transition-colors">
                {t('home.signup.button')}
              </button>
            </div>
            {isSubmitted && <p className="mt-4 text-accent-300">{t('home.signup.success')}</p>}
          </form>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-primary-600 dark:text-primary-400 mb-12">{t('home.testimonials.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TESTIMONIALS.map(testimonial => (
              <div key={testimonial.id} className="bg-white dark:bg-base-800 p-8 rounded-xl shadow-soft-lg border-l-4 border-primary-400">
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
    </div>
    </>
  );
};

export default HomePage;