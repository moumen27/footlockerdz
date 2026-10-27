import React, { useState } from 'react';
import pumaPng from '../../assets/icons/puma.png';
import nbPng from '../../assets/icons/new-balance-logo-png_seeklogo-98723.png';
import reebokPng from '../../assets/icons/Reebok-logo.png';
import vansPng from '../../assets/icons/vans.png';

/**
 * Universal BrandLogo component that renders high-definition vector SVGs
 * or local images with foolproof fallbacks, supporting light/dark theme seamlessly.
 */
export default function BrandLogo({ brandName = '', slug = '', logoUrl = '', className = 'h-12 w-auto max-w-[120px] object-contain' }) {
  const [imgError, setImgError] = useState(false);
  const normalized = (slug || brandName || '').toLowerCase().replace(/[\s_]+/g, '-');

  // If we have an explicit image that hasn't errored
  const localImageMap = {
    'puma': pumaPng,
    'new-balance': nbPng,
    'reebok': reebokPng,
    'vans': vansPng,
  };

  const localImg = localImageMap[normalized];

  // Specific high-precision SVGs for brands without local images or as clean vector alternates
  if (normalized === 'nike') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`dark:text-white text-gray-900 ${className}`} aria-label="Nike">
        <path d="M21.707 5.293c-2.454 1.83-5.228 3.535-7.79 5.378-2.678 1.927-5.074 4.092-7.514 6.302-1.393 1.261-2.905 2.705-4.636 2.025-1.463-.574-1.928-2.155-1.57-3.528.461-1.764 1.956-3.155 3.39-4.246 3.528-2.677 7.42-4.802 11.458-6.612 2.22-.995 4.54-1.848 6.942-2.15.54-.068 1.15.114 1.34.64.21.57-.27 1.15-.62 1.591z" />
      </svg>
    );
  }

  if (normalized === 'adidas') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`dark:text-white text-gray-900 ${className}`} aria-label="Adidas">
        <path d="M4.8 19.5L1.5 19.5L3.8 14.8L7.1 14.8L4.8 19.5ZM10.5 19.5L7.2 19.5L11.8 10.2L15.1 10.2L10.5 19.5ZM16.2 19.5L12.9 19.5L19.8 5.5L23.1 5.5L16.2 19.5Z" />
      </svg>
    );
  }

  if (normalized === 'converse') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`dark:text-white text-gray-900 ${className}`} aria-label="Converse">
        <path d="M12 2l2.6 6.5h6.9l-5.4 4.3 2 6.7L12 15.6l-6.1 3.9 2-6.7-5.4-4.3h6.9L12 2z" />
        <path d="M18.5 7.5l4 4.5-4 4.5v-3l-1.5-1.5 1.5-1.5v-3z" />
      </svg>
    );
  }

  if (normalized === 'under-armour') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className={`dark:text-white text-gray-900 ${className}`} aria-label="Under Armour">
        <path d="M12 13.5c-2.5 0-4.5-2-4.5-4.5V3h2.6v6c0 1 .8 1.9 1.9 1.9s1.9-.9 1.9-1.9V3H16.5v6c0 2.5-2 4.5-4.5 4.5zm0-3c2.5 0 4.5 2 4.5 4.5V21H13.9v-6c0-1-.8-1.9-1.9-1.9s-1.9.9-1.9 1.9v6H7.5v-6c0-2.5 2-4.5 4.5-4.5z" />
      </svg>
    );
  }

  if (normalized === 'asics') {
    return (
      <svg viewBox="0 0 100 40" fill="currentColor" className={`dark:text-white text-gray-900 ${className}`} aria-label="Asics">
        <path d="M14 6 C7 11 2 20 2 28 C2 34 6 38 12 38 C20 38 27 32 30 24 L24 24 C21 28 17 31 13 31 C9 31 7 28 8 24 C9 18 16 11 25 7 L21 3 C18 4 16 5 14 6 Z M20 18 C15 21 11 25 10 28 C14 26 21 22 25 18 Z" />
        <text x="36" y="30" fontFamily="sans-serif" fontWeight="900" fontStyle="italic" fontSize="26" letterSpacing="2">asics</text>
      </svg>
    );
  }

  if (normalized === 'campus') {
    return (
      <div className={`flex items-center justify-center font-black tracking-widest uppercase text-xl dark:text-white text-gray-900 font-sans border-2 border-current px-3 py-1 rounded-md ${className}`}>
        CAMPUS
      </div>
    );
  }

  // If we have a local png asset (Puma, NB, Reebok, Vans)
  if (localImg) {
    return (
      <img
        src={localImg}
        alt={brandName}
        className={`object-contain transition-all duration-300 dark:invert ${className}`}
        loading="lazy"
      />
    );
  }

  // If remote URL is given and didn't fail
  if (logoUrl && !imgError && !logoUrl.includes('placeholder')) {
    return (
      <img
        src={logoUrl}
        alt={brandName}
        onError={() => setImgError(true)}
        className={`object-contain transition-all duration-300 dark:invert ${className}`}
        loading="lazy"
      />
    );
  }

  // Fallback typography badge
  return (
    <span className={`font-black uppercase tracking-wider text-xl text-gray-800 dark:text-gray-100 ${className}`}>
      {brandName}
    </span>
  );
}
