import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Flame } from 'lucide-react';

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;
  const difference = new Date(targetDate).getTime() - new Date().getTime();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export default function FlashSaleBanner({ flashSale }) {
  const { t, lng, isAr } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(flashSale?.endDate));

  useEffect(() => {
    if (!flashSale?.endDate) return;

    setTimeLeft(calculateTimeLeft(flashSale.endDate));

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(flashSale.endDate);
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flashSale?.endDate]);

  // If flash sale is disabled by admin or ended, do not render
  if (!flashSale || flashSale.active === false || !timeLeft) {
    return null;
  }

  const title = lng === 'ar' ? (flashSale.title?.ar || 'تخفيضات فلاش') : (flashSale.title?.fr || 'VENTE FLASH');
  const subtitle = lng === 'ar' ? (flashSale.subtitle?.ar || 'خصم يصل إلى 50٪ على مجموعة مختارة.') : (flashSale.subtitle?.fr || "Jusqu'à -50% sur une sélection de produits.");

  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 md:p-5 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between shadow-xl shadow-red-600/20 border border-red-500/30">
      <div className="flex items-center gap-3.5 mb-3 sm:mb-0">
        <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
          <Flame className="w-6 h-6 text-yellow-300 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-lg sm:text-xl tracking-tight leading-tight">{title}</h2>
            {flashSale.discountBadge && (
              <span className="bg-yellow-400 text-red-900 text-xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {flashSale.discountBadge}
              </span>
            )}
          </div>
          <p className="text-red-100 text-xs sm:text-sm mt-0.5 opacity-90">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 bg-red-900/40 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-inner">
        <div className="text-center min-w-[36px]">
          <span className="block text-2xl font-black tabular-nums tracking-tight">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-200">
            {t({ fr: 'Jours', ar: 'أيام' })}
          </span>
        </div>
        <span className="text-xl font-black text-red-300 pb-3">:</span>
        <div className="text-center min-w-[36px]">
          <span className="block text-2xl font-black tabular-nums tracking-tight">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-200">
            {t({ fr: 'Hrs', ar: 'ساعة' })}
          </span>
        </div>
        <span className="text-xl font-black text-red-300 pb-3">:</span>
        <div className="text-center min-w-[36px]">
          <span className="block text-2xl font-black tabular-nums tracking-tight">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-red-200">
            {t({ fr: 'Min', ar: 'دقيقة' })}
          </span>
        </div>
        <span className="text-xl font-black text-red-300 pb-3">:</span>
        <div className="text-center min-w-[36px]">
          <span className="block text-2xl font-black tabular-nums tracking-tight text-yellow-300">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-300">
            {t({ fr: 'Sec', ar: 'ثانية' })}
          </span>
        </div>
      </div>
    </div>
  );
}
