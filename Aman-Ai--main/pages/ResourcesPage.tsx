import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { RESOURCES } from '../constants';
import { Resource } from '../types';
import SEOMeta from '../components/SEOMeta';

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const { t } = useLocalization();
  const getIcon = (type: Resource['type']) => {
    switch(type) {
      case 'Article':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'Exercise':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
      case 'Guide':
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/60 dark:bg-base-800/60 backdrop-blur-md rounded-xl shadow-soft overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 mb-4">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full flex-shrink-0">
            {getIcon(resource.type)}
          </div>
          <div>
            <span className="text-sm font-semibold text-primary-800 dark:text-primary-200">{resource.type.toUpperCase()}</span>
            <h3 className="text-xl font-bold text-base-800 dark:text-base-100">{resource.title}</h3>
          </div>
        </div>
        <p className="text-base-600 dark:text-base-300 mb-4">{resource.description}</p>
        <a href={resource.link} className="font-semibold text-primary-600 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
          {t('resources.read_more')}
        </a>
      </div>
    </div>
  );
};


const ResourcesPage: React.FC = () => {
  const { t } = useLocalization();
  const baseUrl = "https://amandigitalcare.com";

  const resourcesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Aman Digital Care Recovery Resources",
    "description": t('resources.subtitle'),
    "itemListElement": RESOURCES.map((resource, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": resource.title,
        "description": resource.description,
        "author": {
          "@type": "Organization",
          "name": "Aman Digital Care"
        }
      }
    }))
  };
  
  return (
    <>
    <SEOMeta
        title={t('seo.resources.title')}
        description={t('seo.resources.description')}
        keywords={`recovery resources, ${t('seo.keywords.default')}`}
        canonicalUrl={`${baseUrl}/#/resources`}
        schema={resourcesSchema}
    />
    <div className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400">{t('resources.title')}</h1>
          <p className="mt-4 text-lg text-base-600 dark:text-base-300 max-w-3xl mx-auto">{t('resources.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {RESOURCES.map(resource => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default ResourcesPage;