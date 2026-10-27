import React, { useState } from 'react';

import { Star } from 'lucide-react';
import PriceTag from './PriceTag';
import ColorSwatchSelector from './ColorSwatchSelector';
import SizeSelector from './SizeSelector';
import ProductActions from './ProductActions';
import StockBadge from './StockBadge';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';

const ProductInfo = ({ product, selectedColor, setSelectedColor }) => {
  const { t } = useLanguage();
  const { lng } = useLanguage();
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [showError, setShowError] = useState(false);

  const productName = lng === 'ar' ? product.name.ar : product.name.fr;
  
  const currentVariant = product.colorVariants?.find(v => v.color === selectedColor) || {
    color: product.color || '',
    stock: product.variants?.stock || 0,
    sizes: product.variants?.sizeEU || [],
    sizeDetails: []
  };

  const selectedSizeStock = selectedSize && currentVariant.sizeDetails
    ? currentVariant.sizeDetails.find(s => s.size === selectedSize)?.stock || 0
    : currentVariant.stock;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setShowError(true);
      toast.error(t({ fr: 'Veuillez sélectionner une taille', ar: 'يرجى اختيار المقاس' }));
      setTimeout(() => setShowError(false), 800); // Reset shake
      return;
    }
    addToCart({ 
      product, 
      variant: { 
        ...currentVariant, 
        color: selectedColor, 
        size: selectedSize, 
        sku: `${product.id}-${selectedColor}-${selectedSize}` 
      }, 
      qty 
    });
    toast.success(t({ fr: 'Produit ajouté au panier', ar: 'تمت إضافة المنتج إلى السلة' }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Brand & Name */}
      <div className="mb-2">
        <span className="text-sm font-bold tracking-widest uppercase text-gray-500">{product.brand}</span>
        <h1 className="text-3xl lg:text-4xl font-bold mt-1 mb-2">{productName}</h1>
      </div>

      {/* Ratings Link */}
      <div 
        className="flex items-center gap-2 mb-6 cursor-pointer hover:underline" 
        onClick={() => {
          window.dispatchEvent(new CustomEvent('switch-product-tab', { detail: 'reviews' }));
          document.getElementById('reviews-tab')?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <div className="flex items-center text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
          <span className="ml-1 text-sm font-medium text-black dark:text-white">{product.rating}</span>
        </div>
        <span className="text-sm text-gray-500">· {product.likes} {t({ fr: 'avis', ar: 'تقييم' })}</span>
      </div>

      {/* Price */}
      <div className="mb-6">
        <PriceTag price={product.price} oldPrice={product.oldPrice} className="text-2xl" />
      </div>

      <hr className="border-gray-200 dark:border-gray-800 mb-6" />

      {/* Selectors */}
      <div className="space-y-6 flex-1">
        {/* Colors */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">{t({ fr: 'Couleur', ar: 'اللون' })} : <span className="text-gray-500 capitalize">{selectedColor}</span></span>
          </div>
          <ColorSwatchSelector 
            variants={product.colorVariants || []} 
            selectedColor={selectedColor} 
            onSelect={(color) => {
              setSelectedColor(color);
              setSelectedSize(''); // Reset size when color changes
            }} 
          />
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">{t({ fr: 'Pointure (EU)', ar: 'المقاس (EU)' })}</span>
            <button className="text-sm underline text-gray-500 hover:text-black dark:hover:text-white">
              {t({ fr: 'Guide des tailles', ar: 'دليل المقاسات' })}
            </button>
          </div>
          <SizeSelector 
            availableSizes={currentVariant.sizes} 
            selectedSize={selectedSize} 
            onSelect={(size) => {
              setSelectedSize(size);
              setShowError(false);
              setQty(1); // Reset qty when size changes
            }} 
          />
        </div>

        {/* Stock Badge */}
        {selectedSizeStock <= 3 && selectedSizeStock > 0 && (
          <StockBadge stock={selectedSizeStock} />
        )}
      </div>

      {/* Actions (Sticky on Mobile, Static on Desktop) */}
      <div className="mt-8">
        <ProductActions 
          product={product}
          qty={qty}
          setQty={setQty}
          maxQty={selectedSizeStock}
          onAddToCart={handleAddToCart}
          showError={showError}
          disabled={currentVariant.stock === 0}
        />
      </div>
    </div>
  );
};

export default ProductInfo;
