
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { translateAll } from '../services/translationService';
import { safeLocalStorage } from '../utils';

// Define the structure for our translations
type Translations = { [key: string]: any };

interface LocalizationContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: { [key: string]: string | number }) => any;
  isLoaded: boolean;
  isTranslating: boolean; 
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper function to get nested properties from the translation object
const getNestedTranslation = (obj: Translations, key: string): any => {
    return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>(() => {
    return safeLocalStorage.getItem('amandigitalcare-language') || 'en';
  });
  
  const [sourceTranslations, setSourceTranslations] = useState<Translations | null>(null);
  const [activeTranslations, setActiveTranslations] = useState<Translations | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load the source English file on initial mount
  useEffect(() => {
    // Fix: Removed the leading slash to make the path relative to the app base
    // This resolves the issue where locales are not found in specific environments
    fetch('Aman-Ai--main/locales/en.json')
      .then(res => {
          if (!res.ok) throw new Error(`HTTP Error: ${res.status} - Could not find en.json`);
          return res.json();
      })
      .then(data => {
        setSourceTranslations(data);
        setActiveTranslations(data);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("CRITICAL: Failed to load en.json", err);
        setError("Application core files could not be loaded.");
        setIsLoaded(true); // Proceed to let app show key fallbacks instead of a blank screen
      });
  }, []);

  // 2. This effect triggers when the language is changed
  useEffect(() => {
    if (!sourceTranslations) return; 

    safeLocalStorage.setItem('amandigitalcare-language', language);
    document.documentElement.lang = language;

    if (language === 'en') {
      setActiveTranslations(sourceTranslations);
      return;
    }

    if (!navigator.onLine) {
      setActiveTranslations(sourceTranslations);
      return;
    }

    const performTranslation = async () => {
      setIsTranslating(true);
      try {
        const translatedData = await translateAll(sourceTranslations, language);
        setActiveTranslations(translatedData);
      } catch (e) {
        console.error(`Translation failed for: ${language}`, e);
        setActiveTranslations(sourceTranslations); // Fallback to English
      } finally {
        setIsTranslating(false);
      }
    };
    
    performTranslation();

  }, [language, sourceTranslations]);

  const t = useCallback((key: string, params?: { [key: string]: string | number }): any => {
    // If translations haven't loaded yet, return an empty string or the last part of the key for a cleaner look
    if (!activeTranslations) return '';

    let translation = getNestedTranslation(activeTranslations, key);

    // Fallback to English source if the translated key is missing
    if (translation === undefined && sourceTranslations) {
        translation = getNestedTranslation(sourceTranslations, key);
    }
    
    let result = translation !== undefined ? translation : key;

    if (params && typeof result === 'string') {
      Object.keys(params).forEach(pKey => {
        result = result.replace(`{${pKey}}`, String(params[pKey]));
      });
    }
    return result;
  }, [activeTranslations, sourceTranslations]);

  if (error && !isLoaded) {
    return <div className="h-screen w-screen flex items-center justify-center bg-red-50 text-red-800 p-10 text-center">
      <div>
        <p className="font-bold text-xl mb-2">System Initialization Error</p>
        <p>{error}</p>
      </div>
    </div>;
  }
  
  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, isLoaded, isTranslating }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
