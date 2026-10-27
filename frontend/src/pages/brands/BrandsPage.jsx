import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  ArrowUpRight, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  RotateCcw, 
  SlidersHorizontal, 
  X,
  Package,
  Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';
import BrandLogo from '../../components/brands/BrandLogo';

// Rich metadata dictionary for sneaker brands present in the FootLockerDZ catalog
const BRAND_METADATA = {
  nike: {
    name: 'Nike',
    slug: 'nike',
    country: 'USA',
    flag: '🇺🇸',
    slogan: {
      fr: 'Just Do It • Performance & Style Mondial',
      ar: 'فقط افعلها • أداء وأناقة عالمية'
    },
    description: {
      fr: 'Leader mondial des sneakers de performance, basketball, running et streetwear iconique.',
      ar: 'الرائد العالمي في الأحذية الرياضية، كرة السلة، الجري وأزياء الشارع الأيقونية.'
    },
    categoryType: 'sport',
    tags: ['Air Max', 'Dunk', 'Jordan', 'Running'],
    gradient: 'from-orange-500/10 via-red-500/5 to-transparent',
    borderHover: 'group-hover:border-orange-500/40',
    accentText: 'text-orange-500',
    accentBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    popular: true
  },
  adidas: {
    name: 'Adidas',
    slug: 'adidas',
    country: 'Allemagne',
    flag: '🇩🇪',
    slogan: {
      fr: 'Impossible Is Nothing • Originals & 3 Bandes',
      ar: 'المستحيل لا شيء • تراث أصيل ورياضي'
    },
    description: {
      fr: 'L’héritage intemporel des 3 bandes : Samba, Gazelle, Campus, Superstar et Ultraboost.',
      ar: 'تراث الخطوط الثلاثية الأيقوني: سامبا، غازيل، كامبوس، سوبرستار وألترا بوست.'
    },
    categoryType: 'sport',
    tags: ['Samba', 'Gazelle', 'Originals', 'Football'],
    gradient: 'from-blue-500/10 via-sky-500/5 to-transparent',
    borderHover: 'group-hover:border-blue-500/40',
    accentText: 'text-blue-500',
    accentBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    popular: true
  },
  puma: {
    name: 'Puma',
    slug: 'puma',
    country: 'Allemagne',
    flag: '🇩🇪',
    slogan: {
      fr: 'Forever Faster • Vitesse, Motorsport & Tendance',
      ar: 'أسرع إلى الأبد • سرعة، رياضة وموضة'
    },
    description: {
      fr: 'Alliance parfaite entre sport de pointe, motorsport et street style rétro.',
      ar: 'الجمع المثالي بين الرياضة المتطورة وسباق السيارات والنمط الكلاسيكي.'
    },
    categoryType: 'sport',
    tags: ['Palermo', 'Suede', 'Running', 'Motorsport'],
    gradient: 'from-rose-500/10 via-red-500/5 to-transparent',
    borderHover: 'group-hover:border-rose-500/40',
    accentText: 'text-rose-500',
    accentBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    popular: true
  },
  'new-balance': {
    name: 'New Balance',
    slug: 'new-balance',
    country: 'USA',
    flag: '🇺🇸',
    slogan: {
      fr: 'Fearlessly Independent • Confort Suprême & Rétro',
      ar: 'مستقل بشجاعة • راحة فائقة وطراز ريترو'
    },
    description: {
      fr: 'Les icônes du dad-shoe et du confort absolu : 550, 9060, 2002R et 1906.',
      ar: 'أيقونات الراحة الفائقة والتصميم الكلاسيكي: 550، 9060، 2002R و 1906.'
    },
    categoryType: 'lifestyle',
    tags: ['550', '9060', '2002R', 'Confort'],
    gradient: 'from-red-600/10 via-zinc-500/5 to-transparent',
    borderHover: 'group-hover:border-red-600/40',
    accentText: 'text-red-600',
    accentBg: 'bg-red-600/10 text-red-600 dark:text-red-400',
    popular: true
  },
  converse: {
    name: 'Converse',
    slug: 'converse',
    country: 'USA',
    flag: '🇺🇸',
    slogan: {
      fr: 'For The Independent • All Star & Légende Skate',
      ar: 'للمستقلين • أل ستار وأسطورة التزلج'
    },
    description: {
      fr: 'La Chuck Taylor All Star indémodable, symbole de liberté créative et d’authenticité.',
      ar: 'حذاء تشاك تايلور أل ستار الخالد، رمز الحرية الإبداعية والأصالة.'
    },
    categoryType: 'lifestyle',
    tags: ['Chuck 70', 'All Star', 'Skate', 'Canvas'],
    gradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
    borderHover: 'group-hover:border-amber-500/40',
    accentText: 'text-amber-500',
    accentBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    popular: false
  },
  asics: {
    name: 'Asics',
    slug: 'asics',
    country: 'Japon',
    flag: '🇯🇵',
    slogan: {
      fr: 'Sound Mind, Sound Body • Amorti GEL & Running',
      ar: 'عقل سليم في جسم سليم • امتصاص الصدمات وجري'
    },
    description: {
      fr: 'La référence technologique japonaise en matière d’amorti GEL, de marathon et de style.',
      ar: 'المرجع التكنولوجي الياباني في تقنية GEL الممتصة للصدمات والجري الكلاسيكي.'
    },
    categoryType: 'sport',
    tags: ['GEL-Kayano', 'GEL-NYC', 'Running', 'Performance'],
    gradient: 'from-indigo-500/10 via-blue-500/5 to-transparent',
    borderHover: 'group-hover:border-indigo-500/40',
    accentText: 'text-indigo-500',
    accentBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    popular: false
  },
  reebok: {
    name: 'Reebok',
    slug: 'reebok',
    country: 'UK',
    flag: '🇬🇧',
    slogan: {
      fr: 'Life Is Not A Spectator Sport • Classic Leather',
      ar: 'الحياة ليست رياضة مشاهدة • كلاسيك ليذر'
    },
    description: {
      fr: 'Le style intemporel du fitness des années 80-90 avec la Classic Leather et Club C 85.',
      ar: 'أسلوب اللياقة البدنية الكلاسيكي من الثمانينيات مع كلاسيك ليذر وكلوب سي 85.'
    },
    categoryType: 'lifestyle',
    tags: ['Club C 85', 'Classic Leather', 'Retro', 'Tennis'],
    gradient: 'from-sky-500/10 via-cyan-500/5 to-transparent',
    borderHover: 'group-hover:border-sky-500/40',
    accentText: 'text-sky-500',
    accentBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    popular: false
  },
  campus: {
    name: 'Campus',
    slug: 'campus',
    country: 'Inde',
    flag: '🇮🇳',
    slogan: {
      fr: 'Step Out In Style • Tendance & Casual Shoes',
      ar: 'خطوة بأناقة • أحذية عصرية ويومية'
    },
    description: {
      fr: 'Sneakers légères et dynamiques pour le quotidien avec un excellent rapport qualité-prix.',
      ar: 'أحذية رياضية خفيفة وعصرية للحياة اليومية بجودة ممتازة.'
    },
    categoryType: 'lifestyle',
    tags: ['Casual', 'Lifestyle', 'Confort', 'Quotidien'],
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderHover: 'group-hover:border-emerald-500/40',
    accentText: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    popular: false
  },
  'under-armour': {
    name: 'Under Armour',
    slug: 'under-armour',
    country: 'USA',
    flag: '🇺🇸',
    slogan: {
      fr: 'The Only Way Is Through • Haute Performance',
      ar: 'الطريق الوحيد هو التقدم • أداء رياضي عالي'
    },
    description: {
      fr: 'Équipementier des athlètes pour le training intensif, le basketball et le dépassement de soi.',
      ar: 'تجهيزات الرياضيين للتدريب الشاق، كرة السلة واللياقة البدنية.'
    },
    categoryType: 'sport',
    tags: ['Curry Flow', 'Training', 'Fitness', 'HeatGear'],
    gradient: 'from-zinc-500/10 via-slate-500/5 to-transparent',
    borderHover: 'group-hover:border-zinc-500/40',
    accentText: 'text-zinc-500',
    accentBg: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
    popular: false
  }
};

