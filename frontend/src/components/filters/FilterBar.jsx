import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useProductFilters } from '../../hooks/useProductFilters';
import { useLanguage } from '../../context/LanguageContext';
import { shopApi } from '../../api/shopApi';

export default function FilterBar({ facets = {}, isLoading = false, forceFilter, forceBrand }) {
  const { filters, toggleFilterArray, setFilter } = useProductFilters();
  const { category } = useParams();
  const navigate = useNavigate();
  const { t, isAr } = useLanguage();

  const renderCheckboxGroup = (key, label, options, facetKey) => (
    <div className="mb-6">
      <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{label}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {options.map((opt) => {
          const optKey = opt.value.toLowerCase();
          const count =
            facets[facetKey]?.[optKey] ||
            facets[facetKey]?.[optKey.replace(/-/g, ' ')] ||
            (facetKey === 'brand' && opt.label ? facets[facetKey]?.[opt.label.toLowerCase()] : 0) ||
            0;
          let isChecked = filters[key]?.some(
            (v) =>
              v?.toLowerCase() === optKey ||
              v?.toLowerCase().replace(/\s+/g, '-') === optKey.replace(/\s+/g, '-')
          );
          
          if (key === 'sport' && category && category.toLowerCase() === opt.value.toLowerCase()) {
            isChecked = true;
          }

          const handleChange = () => {
            if (key === 'sport' && category && category.toLowerCase() === opt.value.toLowerCase()) {
              navigate('/shop'); // Remove category from URL
            } else {
              toggleFilterArray(key, opt.value);
            }
          };
          
          return (
            <label key={opt.value} className={`flex items-center justify-between cursor-pointer group`}>
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isChecked} 
                onChange={handleChange} 
              />
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#006233] border-[#006233]' : 'border-gray-300 dark:border-gray-600 group-hover:border-[#006233]'}`}>
                  {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{opt.label}</span>
              </div>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const { data: dbBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: shopApi.getBrands,
    staleTime: 0
  });

  const dynamicBrands = useMemo(() => {
    if (!Array.isArray(dbBrands)) return [];

    const map = new Map();
    dbBrands.forEach((b) => {
      if (b && b.name) {
        const val = (b.slug || b.name).toLowerCase().trim().replace(/\s+/g, '-');
        if (!map.has(val)) {
          map.set(val, {
            label: b.name,
            value: val,
            productCount: b.productCount || 0
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [dbBrands]);

  const SPORTS = [
    { value: 'running',    label: t({ fr: 'Running',    ar: 'جري' }) },
    { value: 'basketball', label: t({ fr: 'Basketball', ar: 'كرة السلة' }) },
    { value: 'football',   label: t({ fr: 'Football',   ar: 'كرة القدم' }) },
    { value: 'lifestyle',  label: t({ fr: 'Lifestyle',  ar: 'لايف ستايل' }) },
    { value: 'outdoor',    label: t({ fr: 'Outdoor',    ar: 'رياضة خارجية' }) },
    { value: 'slides',     label: t({ fr: 'Slides',     ar: 'شبشب' }) },
    { value: 'training',   label: t({ fr: 'Training',   ar: 'تدريب' }) },
  ];
  const GENDERS = [
    { label: t({fr: 'Homme', ar: 'رجال'}), value: 'men' },
    { label: t({fr: 'Femme', ar: 'نساء'}), value: 'women' },
    { label: t({fr: 'Enfant', ar: 'أطفال'}), value: 'kids' },
    { label: t({fr: 'Unisexe', ar: 'للجنسين'}), value: 'unisex' }
  ];
  const SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'].map(s => ({ label: s, value: s }));

  return (
    <div className={`w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
      {/* Brand */}
      {!forceBrand && renderCheckboxGroup('brand', t({fr: 'Marque', ar: 'العلامة التجارية'}), dynamicBrands, 'brand')}
      
      {/* Gender */}
      {renderCheckboxGroup('gender', t({fr: 'Genre', ar: 'الجنس'}), GENDERS, 'gender')}
      
      {/* Sport */}
      {renderCheckboxGroup('sport', t({fr: 'Sport', ar: 'الرياضة'}), SPORTS, 'sport')}
      
      {/* Sizes */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{t({fr: 'Pointure', ar: 'المقاس'})}</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((opt) => {
            const count = facets.size?.[opt.value] || 0;
            const isChecked = filters.size?.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => toggleFilterArray('size', opt.value)}
                className={`w-10 h-10 rounded border text-sm font-medium transition-all ${
                  isChecked 
                    ? 'border-[#006233] bg-[#006233] text-white' 
                    : 'border-gray-300 text-gray-700 hover:border-[#006233] dark:border-gray-600 dark:text-gray-300'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">{t({fr: 'Prix', ar: 'السعر'})}</h3>
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            placeholder="Min" 
            value={filters.minPrice}
            onChange={(e) => setFilter('minPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-transparent text-sm focus:ring-1 focus:ring-[#006233] outline-none"
          />
          <span className="text-gray-400">-</span>
          <input 
            type="number" 
            placeholder="Max" 
            value={filters.maxPrice}
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-transparent text-sm focus:ring-1 focus:ring-[#006233] outline-none"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4 mb-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        {forceFilter !== 'sale' && (
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t({fr: 'En promotion', ar: 'في تخفيض'})}</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={filters.promo} onChange={(e) => setFilter('promo', e.target.checked)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${filters.promo ? 'bg-[#006233]' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`dot absolute ${isAr ? 'right-1' : 'left-1'} top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.promo ? (isAr ? '-translate-x-4' : 'translate-x-4') : ''}`}></div>
            </div>
          </label>
        )}
        
        {forceFilter !== 'new' && (
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t({fr: 'Nouveautés', ar: 'وصل حديثاً'})}</span>
            <div className="relative">
              <input type="checkbox" className="sr-only" checked={filters.isNew} onChange={(e) => setFilter('isNew', e.target.checked)} />
              <div className={`block w-10 h-6 rounded-full transition-colors ${filters.isNew ? 'bg-[#006233]' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              <div className={`dot absolute ${isAr ? 'right-1' : 'left-1'} top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.isNew ? (isAr ? '-translate-x-4' : 'translate-x-4') : ''}`}></div>
            </div>
          </label>
        )}

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{t({fr: 'En stock', ar: 'متوفر'})}</span>
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={filters.inStock} onChange={(e) => setFilter('inStock', e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition-colors ${filters.inStock ? 'bg-[#006233]' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
            <div className={`dot absolute ${isAr ? 'right-1' : 'left-1'} top-1 bg-white w-4 h-4 rounded-full transition-transform ${filters.inStock ? (isAr ? '-translate-x-4' : 'translate-x-4') : ''}`}></div>
          </div>
        </label>
      </div>

    </div>
  );
}
