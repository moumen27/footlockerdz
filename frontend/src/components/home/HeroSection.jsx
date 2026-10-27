import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import sliderImage from '../../assets/image/slider-02.webp';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/axios';

export default function HeroSection() {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const { data } = await axiosInstance.get('/banners');
        if (data && data.length > 0) {
          setBanner(data[0]);
        }
      } catch (error) {
        console.error("Failed to load banners", error);
      }
    };
    fetchBanner();
  }, []);

  const bgImage = banner 
    ? (isDarkMode && banner.imageDark ? banner.imageDark : banner.imageLight) 
    : sliderImage;
  const title = banner ? t(banner.title) : t({fr: "Trouvez vos chaussures", ar: "ابحث عن حذائك"});

  return (
    <section className="relative w-full min-h-[600px] lg:min-h-[750px] flex items-center bg-gray-900 overflow-hidden">
      
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl relative z-10 pt-20 pb-40">
        <div className="max-w-2xl">
          {/* Subtitle / Eyebrow */}
          <span className="block text-[#E52E2E] font-semibold text-lg mb-3 tracking-wide">
            {banner ? t({fr: "Offre Exclusive", ar: "عرض حصري"}) : t({fr: "Grandes Soldes Aujourd'hui", ar: "تخفيضات كبرى اليوم"})}
          </span>
          
          {/* Main Title */}
          <h1 className="text-white font-extrabold text-5xl md:text-6xl lg:text-7xl leading-[1.15] mb-8 line-clamp-3">
            {title}
          </h1>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            {banner ? (
              <Link 
                to={banner.cta?.link || '/shop'} 
                className="inline-block border-2 border-[#006233] bg-[#006233] text-white font-semibold text-base py-3.5 px-9 rounded transition-all duration-300 hover:bg-transparent hover:text-white"
              >
                {t(banner.cta?.text) || t({fr: "Shop maintenant", ar: "تسوق الآن"})}
              </Link>
            ) : (
              <>
                <Link 
                  to="/shop" 
                  className="inline-block border-2 border-[#006233] bg-[#006233] text-white font-semibold text-base py-3.5 px-9 rounded transition-all duration-300 hover:bg-transparent hover:text-white"
                >
                  {t({fr: "Shop maintenant", ar: "تسوق الآن"})}
                </Link>
                <Link 
                  to="/sale" 
                  className="inline-block border-2 border-[#E52E2E] bg-[#E52E2E] text-white font-semibold text-base py-3.5 px-9 rounded transition-all duration-300 hover:bg-transparent hover:text-white"
                >
                  {t({fr: "Voir les soldes", ar: "شاهد التخفيضات"})}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
