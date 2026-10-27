import React from 'react';

// All possible EU sizes for shoes typically
const allSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

const SizeSelector = ({ availableSizes = [], selectedSize, onSelect }) => {
  return (
    <div className="grid grid-cols-5 gap-2 lg:gap-3">
      {allSizes.map((size) => {
        const isAvailable = availableSizes.includes(size);
        const isSelected = selectedSize === size;
        
        return (
          <button
            key={size}
            disabled={!isAvailable}
            onClick={() => isAvailable && onSelect(size)}
            className={`
              py-3 rounded-lg border transition-all text-center relative
              ${isSelected 
                ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white' 
                : 'bg-white text-black border-gray-300 hover:border-black dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:border-white'}
              ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900 text-gray-400' : ''}
            `}
          >
            {size}
            
            {/* Cross out out-of-stock sizes */}
            {!isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-[120%] h-px bg-gray-400 rotate-45 transform origin-center"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SizeSelector;
