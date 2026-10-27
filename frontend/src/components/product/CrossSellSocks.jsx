import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Check } from 'lucide-react';
import { useMoney } from '../../context/CurrencyContext';
import { useCart } from '../../context/CartContext';

const CrossSellSocks = ({ product }) => {
  const { t } = useTranslation();
  const { format: formatMoney } = useMoney();
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  // Mock static product for cross-selling
  const crossSellItem = {
    id: 'cs-1',
    name: t('Chaussettes invisibles (lot de 3)'),
    price: 1500,
    image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80'
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center gap-6 justify-between">
      <div className="flex items-center gap-6 flex-1">
        <img 
          src={crossSellItem.image} 
          alt={crossSellItem.name} 
          className="w-24 h-24 object-cover rounded-xl shadow-sm"
        />
        <div>
          <h4 className="font-bold text-lg mb-1">{t('Complétez votre look')}</h4>
          <p className="text-gray-500 mb-2">{crossSellItem.name}</p>
          <p className="font-bold">{formatMoney(crossSellItem.price)}</p>
        </div>
      </div>
      
      <button 
        onClick={() => {
          addToCart({ product: crossSellItem });
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className={`w-full md:w-auto px-8 py-3 border-2 rounded-full font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 overflow-hidden relative group ${
          added 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'bg-white dark:bg-gray-800 border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
        }`}
      >
        {added ? (
          <>
            <Check className="w-4 h-4 animate-bounce" />
            {t('Ajouté')}
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            {t('Ajouter')}
          </>
        )}
      </button>
    </div>
  );
};

export default CrossSellSocks;
