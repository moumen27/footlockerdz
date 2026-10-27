import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Clock } from 'lucide-react';

const StockBadge = ({ stock }) => {
  const { t } = useLanguage();
  
  if (stock > 3 || stock <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 rounded-md text-sm font-medium">
      <Clock className="w-4 h-4" />
      <span>{t({ fr: 'Dernières paires', ar: 'آخر الأزواج' })} : {t({ fr: `Plus que ${stock} en stock`, ar: `أكثر من ${stock} في المخزن` })}</span>
    </div>
  );
};

export default StockBadge;
