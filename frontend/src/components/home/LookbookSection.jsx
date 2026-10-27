import React from 'react';
import { Link } from 'react-router-dom';
import streetStyleImg from '../../assets/image/lookbook-urban.jpg';
import urbanRunningImg from '../../assets/image/lookbook-running.jpg';
import { useLanguage } from '../../context/LanguageContext';

export default function LookbookSection() {
  const { t } = useLanguage();

  return (
    <div className="py-16 lg:py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t({ fr: "Lookbook", ar: "إطلالات" })}
          </h2>
          <p className="text-gray-500 mt-2">
            {t({ fr: "Découvrez comment porter nos collections", ar: "اكتشف كيف ترتدي مجموعاتنا" })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Look 1 : Style Urbain → /shop?sport=lifestyle */}
          <Link
            to="/shop?sport=lifestyle"
            aria-label={t({ fr: "Acheter le look Style Urbain", ar: "تسوق إطلالة ستايل حضري" })}
            className="relative group block overflow-hidden rounded-2xl aspect-[4/5] md:aspect-square lg:aspect-[4/3] min-h-[300px] cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-xl"
          >
            <img 
              src={streetStyleImg} 
              alt={t({ 
                fr: "Look Style Urbain - Sneakers streetwear authentiques et pantalon cargo", 
                ar: "إطلالة ستايل حضري - أحذية ستريت وير وسروال كارجو" 
              })} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300"></div>
            
            <div className="absolute bottom-8 left-8 rtl:left-auto rtl:right-8 text-left rtl:text-right">
              <h3 className="text-white font-bold text-2xl mb-2">
                {t({ fr: "Style Urbain", ar: "ستايل حضري" })}
              </h3>
              <span className="text-white border-b-2 border-white pb-1 group-hover:border-emerald-400 group-hover:text-emerald-300 transition-colors font-medium inline-block text-sm">
                {t({ fr: "Acheter ce look", ar: "تسوق هذه الإطلالة" })}
                <span className="sr-only"> ({t({ fr: "Style Urbain", ar: "ستايل حضري" })})</span>
              </span>
            </div>
          </Link>
          
          {/* Look 2 : Running Urbain → /shop?sport=running */}
          <Link
            to="/shop?sport=running"
            aria-label={t({ fr: "Acheter le look Running Urbain", ar: "تسوق إطلالة ركض حضري" })}
            className="relative group block overflow-hidden rounded-2xl aspect-[4/5] md:aspect-square lg:aspect-[4/3] min-h-[300px] cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-xl"
          >
            <img 
              src={urbanRunningImg} 
              alt={t({ 
                fr: "Look Running Urbain - Chaussures de running haute performance en ville", 
                ar: "إطلالة ركض حضري - أحذية ركض عالية الأداء في المدينة" 
              })} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent group-hover:from-black/85 transition-colors duration-300"></div>
            
            <div className="absolute bottom-8 left-8 rtl:left-auto rtl:right-8 text-left rtl:text-right">
              <h3 className="text-white font-bold text-2xl mb-2">
                {t({ fr: "Running Urbain", ar: "ركض حضري" })}
              </h3>
              <span className="text-white border-b-2 border-white pb-1 group-hover:border-emerald-400 group-hover:text-emerald-300 transition-colors font-medium inline-block text-sm">
                {t({ fr: "Acheter ce look", ar: "تسوق هذه الإطلالة" })}
                <span className="sr-only"> ({t({ fr: "Running Urbain", ar: "ركض حضري" })})</span>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
