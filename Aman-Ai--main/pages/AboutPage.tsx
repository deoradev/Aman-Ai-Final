import React from 'react';
import { NavLink } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const AboutPage: React.FC = () => {
  const { t } = useLocalization();
  const baseUrl = "https://amandigitalcare.com";

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": t('seo.about.title'),
    "description": t('seo.about.description'),
    "url": `${baseUrl}/#/about`,
    "mainEntity": {
      "@type": "Organization",
      "name": "Aman Digital Care",
      "url": baseUrl + '/',
      "logo": `${baseUrl}/assets/icons/icon-512x512.png`,
      "missionStatement": t('about.mission.p1')
    }
  };
  
  return (
    <>
    <SEOMeta
        title={t('seo.about.title')}
        description={t('seo.about.description')}
        keywords={`about Aman Digital Care, mental health mission, ${t('seo.keywords.default')}`}
        canonicalUrl={`${baseUrl}/#/about`}
        schema={aboutSchema}
    />
    <div className="bg-base-50 dark:bg-base-900">
      {/* Hero Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold">{t('about.title')}</h1>
          <p className="mt-4 text-lg max-w-3xl mx-auto text-primary-100">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('about.mission.title')}</h2>
            <p className="text-base-700 dark:text-base-300 leading-relaxed mb-4">
              {t('about.mission.p1')}
            </p>
            <p className="text-base-700 dark:text-base-300 leading-relaxed">
              {t('about.mission.p2')}
            </p>
          </div>
          <div className="flex justify-center my-8">
            <Logo size="large" />
          </div>
        </div>
      </section>

      {/* Legacy Section */}
      <section className="py-16 bg-base-100 dark:bg-base-800/50">
        <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('about.legacy.title')}</h2>
            <div className="space-y-4 text-base-700 dark:text-base-300 leading-relaxed">
              <p>{t('about.legacy.p1')}</p>
              <p>{t('about.legacy.p2')}</p>
            </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 text-center mb-12">{t('about.values.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{t('about.values.accessibility.title')}</h3>
              <p className="text-base-600 dark:text-base-400">{t('about.values.accessibility.description')}</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{t('about.values.empathy.title')}</h3>
              <p className="text-base-600 dark:text-base-400">{t('about.values.empathy.description')}</p>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{t('about.values.integrity.title')}</h3>
              <p className="text-base-600 dark:text-base-400">{t('about.values.integrity.description')}</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Foundation Section */}
      <section className="py-16 bg-base-100 dark:bg-base-800/50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('about.foundation.title')}</h2>
          <p className="text-base-700 dark:text-base-300 leading-relaxed">
            {t('about.foundation.description')}
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('about.cta.title')}</h2>
          <p className="text-base-600 dark:text-base-300 max-w-2xl mx-auto mb-8">
            {t('about.cta.description')}
          </p>
          <NavLink to="/programs" className="inline-block bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg">
            {t('about.cta.button')}
          </NavLink>
        </div>
      </section>
    </div>
    </>
  );
};

export default AboutPage;