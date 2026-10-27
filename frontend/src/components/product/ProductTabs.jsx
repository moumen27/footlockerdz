import React, { useState } from 'react';
import ProductReviews from './ProductReviews';
import ProductQA from './ProductQA';
import { useLanguage } from '../../context/LanguageContext';
import { Tag, Layers, Users, Hash, Palette, Ruler, CheckCircle2, XCircle } from 'lucide-react';

const ProductTabs = ({ product }) => {
  const { t, lng } = useLanguage();
  const [activeTab, setActiveTab] = useState('description');

  React.useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail) setActiveTab(e.detail);
    };
    window.addEventListener('switch-product-tab', handleSwitch);
    return () => window.removeEventListener('switch-product-tab', handleSwitch);
  }, []);

  const tabs = [
    { id: 'description', label: t({ fr: 'Description', ar: 'الوصف' }) },
    { id: 'attributes', label: t({ fr: 'Caractéristiques', ar: 'المواصفات' }) },
    { id: 'reviews', label: t({ fr: 'Avis', ar: 'التقييمات' }) },
    { id: 'qa', label: t({ fr: 'Questions', ar: 'الأسئلة' }) },
  ];

  const productDesc = typeof product.description === 'object' 
    ? (lng === 'ar' ? (product.description.ar || product.description.fr) : (product.description.fr || product.description.ar))
    : (product.description || '');

  const getGenderLabel = (g) => {
    switch (g) {
      case 'men': return t({ fr: 'Homme', ar: 'رجال' });
      case 'women': return t({ fr: 'Femme', ar: 'نساء' });
      case 'kids': return t({ fr: 'Enfant', ar: 'أطفال' });
      case 'unisex': return t({ fr: 'Unisexe', ar: 'للجنسين' });
      default: return t({ fr: 'Unisexe', ar: 'للجنسين' });
    }
  };

  const getCategoryLabel = (cat) => {
    if (!cat) return '';
    if (typeof cat === 'object') return cat[lng] || cat.fr || cat.ar || '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const colorsList = product.colorVariants && product.colorVariants.length > 0
    ? product.colorVariants.map(c => c.color).filter(Boolean).join(', ')
    : null;

  const sizesList = product.colorVariants && product.colorVariants.length > 0
    ? [...new Set(product.colorVariants.flatMap(c => c.sizes || []))].filter(Boolean).join(', ')
    : null;

  const realSpecs = [
    {
      icon: Tag,
      label: t({ fr: 'Marque', ar: 'العلامة التجارية' }),
      value: product.brand || 'FootLockerDZ',
    },
    {
      icon: Layers,
      label: t({ fr: 'Catégorie', ar: 'الفئة' }),
      value: getCategoryLabel(product.categoryName) || 'Lifestyle',
    },
    {
      icon: Users,
      label: t({ fr: 'Genre', ar: 'الجنس' }),
      value: getGenderLabel(product.gender),
    },
    {
      icon: Hash,
      label: t({ fr: 'Référence (SKU)', ar: 'رمز المنتج (SKU)' }),
      value: product.sku || product.slug || '—',
    },
    colorsList && {
      icon: Palette,
      label: t({ fr: 'Couleurs', ar: 'الألوان المتاحة' }),
      value: colorsList,
    },
    sizesList && {
      icon: Ruler,
      label: t({ fr: 'Pointures disponibles', ar: 'المقاسات المتاحة' }),
      value: sizesList,
    },
    {
      icon: product.totalStock > 0 ? CheckCircle2 : XCircle,
      label: t({ fr: 'Disponibilité', ar: 'التوفر' }),
      value: product.totalStock > 0 
        ? t({ fr: 'En stock', ar: 'متوفر في المخزون' })
        : t({ fr: 'Rupture de stock', ar: 'نفد من المخزون' }),
      badge: product.totalStock > 0 ? 'in_stock' : 'out_of_stock'
    }
  ].filter(Boolean);

  return (
    <div className="mt-12" id="reviews-tab">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              whitespace-nowrap px-8 py-4 font-medium text-lg transition-colors border-b-2
              ${activeTab === tab.id 
                ? 'border-black text-black dark:border-white dark:text-white' 
                : 'border-transparent text-gray-500 hover:text-black dark:hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === 'description' && (
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            {productDesc ? (
              <p className="text-base">{productDesc}</p>
            ) : (
              <p className="text-gray-400 italic">{t({ fr: 'Aucune description disponible pour ce produit.', ar: 'لا يوجد وصف متاح لهذا المنتج.' })}</p>
            )}
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="max-w-2xl bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800 shadow-sm">
            {realSpecs.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="flex items-center justify-between p-4 sm:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-600 dark:text-gray-300 text-sm">{spec.label}</span>
                  </div>
                  {spec.badge ? (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      spec.badge === 'in_stock' 
                        ? 'bg-emerald-100 text-[#006233] dark:bg-emerald-950/50 dark:text-emerald-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                    }`}>
                      {spec.value}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-900 dark:text-white text-sm capitalize">{spec.value}</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews productId={product.id} />
        )}

        {activeTab === 'qa' && (
          <ProductQA productId={product.id} />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
