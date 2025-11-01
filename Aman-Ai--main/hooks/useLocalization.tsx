import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { translateAll } from '../services/translationService';
import { safeLocalStorage } from '../utils';

// Define the structure for our translations
type Translations = { [key: string]: any };

interface LocalizationContextType {
  language: string;
  setLanguage: (language: string) => void;
  // FIX: Changed return type to `any` to support returning complex objects (like arrays) from translation files.
  t: (key: string, params?: { [key: string]: string | number }) => any;
  isLoaded: boolean;
  isTranslating: boolean; // New state to indicate translation is in progress
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

// Helper function to get nested properties from the translation object
// FIX: Changed return type to `any` to correctly return nested objects and arrays.
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
    fetch('/Aman-Ai--main/locales/en.json')
      .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
      })
      .then(data => {
        setSourceTranslations(data);
        setActiveTranslations(data);
        setIsLoaded(true);
      })
      .catch(err => {
        console.error("CRITICAL: Could not load source English translations.", err);
        setError("Application core files could not be loaded.");
        setIsLoaded(true); // Still show the app, even if broken.
      });
  }, []);

  // 2. This effect triggers when the language is changed
  useEffect(() => {
    if (!sourceTranslations) return; // Wait for English to load

    safeLocalStorage.setItem('amandigitalcare-language', language);
    document.documentElement.lang = language;

    if (language === 'en') {
      setActiveTranslations(sourceTranslations);
      return;
    }

    if (!navigator.onLine) {
      console.warn("Offline: Cannot fetch new language pack. Defaulting to English.");
      setActiveTranslations(sourceTranslations);
      return;
    }

    const performTranslation = async () => {
      setIsTranslating(true);
      try {
        const translatedData = await translateAll(sourceTranslations, language);
        setActiveTranslations(translatedData);
      } catch (e) {
        console.error(`Failed to translate to ${language}`, e);
        // Alert removed for better UX. The app will just stay in English.
        setActiveTranslations(sourceTranslations); // Fallback to English on error
      } finally {
        setIsTranslating(false);
      }
    };
    
    performTranslation();

  }, [language, sourceTranslations]);

  // The translation function
  // FIX: Changed return type to `any` and added a check to only perform string replacement on strings, preventing runtime errors with array/object values.
  const t = useCallback((key: string, params?: { [key: string]: string | number }): any => {
    if (!activeTranslations) return key;

    let translation = getNestedTranslation(activeTranslations, key);

    // Fallback to English if a specific key is missing in the translated language
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

  if (error) {
    return <div className="h-screen w-screen flex items-center justify-center bg-red-100 text-red-800">{error}</div>;
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