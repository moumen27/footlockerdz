import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../../context/LanguageContext';
import { shopApi } from '../../api/shopApi';
import axiosInstance from '../../api/axios';

// Local fallback image (in public/images/)
const FALLBACK_IMAGE = '/images/megamenu-visual.jpg';

const brandLogos = [
  { name: 'Nike', icon: 'https://cdn.simpleicons.org/nike', path: '/shop?brand=nike' },
  { name: 'New Balance', icon: 'https://cdn.simpleicons.org/newbalance', path: '/shop?brand=new-balance' },
  { name: 'Adidas', icon: 'https://cdn.simpleicons.org/adidas', path: '/shop?brand=adidas' },
  { name: 'Jordan', icon: 'https://cdn.simpleicons.org/jordan', path: '/shop?brand=jordan' },
  { name: 'Asics', text: 'ASICS', path: '/shop?brand=asics' },
  { name: 'Converse', text: 'CONVERSE', path: '/shop?brand=converse' },
  { name: 'Hoka', text: 'HOKA', path: '/shop?brand=hoka' },
  { name: 'UGG', text: 'UGG', path: '/shop?brand=ugg' },
  { name: 'Puma', icon: 'https://cdn.simpleicons.org/puma', path: '/shop?brand=puma' },
  { name: 'Crocs', text: 'crocs', path: '/shop?brand=crocs' },
  { name: 'Lacoste', text: 'LACOSTE', path: '/shop?brand=lacoste' },
  { name: 'Vans', text: 'VANS', path: '/shop?brand=vans' },
  { name: 'On', text: 'on', path: '/shop?brand=on' },
  { name: 'Salomon', text: 'SALOMON', path: '/shop?brand=salomon' },
  { name: 'Under Armour', icon: 'https://cdn.simpleicons.org/underarmour', path: '/shop?brand=underarmour' },
  { name: 'Saucony', text: 'saucony', path: '/shop?brand=saucony' },
  { name: 'New Era', text: 'NEW ERA', path: '/shop?brand=newera' },
  { name: 'Birkenstock', text: 'BIRKENSTOCK', path: '/shop?brand=birkenstock' },
];

