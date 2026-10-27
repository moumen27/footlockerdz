import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Truck, ShieldCheck, Undo2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMoney } from '../../context/CurrencyContext';
import CartItem from '../../components/cart/CartItem';
import logolight from '../../assets/icons/logo-light.jpg';
import logodark from '../../assets/icons/logo-dark.jpg';

export default function CartPage() {
  const { cartItems, subtotal, syncing, freeShippingThreshold } = useCart();
  const { t, isAr } = useLanguage();
  const { format } = useMoney();
  const navigate = useNavigate();
  
  const [promoCode, setPromoCode] = useState('');

  // Computed values
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  
  // Delivery estimation logic (simplified mock)
  const isWilayaKnown = false; // Mock
  const deliveryFee = isWilayaKnown ? 500 : null; 
  const total = subtotal + (deliveryFee || 0);



  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-8 pb-20 transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t(isAr ? 'حقيبة التسوق - FootLockerDZ' : 'Mon Panier - FootLockerDZ')}</title>
      </Helmet>

      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
          {t(isAr ? 'حقيبة التسوق' : 'Mon Panier')}
          <span className="text-xl text-gray-500 font-medium ml-3">({cartItems.length} {t(isAr ? 'عناصر' : 'articles')})</span>
        </h1>

        {cartItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 opacity-20 dark:invert mb-6">
              <img src={logolight} alt="Empty Cart" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {t(isAr ? 'حقيبة التسوق الخاصة بك فارغة' : 'Votre panier est vide')}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
              {t(isAr ? 'اكتشف مجموعاتنا الجديدة والعروض الحصرية لإضافة منتجات إلى حقيبتك.' : 'Il semblerait que vous n\'ayez pas encore trouvé votre bonheur. Découvrez nos nouveautés !')}
            </p>
            <Link 
              to="/shop"
              className="bg-[#006233] hover:bg-[#004e28] text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {t(isAr ? 'تسوق الآن' : 'Découvrir la boutique')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Cart Items */}
            <div className="flex-1 space-y-6">
              
              {/* Free Shipping Bar */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 text-center">
                  {remainingForFreeShipping > 0 
                    ? t(isAr ? `أضف ${format(remainingForFreeShipping)} للحصول على توصيل مجاني` : `Plus que ${format(remainingForFreeShipping)} pour la livraison gratuite !`)
                    : t(isAr ? 'تهانينا! التوصيل مجاني' : 'Félicitations ! Vous bénéficiez de la livraison gratuite.')}
                </p>
                <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#006233] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 space-y-2">
                  {cartItems.map(item => (
                    <CartItem key={item.sku} item={item} />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Summary */}
            <div className="w-full lg:w-[400px] shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {t(isAr ? 'ملخص الطلب' : 'Récapitulatif')}
                </h3>

                {/* Promo Code */}
                <div className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder={t(isAr ? 'رمز الترويجي' : 'Code promo')}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#006233] outline-none transition-all dark:text-white font-medium"
                  />
                  <button className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md">
                    {t(isAr ? 'تطبيق' : 'Appliquer')}
                  </button>
                </div>

                {/* Totals */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t(isAr ? 'المجموع الفرعي' : 'Sous-total')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{format(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t(isAr ? 'التوصيل' : 'Livraison estimée')}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {deliveryFee !== null ? format(deliveryFee) : t(isAr ? 'يُحسب لاحقاً' : 'Calculée à l\'étape suivante')}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{t(isAr ? 'المجموع' : 'Total')}</span>
                    <span className="text-2xl font-black text-[#006233]">{format(total)}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <button 
                  onClick={() => navigate('/checkout')}
                  disabled={syncing}
                  className="w-full bg-[#006233] hover:bg-[#004e28] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mb-6"
                >
                  {t(isAr ? 'متابعة الدفع' : 'Passer à la caisse')}
                  <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
                </button>

                {/* Trust Icons */}
                <div className="flex justify-between items-center py-4 border-t border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center gap-2 text-xs font-medium w-1/3 text-center">
                    <Truck className="w-6 h-6 mb-1 text-gray-400" />
                    {t(isAr ? 'توصيل سريع' : 'Livraison 58 wilayas')}
                  </div>
                  <div className="flex flex-col items-center gap-2 text-xs font-medium w-1/3 text-center border-l border-r border-gray-100 dark:border-gray-700">
                    <ShieldCheck className="w-6 h-6 mb-1 text-gray-400" />
                    {t(isAr ? 'منتجات أصلية' : 'Authenticité garantie')}
                  </div>
                  <div className="flex flex-col items-center gap-2 text-xs font-medium w-1/3 text-center">
                    <Undo2 className="w-6 h-6 mb-1 text-gray-400" />
                    {t(isAr ? 'إرجاع مجاني' : 'Retours sous 30 j.')}
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
