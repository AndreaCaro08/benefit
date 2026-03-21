import { createContext, useContext } from 'react';

export const LanguageContext = createContext<{
  language: string | null;
  setLanguage: (lang: string) => void;
}>({ language: null, setLanguage: () => {} });

export const useLanguage = () => useContext(LanguageContext);
