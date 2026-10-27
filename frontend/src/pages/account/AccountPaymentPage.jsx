import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CreditCard } from 'lucide-react';

const AccountPaymentPage = () => {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">{t({ fr: 'Moyens de paiement', ar: 'طرق الدفع' })}</h2>
      
      <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-[#11323B]/10 text-[#11323B] rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} />
        </div>
        <h3 className="text-xl font-semibold mb-2">{t({ fr: 'Aucun moyen de paiement', ar: 'لا توجد طرق دفع' })}</h3>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          {t({ fr: "Vous n'avez pas encore enregistré de moyen de paiement. Vous pourrez le faire lors de votre prochaine commande.", ar: "لم تقم بحفظ أي طريقة دفع بعد. يمكنك القيام بذلك في طلبك القادم." })}
        </p>
      </div>
    </div>
  );
};

export default AccountPaymentPage;
