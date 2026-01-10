
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useConnectivity } from '../hooks/useConnectivity';
import { ALL_LANGUAGES, COMMON_LANGUAGES } from '../constants';
import { getUserName, calculateJournalStreak } from '../utils';
import { JournalEntry } from '../types';

interface NavItem {
    to?: string;
    text: string;
    children?: NavItem[];
}

const Dropdown: React.FC<{ item: NavItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const node = useRef<HTMLDivElement>(null);

    const handleClickOutside = (e: MouseEvent) => {
        if (node.current?.contains(e.target as Node)) {
            return;
        }
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={node}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-2 rounded-lg text-xs font-bold transition-all text-base-700 dark:text-base-300 hover:bg-base-100/50 dark:hover:bg-base-700/50 flex items-center uppercase tracking-wider"
            >
                {item.text}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ml-1.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white/95 dark:bg-base-800/95 backdrop-blur-xl rounded-2xl shadow-soft-lg py-2 border border-white/20 dark:border-base-700/30 z-50">
                    {item.children?.map(child => (
                        <NavLink
                            key={child.to}
                            to={child.to!}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `block px-5 py-2.5 text-sm transition-all ${
                                  isActive ? 'text-primary-500 font-bold bg-primary-500/5' : 'text-base-600 dark:text-base-400 hover:text-primary-500'
                                }`
                            }
                        >
                            {child.text}
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    )
}

const Header: React.FC = () => {
  const { language, setLanguage, t, isTranslating } = useLocalization();
  const { currentUser, getScopedKey } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline } = useConnectivity();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (currentUser) {
        const journals: JournalEntry[] = JSON.parse(localStorage.getItem(getScopedKey('journal-entries')) || '[]');
        setStreak(calculateJournalStreak(journals));
    }
  }, [currentUser, getScopedKey]);
  
  const targetLanguageName = useMemo(() => {
    return ALL_LANGUAGES.find(l => l.code === language)?.name || language;
  }, [language]);

  const navLinks: NavItem[] = [
    { to: '/', text: t('nav.home') },
    { to: '/dashboard', text: t('nav.dashboard') },
    { to: '/programs', text: t('nav.programs') },
    {
      text: t('nav.features'),
      children: [
        { to: '/analytics', text: t('nav.analytics') },
        { to: '/resources', text: t('nav.resources') },
        { to: '/community', text: t('nav.community_wall') },
        { to: '/group-session', text: t('nav.group_session') },
        { to: '/live-talk', text: t('nav.live_talk') },
        { to: '/toolkit', text: t('nav.toolkit') },
        { to: '/conversation-practice', text: t('nav.conversation_practice') },
        { to: '/prevention-plan', text: t('nav.prevention_plan') },
        { to: '/sober-circle', text: t('nav.sober_circle') },
      ],
    },
    {
      text: t('nav.about_us_group'),
      children: [
        { to: '/about', text: t('nav.about') },
        { to: '/our-approach', text: t('nav.our_approach') },
        { to: '/contact', text: t('nav.contact') },
        { to: '/policies', text: t('nav.policies_legal') },
      ],
    },
  ];

  return (
    <header className="bg-white/70 dark:bg-base-900/70 backdrop-blur-xl shadow-soft sticky top-0 z-40 border-b border-white/20 dark:border-base-800/50">
      {isTranslating && (
        <div className="absolute top-full left-0 w-full bg-primary-500 text-white text-[10px] font-black py-0.5 px-4 text-center z-30 uppercase tracking-[0.2em]">
          {t('header.translating_to', { language: targetLanguageName })}
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-6">
            <NavLink to="/"><Logo /></NavLink>
            
            {currentUser && streak > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-orange-500/10 rounded-full border border-orange-500/20 animate-fade-in">
                    <span className="text-lg">🔥</span>
                    <span className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-tighter">{streak} Day Streak</span>
                </div>
            )}

            {!isOnline && (
                <span className="flex items-center gap-2 px-3 py-1 bg-warning-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    {t('offline.indicator')}
                </span>
            )}
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map(link => (
              link.children ? <Dropdown key={link.text} item={link} /> :
              <NavLink
                key={link.to}
                to={link.to!}
                className={({ isActive }) => `px-3 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${isActive ? 'text-primary-500' : 'text-base-700 dark:text-base-300 hover:text-primary-500'}`}
              >
                {link.text}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <NavLink
                to="/profile"
                className={({ isActive }) => `flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border-2 transition-all ${isActive ? 'border-primary-500 bg-primary-500/5 text-primary-500' : 'border-base-200 dark:border-base-700 text-base-600 dark:text-base-400 hover:border-primary-300'}`}
            >
              <div className="w-6 h-6 rounded-full bg-base-200 dark:bg-base-700 flex items-center justify-center overflow-hidden">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-xs font-black uppercase tracking-tight truncate max-w-[100px]">{currentUser ? getUserName(currentUser) : t('nav.login')}</span>
            </NavLink>
            
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-base-100 dark:bg-base-800 text-base-600 dark:text-base-400 hover:text-primary-500 transition-all border border-base-200 dark:border-base-700 shadow-sm active:scale-90">
              {theme === 'light' ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-3">
             <button onClick={toggleTheme} className="p-2 rounded-lg bg-base-100 dark:bg-base-800 text-base-600 dark:text-base-400 active:scale-90">
                {theme === 'light' ? <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.464A1 1 0 106.465 13.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm-1.414-2.12a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" /></svg>}
             </button>
             <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-base-600 dark:text-base-400 active:scale-90">
               {isMobileMenuOpen ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>}
             </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-white/95 dark:bg-base-950/95 backdrop-blur-2xl z-50 overflow-y-auto animate-fade-in-up">
          <div className="p-6 space-y-6">
            <div className="flex flex-col gap-4">
                {navLinks.flatMap(link =>
                    link.children ? [
                        <p key={link.text} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-2">{link.text}</p>,
                        ...link.children.map(child => (
                            <NavLink key={child.to} to={child.to!} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `text-xl font-bold ${isActive ? 'text-primary-500' : 'text-base-900 dark:text-base-100'}`}>{child.text}</NavLink>
                        ))
                    ] : [
                        <NavLink key={link.to} to={link.to!} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `text-xl font-bold ${isActive ? 'text-primary-500' : 'text-base-900 dark:text-base-100'}`}>{link.text}</NavLink>
                    ]
                )}
            </div>
            
            <div className="pt-6 border-t border-base-200 dark:border-base-800">
                <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between p-4 bg-primary-500 rounded-2xl text-white shadow-lg">
                    <span className="font-bold">{currentUser ? getUserName(currentUser) : t('nav.login')}</span>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
