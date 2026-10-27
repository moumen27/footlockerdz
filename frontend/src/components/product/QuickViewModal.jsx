import React, { useState, useMemo, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { useMoney } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

export default function QuickViewModal({ product, onClose }) {
  const { t } = useLanguage();
  const { format } = useMoney();
  const { addToCart } = useCart();

  // Extract all variants
  const sizeOptions = useMemo(() => {
    if (!product) return [];
    
    // 1. From rawVariants if available
    if (Array.isArray(product.rawVariants) && product.rawVariants.length > 0) {
      return product.rawVariants.map((v, index) => ({
        id: v.id || v._id || index,
        size: String(v.size || ''),
        color: v.color || '',
        stock: Number(v.stock) || 0,
        images: Array.isArray(v.images) && v.images.length > 0 ? v.images : [product.image].filter(Boolean),
        sku: v.sku || `${product.id}-${v.size}`
      }));
    }

    // 2. From colorVariants if available
    if (Array.isArray(product.colorVariants) && product.colorVariants.length > 0) {
      const flattened = [];
      product.colorVariants.forEach(c => {
        (c.sizeDetails || []).forEach(sd => {
          flattened.push({
            id: `${c.color}-${sd.size}`,
            size: String(sd.size),
            color: c.color,
            stock: Number(sd.stock) || 0,
            images: Array.isArray(c.images) && c.images.length > 0 ? c.images : [product.image].filter(Boolean),
            sku: `${product.id}-${c.color}-${sd.size}`
          });
        });
      });
      if (flattened.length > 0) return flattened;
    }

    // 3. Fallback from variants.sizeEU
    const sizes = product.variants?.sizeEU || [];
    return sizes.map((size) => ({
      id: size,
      size: String(size),
      color: product.variants?.color || '',
      stock: Number(product.variants?.stock) || 10,
      images: [product.image, product.hoverImage].filter(Boolean),
      sku: `${product.id}-${size}`
    }));
  }, [product]);

  // Initial selected size: choose first with stock > 0, or first available
  const [selectedSize, setSelectedSize] = useState(() => {
    if (!sizeOptions.length) return null;
    const inStock = sizeOptions.find(s => s.stock > 0);
    return inStock ? inStock.size : sizeOptions[0].size;
  });

  // When product changes, reset selection
  useEffect(() => {
    if (sizeOptions.length > 0) {
      const inStock = sizeOptions.find(s => s.stock > 0);
      setSelectedSize(inStock ? inStock.size : sizeOptions[0].size);
    }
  }, [product, sizeOptions]);

  // Active variant based on selected size
  const activeVariant = useMemo(() => {
    if (!selectedSize) return sizeOptions[0] || null;
    return sizeOptions.find(s => s.size === selectedSize) || sizeOptions[0] || null;
  }, [selectedSize, sizeOptions]);

  // Active images based on selected variant
  const images = useMemo(() => {
    if (activeVariant?.images?.length > 0) {
      return activeVariant.images;
    }
    const fallback = [product?.image, product?.hoverImage].filter(Boolean);
    return fallback.length > 0 ? fallback : ['/assets/placeholder.png'];
  }, [activeVariant, product]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // When variant/size changes, reset gallery to first image of that variant
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedSize, activeVariant]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  if (!product) return null;

  const isOutOfStock = !sizeOptions.some(s => s.stock > 0);
  const activeStock = activeVariant?.stock || 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error(t({ fr: 'Veuillez sélectionner une pointure', ar: 'يرجى تحديد المقاس' }));
      return;
    }

    if (activeStock === 0) {
      toast.error(t({ fr: 'Cette pointure est actuellement épuisée', ar: 'هذا المقاس غير متوفر حالياً' }));
      return;
    }

    const prodId = product?.id || product?._id || product?.slug || 'product';
    const itemVariant = {
      sku: activeVariant?.sku || `${prodId}-${selectedSize}`,
      size: selectedSize,
      color: activeVariant?.color || product?.variants?.color || 'Standard',
      image: images[0] || product?.image || '',
      stock: activeStock || 10,
      price: product?.price || 0
    };

    addToCart({
      product: {
        id: prodId,
        _id: prodId,
        name: product?.name || '',
        price: product?.price || 0,
        oldPrice: product?.oldPrice,
        brand: product?.brand || '',
        image: images[0] || product?.image || ''
      },
      variant: itemVariant,
      qty: 1
    });

    toast.success(t({ fr: 'Produit ajouté au panier avec succès !', ar: 'تمت إضافة المنتج إلى السلة بنجاح!' }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform transition-all z-10">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>

        {/* Gallery Section */}
        <div className="relative w-full md:w-1/2 bg-gray-50 dark:bg-gray-800/50 min-h-[300px] md:h-auto overflow-hidden group flex items-center justify-center">
          <div className="w-full h-full relative p-6 flex items-center justify-center">
            <img 
              src={images[currentImageIndex] || product.image} 
              alt={`${t(product.name)} - ${selectedSize ? `taille ${selectedSize}` : ''}`} 
              className="max-h-[320px] md:max-h-[420px] w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-all duration-300 transform group-hover:scale-105"
            />
          </div>
          
          {/* Gallery Controls */}
          {images.length > 1 && (
            <>
              <button 
                onClick={handlePrevImage} 
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 transition-colors z-10"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white rtl:rotate-180" />
              </button>
              <button 
                onClick={handleNextImage} 
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-900/80 p-2 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 transition-colors z-10"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white rtl:rotate-180" />
              </button>
            </>
          )}
          
          {/* Gallery Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
              {images.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === currentImageIndex 
                      ? 'bg-[#006233] dark:bg-[#F9A826] w-6' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                  }`}
                  aria-label={`Aller à l'image ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1">
                {product.brand}
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                {t(product.name)}
              </h2>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-black text-gray-900 dark:text-white">
                {format(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  {format(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Sizes & Colors */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {t({ fr: 'Pointure (EU)', ar: 'المقاس (EU)' })}
                </span>
                {activeVariant?.color && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t({ fr: 'Modèle :', ar: 'الموديل:' })} <strong className="text-gray-800 dark:text-gray-200 capitalize">{activeVariant.color}</strong>
                  </span>
                )}
              </div>
              
              {!isOutOfStock ? (
                <div className="flex flex-wrap gap-2.5">
                  {sizeOptions.map((opt) => {
                    const isSelected = selectedSize === opt.size;
                    const isAvailable = opt.stock > 0;
                    return (
                      <button
                        key={`${opt.size}-${opt.id}`}
                        onClick={() => setSelectedSize(opt.size)}
                        disabled={!isAvailable}
                        className={`min-w-[52px] h-11 px-3 rounded-xl border text-sm font-semibold transition-all relative flex items-center justify-center ${
                          isSelected
                            ? 'border-[#006233] bg-[#006233] text-white shadow-md shadow-[#006233]/20 dark:border-[#F9A826] dark:bg-[#F9A826] dark:text-gray-950'
                            : isAvailable
                            ? 'border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-gray-900 dark:hover:border-white bg-white dark:bg-gray-800'
                            : 'border-gray-100 dark:border-gray-800 text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed line-through'
                        }`}
                      >
                        {opt.size}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-lg text-sm font-medium text-center">
                  {t({ fr: 'Ce produit est actuellement en rupture de stock.', ar: 'هذا المنتج غير متوفر حالياً.' })}
                </div>
              )}

              {/* Stock indicator for active selection */}
              {selectedSize && (
                <div className="mt-3">
                  {activeStock > 0 && activeStock <= 3 && (
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                      {t({ 
                        fr: `Dernières paires : plus que ${activeStock} disponible(s) en ${selectedSize} !`, 
                        ar: `القطع الأخيرة: متبقي ${activeStock} فقط في مقاس ${selectedSize}!` 
                      })}
                    </p>
                  )}
                  {activeStock > 3 && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {t({ fr: 'En stock', ar: 'متوفر' })}
                    </p>
                  )}
                  {activeStock === 0 && (
                    <p className="text-xs font-medium text-red-500">
                      {t({ fr: 'Rupture temporaire pour cette pointure', ar: 'نفد هذا المقاس مؤقتاً' })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Button */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              disabled={isOutOfStock || activeStock === 0}
              onClick={handleAddToCart}
              className="w-full py-4 px-6 bg-[#006233] hover:bg-[#004e28] dark:bg-[#006233] dark:hover:bg-[#004e28] disabled:bg-gray-200 disabled:dark:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#006233]/15 transition-all transform active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>
                {isOutOfStock || activeStock === 0
                  ? t({ fr: 'Épuisé', ar: 'نفد' })
                  : t({ fr: 'Ajouter au panier', ar: 'أضف إلى السلة' })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
