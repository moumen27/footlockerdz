import React from 'react';
import { Minus, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useMoney } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

export default function CartItem({ item }) {
  const { format } = useMoney();
  const { updateQty, removeFromCart } = useCart();
  const { t, isAr } = useLanguage();

  const handleIncrement = () => {
    if (item.quantity < (item.variant?.stock || 99)) {
      updateQty(item.sku, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQty(item.sku, item.quantity - 1);
    }
  };

  const isLowStock = item.variant?.stock <= 5;
  const isOutOfStock = item.variant?.stock === 0;

  return (
    <div className={`flex gap-4 py-4 border-b border-gray-100 dark:border-gray-800 ${isOutOfStock ? 'opacity-50 grayscale' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Thumbnail */}
      <div className="w-20 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
        <img 
          src={item.image || 'https://via.placeholder.com/150'} 
          alt={typeof item.name === 'object' ? item.name.fr : item.name} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">
              {typeof item.name === 'object' ? (isAr ? item.name.ar : item.name.fr) : item.name}
            </h4>
            <div className="text-sm text-gray-500 mt-1 flex gap-2">
              {item.color && <span>{item.color}</span>}
              {item.color && item.size && <span>|</span>}
              {item.size && <span>{t(isAr ? 'المقاس' : 'Taille')} : {item.size}</span>}
            </div>
          </div>
          <button 
            onClick={() => removeFromCart(item.sku)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
            aria-label={`Supprimer ${typeof item.name === 'object' ? item.name.fr : item.name} du panier`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Warnings */}
        {(isLowStock || isOutOfStock) && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600 mt-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>
              {isOutOfStock 
                ? t(isAr ? 'هذا المنتج لم يعد متوفراً' : 'Ce produit n\'est plus disponible') 
                : t(isAr ? `بقي ${item.variant.stock} فقط في المخزون` : `Il ne reste que ${item.variant.stock} en stock`)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          {/* Price */}
          <span className="font-bold text-gray-900 dark:text-white">
            {format(item.price)}
          </span>

          {/* Stepper */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button 
              onClick={handleDecrement}
              disabled={item.quantity <= 1 || isOutOfStock}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm disabled:opacity-50 disabled:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-[#006233]"
              aria-label="Diminuer la quantité"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
              {item.quantity}
            </span>
            <button 
              onClick={handleIncrement}
              disabled={item.quantity >= (item.variant?.stock || 99) || isOutOfStock}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-gray-700 shadow-sm disabled:opacity-50 disabled:shadow-none transition-all focus:outline-none focus:ring-2 focus:ring-[#006233]"
              aria-label="Augmenter la quantité"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
