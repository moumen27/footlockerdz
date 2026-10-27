import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { shopApi } from '../../api/shopApi';
import { useLanguage } from '../../context/LanguageContext';
import ProductCard from '../product/ProductCard';
import QuickViewModal from '../product/QuickViewModal';

export default function NewArrivalSection() {
  const { t } = useLanguage();
  const scrollRef = useRef(null);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'newArrivalsHome'],
    queryFn: async () => {
      // 1. Fetch products marked as isNew: true
      const res = await shopApi.getProducts({ isNew: true });
      if (res?.items && res.items.length > 0) {
        return res.items.slice(0, 8);
      }
      // 2. Fallback to newest products if none explicitly marked
      const allRes = await shopApi.getProducts({ sort: 'new' });
      return (allRes?.items || []).slice(0, 8);
    },
    staleTime: 5 * 1000
  });

  const products = productsData || [];

  return (
    <div id="new-arrivals" className="new-arrival-section py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="section-spacing">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="new-arrival-title mb-10 flex items-center justify-between">
            <h2 className="section-heading-text text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {t({ fr: "Nouveautés", ar: "وصل حديثاً" })}
            </h2>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll('left')}
                  className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  aria-label={t({ fr: "Précédent", ar: "السابق" })}
                >
                  <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => scroll('right')}
                  className="p-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                  aria-label={t({ fr: "Suivant", ar: "التالي" })}
                >
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              </div>
              <Link
                to="/new"
                className="text-sm font-semibold text-[#006233] dark:text-[#F9A826] hover:underline"
              >
                {t({ fr: "Voir tout →", ar: "عرض الكل ←" })}
              </Link>
            </div>
          </div>

          <div className="new-arrivals-products relative">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#006233] dark:border-[#F9A826]"></div>
              </div>
            ) : products.length === 0 ? (
              <p className="text-center text-gray-500 py-10">
                {t({ fr: "Aucune nouveauté pour le moment.", ar: "لا توجد منتجات جديدة حالياً." })}
              </p>
            ) : (
              <div
                ref={scrollRef}
                className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-8 pb-6 -mx-4 px-4 lg:mx-0 lg:px-0 scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {products.map((product) => (
                  <div
                    key={product.id || product.slug}
                    className="flex-none w-[75vw] sm:w-[40vw] lg:w-[calc(25%-1.5rem)] snap-start"
                  >
                    <ProductCard product={product} onQuickView={setQuickViewProduct} />
                  </div>
                ))}
              </div>
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
