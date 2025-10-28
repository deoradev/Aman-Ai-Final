import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const PolicyCard: React.FC<{ to: string; title: string; description: string }> = ({ to, title, description }) => (
    <NavLink 
        to={to} 
        className="block p-6 bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-xl shadow-soft transform hover:-translate-y-1 transition-transform duration-300"
    >
        <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400">{title}</h3>
        <p className="mt-2 text-base-600 dark:text-base-300">{description}</p>
        <span className="mt-4 inline-block font-semibold text-primary-500">Read More &rarr;</span>
    </NavLink>
);

const PoliciesPage: React.FC = () => {
  const { t } = useLocalization();

  const policies = [
    { to: '/privacy-policy', title: t('policies_page.privacy.title'), description: t('policies_page.privacy.description') },
    { to: '/terms-of-service', title: t('policies_page.terms.title'), description: t('policies_page.terms.description') },
    { to: '/disclaimer', title: t('policies_page.disclaimer.title'), description: t('policies_page.disclaimer.description') },
    { to: '/cookie-policy', title: t('policies_page.cookies.title'), description: t('policies_page.cookies.description') }
  ];

  return (
    <>
      <SEOMeta
        title={`${t('policies_page.title')} | Aman Digital Care`}
        description={t('policies_page.subtitle')}
        noIndex={true}
      />
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('policies_page.title')}</h1>
            <p className="mt-4 text-lg text-base-600 dark:text-base-300">{t('policies_page.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {policies.map(policy => (
              <PolicyCard key={policy.to} {...policy} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PoliciesPage;
