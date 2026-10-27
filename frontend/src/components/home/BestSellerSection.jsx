import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '../../api/shopApi';
import { settingsApi } from '../../api/settingsApi';
import { useLanguage } from '../../context/LanguageContext';
import ProductCard from '../product/ProductCard';
import QuickViewModal from '../product/QuickViewModal';

const calculateTimeLeft = (targetDate) => {
  if (!targetDate) return null;
  const difference = new Date(targetDate).getTime() - Date.now();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

export default function BestSellerSection() {
  const { t } = useLanguage();
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // 1. Fetch real admin settings for flash sale
  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 60 * 1000,
  });

  const flashSale = settingsData?.flashSale;
  const isFlashActive = Boolean(flashSale?.active && flashSale?.endDate);

  const [timeLeft, setTimeLeft] = useState(() => (isFlashActive ? calculateTimeLeft(flashSale?.endDate) : null));

  useEffect(() => {
    if (!isFlashActive || !flashSale?.endDate) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(calculateTimeLeft(flashSale.endDate));

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(flashSale.endDate);
      setTimeLeft(remaining);
      if (!remaining) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isFlashActive, flashSale?.endDate]);

  const { data: promoResult, isLoading } = useQuery({
    queryKey: ['products', 'bestSellersHome'],
    queryFn: async () => {
      // 1. Fetch promo products (discountPrice > 0)
      const res = await shopApi.getProducts({ promo: true });
      if (res?.items && res.items.length > 0) {
        return {
          items: res.items.slice(0, 8),
          total: res.items.length
        };
      }
      // 2. Fallback to general catalog
      const allRes = await shopApi.getProducts({});
      const allItems = allRes?.items || [];
      return {
        items: allItems.slice(0, 8),
        total: allItems.length
      };
    },
    staleTime: 5 * 1000
  });

  const products = (promoResult?.items || []).slice(0, 8);
  const totalPromoCount = promoResult?.total || 0;

  return (
    <div id="shop-now" className="best-seller-section py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="section-spacing">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="best-seller-title mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="section-heading-text text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {t({ fr: "Soldes & Promotions", ar: "تخفيضات وعروض" })}
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              {timeLeft && (
                <>
                  <span className="text-red-600 font-bold uppercase text-sm tracking-wider">
                    {t({ fr: "Se termine dans:", ar: "ينتهي في:" })}
                  </span>
                  <div className="flex gap-2 text-center" dir="ltr">
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 rounded p-2 min-w-[50px]">
                      <span className="block font-bold text-lg">{timeLeft.days.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-semibold">{t({ fr: "Jours", ar: "أيام" })}</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 rounded p-2 min-w-[50px]">
                      <span className="block font-bold text-lg">{timeLeft.hours.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-semibold">{t({ fr: "Hrs", ar: "ساعات" })}</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 rounded p-2 min-w-[50px]">
                      <span className="block font-bold text-lg">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-semibold">{t({ fr: "Min", ar: "دقائق" })}</span>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 rounded p-2 min-w-[50px]">
                      <span className="block font-bold text-lg">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                      <span className="text-[10px] uppercase font-semibold">{t({ fr: "Sec", ar: "ثواني" })}</span>
                    </div>
                  </div>
                </>
              )}
              <Link
                to="/sale"
                className="text-sm font-semibold text-[#006233] dark:text-[#F9A826] hover:underline shrink-0 ml-auto md:ml-0"
              >
                {t({ fr: "Voir tout →", ar: "عرض الكل ←" })}
              </Link>
            </div>
          </div>

          <div className="best-seller-products">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                {t({ fr: "Aucun article en promotion actuellement.", ar: "لا توجد عروض ترويجية حالياً." })}
              </p>
            ) : (
              <>
                {/* Max 2 rows x 4 columns = 8 cards max */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                  {products.map((product) => (
                    <div key={product.id || product.slug} className="h-full">
                      <ProductCard product={product} onQuickView={setQuickViewProduct} />
                    </div>
                  ))}
                </div>

                {/* If more than 8 products on sale, show button to view all on shop page */}
                {totalPromoCount > 8 && (
                  <div className="mt-12 text-center">
                    <Link
                      to="/sale"
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-semibold hover:bg-black dark:hover:bg-gray-100 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <span>
                        {t({ 
                          fr: `Voir toutes les promotions (${totalPromoCount} produits)`, 
                          ar: `عرض جميع التخفيضات (${totalPromoCount} منتج)` 
                        })}
                      </span>
                      <span className="rtl:rotate-180">→</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}
