import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function SearchBar({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { t, isAr } = useLanguage();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-b border-gray-100 dark:border-gray-800 shadow-lg z-50 transition-all duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} w-5 h-5 text-gray-400`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? "ابحث عن المنتجات..." : "Rechercher des produits..."}
            className={`w-full bg-gray-50 dark:bg-gray-800 border-none rounded-full py-3 ${isAr ? 'pr-12 pl-12' : 'pl-12 pr-12'} text-gray-900 dark:text-white focus:ring-2 focus:ring-[#006233] outline-none transition-colors`}
          />
          <button
            type="button"
            onClick={onClose}
            className={`absolute ${isAr ? 'left-4' : 'right-4'} p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
