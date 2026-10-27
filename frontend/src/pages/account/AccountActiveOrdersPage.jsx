import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccountActiveOrdersPage = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">{t({ fr: 'Commandes en cours', ar: 'الطلبات الحالية' })}</h2>
      
      <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-[#11323B]/10 text-[#11323B] rounded-full flex items-center justify-center mx-auto mb-4">
          <Package size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t({ fr: 'Aucune commande en cours', ar: 'لا توجد طلبات حالية' })}</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          {t({ fr: "Vous n'avez pas de commande en cours de livraison pour le moment.", ar: "ليس لديك أي طلبات قيد التوصيل في الوقت الحالي." })}
        </p>
        <Link to="/shop" className="inline-block bg-[#F9A826] text-white px-8 py-3 font-medium hover:bg-orange-600 transition-colors">
          {t({ fr: 'Découvrir nos produits', ar: 'اكتشف منتجاتنا' })}
        </Link>
      </div>
    </div>
  );
};

export default AccountActiveOrdersPage;
