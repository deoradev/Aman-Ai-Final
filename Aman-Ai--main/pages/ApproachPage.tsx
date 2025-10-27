import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const ApproachPage: React.FC = () => {
  const { t } = useLocalization();
  const baseUrl = "https://amandigitalcare.com";

  const approachSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t('seo.approach.title'),
    "description": t('seo.approach.description'),
    "url": `${baseUrl}/#/our-approach`,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Therapeutic Approaches",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": t('approach_page.section1_item1_title'),
          "description": t('approach_page.section1_item1_text')
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": t('approach_page.section1_item2_title'),
          "description": t('approach_page.section1_item2_text')
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": t('approach_page.section1_item3_title'),
          "description": t('approach_page.section1_item3_text')
        }
      ]
    }
  };

  const methods = [
    { title: t('approach_page.section1_item1_title'), text: t('approach_page.section1_item1_text') },
    { title: t('approach_page.section1_item2_title'), text: t('approach_page.section1_item2_text') },
    { title: t('approach_page.section1_item3_title'), text: t('approach_page.section1_item3_text') }
  ];

  return (
    <>
      <SEOMeta
        title={t('seo.approach.title')}
        description={t('seo.approach.description')}
        keywords={`clinical approach, cbt, mindfulness, ai safety, ${t('seo.keywords.default')}`}
        canonicalUrl={`${baseUrl}/#/our-approach`}
        schema={approachSchema}
      />
      <div className="bg-base-50 dark:bg-base-900">
        <section className="bg-primary-500 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold">{t('approach_page.title')}</h1>
            <p className="mt-4 text-lg max-w-3xl mx-auto text-primary-100">{t('approach_page.subtitle')}</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-16">
              
              <div>
                <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 text-center mb-6">{t('approach_page.section1_title')}</h2>
                <p className="text-center text-lg text-base-700 dark:text-base-300 leading-relaxed mb-10">{t('approach_page.section1_p1')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {methods.map(method => (
                    <div key={method.title} className="bg-white/60 dark:bg-base-800/60 p-6 rounded-xl shadow-soft border-t-4 border-primary-400 text-center">
                      <h3 className="text-xl font-semibold text-base-800 dark:text-base-100 mb-2">{method.title}</h3>
                      <p className="text-base-600 dark:text-base-400">{method.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="bg-white/60 dark:bg-base-800/60 p-8 rounded-xl shadow-soft">
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('approach_page.section2_title')}</h2>
                    <p className="text-base-700 dark:text-base-300 leading-relaxed">{t('approach_page.section2_p1')}</p>
                </div>
                 <div className="bg-white/60 dark:bg-base-800/60 p-8 rounded-xl shadow-soft">
                    <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('approach_page.section3_title')}</h2>
                    <p className="text-base-700 dark:text-base-300 leading-relaxed">{t('approach_page.section3_p1')}</p>
                </div>
              </div>
              
              <div>
                <div className="mt-6 p-6 bg-secondary-100/50 dark:bg-secondary-900/20 border-l-4 border-secondary-500 rounded-r-lg">
                    <h3 className="text-xl font-bold text-secondary-800 dark:text-secondary-200">{t('approach_page.disclaimer_title')}</h3>
                    <p className="text-md text-secondary-700 dark:text-secondary-300 mt-2">{t('approach_page.disclaimer_text')}</p>
                </div>
              </div>

              <div className="bg-white/60 dark:bg-base-800/60 p-8 rounded-xl shadow-soft text-center">
                <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-4">{t('approach_page.section4_title')}</h2>
                <p className="text-lg text-base-700 dark:text-base-300 leading-relaxed max-w-2xl mx-auto mb-6">{t('approach_page.section4_p1')}</p>
                <NavLink to="/toolkit" className="inline-block bg-primary-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-primary-600 transition-transform hover:scale-105 shadow-soft-lg">
                    {t('approach_page.cta_button')}
                </NavLink>
              </div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ApproachPage;