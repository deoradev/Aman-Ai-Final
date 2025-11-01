import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { safeLocalStorage } from '../utils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const storedTheme = safeLocalStorage.getItem('amandigitalcare-theme') as Theme;
        if (storedTheme) {
            return storedTheme;
        }
        // Always default to light mode if no theme is stored, ignoring system preference.
        return 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
    safeLocalStorage.setItem('amandigitalcare-theme', theme);
  }, [theme]);

  // This effect runs once on mount, adding a class to the body to enable transitions.
  // This prevents transitions from running on the initial page load.
  useEffect(() => {
    document.body.classList.add('enable-transitions');
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};