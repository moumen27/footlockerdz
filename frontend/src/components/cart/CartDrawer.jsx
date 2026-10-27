import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Truck, ShieldCheck, Undo2, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMoney } from '../../context/CurrencyContext';
import CartItem from './CartItem';
import logolight from '../../assets/icons/logo-light.jpg';
import logodark from '../../assets/icons/logo-dark.jpg';

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, subtotal, clearCart, syncing, freeShippingThreshold } = useCart();
  const { t, isAr } = useLanguage();
  const { format } = useMoney();
  const navigate = useNavigate();
  
  const [promoCode, setPromoCode] = useState('');

  // Computed values
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  
  // Delivery estimation logic (simplified mock)
  const isWilayaKnown = false; // Mock: user logged in with address
  const deliveryFee = isWilayaKnown ? 500 : null; 
  const total = subtotal + (deliveryFee || 0);

  // Close handler
  const handleClose = () => setIsCartOpen(false);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 bottom-0 ${isAr ? 'left-0' : 'right-0'} w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[101] flex flex-col transition-transform transform translate-x-0`}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {t(isAr ? 'حقيبة التسوق' : 'Mon Panier')}
            <span className="bg-[#006233] text-white text-xs py-0.5 px-2 rounded-full font-bold">
              {cartItems.length}
            </span>
          </h2>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-black dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Fermer le panier"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Bar */}
        {cartItems.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 text-center">
              {remainingForFreeShipping > 0 
                ? t(isAr ? `أضف ${format(remainingForFreeShipping)} للحصول على توصيل مجاني` : `Plus que ${format(remainingForFreeShipping)} pour la livraison gratuite`)
                : t(isAr ? 'تهانينا! التوصيل مجاني' : 'Félicitations ! La livraison est gratuite')}
            </p>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#006233] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {cartItems.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-6">
              <div className="w-24 h-24 opacity-20 dark:invert">
                <img src={logolight} alt="Empty Cart" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t(isAr ? 'حقيبة التسوق فارغة' : 'Votre panier est vide')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {t(isAr ? 'اكتشف مجموعاتنا الجديدة والعروض الحصرية.' : 'Découvrez nos nouvelles collections et offres exclusives.')}
                </p>
                <button 
                  onClick={() => { handleClose(); navigate('/shop'); }}
                  className="bg-[#006233] hover:bg-[#004e28] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  {t(isAr ? 'تسوق الآن' : 'Commencer mes achats')}
                </button>
              </div>
            </div>
          ) : (
            /* Cart Items */
            <div className="space-y-2">
              {cartItems.map(item => (
                <CartItem key={item.sku} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
            
            {/* Promo Code */}
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder={t(isAr ? 'رمز الترويجي' : 'Code promo')}
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:ring-2 focus:ring-[#006233] outline-none transition-all dark:text-white"
              />
              <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-lg text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                {t(isAr ? 'تطبيق' : 'Appliquer')}
              </button>
            </div>

            {/* Totals */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t(isAr ? 'المجموع الفرعي' : 'Sous-total')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>{t(isAr ? 'التوصيل' : 'Livraison estimée')}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {deliveryFee !== null ? format(deliveryFee) : t(isAr ? 'يُحسب لاحقاً' : 'Calculée à l\'étape suivante')}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center mt-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{t(isAr ? 'المجموع' : 'Total')}</span>
                <span className="text-xl font-extrabold text-[#006233]">{format(total)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <button 
              onClick={() => { handleClose(); navigate('/checkout'); }}
              disabled={syncing}
              className="w-full bg-[#006233] hover:bg-[#004e28] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {t(isAr ? 'متابعة الدفع' : 'Commander')}
              <ArrowRight className={`w-5 h-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            
            {/* View full cart link */}
            <div className="mt-3 text-center">
              <Link 
                to="/cart" 
                onClick={handleClose}
                className="text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white underline"
              >
                {t(isAr ? 'عرض الحقيبة بالكامل' : 'Voir le panier complet')}
              </Link>
            </div>

            {/* Trust Icons */}
            <div className="flex justify-center gap-6 mt-6 pb-2">
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-center gap-1 text-gray-400">
                <Undo2 className="w-5 h-5" />
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