export default function MegaMenu({ isOpen, activeGender, activeType, onMouseEnter, onMouseLeave }) {
  const { t, isAr } = useLanguage();
  const navigate = useNavigate();

  const { data: dbBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: shopApi.getBrands,
    staleTime: 0
  });

  // Fetch active banners to power the visual panel
  const { data: banners } = useQuery({
    queryKey: ['banners-megamenu'],
    queryFn: async () => {
      try {
        const { data } = await axiosInstance.get('/banners');
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Pick the first active, in-schedule banner
  const activeBanner = useMemo(() => {
    if (!Array.isArray(banners) || banners.length === 0) return null;
    const now = new Date();
    return banners.find(b => {
      if (!b.isActive) return false;
      if (b.schedule?.startDate && new Date(b.schedule.startDate) > now) return false;
      if (b.schedule?.endDate && new Date(b.schedule.endDate) < now) return false;
      return b.imageLight || b.imageDark;
    }) || null;
  }, [banners]);

  const displayBrands = useMemo(() => {
    if (!Array.isArray(dbBrands) || dbBrands.length === 0) return [];
    return dbBrands.slice(0, 8);
  }, [dbBrands]);

  if (!isOpen) return null;
  
  const getUrl = (basePath) => {
    if (!activeGender) return basePath;
    return basePath.includes('?') 
      ? `${basePath}&gender=${activeGender}`
      : `${basePath}?gender=${activeGender}`;
  };

  // Visual panel: prefer live banner, fallback to local image
  const visualImage = activeBanner?.imageLight || FALLBACK_IMAGE;
  const visualTitle = activeBanner
    ? (isAr ? activeBanner.title?.ar : activeBanner.title?.fr) || t({ fr: 'Nouveautés', ar: 'جديد' })
    : t({ fr: 'Nouveautés Été', ar: 'جديد الصيف' });
  const visualLink = activeBanner?.cta?.link || '/new';
  const visualCta = activeBanner
    ? (isAr ? activeBanner.cta?.text?.ar : activeBanner.cta?.text?.fr) || (isAr ? 'اكتشف' : 'Découvrir')
    : (isAr ? 'اكتشف الجديد' : 'Voir les nouveautés');

  if (activeType === 'brands') {
    return (
      <div 
        className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl z-50 transition-all duration-300"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {brandLogos.map((brand, idx) => (
              <Link 
                key={idx} 
                to={brand.path}
                className="flex items-center justify-center p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800 rounded-sm h-24"
              >
                {brand.icon ? (
                  <img src={brand.icon} alt={brand.name} className="h-8 w-auto opacity-80 hover:opacity-100 dark:invert transition-opacity" />
                ) : (
                  <span className="font-bold text-xl uppercase tracking-wider text-black dark:text-white opacity-80 hover:opacity-100 transition-opacity">{brand.text}</span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Link to="/brands" className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors dark:text-white rounded-sm">
              {t({fr: 'Voir toutes les marques', ar: 'عرض كل الماركات'})}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl z-50 transition-all duration-300"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">

          {/* Sports */}
          <div className="col-span-3 space-y-6">
            <h3 className="text-sm font-black tracking-widest uppercase border-b border-gray-100 dark:border-gray-800 pb-3 text-black dark:text-white">
              {t({fr: 'Sports', ar: 'الرياضات'})}
            </h3>
            <ul className="space-y-3">
              <li><Link to={getUrl("/shop?sport=running")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Running', ar: 'جري'})}</Link></li>
              <li><Link to={getUrl("/shop?sport=basketball")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Basketball', ar: 'كرة سلة'})}</Link></li>
              <li><Link to={getUrl("/shop?sport=football")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Football', ar: 'كرة قدم'})}</Link></li>
              <li><Link to={getUrl("/shop?sport=lifestyle")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Lifestyle', ar: 'حياة يومية'})}</Link></li>
              <li><Link to={getUrl("/shop?sport=outdoor")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Outdoor', ar: 'خارجي'})}</Link></li>
              <li><Link to={getUrl("/shop?sport=slides")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Slides', ar: 'شباشب'})}</Link></li>
              <li><Link to={getUrl("/shop?sport=training")} className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">{t({fr: 'Training', ar: 'تمرين'})}</Link></li>
            </ul>
          </div>

          {/* Marques */}
          <div className="col-span-3 space-y-6">
            <h3 className="text-sm font-black tracking-widest uppercase border-b border-gray-100 dark:border-gray-800 pb-3 text-black dark:text-white">
              {t({fr: 'Marques', ar: 'ماركات'})}
            </h3>
            <ul className="space-y-3">
              {displayBrands.map((brand) => {
                const slug = (brand.slug || brand.name).toLowerCase().trim().replace(/\s+/g, '-');
                return (
                  <li key={brand._id || slug}>
                    <Link
                      to={getUrl(`/shop?brand=${encodeURIComponent(slug)}`)}
                      className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {brand.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Photo — col-span-6 pour remplir l'espace de la colonne Tendances supprimée */}
          <div className="col-span-6">
            <div
              className="relative rounded-2xl overflow-hidden h-64 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={() => navigate(getUrl(visualLink))}
              role="link"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(getUrl(visualLink))}
              aria-label={visualCta}
            >
              <img
                src={visualImage}
                alt={visualTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={e => {
                  if (e.target.src !== window.location.origin + FALLBACK_IMAGE) {
                    e.target.src = FALLBACK_IMAGE;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <span className="inline-block bg-white text-black text-[10px] font-black tracking-widest uppercase px-2 py-1 mb-3">
                  {t({fr: 'NOUVEAU', ar: 'جديد'})}
                </span>
                <h4 className="text-white text-xl font-bold leading-tight mb-2">
                  {visualTitle}
                </h4>
                <span className="text-white/80 text-sm flex items-center group-hover:text-white transition-colors">
                  {visualCta}
                  <span className={`${isAr ? 'mr-1' : 'ml-1'} transition-transform group-hover:${isAr ? '-translate-x-1' : 'translate-x-1'}`}>
                    {isAr ? '←' : '→'}
                  </span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

