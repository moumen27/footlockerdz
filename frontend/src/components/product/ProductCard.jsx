import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useMoney } from '../../context/CurrencyContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductCard({ product, onQuickView }) {
  const { t } = useLanguage();
  const { format } = useMoney();
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  const isLiked = isInWishlist(product.id);

  const isOutOfStock = product.variants.stock === 0;
  const isLowStock = !isOutOfStock && product.variants.stock <= 3;
  const discountPercent = product.oldPrice && product.oldPrice > product.price 
    ? Math.round((1 - product.price / product.oldPrice) * 100) 
    : 0;

  return (
    <div className="product-card-wrapper group cursor-pointer relative h-full flex flex-col">
      <Link to={`/product/${product.slug}`} className="product-link block relative flex-grow flex flex-col">
        
        {/* Image Container */}
        <div className="product-card-image bg-[var(--surface-sunken)] dark:bg-gray-800 rounded-2xl mb-4 aspect-[4/3] flex items-center justify-center overflow-hidden relative group/image">
          
          <img 
            src={product.image} 
            alt={t(product.name)} 
            className="product-thumb-image w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transition-opacity duration-500 group-hover/image:opacity-0" 
            loading="lazy"
          />
          <img 
            src={product.hoverImage || product.image} 
            alt={`${t(product.name)} hover`} 
            className="product-hover-image absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-0 scale-100 group-hover/image:scale-110 group-hover/image:opacity-100 transition-all duration-700" 
            loading="lazy"
          />

          {/* Badges (Top Left) */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 items-start">
            {isOutOfStock && (
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">{t({ fr: 'Rupture', ar: 'نفد' })}</span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">{t({ fr: 'Nouveau', ar: 'جديد' })}</span>
            )}
            {discountPercent > 0 && !isOutOfStock && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">-{discountPercent}%</span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">{t({ fr: 'Dernières paires', ar: 'آخر الأزواج' })}</span>
            )}
          </div>
          
          {/* Actions (Top Right) */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 rtl:-translate-x-10 opacity-0 group-hover/image:translate-x-0 group-hover/image:opacity-100 transition-all duration-300 z-10">
            <button 
              className="bg-white dark:bg-gray-900 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" 
              onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
              aria-label={t({ fr: 'Ajouter aux favoris', ar: 'إضافة إلى المفضلة' })}
            >
              <Heart className={`w-5 h-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700 dark:text-gray-200'}`} />
            </button>
            <button 
              className="bg-white dark:bg-gray-900 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors" 
              onClick={(e) => { e.preventDefault(); if(onQuickView) onQuickView(product); }}
              aria-label="Aperçu rapide"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Sizes Dots */}
          {!isOutOfStock && product.variants.sizeEU && (
            <div className="absolute bottom-3 left-0 w-full flex justify-center flex-wrap gap-1.5 translate-y-10 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 z-10 px-2">
              {product.variants.sizeEU.slice(0, 5).map(size => (
                <span key={size} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
                  {size}
                </span>
              ))}
              {product.variants.sizeEU.length > 5 && (
                <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded shadow-sm text-gray-900 dark:text-white">
                  +{product.variants.sizeEU.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="product-card-title-rating flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-1 gap-2">
            <h3 className="collection-product-title font-semibold text-base md:text-lg text-[var(--text)] line-clamp-2 leading-tight">
              {t(product.name)}
            </h3>
            {/* Note & Avis */}
            {product.rating > 0 && (product.likes > 0 || product.reviewsCount > 0) ? (
              <div className="flex items-center gap-1 shrink-0 pt-1">
                <span className="text-yellow-500 text-sm leading-none">★</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  {Number(product.rating).toFixed(1)}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  ({product.likes || product.reviewsCount})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 shrink-0 pt-1 text-[var(--text-muted)]">
                <span className="text-gray-300 dark:text-gray-600 text-sm leading-none">☆</span>
                <span className="text-xs">{t({ fr: 'Aucun avis', ar: 'لا توجد تقييمات' })}</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-[var(--text-muted)] mb-2 uppercase tracking-wide font-medium">{product.brand}</p>
          
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${isOutOfStock ? 'text-gray-400' : 'text-[var(--text)]'}`}>
                {format(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-[var(--text-muted)] line-through text-sm">
                  {format(product.oldPrice)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
