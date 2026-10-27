import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, Heart, Share2, Check } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'react-toastify';

const ProductActions = ({ product, qty, setQty, maxQty, onAddToCart, showError, disabled }) => {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLiked = product ? isInWishlist(product.id) : false;
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = typeof product?.name === 'object' 
      ? (product.name.fr || product.name.ar) 
      : (product?.name || 'FootLockerDZ');

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Découvrez ${title} sur FootLockerDZ !`,
          url,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t({ fr: 'Lien du produit copié dans le presse-papiers !', ar: 'تم نسخ رابط المنتج إلى الحافظة!' }));
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error(t({ fr: 'Impossible de copier le lien', ar: 'تعذر نسخ الرابط' }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Error message above button */}
      <div className={`h-6 text-sm text-red-500 font-medium transition-opacity ${showError ? 'opacity-100' : 'opacity-0'}`}>
        {t({ fr: 'Veuillez sélectionner une taille', ar: 'يرجى اختيار المقاس' })}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        {/* Quantity Stepper */}
        <div className="flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-full px-4 py-3 lg:w-32">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={qty <= 1 || disabled}
            className="text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-50"
            aria-label={t({ fr: 'Diminuer la quantité', ar: 'تقليل الكمية' })}
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="font-semibold">{disabled ? 0 : qty}</span>
          <button 
            onClick={() => setQty(Math.min(maxQty, qty + 1))}
            disabled={qty >= maxQty || disabled}
            className="text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-50"
            aria-label={t({ fr: 'Augmenter la quantité', ar: 'زيادة الكمية' })}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add to cart */}
        <button
          onClick={onAddToCart}
          disabled={disabled}
          className={`
            flex-1 flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black
            py-4 px-8 rounded-full font-bold uppercase tracking-widest transition-all
            hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed
            ${showError ? 'animate-[shake_0.5s_ease-in-out]' : ''}
          `}
        >
          <ShoppingBag className="w-5 h-5" />
          {disabled ? t({ fr: 'Épuisé', ar: 'نفد المخزون' }) : t({ fr: 'Ajouter au panier', ar: 'أضف إلى السلة' })}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center gap-4 mt-2">
        <button 
          onClick={() => product && toggleWishlist(product)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black dark:hover:text-white"
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
          {isLiked ? t({ fr: 'Retirer des favoris', ar: 'إزالة من المفضلة' }) : t({ fr: 'Ajouter aux favoris', ar: 'إضافة إلى المفضلة' })}
        </button>
        <button 
          onClick={handleShare}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            copied 
              ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
          title={t({ fr: 'Partager ce produit', ar: 'مشاركة هذا المنتج' })}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-scale-in" />
              <span>{t({ fr: 'Lien copié !', ar: 'تم نسخ الرابط!' })}</span>
            </>
          ) : (
            <>
              <Share2 className="w-5 h-5" />
              <span>{t({ fr: 'Partager', ar: 'مشاركة' })}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductActions;
