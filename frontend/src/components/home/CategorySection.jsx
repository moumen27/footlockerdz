import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '../../api/shopApi';
import { useLanguage } from '../../context/LanguageContext';
import runningImg from '../../assets/image/running.webp';
import lifestyleImg from '../../assets/image/lifestyle-category.webp';
import basketImg from '../../assets/image/basket.webp';
import footballImg from '../../assets/image/football.webp';
import outdoorImg from '../../assets/image/outdoor.jpeg';
import slidesImg from '../../assets/image/slides.webp';

const defaultCategoryImages = {
  lifestyle: lifestyleImg,
  running: runningImg,
  basketball: basketImg,
  basket: basketImg,
  football: footballImg,
  outdoor: outdoorImg,
  slides: slidesImg,
};

const FEATURED_SLUGS = ['lifestyle', 'basketball', 'outdoor', 'slides', 'running', 'football'];

export default function CategorySection() {
  const { t } = useLanguage();

  const { data: dbCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: shopApi.getCategories,
    staleTime: 5 * 1000
  });

  const categoriesList = useMemo(() => {
    if (Array.isArray(dbCategories) && dbCategories.length > 0) {
      const catMap = new Map();
      dbCategories.forEach((c) => {
        if (c.slug) catMap.set(c.slug.toLowerCase(), c);
      });

      return FEATURED_SLUGS.map((slug) => {
        const cat = catMap.get(slug);
        return {
          slug,
          name: cat?.name || { 
            fr: slug.charAt(0).toUpperCase() + slug.slice(1), 
            ar: slug === 'lifestyle' ? 'لايف ستايل' : slug 
          },
          image: defaultCategoryImages[slug] || lifestyleImg
        };
      });
    }

    // Fallback if loading
    return [
      { slug: 'lifestyle', name: { fr: 'Lifestyle', ar: 'لايف ستايل' }, image: lifestyleImg },
      { slug: 'basketball', name: { fr: 'Basketball', ar: 'كرة السلة' }, image: basketImg },
      { slug: 'outdoor', name: { fr: 'Outdoor', ar: 'أوتدور' }, image: outdoorImg },
      { slug: 'slides', name: { fr: 'Slides', ar: 'شبشب' }, image: slidesImg },
      { slug: 'running', name: { fr: 'Running', ar: 'ركض' }, image: runningImg },
      { slug: 'football', name: { fr: 'Football', ar: 'كرة القدم' }, image: footballImg },
    ];
  }, [dbCategories]);

  return (
    <div id="category" className="category-section py-16 lg:py-24 bg-[#fcfcfc] dark:bg-gray-900 transition-colors">
      <div className="section-spacing">
        <div className="container mx-auto px-4 max-w-7xl our-categories-container">
          <div className="common-left-title our-categories-title-text-width mb-10 flex justify-between items-end">
            <h2 className="section-heading-text category-section-title text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {t({ fr: "Nos catégories", ar: "فئاتنا" })}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {categoriesList.map((category, index) => (
              <div key={category.slug || index} className="categories-product group cursor-pointer">
                <Link to={`/shop?sport=${category.slug}`} className="category-link-block block">
                  <div className="category-image-wrapper bg-[#f1f1f1] dark:bg-gray-800 rounded-2xl mb-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={t(category.name)} 
                      className="category-image w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                  <div className="common-product-title font-semibold text-lg text-gray-900 dark:text-white text-left rtl:text-right">
                    {t(category.name)}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
