import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import SEOMeta from '../components/SEOMeta';

const ContactPage: React.FC = () => {
    const { t } = useLocalization();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const baseUrl = "https://amandigitalcare.com";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subject = `Contact Form - ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
        window.location.href = `mailto:officialamanfoundation@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setIsSubmitted(true);
        setName('');
        setEmail('');
        setMessage('');
    };

    const contactSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": t('seo.contact.title'),
        "description": t('seo.contact.description'),
        "url": `${baseUrl}/#/contact`,
        "mainEntity": {
          "@type": "Organization",
          "name": "Aman Digital Care",
          "url": baseUrl,
          "logo": `${baseUrl}/assets/icons/icon-512x512.png`,
          "contactPoint": {
            "@type": "ContactPoint",
            "email": "officialamanfoundation@gmail.com",
            "contactType": "Customer Support",
            "availableLanguage": ["English", "Hindi"]
          }
        }
    };

    return (
        <>
        <SEOMeta
            title={t('seo.contact.title')}
            description={t('seo.contact.description')}
            keywords={`contact Aman Digital Care, support, partnership, ${t('seo.keywords.default')}`}
            canonicalUrl={`${baseUrl}/#/contact`}
            schema={contactSchema}
        />
        <div className="py-16 bg-base-50 dark:bg-base-950 transition-colors duration-500 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-500">{t('contact.title')}</h1>
                        <p className="mt-4 text-lg text-base-600 dark:text-base-300">
                           {t('contact.subtitle')}
                        </p>
                    </div>

                    <div className="bg-base-50/60 dark:bg-base-900/60 backdrop-blur-md p-8 rounded-xl shadow-soft mb-8 text-center border border-base-200 dark:border-base-800">
                        <h2 className="text-2xl font-bold text-primary-500 dark:text-primary-400">{t('contact.info.title')}</h2>
                        <p className="mt-4 text-base-700 dark:text-base-200">{t('contact.info.email')}</p>
                        <p className="mt-2 text-base-700 dark:text-base-200">{t('contact.info.phone')}</p>
                    </div>

                    <div className="bg-base-50/60 dark:bg-base-900/60 backdrop-blur-md p-8 rounded-xl shadow-soft border border-base-200 dark:border-base-800">
                        {isSubmitted ? (
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-primary-500 dark:text-primary-400">{t('contact.success.title')}</h2>
                                <p className="mt-4 text-base-700 dark:text-base-200">{t('contact.success.message')}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('contact.form.name')}</label>
                                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-base-50/50 dark:bg-base-800/50 border border-base-300 dark:border-base-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base-900 dark:text-white"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('contact.form.email')}</label>
                                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-base-50/50 dark:bg-base-800/50 border border-base-300 dark:border-base-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base-900 dark:text-white"/>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-base-700 dark:text-base-300">{t('contact.form.message')}</label>
                                    <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={4} required className="mt-1 block w-full px-3 py-2 bg-base-50/50 dark:bg-base-800/50 border border-base-300 dark:border-base-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base-900 dark:text-white"></textarea>
                                </div>
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                        {t('contact.form.button')}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ContactPage;