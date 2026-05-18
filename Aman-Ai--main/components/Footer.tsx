import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import Logo from './Logo';

const Footer: React.FC = () => {
    const { t } = useLocalization();
    return (
        <footer className="bg-base-50 dark:bg-base-950 border-t border-base-200 dark:border-base-800 pb-[env(safe-area-inset-bottom)] relative z-10 transition-colors duration-500">
            <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="flex justify-center mb-8 opacity-90 grayscale hover:grayscale-0 transition-all duration-700">
                        <Logo />
                    </div>
                    
                    {/* Brand Name */}
                    <p className="text-2xl font-black text-base-950 dark:text-base-50 tracking-tighter uppercase mb-2">
                        Aman Digital Care
                    </p>
                    
                    {/* Subtitle */}
                    <p className="mt-4 text-base text-base-600 dark:text-base-400 max-w-md mx-auto leading-relaxed font-medium">
                        {t('footer.subtitle')}
                    </p>
                    
                    <div className="mt-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-base-500 dark:text-base-400 mb-3">
                            Technical Support
                        </p>
                        {/* Support Link */}
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            <a 
                                href={`mailto:${t('contact.info.support_email')}`} 
                                className="underline decoration-primary-500/30 underline-offset-8 hover:decoration-primary-500 transition-all"
                            >
                                {t('contact.info.support_email')}
                            </a>
                        </p>
                    </div>

                    <div className="mt-12 border-t border-base-100 dark:border-base-800 pt-12">
                        {/* Nav Links */}
                        <div className="flex justify-center gap-x-10 gap-y-6 flex-wrap text-[13px] font-black uppercase tracking-[0.2em] mb-8">
                            <NavLink to="/" className="text-base-800 dark:text-base-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.home')}</NavLink>
                            <NavLink to="/programs" className="text-base-800 dark:text-base-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.programs')}</NavLink>
                            <NavLink to="/resources" className="text-base-800 dark:text-base-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.resources')}</NavLink>
                            <NavLink to="/about" className="text-base-800 dark:text-base-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.about')}</NavLink>
                            <NavLink to="/contact" className="text-base-800 dark:text-base-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('nav.contact')}</NavLink>
                            <NavLink to="/policies" className="text-base-800 dark:text-base-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">{t('footer.policies')}</NavLink>
                        </div>
                        
                        {/* Copyright */}
                        <p className="text-[11px] font-medium text-base-500 dark:text-base-400 leading-relaxed max-w-2xl mx-auto opacity-90">
                            {t('footer.copyright', { year: new Date().getFullYear() })}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default memo(Footer);