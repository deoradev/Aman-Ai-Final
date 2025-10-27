import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useConnectivity } from '../hooks/useConnectivity'; // Import the connectivity hook
import { COMMON_LANGUAGES, ALL_LANGUAGES } from '../constants';
import { getUserName } from '../utils';

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
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors text-base-700 dark:text-base-300 hover:bg-base-100/50 dark:hover:bg-base-700/50 flex items-center"
            >
                {item.text}
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ml-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-base-50 dark:bg-base-800 rounded-xl shadow-soft-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                    {item.children?.map(child => (
                        <NavLink
                            key={child.to}
                            to={child.to!}
                            onClick={() => setIsOpen(false)}
                            className={({ isActive }) =>
                                `block px-4 py-2 text-sm transition-colors ${
                                  isActive ? 'bg-primary-500 text-white' : 'text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'
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
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isOnline } = useConnectivity(); // Use connectivity status
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
      ],
    },
  ];

  const welcomeMessage = currentUser
    ? t('header.welcome_user', { name: getUserName(currentUser) })
    : t('header.welcome_anonymous');

  const ThemeToggle: React.FC = () => (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors text-base-600 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-base-800 focus:ring-primary-500"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.464A1 1 0 106.465 13.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm-1.414-2.12a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z" clipRule="evenodd" /></svg>
      )}
    </button>
  );

  return (
    <header className="bg-base-50/80 dark:bg-base-900/80 backdrop-blur-sm shadow-soft sticky top-0 z-40 border-b border-base-200 dark:border-base-800">
      {isTranslating && (
        <div className="absolute top-full left-0 w-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 text-sm font-semibold py-1 px-4 text-center z-30 animate-fade-in-down">
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('header.translating_to', { language: targetLanguageName })}</span>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <NavLink to="/"><Logo /></NavLink>
            {!isOnline && (
                <span className="flex items-center gap-2 px-3 py-1 bg-warning-100 dark:bg-warning-900/50 text-warning-800 dark:text-warning-200 text-xs font-bold rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-500"></span>
                    </span>
                    {t('offline.indicator')}
                </span>
            )}
          </div>
          <nav className="hidden lg:flex items-center space-x-2">
            {navLinks.map(link => (
              link.children ? <Dropdown key={link.text} item={link} /> :
              <NavLink
                key={link.to}
                to={link.to!}
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary-500 text-white' : 'text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}
              >
                {link.text}
              </NavLink>
            ))}
          </nav>
          <div className="hidden lg:flex items-center space-x-2">
            <NavLink
                to="/profile"
                className={({ isActive }) => `px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive ? 'bg-primary-500 text-white' : 'text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}
            >
              {currentUser ? <span className="truncate max-w-[150px] inline-block">{getUserName(currentUser)}</span> : t('nav.login')}
            </NavLink>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-base-100 dark:bg-base-700 border-2 border-base-200 dark:border-base-600 text-base-700 dark:text-base-200 rounded-md py-1 pl-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select language"
              >
                {Object.entries(COMMON_LANGUAGES).map(([code, name]) => (<option key={code} value={code}>{name}</option>))}
              </select>
            </div>
            <ThemeToggle />
          </div>
          <div className="-mr-2 flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-base-500 hover:text-white hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-base-800 focus:ring-white"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="px-3 py-2 flex justify-between items-center">
                <p className="text-sm font-medium text-base-500 dark:text-base-400">{welcomeMessage}</p>
                <ThemeToggle />
            </div>
            {navLinks.flatMap(link =>
                link.children ? [
                    <p key={link.text} className="px-3 pt-4 pb-1 text-xs font-bold uppercase text-base-500 dark:text-base-400">{link.text}</p>,
                    ...link.children.map(child => (
                        <NavLink key={child.to} to={child.to!} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary-500 text-white' : 'text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}>{child.text}</NavLink>
                    ))
                ] : [
                    <NavLink key={link.to} to={link.to!} onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary-500 text-white' : 'text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}>{link.text}</NavLink>
                ]
            )}
            <NavLink to="/profile" onClick={() => setMobileMenuOpen(false)} className={({isActive}) => `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary-500 text-white' : 'text-base-700 dark:text-base-300 hover:bg-base-100 dark:hover:bg-base-700'}`}>
                {currentUser ? getUserName(currentUser) : t('nav.login')}
            </NavLink>
            <div className="px-3 pt-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-base-100 dark:bg-base-700 border-2 border-base-200 dark:border-base-600 text-base-700 dark:text-base-200 rounded-md py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Select language"
              >
                {Object.entries(COMMON_LANGUAGES).map(([code, name]) => (<option key={code} value={code}>{name}</option>))}
              </select>
            </div>
          </div>
        </div>
      )}
       <style>{`
        @keyframes fade-in-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.3s ease-out forwards;
        }
      `}</style>
    </header>
  );
};

export default Header;