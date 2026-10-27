import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const ProductGallery = ({ product, selectedColor }) => {
  const { t } = useLanguage();
  const [activeImage, setActiveImage] = useState(0);
  
  // Find images for the selected color
  const currentVariant = product.colorVariants?.find(v => v.color === selectedColor);
  const images = currentVariant?.images?.length > 0 
    ? currentVariant.images 
    : (product.images || [product.image, product.hoverImage]);

  // Reset to first image when color changes
  React.useEffect(() => {
    setActiveImage(0);
  }, [selectedColor]);

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4">
      {/* Thumbnails (Desktop: Left Vertical, Mobile: Bottom Horizontal) */}
      <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:w-24 hide-scrollbar">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(idx)}
            className={`flex-shrink-0 w-20 h-20 lg:w-full lg:h-24 rounded-lg overflow-hidden border-2 transition-colors ${
              activeImage === idx ? 'border-black dark:border-white' : 'border-transparent hover:border-gray-300'
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Main Image Gallery */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-square lg:aspect-auto lg:h-[600px] group">
        <div 
          className="flex h-full w-full overflow-x-auto snap-x snap-mandatory hide-scrollbar lg:hidden"
          onScroll={(e) => {
            const scrollLeft = e.currentTarget.scrollLeft;
            const width = e.currentTarget.clientWidth;
            const newIndex = Math.round(scrollLeft / width);
            if (newIndex !== activeImage) setActiveImage(newIndex);
          }}
        >
          {images.map((img, idx) => (
            <div key={idx} className="w-full h-full flex-shrink-0 snap-center">
              <picture>
                <source srcSet={img} type="image/webp" />
                <img src={img} alt={`${product.brand} - Image ${idx + 1}`} className="w-full h-full object-cover" />
              </picture>
            </div>
          ))}
        </div>

        {/* Desktop Image with Hover Zoom (CSS only implementation) */}
        <div className="hidden lg:block w-full h-full relative cursor-crosshair">
           <picture>
             <source srcSet={images[activeImage]} type="image/webp" />
             <img 
               src={images[activeImage]} 
               alt={`${product.brand} - Vue principale`} 
               className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-150 transform-origin-center"
               onMouseMove={(e) => {
                 const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                 const x = ((e.clientX - left) / width) * 100;
                 const y = ((e.clientY - top) / height) * 100;
                 e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.transformOrigin = 'center center';
               }}
             />
           </picture>
        </div>

        {/* Badges on image */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
           {product.isNew && (
             <span className="bg-black text-white text-xs px-2 py-1 uppercase font-bold tracking-wider">
               {t({ fr: 'Nouveau', ar: 'جديد' })}
             </span>
           )}
           {product.oldPrice && (
             <span className="bg-red-500 text-white text-xs px-2 py-1 uppercase font-bold tracking-wider">
               -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
             </span>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProductGallery;
