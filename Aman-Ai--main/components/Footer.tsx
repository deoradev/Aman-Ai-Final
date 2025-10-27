import React from 'react';
import { useLocalization } from '../hooks/useLocalization';

const Footer: React.FC = () => {
    const { t } = useLocalization();
    return (
        <footer className="bg-base-800 dark:bg-base-900 text-base-200">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="text-lg font-semibold text-primary-400">Aman Digital Care</p>
                    <p className="mt-2 text-sm text-base-300">{t('footer.subtitle')}</p>
                    <div className="mt-4">
                        <p className="text-sm font-medium">
                            {t('contact.info.support_prefix')}
                            <a 
                                href={`mailto:${t('contact.info.support_email')}`} 
                                className="underline hover:text-primary-300 transition-colors"
                            >
                                {t('contact.info.support_email')}
                            </a>
                        </p>
                    </div>
                    <div className="mt-6 border-t border-base-700 pt-6">
                        <div className="flex justify-center gap-x-6 gap-y-2 flex-wrap text-sm text-base-300 mb-4">
                            <a href="/#/" className="hover:text-white hover:underline transition-colors">{t('nav.home')}</a>
                            <a href="/#/programs" className="hover:text-white hover:underline transition-colors">{t('nav.programs')}</a>
                            <a href="/#/resources" className="hover:text-white hover:underline transition-colors">{t('nav.resources')}</a>
                            <a href="/#/about" className="hover:text-white hover:underline transition-colors">{t('nav.about')}</a>
                            <a href="/#/contact" className="hover:text-white hover:underline transition-colors">{t('nav.contact')}</a>
                        </div>
                        <p className="text-sm text-base-400">
                            {t('footer.copyright', { year: new Date().getFullYear() })}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;