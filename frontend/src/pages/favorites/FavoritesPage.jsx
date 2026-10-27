import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import ProductCard from '../../components/product/ProductCard';

export default function FavoritesPage() {
  const { t, isAr } = useLanguage();
  const { wishlistItems } = useWishlist();

  return (
    <div className="bg-[var(--bg)] min-h-screen pt-8 pb-20 transition-colors" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t({ fr: 'Mes Favoris', ar: 'مفضلتي' })} - FootLockerDZ</title>
      </Helmet>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link to="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t({ fr: 'Accueil', ar: 'الرئيسية' })}</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">{t({ fr: 'Mes Favoris', ar: 'مفضلتي' })}</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              {t({ fr: 'Mes Favoris', ar: 'مفضلتي' })}
            </h1>
            <p className="text-gray-500 text-sm">
              {wishlistItems.length} {t({ fr: 'produits sauvegardés', ar: 'المنتجات المحفوظة' })}
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <Heart className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t({ fr: 'Votre liste de favoris est vide', ar: 'قائمة مفضلتك فارغة' })}</h3>
            <p className="text-gray-500 mb-6">{t({ fr: 'Découvrez nos produits et ajoutez-les à vos favoris pour les retrouver plus tard.', ar: 'اكتشف منتجاتنا وأضفها إلى مفضلتك لتجدها لاحقًا.' })}</p>
            <Link to="/shop" className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-bold transition-transform hover:scale-105">
              {t({ fr: 'Explorer la boutique', ar: 'استكشف المتجر' })}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {wishlistItems.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
