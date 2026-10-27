import React, { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { LayoutGrid, Menu, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useProductFilters } from '../../hooks/useProductFilters';
import { shopApi } from '../../api/shopApi';
import { settingsApi } from '../../api/settingsApi';

import ProductCard from '../../components/product/ProductCard';
import FilterBar from '../../components/filters/FilterBar';
import FilterDrawerMobile from '../../components/filters/FilterDrawerMobile';
import QuickViewModal from '../../components/product/QuickViewModal';
import FlashSaleBanner from '../../components/shop/FlashSaleBanner';

export default function ShopListingPage({ forceFilter, embedded = false, forceBrand = null }) {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const { t, isAr } = useLanguage();
  const { filters, setFilter, resetFilters } = useProductFilters();
  
  const [gridCols, setGridCols] = useState(3); // 2 or 3
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // If category in URL, override/inject sport or category filter
  // For the sake of the mock, we assume 'category' maps to 'sport' filter
  const activeFilters = { ...filters };
  if (category && (!filters.sport || filters.sport.length === 0)) {
    activeFilters.sport = [category];
  }
  if (forceFilter === 'sale') activeFilters.promo = true;
  if (forceFilter === 'new') activeFilters.isNew = true;
  if (forceBrand) activeFilters.brand = [forceBrand];
  if (searchParams.get('purchased') === 'true') activeFilters.purchased = true;

  // React Query Fetch
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', activeFilters],
    queryFn: () => shopApi.getProducts(activeFilters),
    staleTime: 5 * 1000,
    retry: 1
  });

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
    staleTime: 60 * 1000
  });

  const generateTitle = () => {
    if (forceFilter === 'sale') return t({fr: 'Soldes – FootLockerDZ', ar: 'تخفيضات – FootLockerDZ'});
    if (forceFilter === 'new') return t({fr: 'Nouveautés – FootLockerDZ', ar: 'وصل حديثاً – FootLockerDZ'});
    if (activeFilters.purchased) return t({fr: 'Mes Produits Achetés – FootLockerDZ', ar: 'منتجاتي المشتراة – FootLockerDZ'});
    let title = t({fr: 'Boutique', ar: 'المتجر'});
    if (activeFilters.sport?.length === 1) title += ` ${activeFilters.sport[0].charAt(0).toUpperCase() + activeFilters.sport[0].slice(1)}`;
    if (activeFilters.brand?.length === 1) title += ` ${activeFilters.brand[0]}`;
    if (activeFilters.gender?.length === 1) title += ` ${t({fr: activeFilters.gender[0] === 'men' ? 'Homme' : activeFilters.gender[0] === 'women' ? 'Femme' : activeFilters.gender[0], ar: ''})}`;
    return `${title} – FootLockerDZ`;
  };

  // Pagination Logic
  const handlePageChange = (newPage) => {
    if (newPage > 0 && data && newPage <= data.pages) {
      setFilter('page', newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`bg-[var(--bg)] transition-colors ${!embedded ? 'min-h-screen pt-8 pb-20' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {!embedded && (
        <Helmet>
          <title>{generateTitle()}</title>
        </Helmet>
      )}

      <div className={`${!embedded ? 'container mx-auto px-4 max-w-7xl' : ''}`}>
        {/* Breadcrumbs */}
        {!embedded && (
          <nav className="text-sm text-gray-500 mb-6 flex gap-2">
            <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t({fr: 'Accueil', ar: 'الرئيسية'})}</Link>
            <span>/</span>
            {forceFilter === 'sale' ? (
              <span className="text-gray-900 dark:text-white font-medium">{t({fr: 'Soldes', ar: 'تخفيضات'})}</span>
            ) : forceFilter === 'new' ? (
              <span className="text-gray-900 dark:text-white font-medium">{t({fr: 'Nouveautés', ar: 'وصل حديثاً'})}</span>
            ) : activeFilters.purchased ? (
              <span className="text-gray-900 dark:text-white font-medium">{t({fr: 'Mes Produits Achetés', ar: 'منتجاتي المشتراة'})}</span>
            ) : (
              <>
                <Link to="/shop" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t({fr: 'Boutique', ar: 'المتجر'})}</Link>
                {category && (
                  <>
                    <span>/</span>
                    <span className="text-gray-900 dark:text-white font-medium capitalize">{category}</span>
                  </>
                )}
              </>
            )}
          </nav>
        )}

        {/* Countdown for sale */}
        {forceFilter === 'sale' && (
          <FlashSaleBanner flashSale={settingsData?.flashSale} />
        )}

        {/* Header & Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            {!embedded && (
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white capitalize mb-2">
                {forceFilter === 'sale' ? t({fr: 'Nos Soldes', ar: 'تخفيضاتنا'}) 
                 : forceFilter === 'new' ? t({fr: 'Nouveautés', ar: 'وصل حديثاً'}) 
                 : activeFilters.purchased ? t({fr: 'Mes Produits Achetés', ar: 'منتجاتي المشتراة'})
                 : category ? category : t({fr: 'Tous les produits', ar: 'جميع المنتجات'})}
              </h1>
            )}
            <p className="text-gray-500 text-sm">
              {isLoading ? '...' : (data?.total || 0)} {t({fr: 'produits correspondants', ar: 'منتج مطابق'})}
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Mobile Filter Button */}
            <button 
              className="md:hidden flex items-center justify-center gap-2 flex-1 border border-gray-300 dark:border-gray-700 rounded px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMobileDrawerOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {t({fr: 'Filtres', ar: 'تصفية'})}
            </button>

            {/* Sort Dropdown */}
            <select 
              value={filters.sort}
              onChange={(e) => setFilter('sort', e.target.value)}
              className="flex-1 md:w-48 bg-transparent border border-gray-300 dark:border-gray-700 rounded px-4 py-2 text-sm font-medium focus:ring-1 focus:ring-[#006233] outline-none"
            >
              <option value="relevance">{t({fr: 'Pertinence', ar: 'صلة'})}</option>
              <option value="price_asc">{t({fr: 'Prix croissant', ar: 'السعر من الأقل'})}</option>
              <option value="price_desc">{t({fr: 'Prix décroissant', ar: 'السعر من الأعلى'})}</option>
              <option value="newest">{t({fr: 'Nouveautés', ar: 'وصل حديثاً'})}</option>
              <option value="most_liked">{t({fr: 'Les plus aimés', ar: 'الأكثر إعجاباً'})}</option>
              <option value="highest_rated">{t({fr: 'Les mieux notés', ar: 'الأعلى تقييماً'})}</option>
            </select>

            {/* Grid Toggle (Desktop Only) */}
            <div className="hidden md:flex border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
              <button 
                onClick={() => setGridCols(2)}
                className={`p-2 transition-colors ${gridCols === 2 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                aria-label="Vue 2 colonnes"
              >
                <Menu className={`w-5 h-5 ${gridCols === 2 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
              </button>
              <button 
                onClick={() => setGridCols(3)}
                className={`p-2 border-l border-gray-300 dark:border-gray-700 transition-colors ${gridCols === 3 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                aria-label="Vue 3 colonnes"
              >
                <LayoutGrid className={`w-5 h-5 ${gridCols === 3 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-64 shrink-0">
            <FilterBar facets={data?.facets} isLoading={isLoading} forceFilter={forceFilter} forceBrand={forceBrand} />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            
            {/* Active Filters Chips */}
            {(filters.brand.length > 0 || filters.sport.length > 0 || filters.minPrice || filters.q) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.brand.map(b => {
                  const displayName = b.charAt(0).toUpperCase() + b.slice(1).replace(/-/g, ' ');
                  return (
                    <span key={`b-${b}`} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-gray-200 dark:border-gray-700">
                      <span>{displayName}</span>
                      <button 
                        type="button"
                        onClick={() => setFilter('brand', filters.brand.filter(x => String(x).toLowerCase().replace(/\s+/g, '-') !== String(b).toLowerCase().replace(/\s+/g, '-')))} 
                        className="text-gray-400 hover:text-red-500 text-base leading-none font-bold"
                        aria-label="Remove filter"
                      >&times;</button>
                    </span>
                  );
                })}
                {/* Simplified chips for brevity, in reality we'd loop over all active arrays */}
                <button onClick={resetFilters} className="text-sm font-medium text-[#006233] hover:underline px-2">
                  {t({fr: 'Tout effacer', ar: 'مسح الكل'})}
                </button>
              </div>
            )}

            {/* State Handling */}
            {isLoading ? (
              <div className={`grid grid-cols-2 md:grid-cols-${gridCols} gap-4 lg:gap-6`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl aspect-[4/5]"></div>
                ))}
              </div>
            ) : isError ? (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-8 rounded-2xl flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
                <h3 className="text-xl font-bold mb-2">{t({fr: 'Oops! Une erreur est survenue', ar: 'أوبس! حدث خطأ'})}</h3>
                <p className="mb-6">{error?.message?.fr || t({fr: 'Impossible de charger les produits.', ar: 'تعذر تحميل المنتجات.'})}</p>
                <button onClick={() => refetch()} className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                  <RefreshCw className="w-4 h-4" /> Réessayer
                </button>
              </div>
            ) : data.items.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t({fr: 'Aucun produit trouvé', ar: 'لم يتم العثور على أي منتج'})}</h3>
                <p className="text-gray-500 mb-6">{t({fr: 'Essayez de modifier vos filtres ou de faire une nouvelle recherche.', ar: 'حاول تعديل الفلاتر أو إجراء بحث جديد.'})}</p>
                <button onClick={resetFilters} className="bg-[#006233] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#004e28] transition-colors">
                  {t({fr: 'Réinitialiser les filtres', ar: 'إعادة ضبط الفلاتر'})}
                </button>
              </div>
            ) : (
              <>
                <div className={`grid grid-cols-2 md:grid-cols-${gridCols} gap-4 lg:gap-6`}>
                  {data.items.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onQuickView={setQuickViewProduct} 
                    />
                  ))}
                </div>

                {/* Pagination */}
                {data.pages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button 
                      disabled={data.page === 1}
                      onClick={() => handlePageChange(data.page - 1)}
                      className={`p-2 rounded-lg border ${data.page === 1 ? 'border-gray-200 text-gray-300 dark:border-gray-800 dark:text-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                    >
                      {isAr ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                    
                    {Array.from({ length: data.pages }).map((_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === data.page;
                      return (
                        <button 
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-bold transition-colors ${isActive ? 'bg-[#006233] text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button 
                      disabled={data.page === data.pages}
                      onClick={() => handlePageChange(data.page + 1)}
                      className={`p-2 rounded-lg border ${data.page === data.pages ? 'border-gray-200 text-gray-300 dark:border-gray-800 dark:text-gray-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'}`}
                    >
                      {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FilterDrawerMobile 
        isOpen={isMobileDrawerOpen} 
        onClose={() => setIsMobileDrawerOpen(false)} 
        facets={data?.facets} 
        isLoading={isLoading} 
        forceFilter={forceFilter}
        forceBrand={forceBrand}
      />

      {quickViewProduct && (
        <QuickViewModal 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </div>
  );
}
