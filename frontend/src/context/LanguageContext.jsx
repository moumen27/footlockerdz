import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lng, setLng] = useState(() => localStorage.getItem('fldz.lng') || 'fr'); // 'fr' or 'ar'

  const changeLanguage = (newLang) => {
    setLng(newLang);
    localStorage.setItem('fldz.lng', newLang);
  };

  const toggleLanguage = () => {
    const newLang = lng === 'fr' ? 'ar' : 'fr';
    changeLanguage(newLang);
  };

  /**
   * Given a localised name object { fr: '...', ar: '...' }
   * or a plain string (legacy), returns the correct label.
   */
  const t = (nameObj) => {
    if (!nameObj) return '';
    if (typeof nameObj === 'string') return nameObj;
    let val = nameObj[lng] || nameObj.fr || nameObj.ar || '';
    if (typeof val === 'object' && val !== null) {
      val = val[lng] || val.fr || val.ar || '';
    }
    return typeof val === 'string' ? val : '';
  };

  return (
    <LanguageContext.Provider value={{ lng, toggleLanguage, changeLanguage, t, isAr: lng === 'ar' }}>
      <div dir={lng === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
