import React from 'react';
import { X } from 'lucide-react';
import FilterBar from './FilterBar';
import { useLanguage } from '../../context/LanguageContext';

export default function FilterDrawerMobile({ isOpen, onClose, facets, isLoading, forceFilter, forceBrand }) {
  const { t, isAr } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Drawer */}
      <div className={`relative flex flex-col w-full max-w-xs h-full bg-white dark:bg-gray-900 shadow-xl overflow-hidden transition-transform ${isAr ? 'mr-auto' : 'ml-auto'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t({fr: 'Filtres', ar: 'تصفية'})}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <FilterBar facets={facets} isLoading={isLoading} forceFilter={forceFilter} forceBrand={forceBrand} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-[#006233] text-white font-bold rounded-lg hover:bg-[#004e28] transition-colors"
          >
            {t({fr: 'Voir les résultats', ar: 'عرض النتائج'})}
          </button>
        </div>
      </div>
    </div>
  );
}