export default function BrandsPage() {
  const { t, isAr } = useLanguage();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'inStock', 'sport', 'lifestyle'

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await axiosInstance.get('/brands');
        setBrands(data || []);
      } catch (error) {
        console.error('Error fetching brands:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Enrich fetched brands with local rich metadata
  const enrichedBrands = useMemo(() => {
    if (!Array.isArray(brands)) return [];

    return brands.map((b) => {
      const slugKey = (b.slug || b.name || '').toLowerCase().replace(/[\s_]+/g, '-');
      const meta = BRAND_METADATA[slugKey] || {};

      const flag = b.country?.toLowerCase() === 'usa' ? '🇺🇸' : 
                   b.country?.toLowerCase() === 'allemagne' || b.country?.toLowerCase() === 'germany' ? '🇩🇪' : 
                   b.country?.toLowerCase() === 'japon' || b.country?.toLowerCase() === 'japan' ? '🇯🇵' : 
                   b.country?.toLowerCase() === 'uk' || b.country?.toLowerCase() === 'angleterre' ? '🇬🇧' : 
                   meta.flag || '🌍';

      let defaultSlogan = meta.slogan || { fr: 'Authentique & Tendance', ar: 'أصلي وعصري' };
      if (b.slogan) {
        if (typeof b.slogan === 'string') {
          defaultSlogan = { fr: b.slogan, ar: b.slogan };
        } else if (typeof b.slogan === 'object') {
          defaultSlogan = {
            fr: b.slogan.fr || meta.slogan?.fr || 'Authentique & Tendance',
            ar: b.slogan.ar || meta.slogan?.ar || 'أصلي وعصري'
          };
        }
      }

      let defaultDesc = meta.description || { fr: 'Articles officiels disponibles en magasin.', ar: 'منتجات رسمية متوفرة في المتجر.' };
      if (b.description) {
        if (typeof b.description === 'string') {
          defaultDesc = { fr: b.description, ar: b.description };
        } else if (typeof b.description === 'object') {
          defaultDesc = {
            fr: b.description.fr || meta.description?.fr || 'Articles officiels disponibles en magasin.',
            ar: b.description.ar || meta.description?.ar || 'منتجات رسمية متوفرة في المتجر.'
          };
        }
      }

      return {
        _id: b._id || slugKey,
        name: b.name || meta.name || slugKey.toUpperCase(),
        slug: b.slug || meta.slug || slugKey,
        logo: b.logo || `/assets/brands/${slugKey}.svg`,
        productCount: typeof b.productCount === 'number' ? b.productCount : 0,
        country: b.country || meta.country || 'International',
        flag,
        slogan: defaultSlogan,
        description: defaultDesc,
        categoryType: b.categoryType || meta.categoryType || 'lifestyle',
        tags: meta.tags || ['Sneakers', 'Streetwear'],
        gradient: meta.gradient || 'from-gray-500/10 to-transparent',
        borderHover: meta.borderHover || 'group-hover:border-gray-500/40',
        accentText: meta.accentText || 'text-[#006233]',
        accentBg: meta.accentBg || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        popular: meta.popular || false
      };
    });
  }, [brands]);

  // Filtered brands according to search query and active tab
  const filteredBrands = useMemo(() => {
    return enrichedBrands.filter((brand) => {
      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        brand.name.toLowerCase().includes(q) ||
        brand.slug.toLowerCase().includes(q) ||
        brand.country.toLowerCase().includes(q) ||
        (brand.tags && brand.tags.some((t) => t.toLowerCase().includes(q)));

      if (!matchesSearch) return false;

      // Tab match
      if (activeTab === 'inStock') {
        return brand.productCount > 0;
      }
      if (activeTab === 'sport') {
        return brand.categoryType === 'sport';
      }
      if (activeTab === 'lifestyle') {
        return brand.categoryType === 'lifestyle';
      }
      return true;
    });
  }, [enrichedBrands, searchQuery, activeTab]);

  // Top flagship brands for the spotlight section
  const spotlightBrands = useMemo(() => {
    return enrichedBrands.filter((b) => ['nike', 'adidas', 'puma'].includes(b.slug));
  }, [enrichedBrands]);

  // Dynamic counts for each filter tab
  const tabCounts = useMemo(() => {
    return {
      all: enrichedBrands.length,
      inStock: enrichedBrands.filter((b) => b.productCount > 0).length,
      sport: enrichedBrands.filter((b) => b.categoryType === 'sport').length,
      lifestyle: enrichedBrands.filter((b) => b.categoryType === 'lifestyle').length,
    };
  }, [enrichedBrands]);

  // Total products in store across brands
  const totalArticles = useMemo(() => {
    return enrichedBrands.reduce((acc, b) => acc + (b.productCount || 0), 0);
  }, [enrichedBrands]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 pt-6 pb-24" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t({ fr: 'Nos Marques Officielles – FootLockerDZ', ar: 'علاماتنا التجارية الرسمية – FootLockerDZ' })}</title>
        <meta
          name="description"
          content={t({
            fr: 'Découvrez toutes nos marques de sneakers officielles : Nike, Adidas, Puma, New Balance, Converse, Asics, Reebok. Livraison 58 Wilayas.',
            ar: 'اكتشف جميع ماركات الأحذية الرياضية الأصلية: نايكي، أديداس، بوما، نيو بالانس، كونفرس، أسيكس، ريبوك. التوصيل متوفر لـ 58 ولاية.'
          })}
        />
      </Helmet>

      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Breadcrumb Navigation */}
        <nav className="text-xs sm:text-sm text-gray-500 mb-6 flex items-center gap-2" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#006233] dark:hover:text-[#F9A826] transition-colors font-medium">
            {t({ fr: 'Accueil', ar: 'الرئيسية' })}
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-semibold">
            {t({ fr: 'Marques Officielles', ar: 'العلامات التجارية' })}
          </span>
        </nav>

        {/* Hero Section with Luxury Sports Styling */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-8 md:p-14 mb-12 shadow-2xl border border-gray-800">
          {/* Subtle Ambient Glowing Orbs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#006233]/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#F9A826]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Authenticity Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold tracking-widest uppercase mb-6 text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t({ fr: '100% PRODUITS AUTHENTIQUES & CERTIFIÉS', ar: 'منتجات أصلية ومضمونة 100%' })}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white mb-5 leading-none">
              {t({ fr: 'UNIVERS DES MARQUES', ar: 'عالم العلامات التجارية' })}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-300 font-light leading-relaxed mb-8 max-w-2xl mx-auto">
              {t({
                fr: 'Retrouvez les géants mondiaux de la sneaker et du streetwear. Cliquez sur votre marque préférée pour explorer directement les modèles en stock.',
                ar: 'اكتشف عمالقة الأحذية الرياضية وأزياء الشارع العالمية. اضغط على أي ماركة لتصفح جميع الموديلات المتوفرة في المتجر مباشرة.'
              })}
            </p>

            {/* Trust Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-4 border-t border-white/10 text-xs sm:text-sm">
              <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400">{enrichedBrands.length}</span>
                <span className="text-gray-400 text-xs">{t({ fr: 'Marques mondiales', ar: 'ماركة عالمية' })}</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                <span className="text-xl sm:text-2xl font-black text-emerald-400">100%</span>
                <span className="text-gray-400 text-xs">{t({ fr: 'Originaux garantis', ar: 'أصلي ومضمون' })}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex flex-col items-center p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                <span className="text-xl sm:text-2xl font-black text-sky-400">58</span>
                <span className="text-gray-400 text-xs">{t({ fr: 'Wilayas livrées', ar: 'ولاية مغطاة' })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Flagship Brands Quick Spotlight Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006233] dark:bg-[#F9A826]"></span>
              {t({ fr: 'Piliers Incontournables', ar: 'الماركات الأكثر طلباً' })}
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              {t({ fr: 'Accès rapide boutique', ar: 'دخول سريع للمتجر' })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {spotlightBrands.map((b) => (
              <Link
                key={`spotlight-${b.slug}`}
                to={`/shop?brand=${encodeURIComponent(b.slug)}`}
                className="group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-3 border border-gray-100 dark:border-gray-800 group-hover:scale-105 transition-transform">
                    <BrandLogo slug={b.slug} brandName={b.name} logoUrl={b.logo} className="h-9 w-auto max-w-[56px]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-white group-hover:text-[#006233] dark:group-hover:text-[#F9A826] transition-colors">
                      {b.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {t(b.slogan)}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      {b.productCount} {b.productCount > 1 ? t({ fr: 'modèles en stock', ar: 'موديلات متوفرة' }) : t({ fr: 'modèle en stock', ar: 'موديل متوفر' })}
                    </span>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 group-hover:bg-[#006233] group-hover:text-white dark:group-hover:bg-[#F9A826] dark:group-hover:text-gray-950 transition-colors">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-5 mb-8 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t({
                  fr: 'Rechercher une marque (ex: Puma, Nike, Adidas...)',
                  ar: 'ابحث عن علامة تجارية (مثال: بوما، نايكي...)'
                })}
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#006233] dark:focus:ring-[#F9A826] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-[#006233] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t({ fr: 'Toutes les marques', ar: 'جميع الماركات' })} ({tabCounts.all})
              </button>

              <button
                onClick={() => setActiveTab('inStock')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'inStock'
                    ? 'bg-[#006233] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {t({ fr: 'En Stock dans le Shop', ar: 'متوفر في المتجر' })} ({tabCounts.inStock})
              </button>

              <button
                onClick={() => setActiveTab('sport')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'sport'
                    ? 'bg-[#006233] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t({ fr: 'Sport & Performance', ar: 'رياضة وأداء' })} ({tabCounts.sport})
              </button>

              <button
                onClick={() => setActiveTab('lifestyle')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'lifestyle'
                    ? 'bg-[#006233] text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {t({ fr: 'Lifestyle & Rétro', ar: 'لايف ستايل وريترو' })} ({tabCounts.lifestyle})
              </button>
            </div>

          </div>
        </div>

        {/* Brands Cards Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-72">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#006233] dark:border-[#F9A826]"></div>
            <p className="mt-4 text-sm text-gray-500">{t({ fr: 'Chargement des marques...', ar: 'جاري تحميل الماركات...' })}</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {t({ fr: 'Aucune marque trouvée', ar: 'لم يتم العثور على أي علامة' })}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              {t({
                fr: 'Essayez un autre mot-clé ou réinitialisez les filtres pour voir toute la collection.',
                ar: 'جرب كلمة بحث أخرى أو أعد ضبط الفلاتر لمشاهدة جميع الماركات.'
              })}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('all'); }}
              className="px-5 py-2.5 rounded-xl bg-[#006233] text-white text-xs font-bold hover:bg-[#004d28] transition-colors"
            >
              {t({ fr: 'Réinitialiser la recherche', ar: 'إعادة ضبط البحث' })}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map((brand) => {
              // Direct shop link pre-filtering this exact brand!
              const shopUrl = `/shop?brand=${encodeURIComponent(brand.slug)}`;

              return (
                <Link
                  key={brand._id || brand.slug}
                  to={shopUrl}
                  className="group relative flex flex-col justify-between bg-white dark:bg-gray-800/95 rounded-2xl p-6 border border-gray-200/80 dark:border-gray-700/80 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden"
                >
                  {/* Subtle Brand Ambient Glow On Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${brand.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  {/* Card Top: Country Flag & Availability Pill */}
                  <div className="relative z-10 flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
                      <span className="text-sm">{brand.flag}</span>
                      <span>{brand.country}</span>
                    </span>

                    {/* Stock Status Pill */}
                    {brand.productCount > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {brand.productCount} {brand.productCount > 1 ? t({ fr: 'articles', ar: 'منتجات' }) : t({ fr: 'article', ar: 'منتج' })}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                        {t({ fr: 'Catalogue', ar: 'كتالوج' })}
                      </span>
                    )}
                  </div>

                  {/* Card Center: Brand Logo & Typography */}
                  <div className="relative z-10 flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-24 h-24 mb-5 flex items-center justify-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                      <BrandLogo
                        slug={brand.slug}
                        brandName={brand.name}
                        logoUrl={brand.logo}
                        className="max-h-14 max-w-full object-contain"
                      />
                    </div>

                    <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-[#006233] dark:group-hover:text-[#F9A826] transition-colors mb-1">
                      {brand.name}
                    </h3>

                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-1 mb-3">
                      {t(brand.slogan)}
                    </p>

                    {/* Quick Tags */}
                    {brand.tags && brand.tags.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                        {brand.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/80 text-gray-600 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Interactive Direct Link Action */}
                  <div className="relative z-10 pt-4 mt-2 border-t border-gray-100 dark:border-gray-700/70">
                    <div className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-900/90 group-hover:bg-[#006233] dark:group-hover:bg-[#F9A826] text-gray-800 dark:text-gray-200 group-hover:text-white dark:group-hover:text-gray-950 font-bold text-xs transition-all duration-200 shadow-xs">
                      <span>{t({ fr: 'Voir les modèles', ar: 'تصفح الموديلات' })}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quality & Authenticity Guarantee Section */}
        <div className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-3">
              {t({ fr: 'Pourquoi acheter chez FootLockerDZ ?', ar: 'لماذا تختار FootLockerDZ ؟' })}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t({
                fr: 'Le premier catalogue de sneakers multimarques garanties 100% officielles en Algérie.',
                ar: 'المنصة الأولى للأحذية الرياضية الأصلية متعددة الماركات في الجزائر مع ضمان الجودة.'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-[#006233] dark:text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                {t({ fr: 'Authenticité 100%', ar: 'أصالة مضمونة 100%' })}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t({
                  fr: 'Chaque paire est rigoureusement vérifiée et provient de réseaux certifiés.',
                  ar: 'كل زوج يتم التحقق منه بدقة ومستورد من موزعين معتمدين.'
                })}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                {t({ fr: 'Livraison 58 Wilayas', ar: 'توصيل لـ 58 ولاية' })}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t({
                  fr: 'Expédition rapide avec paiement à la livraison à domicile ou en point relais.',
                  ar: 'شحن سريع لباب منزلك مع الدفع عند الاستلام في جميع الولايات.'
                })}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                {t({ fr: 'Essayage & Échange', ar: 'تجربة وتبديل المقاس' })}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t({
                  fr: 'Essayez votre pointure à la réception avec notre livreur en toute tranquillité.',
                  ar: 'يمكنك تجربة المقاس عند وصول الموزع لضمان المقاس المناسب لك.'
                })}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1">
                {t({ fr: 'Service Client 7j/7', ar: 'خدمة عملاء طيلة الأسبوع' })}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t({
                  fr: 'Assistance dédiée par téléphone et WhatsApp pour vous conseiller vos modèles.',
                  ar: 'فريق دعم متواجد عبر الهاتف وواتساب لمساعدتك في اختيار حذائك.'
                })}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
