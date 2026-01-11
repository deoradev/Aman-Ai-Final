import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import Logo from './Logo';

const Footer: React.FC = () => {
    const { t } = useLocalization();
    return (
        <footer className="bg-white dark:bg-base-950 border-t border-base-200 dark:border-base-800 text-base-600 dark:text-base-400">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="flex justify-center mb-6 opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
                        <Logo />
                    </div>
                    <p className="text-xl font-black text-base-900 dark:text-white tracking-tighter uppercase mb-2">Aman Digital Care</p>
                    <p className="mt-2 text-sm text-base-500 dark:text-base-200 max-w-md mx-auto leading-relaxed">{t('footer.subtitle')}</p>
                    
                    <div className="mt-6">
                        <p className="text-xs font-black uppercase tracking-widest text-base-400 dark:text-base-400 mb-2">Technical Support</p>
                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            <a 
                                href={`mailto:${t('contact.info.support_email')}`} 
                                className="underline decoration-primary-500/30 underline-offset-4 hover:decoration-primary-500 transition-all"
                            >
                                {t('contact.info.support_email')}
                            </a>
                        </p>
                    </div>

                    <div className="mt-10 border-t border-base-100 dark:border-base-800 pt-10">
                        <div className="flex justify-center gap-x-8 gap-y-4 flex-wrap text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <NavLink to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base-600 dark:text-base-300">{t('nav.home')}</NavLink>
                            <NavLink to="/programs" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base-600 dark:text-base-300">{t('nav.programs')}</NavLink>
                            <NavLink to="/resources" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base-600 dark:text-base-300">{t('nav.resources')}</NavLink>
                            <NavLink to="/about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base-600 dark:text-base-300">{t('nav.about')}</NavLink>
                            <NavLink to="/contact" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base-600 dark:text-base-300">{t('nav.contact')}</NavLink>
                            <NavLink to="/policies" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-base-600 dark:text-base-300">{t('footer.policies')}</NavLink>
                        </div>
                        
                        <p className="text-[10px] font-medium text-base-400 dark:text-base-500 leading-relaxed max-w-2xl mx-auto">
                            {t('footer.copyright', { year: new Date().getFullYear() })}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default memo(Footer);