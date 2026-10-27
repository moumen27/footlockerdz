import React from 'react';
import { Star, ShieldCheck, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const socialProofs = [
  {
    icon: <Star className="w-8 h-8 text-yellow-500" />,
    title: {fr: "Avis 4.8/5", ar: "تقييم 4.8/5"},
    description: {fr: "Des clients satisfaits de nos produits.", ar: "عملاء راضون عن منتجاتنا."}
  },
  {
    icon: <ShieldCheck className="w-8 h-8" style={{ color: '#006233' }} />,
    title: {fr: "100% Original", ar: "أصلي 100%"},
    description: {fr: "Garantie d'authenticité sur tous les produits.", ar: "ضمان الأصالة على جميع المنتجات."}
  },
  {
    icon: <Truck className="w-8 h-8 text-blue-500" />,
    title: {fr: "Livraison 58 Wilayas", ar: "توصيل 58 ولاية"},
    description: {fr: "Livraison rapide et fiable partout en Algérie.", ar: "توصيل سريع وموثوق في جميع أنحاء الجزائر."}
  }
];

export default function SocialProofSection() {
  const { t } = useLanguage();
  
  return (
    <div className="py-12 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {socialProofs.map((proof, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
                {proof.icon}
              </div>
              <h2 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{t(proof.title)}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">{t(proof.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
