import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useConnectivity } from '../hooks/useConnectivity';
import { ALL_LANGUAGES } from '../constants';
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
                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all text-base-700 dark:text-base-300 hover:bg-base-100/50 dark:hover:bg-base-700/50 flex items-center"
            >
                {item.text}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ml-2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-white/95 dark:bg-base-800/95 backdrop-blur-3xl rounded-[1.5rem] shadow-2xl py-3 border border-white/20 dark:border-base-700/30 z-50 animate-enter">
                    {item.children?.map(child => (
                        <NavLink
                            key={child.to}
                            to={child.to!}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `block px-6 py-3 text-sm font-semibold transition-all ${
                                  isActive ? 'text-primary-500 bg-primary-500/5' : 'text-base-600 dark:text-base-400 hover:text-primary-500'
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
  const { t, isTranslating, language } = useLocalization();
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

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);
  
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
    <>
    <header className="bg-white/70 dark:bg-base-900/70 backdrop-blur-3xl shadow-soft sticky top-0 z-40 border-b border-white/10 dark:border-base-800/40 h-20">
      {isTranslating && (
        <div className="absolute top-full left-0 w-full bg-primary-500 text-white text-[9px] font-black py-1 px-4 text-center z-30 uppercase tracking-[0.4em] shadow-lg animate-pulse">
          Translating to {targetLanguageName}...
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="hover:scale-105 transition-transform"><Logo /></NavLink>
            
            {currentUser && streak > 0 && (
                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 shadow-inner group cursor-default">
                    <span className="text-lg group-hover:scale-125 transition-transform">🔥</span>
                    <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">{streak} Day Streak</span>
                </div>
            )}

            {!isOnline && (
                <span className="flex items-center gap-2 px-3 py-1 bg-warning-500 text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg animate-pulse">
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
                className={({ isActive }) => `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${isActive ? 'text-primary-500 bg-primary-500/5' : 'text-base-700 dark:text-base-300 hover:text-primary-500'}`}
              >
                {link.text}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-6">
            <NavLink
                to="/profile"
                className={({ isActive }) => `flex items-center gap-3 pl-3 pr-6 py-2 rounded-full border border-base-200 dark:border-base-700 transition-all hover:border-primary-500 ${isActive ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/30' : 'bg-white/50 dark:bg-base-800/50 text-base-800 dark:text-base-200 shadow-soft'}`}
            >
              <div className="w-6 h-6 rounded-full bg-base-100 dark:bg-base-900 flex items-center justify-center overflow-hidden border border-black/5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[120px]">{currentUser ? getUserName(currentUser) : t('nav.login')}</span>
            </NavLink>
            
            <button onClick={toggleTheme} className="p-2.5 rounded-2xl bg-base-50 dark:bg-base-800 text-base-600 dark:text-base-300 hover:text-primary-500 transition-all border border-base-200 dark:border-base-700 active:scale-90 shadow-sm">
              {theme === 'light' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2 rounded-xl bg-base-100 dark:bg-base-800 text-base-600 dark:text-base-400">
                {theme === 'light' ? <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg> : <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.464A1 1 0 106.465 13.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm-1.414-2.12a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" /></svg>}
             </button>
             <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-base-800 dark:text-white">
               <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
             </button>
          </div>
        </div>
      </div>
    </header>

    {/* Mobile Sidebar Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-[999] lg:hidden">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-base-950/40 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div className="absolute inset-x-0 top-0 bg-white dark:bg-base-950 shadow-2xl rounded-b-[3rem] overflow-hidden animate-slide-down border-b border-primary-500/20">
          <div className="relative pt-6 px-4 pb-12 max-h-[90vh] overflow-y-auto text-center">
            <div className="flex justify-between items-center mb-8 px-2">
              <Logo />
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3 rounded-full bg-base-100 dark:bg-base-800 text-base-800 dark:text-white active:scale-90 transition-transform"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
                {navLinks.flatMap(link =>
                    link.children ? [
                        <p key={link.text} className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 mb-2 mt-6 px-4 opacity-70">{link.text}</p>,
                        ...link.children.map(child => (
                            <NavLink 
                                key={child.to} 
                                to={child.to!} 
                                onClick={() => setMobileMenuOpen(false)} 
                                className={({isActive}) => `px-4 py-3 text-2xl font-black tracking-tighter transition-all rounded-2xl ${isActive ? 'text-primary-600 dark:text-base-950 bg-primary-500/10 dark:bg-primary-400' : 'text-base-900 dark:text-base-100 hover:bg-base-50 dark:hover:bg-base-900'}`}
                            >
                                {child.text}
                            </NavLink>
                        ))
                    ] : [
                        <NavLink 
                            key={link.to} 
                            to={link.to!} 
                            onClick={() => setMobileMenuOpen(false)} 
                            className={({isActive}) => `px-4 py-3 text-2xl font-black tracking-tighter transition-all rounded-2xl ${isActive ? 'text-primary-600 dark:text-base-950 bg-primary-500/10 dark:bg-primary-400' : 'text-base-900 dark:text-base-100 hover:bg-base-50 dark:hover:bg-base-900'}`}
                        >
                            {link.text}
                        </NavLink>
                    ]
                )}
            </nav>
            
            <div className="mt-10 pt-8 border-t border-base-100 dark:border-base-800">
                <NavLink 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="flex items-center justify-between p-6 bg-primary-500 rounded-3xl text-white shadow-xl shadow-primary-500/20 active:scale-95 transition-transform"
                >
                    <div className="text-left">
                        <p className="text-[10px] uppercase font-black tracking-widest opacity-80">Account</p>
                        <p className="text-xl font-black mt-1 truncate max-w-[200px]">{currentUser ? getUserName(currentUser) : t('nav.login')}</p>
                    </div>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </NavLink>
            </div>
          </div>
        </div>
      </div>
    )}

    <style>{`
      @keyframes slide-down {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      .animate-slide-down {
        animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `}</style>
    </>
  );
};

export default Header;