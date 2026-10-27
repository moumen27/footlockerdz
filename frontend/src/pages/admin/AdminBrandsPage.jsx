import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  Tag, 
  Globe, 
  ExternalLink, 
  Package, 
  X, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { brandApi } from '../../api/brandApi';
import BrandLogo from '../../components/brands/BrandLogo';

export default function AdminBrandsPage() {
  const { user } = useAuth();
  const { t, isAr } = useLanguage();
  const queryClient = useQueryClient();

  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'sport', 'lifestyle', 'withStock'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    country: 'International',
    categoryType: 'lifestyle',
    slogan: { fr: '', ar: '' },
    description: { fr: '', ar: '' }
  });

  // Delete State
  const [deletingBrand, setDeletingBrand] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Brands
  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await brandApi.getBrands();
      setBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
      toast.error(t({ fr: 'Erreur lors du chargement des marques', ar: 'خطأ في تحميل العلامات التجارية' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Filtered Brands
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        brand.name.toLowerCase().includes(q) ||
        brand.slug.toLowerCase().includes(q) ||
        (brand.country && brand.country.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterType === 'sport') return brand.categoryType === 'sport';
      if (filterType === 'lifestyle') return brand.categoryType === 'lifestyle';
      if (filterType === 'withStock') return (brand.productCount || 0) > 0;

      return true;
    });
  }, [brands, searchQuery, filterType]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      logo: '',
      country: 'International',
      categoryType: 'lifestyle',
      slogan: { fr: '', ar: '' },
      description: { fr: '', ar: '' }
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name || '',
      slug: brand.slug || '',
      logo: brand.logo || '',
      country: brand.country || 'International',
      categoryType: brand.categoryType || 'lifestyle',
      slogan: {
        fr: typeof brand.slogan === 'object' ? brand.slogan?.fr || '' : brand.slogan || '',
        ar: typeof brand.slogan === 'object' ? brand.slogan?.ar || '' : ''
      },
      description: {
        fr: typeof brand.description === 'object' ? brand.description?.fr || '' : brand.description || '',
        ar: typeof brand.description === 'object' ? brand.description?.ar || '' : ''
      }
    });
    setIsModalOpen(true);
  };

  // Handle Name Change (Auto-generate slug if new)
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: !editingBrand ? val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') : prev.slug
    }));
  };

  // Save (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning(t({ fr: 'Le nom de la marque est obligatoire', ar: 'اسم العلامة التجارية مطلوب' }));
      return;
    }

    try {
      setSaving(true);
      if (editingBrand) {
        await brandApi.updateBrand(editingBrand._id, formData);
        toast.success(t({ fr: 'Marque mise à jour avec succès', ar: 'تم تحديث العلامة التجارية بنجاح' }));
      } else {
        await brandApi.createBrand(formData);
        toast.success(t({ fr: 'Nouvelle marque créée avec succès', ar: 'تمت إضافة العلامة التجارية بنجاح' }));
      }
      setIsModalOpen(false);
      await fetchBrands();
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t({ fr: 'Erreur lors de l’enregistrement', ar: 'خطأ أثناء الحفظ' }));
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    try {
      setIsDeleting(true);
      await brandApi.deleteBrand(deletingBrand._id);
      toast.success(t({ fr: 'Marque supprimée avec succès', ar: 'تم حذف العلامة التجارية بنجاح' }));
      setDeletingBrand(null);
      await fetchBrands();
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t({ fr: 'Erreur lors de la suppression', ar: 'خطأ أثناء الحذف' }));
    } finally {
      setIsDeleting(false);
    }
  };

  // Access control
  if (user?.role === 'admin_orders') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center mt-10">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t({ fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)' })}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {t({ fr: 'Vous n’avez pas les permissions pour gérer le catalogue.', ar: 'ليس لديك صلاحيات لإدارة الكتالوج.' })}
        </p>
      </div>
    );
  }

  // Summary Metrics
  const totalWithProducts = brands.filter((b) => (b.productCount || 0) > 0).length;
  const totalProductsCount = brands.reduce((acc, b) => acc + (b.productCount || 0), 0);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-[#006233]/10 dark:bg-[#F9A826]/10 rounded-xl text-[#006233] dark:text-[#F9A826]">
              <Tag className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
              {t({ fr: 'Gestion des Marques', ar: 'إدارة العلامات التجارية' })}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t({
              fr: 'Gérez les marques officielles de la boutique. Les marques créées apparaissent automatiquement dans les filtres du Shop et sur la page Marques.',
              ar: 'إدارة العلامات التجارية الرسمية. تظهر الماركات المضافة تلقائياً في فلاتر المتجر وصفحة الماركات.'
            })}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#006233] hover:bg-[#004d28] text-white font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t({ fr: 'Nouvelle Marque', ar: 'إضافة علامة تجارية' })}</span>
        </button>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ fr: 'Total Marques', ar: 'إجمالي الماركات' })}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{brands.length}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ fr: 'Avec Produits en Stock', ar: 'ماركات متوفرة في المتجر' })}</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalWithProducts}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ fr: 'Total Articles Liés', ar: 'إجمالي المنتجات المنسوبة' })}</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{totalProductsCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t({ fr: 'Rechercher une marque...', ar: 'بحث عن علامة تجارية...' })}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-[#006233] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t({ fr: 'Toutes', ar: 'الكل' })} ({brands.length})
          </button>
          <button
            onClick={() => setFilterType('withStock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'withStock'
                ? 'bg-[#006233] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t({ fr: 'En Stock', ar: 'متوفرة' })} ({totalWithProducts})
          </button>
          <button
            onClick={() => setFilterType('sport')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'sport'
                ? 'bg-[#006233] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t({ fr: 'Sport', ar: 'رياضة' })}
          </button>
          <button
            onClick={() => setFilterType('lifestyle')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterType === 'lifestyle'
                ? 'bg-[#006233] text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t({ fr: 'Lifestyle', ar: 'لايف ستايل' })}
          </button>
        </div>
      </div>

      {/* Main Brands Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#006233] dark:border-[#F9A826]"></div>
            <p className="mt-3 text-sm text-gray-500">{t({ fr: 'Chargement des marques...', ar: 'جاري التحميل...' })}</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center">
            <Tag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              {t({ fr: 'Aucune marque trouvée', ar: 'لم يتم العثور على علامة تجارية' })}
            </h3>
            <p className="text-xs text-gray-500">
              {t({ fr: 'Essayez un autre mot clé ou créez une nouvelle marque.', ar: 'جرب بحثاً آخر أو أضف علامة تجارية جديدة.' })}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4">{t({ fr: 'Marque', ar: 'العلامة التجارية' })}</th>
                  <th className="px-6 py-4">{t({ fr: 'Slug', ar: 'المعرف الرابط' })}</th>
                  <th className="px-6 py-4">{t({ fr: 'Pays', ar: 'البلد' })}</th>
                  <th className="px-6 py-4">{t({ fr: 'Catégorie', ar: 'الفئة' })}</th>
                  <th className="px-6 py-4 text-center">{t({ fr: 'Articles en boutique', ar: 'المنتجات' })}</th>
                  <th className="px-6 py-4 text-right">{t({ fr: 'Actions', ar: 'إجراءات' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredBrands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/40 transition-colors">
                    {/* Logo & Name */}
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center shrink-0">
                        <BrandLogo
                          slug={brand.slug}
                          brandName={brand.name}
                          logoUrl={brand.logo}
                          className="max-h-8 max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-extrabold text-gray-900 dark:text-white text-base">
                          {brand.name}
                        </div>
                        {brand.slogan?.fr && (
                          <div className="text-xs text-gray-400 line-clamp-1 max-w-xs">
                            {brand.slogan.fr}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                      /{brand.slug}
                    </td>

                    {/* Country */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        {brand.country || 'International'}
                      </span>
                    </td>

                    {/* Category Type */}
                    <td className="px-6 py-4">
                      {brand.categoryType === 'sport' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Sport & Performance
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Lifestyle & Rétro
                        </span>
                      )}
                    </td>

                    {/* Product count */}
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/shop?brand=${encodeURIComponent(brand.slug)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-800"
                        title={t({ fr: 'Voir dans la boutique', ar: 'عرض في المتجر' })}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{brand.productCount || 0} {t({ fr: 'articles', ar: 'منتجات' })}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </Link>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(brand)}
                          className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title={t({ fr: 'Modifier', ar: 'تعديل' })}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingBrand(brand)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title={t({ fr: 'Supprimer', ar: 'حذف' })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#006233]" />
                {editingBrand ? t({ fr: 'Modifier la marque', ar: 'تعديل العلامة التجارية' }) : t({ fr: 'Ajouter une marque', ar: 'إضافة علامة تجارية' })}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Brand Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Nom de la marque *', ar: 'اسم العلامة *' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Ex: Jordan, Salomon, Vans"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Slug (identifiant URL) *', ar: 'المعرف الرابط *' })}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') })}
                    placeholder="ex: jordan"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Logo URL & Live Preview */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                  {t({ fr: 'Logo (URL d’image ou fichier SVG)', ar: 'شعار الماركة (رابط أو مسار)' })}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    placeholder="ex: /assets/brands/jordan.svg ou URL web"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                  />
                  <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 flex items-center justify-center shrink-0">
                    <BrandLogo
                      slug={formData.slug}
                      brandName={formData.name}
                      logoUrl={formData.logo}
                      className="max-h-8 max-w-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Country & Category Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Pays d’origine', ar: 'بلد المنشأ' })}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Ex: USA, France, Allemagne, Japon"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Type de Catégorie', ar: 'تصنيف الماركة' })}
                  </label>
                  <select
                    value={formData.categoryType}
                    onChange={(e) => setFormData({ ...formData, categoryType: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                  >
                    <option value="lifestyle">Lifestyle & Rétro</option>
                    <option value="sport">Sport & Performance</option>
                  </select>
                </div>
              </div>

              {/* Slogan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Slogan (Français)', ar: 'الشعار بالفرنسية' })}
                  </label>
                  <input
                    type="text"
                    value={formData.slogan.fr}
                    onChange={(e) => setFormData({ ...formData, slogan: { ...formData.slogan, fr: e.target.value } })}
                    placeholder="Ex: Just Do It • Performance & Style"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                  />
                </div>

                <div dir="rtl">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Slogan (Arabe)', ar: 'الشعار بالعربية' })}
                  </label>
                  <input
                    type="text"
                    value={formData.slogan.ar}
                    onChange={(e) => setFormData({ ...formData, slogan: { ...formData.slogan, ar: e.target.value } })}
                    placeholder="مثال: فقط افعلها • أداء وأناقة"
                    className="w-full px-4 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Description (Français)', ar: 'الوصف بالفرنسية' })}
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description.fr}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, fr: e.target.value } })}
                    placeholder="Brève présentation de la marque..."
                    className="w-full px-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233] resize-none"
                  />
                </div>

                <div dir="rtl">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">
                    {t({ fr: 'Description (Arabe)', ar: 'الوصف بالعربية' })}
                  </label>
                  <textarea
                    rows="2"
                    value={formData.description.ar}
                    onChange={(e) => setFormData({ ...formData, description: { ...formData.description, ar: e.target.value } })}
                    placeholder="وصف مختصر للعلامة التجارية..."
                    className="w-full px-4 py-2 text-sm rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233] resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold text-sm transition-colors"
                >
                  {t({ fr: 'Annuler', ar: 'إلغاء' })}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-[#006233] hover:bg-[#004d28] text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                  <span>{editingBrand ? t({ fr: 'Enregistrer', ar: 'حفظ' }) : t({ fr: 'Créer la marque', ar: 'إضافة الماركة' })}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 shadow-2xl border border-red-100 dark:border-red-900 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
              {t({ fr: 'Supprimer la marque ?', ar: 'تأكيد حذف العلامة ؟' })}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t({
                fr: `Êtes-vous sûr de vouloir supprimer définitivement "${deletingBrand.name}" ?`,
                ar: `هل أنت متأكد من رغبتك في حذف "${deletingBrand.name}" نهائياً؟`
              })}
            </p>

            {(deletingBrand.productCount || 0) > 0 && (
              <div className="p-3 mb-5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold text-left">
                ⚠️ {t({
                  fr: `Attention : ${deletingBrand.productCount} produit(s) sont associés à cette marque dans le magasin. Vous devez d'abord les supprimer ou changer leur marque avant de pouvoir supprimer cette marque.`,
                  ar: `تنبيه: هناك ${deletingBrand.productCount} منتج مرتبط بهذه الماركة. يجب تعديل أو حذف المنتجات أولاً.`
                })}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingBrand(null)}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold text-sm transition-colors"
              >
                {t({ fr: 'Annuler', ar: 'إلغاء' })}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting || (deletingBrand.productCount || 0) > 0}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />}
                <span>{t({ fr: 'Confirmer la suppression', ar: 'تأكيد الحذف' })}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
