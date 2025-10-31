import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import Logo from './Logo';

const Footer: React.FC = () => {
    const { t } = useLocalization();
    return (
        <footer className="bg-base-800 dark:bg-base-900 text-base-200">
            <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
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
                            <NavLink to="/" className="hover:text-white hover:underline transition-colors">{t('nav.home')}</NavLink>
                            <NavLink to="/programs" className="hover:text-white hover:underline transition-colors">{t('nav.programs')}</NavLink>
                            <NavLink to="/resources" className="hover:text-white hover:underline transition-colors">{t('nav.resources')}</NavLink>
                            <NavLink to="/about" className="hover:text-white hover:underline transition-colors">{t('nav.about')}</NavLink>
                            <NavLink to="/contact" className="hover:text-white hover:underline transition-colors">{t('nav.contact')}</NavLink>
                        </div>
                         <div className="flex justify-center gap-x-4 gap-y-2 flex-wrap text-sm text-base-400 mb-4">
                            <NavLink to="/policies" className="hover:text-white hover:underline transition-colors">{t('footer.policies')}</NavLink>
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

export default memo(Footer);