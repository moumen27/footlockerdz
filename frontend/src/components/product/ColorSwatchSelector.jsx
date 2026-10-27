import React from 'react';
import { useTranslation } from 'react-i18next';

// Tailwind classes for color mapping
const colorMap = {
  black: 'bg-black',
  white: 'bg-white border-gray-200',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  grey: 'bg-gray-500',
  yellow: 'bg-yellow-400'
};

const ColorSwatchSelector = ({ variants = [], selectedColor, onSelect }) => {
  const { t } = useTranslation();

  // Extract unique colors to avoid duplicate keys and buttons
  const uniqueColors = Array.from(new Set(variants.map(v => v.color)));

  return (
    <div className="flex flex-wrap gap-3">
      {uniqueColors.map((color, index) => {
        const isSelected = selectedColor === color;
        
        // Find if all variants of this color are out of stock
        const variantsOfColor = variants.filter(v => v.color === color);
        const outOfStock = variantsOfColor.every(v => v.stock === 0);
        
        // Try to find an image from the variants for this color
        const variantWithImage = variantsOfColor.find(v => v.image);
        
        return (
          <button
            key={`${color}-${index}`}
            onClick={() => onSelect(color)}
            className={`
              relative w-14 h-14 rounded-full border-2 p-1 overflow-hidden transition-all
              ${isSelected ? 'border-black dark:border-white' : 'border-transparent hover:border-gray-300'}
            `}
            aria-label={`${t('Couleur')} ${color}`}
            title={color}
          >
            {/* Show tiny image if provided, else fall back to color mapping */}
            <div className={`w-full h-full rounded-full ${colorMap[color] || 'bg-gray-300'}`}>
               {variantWithImage && <img src={variantWithImage.image} alt={color} className="w-full h-full object-cover rounded-full" />}
            </div>
            
            {/* Out of stock line through */}
            {outOfStock && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[120%] h-0.5 bg-red-500 rotate-45"></div>
               </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ColorSwatchSelector;
