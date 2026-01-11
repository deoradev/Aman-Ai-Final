import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import Logo from './Logo';

const Footer: React.FC = () => {
    const { t } = useLocalization();
    return (
        <footer className="bg-white dark:bg-base-950 border-t border-base-200 dark:border-white/10 pb-[env(safe-area-inset-bottom)] relative z-10">
            <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="flex justify-center mb-6 opacity-90 grayscale hover:grayscale-0 transition-all duration-500">
                        <Logo />
                    </div>
                    
                    {/* Brand Name - Forced Pure White in Dark Mode */}
                    <p className="text-xl font-black text-base-900 dark:text-white tracking-tighter uppercase mb-2">
                        Aman Digital Care
                    </p>
                    
                    {/* Subtitle - Forced Bright Slate in Dark Mode */}
                    <p className="mt-2 text-sm text-base-500 dark:text-slate-200 max-w-md mx-auto leading-relaxed">
                        {t('footer.subtitle')}
                    </p>
                    
                    <div className="mt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-base-400 dark:text-slate-400 mb-2">
                            Technical Support
                        </p>
                        {/* Support Link - Forced Primary 400 for high contrast */}
                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            <a 
                                href={`mailto:${t('contact.info.support_email')}`} 
                                className="underline decoration-primary-500/30 underline-offset-4 hover:decoration-primary-500 transition-all"
                            >
                                {t('contact.info.support_email')}
                            </a>
                        </p>
                    </div>

                    <div className="mt-10 border-t border-base-100 dark:border-white/10 pt-10">
                        {/* Nav Links - Using Primary 300 in Dark Mode for absolute visibility */}
                        <div className="flex justify-center gap-x-8 gap-y-4 flex-wrap text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                            <NavLink to="/" className="text-base-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-white transition-colors">{t('nav.home')}</NavLink>
                            <NavLink to="/programs" className="text-base-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-white transition-colors">{t('nav.programs')}</NavLink>
                            <NavLink to="/resources" className="text-base-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-white transition-colors">{t('nav.resources')}</NavLink>
                            <NavLink to="/about" className="text-base-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-white transition-colors">{t('nav.about')}</NavLink>
                            <NavLink to="/contact" className="text-base-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-white transition-colors">{t('nav.contact')}</NavLink>
                            <NavLink to="/policies" className="text-base-600 dark:text-primary-300 hover:text-primary-600 dark:hover:text-white transition-colors">{t('footer.policies')}</NavLink>
                        </div>
                        
                        {/* Copyright - Forced Slate 400 in Dark Mode */}
                        <p className="text-[10px] font-medium text-base-400 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            {t('footer.copyright', { year: new Date().getFullYear() })}
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default memo(Footer);