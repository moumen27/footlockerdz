import React from 'react';
import { useMoney } from '../../context/CurrencyContext';

const PriceTag = ({ price, oldPrice, className = '' }) => {
  const { format: formatMoney } = useMoney();
  const isPromo = oldPrice && oldPrice > price;

  return (
    <div className={`flex items-baseline gap-3 ${className}`}>
      <span className={`font-bold ${isPromo ? 'text-red-500' : 'text-black dark:text-white'}`}>
        {formatMoney(price)}
      </span>
      {isPromo && (
        <span className="text-gray-400 line-through text-sm font-medium">
          {formatMoney(oldPrice)}
        </span>
      )}
    </div>
  );
};

export default PriceTag;
