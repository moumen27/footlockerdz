import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, ChevronDown, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { newsletterApi } from '../../api/newsletterApi';

const Combobox = ({ options, value, onChange, placeholder }) => {
  const { t, lng } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value || '');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value || '');
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required
          className="w-full px-4 py-2 pr-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 p-1 text-gray-500 hover:text-black dark:hover:text-white rounded-md"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>
      
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, idx) => (
              <li
                key={idx}
                onMouseDown={() => {
                  setSearch(opt);
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
              >
                {opt}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              {t({fr: 'Appuyez sur Entrée pour créer', ar: 'اضغط على Enter لإنشاء'})} "{search}"
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

const AdminProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, lng } = useLanguage();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    sku: '',
    name: { fr: '', ar: '' },
    description: { fr: '', ar: '' },
    price: 0,
    discountPrice: 0,
    isNewProduct: false,
    brand: '',
    category: '',
    gender: 'unisex',
    variants: []
  });

  const [broadcasting, setBroadcasting] = useState(false);

  const handleBroadcast = async () => {
    const pName = formData.name?.fr || 'ce produit';
    const confirmed = window.confirm(t({
      fr: `Envoyer un email d'annonce de la nouveauté « ${pName} » à tous les abonnés de la newsletter ?`,
      ar: `هل تريد إرسال إعلان عن « ${pName} » إلى جميع المشتركين في النشرة الإخبارية؟`
    }));

    if (!confirmed) return;

    setBroadcasting(true);
    try {
      const res = await newsletterApi.broadcastProduct(id);
      toast.success(res.message || t({
        fr: `Email envoyé avec succès aux abonnés !`,
        ar: `تم إرسال البريد الإلكتروني بنجاح للمشتركين!`
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || t({
        fr: `Erreur lors de l'envoi de l'email aux abonnés.`,
        ar: `حدث خطأ أثناء إرسال البريد للمشتركين.`
      }));
    } finally {
      setBroadcasting(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch brands and categories
        const [brandsRes, catRes] = await Promise.all([
          axiosInstance.get('/brands').catch(() => ({ data: [] })),
          axiosInstance.get('/categories').catch(() => ({ data: [] }))
        ]);
        
        setBrands(brandsRes.data);
        setCategories(catRes.data);

        // Fetch product if editing
        if (isEdit) {
          const prodRes = await axiosInstance.get(`/products/${id}`);
          const product = prodRes.data;
          
          setFormData({
            sku: product.sku || '',
            name: { fr: product.name?.fr || product.name || '', ar: product.name?.ar || '' },
            description: { fr: product.description?.fr || '', ar: product.description?.ar || '' },
            price: product.price || 0,
            discountPrice: product.discountPrice || 0,
            isNewProduct: product.isNewProduct || false,
            brand: product.brand?.name || product.brand || '',
            category: product.category?.name?.fr || product.category?.name || product.category || '',
            gender: product.gender || 'unisex',
            variants: product.variants || []
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested fields (e.g., name.fr)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Matrix Tool functions
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        { color: '', colorCode: '#000000', size: '', stock: 0, images: [''] }
      ]
    }));
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };
      return { ...prev, variants: newVariants };
    });
  };

  const handleVariantImageChange = (variantIndex, imageIndex, value) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      const newImages = [...newVariants[variantIndex].images];
      newImages[imageIndex] = value;
      newVariants[variantIndex].images = newImages;
      return { ...prev, variants: newVariants };
    });
  };

  const addVariantImage = (variantIndex) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].images.push('');
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setFormData(prev => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== imageIndex);
      return { ...prev, variants: newVariants };
    });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!formData.sku || !String(formData.sku).trim()) {
      alert(t({
        fr: 'Erreur : Le SKU (Référence) est obligatoire.',
        ar: 'خطأ: حقل SKU (المرجع) مطلوب.'
      }));
      return;
    }

    if (!formData.name?.fr || !String(formData.name.fr).trim()) {
      alert(t({
        fr: 'Erreur : Le nom du produit (Français) est obligatoire.',
        ar: 'خطأ: اسم المنتج (بالفرنسية) مطلوب.'
      }));
      return;
    }

    if (!formData.brand || !String(formData.brand).trim()) {
      alert(t({
        fr: 'Erreur : Veuillez sélectionner ou saisir une marque.',
        ar: 'خطأ: يرجى اختيار أو إدخال علامة تجارية.'
      }));
      return;
    }

    if (!formData.category || !String(formData.category).trim()) {
      alert(t({
        fr: 'Erreur : Veuillez sélectionner ou saisir une catégorie.',
        ar: 'خطأ: يرجى اختيار أو إدخال فئة.'
      }));
      return;
    }

    const baseP = Number(formData.price) || 0;
    const discP = Number(formData.discountPrice) || 0;

    if (baseP <= 0) {
      alert(t({
        fr: 'Erreur : Le prix de base doit être supérieur à 0 DZD.',
        ar: 'خطأ: يجب أن يكون السعر الأساسي أكبر من 0.'
      }));
      return;
    }

    if (discP > 0 && discP >= baseP) {
      alert(t({
        fr: 'Erreur : Le prix remisé doit être strictement inférieur au prix de base (ex: Prix base = 7000, Prix remisé = 5000).',
        ar: 'خطأ: يجب أن يكون سعر التخفيض أقل تماماً من السعر الأساسي.'
      }));
      return;
    }

    const payload = {
      ...formData,
      sku: formData.sku.trim(),
      name: {
        fr: formData.name.fr.trim(),
        ar: (formData.name.ar && formData.name.ar.trim()) || formData.name.fr.trim()
      },
      description: {
        fr: (formData.description?.fr || '').trim(),
        ar: (formData.description?.ar || formData.description?.fr || '').trim()
      },
      price: baseP,
      discountPrice: discP,
      isNewProduct: Boolean(formData.isNewProduct),
      variants: (formData.variants || [])
        .filter((v) => v && v.color && String(v.color).trim() && v.size && String(v.size).trim())
        .map((v) => ({
          ...v,
          stock: Math.max(0, Number(v.stock) || 0),
          images: (v.images || []).filter((img) => typeof img === 'string' && img.trim())
        }))
    };

    setSaving(true);
    try {
      if (isEdit) {
        await axiosInstance.put(`/products/${id}`, payload);
      } else {
        await axiosInstance.post('/products', payload);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || t({
        fr: 'Erreur lors de l’enregistrement du produit',
        ar: 'حدث خطأ أثناء حفظ المنتج'
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/products" className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${lng === 'ar' ? 'rotate-180' : ''}`}>
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </Link>
          <h1 className="text-2xl font-bold dark:text-white">
            {isEdit ? t({fr: 'Modifier le produit', ar: 'تعديل المنتج'}) : t({fr: 'Créer un produit', ar: 'إنشاء منتج'})}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isEdit && (
            <button 
              type="button"
              onClick={handleBroadcast}
              disabled={broadcasting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 text-sm shadow-sm active:scale-95"
            >
              {broadcasting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {broadcasting ? t({fr: 'Envoi...', ar: 'جاري الإرسال...'}) : t({fr: 'Annoncer aux abonnés', ar: 'إرسال للمشتركين'})}
            </button>
          )}
          <button 
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm shadow-sm active:scale-95"
          >
            <Save className="w-4 h-4" />
            {saving ? t({fr: 'Enregistrement...', ar: 'جاري الحفظ...'}) : t({fr: 'Enregistrer', ar: 'حفظ'})}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informations Générales */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-6 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">{t({fr: 'Informations Générales', ar: 'معلومات عامة'})}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'SKU (Référence)', ar: 'SKU (المرجع)'})}</label>
              <input 
                type="text" 
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white"
                placeholder={t({fr: 'Ex: NK-AIR-270', ar: 'مثال: NK-AIR-270'})}
              />
            </div>
            <div className="flex items-center mt-8">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isNewProduct"
                  checked={formData.isNewProduct}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className={`font-medium dark:text-gray-300 ${lng === 'ar' ? 'mr-2' : 'ml-2'}`}>{t({fr: 'Marquer comme "Nouveauté"', ar: 'تحديد كـ "جديد"'})}</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Nom (Français)', ar: 'الاسم (بالفرنسية)'})}</label>
              <input 
                type="text" 
                name="name.fr"
                value={formData.name.fr}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white"
              />
            </div>
            <div dir="rtl">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-right">{t({fr: 'Nom (Arabe)', ar: 'الاسم (بالعربية)'})}</label>
              <input 
                type="text" 
                name="name.ar"
                value={formData.name.ar}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Description (Français)', ar: 'الوصف (بالفرنسية)'})}</label>
              <textarea 
                name="description.fr"
                value={formData.description.fr}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white resize-none"
              ></textarea>
            </div>
            <div dir="rtl">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300 text-right">{t({fr: 'Description (Arabe)', ar: 'الوصف (بالعربية)'})}</label>
              <textarea 
                name="description.ar"
                value={formData.description.ar}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white resize-none text-right"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Catégorisation & Prix */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-6 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">{t({fr: 'Catégorisation & Prix', ar: 'التصنيف والسعر'})}</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Marque', ar: 'العلامة التجارية'})}</label>
              <Combobox 
                options={brands.map(b => b.name)}
                value={formData.brand}
                onChange={(val) => setFormData(prev => ({ ...prev, brand: val }))}
                placeholder={t({fr: 'Ex: Nike', ar: 'مثال: Nike'})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Catégorie', ar: 'الفئة'})}</label>
              <Combobox 
                options={categories.map(c => c.name?.fr || c.name)}
                value={formData.category}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                placeholder={t({fr: 'Ex: Sneakers', ar: 'مثال: Sneakers'})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Sexe', ar: 'الجنس'})}</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white"
              >
                <option value="men">{t({fr: 'Homme', ar: 'رجال'})}</option>
                <option value="women">{t({fr: 'Femme', ar: 'نساء'})}</option>
                <option value="kids">{t({fr: 'Enfant', ar: 'أطفال'})}</option>
                <option value="unisex">{t({fr: 'Unisexe', ar: 'للجنسين'})}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Prix de base (DZD)', ar: 'السعر الأساسي (DZD)'})}</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                required min="0"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">{t({fr: 'Prix remisé (DZD)', ar: 'سعر التخفيض (DZD)'})}</label>
              <input 
                type="number" 
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                min="0"
                placeholder={t({fr: '0 si pas de remise', ar: '0 إذا لم يكن هناك تخفيض'})}
                className={`w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border ${
                  Number(formData.discountPrice) > 0 && Number(formData.discountPrice) >= Number(formData.price)
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-gray-700 focus:ring-black dark:focus:ring-white'
                } rounded-lg outline-none focus:ring-2 dark:text-white`}
              />
              {Number(formData.discountPrice) > 0 && Number(formData.discountPrice) >= Number(formData.price) && (
                <p className="text-xs text-red-500 mt-1 font-medium">
                  {t({
                    fr: '⚠️ Le prix remisé doit être strictement inférieur au prix de base (ex: 5000 pour une base à 7000).',
                    ar: '⚠️ يجب أن يكون سعر التخفيض أقل من السعر الأساسي.'
                  })}
                </p>
              )}
              {Number(formData.discountPrice) > 0 && Number(formData.discountPrice) < Number(formData.price) && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                  {t({
                    fr: `✓ Remise de -${Math.round((1 - Number(formData.discountPrice) / Number(formData.price)) * 100)}% (Prix client : ${Number(formData.discountPrice).toLocaleString()} DA)`,
                    ar: `✓ تخفيض بنسبة -${Math.round((1 - Number(formData.discountPrice) / Number(formData.price)) * 100)}% (السعر للزبون: ${Number(formData.discountPrice).toLocaleString()} دج)`
                  })}
                </p>
              )}
            </div>
          </div>

          {/* Toggle Nouveauté */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <label htmlFor="isNewProduct" className="text-sm font-semibold text-gray-900 dark:text-white cursor-pointer flex items-center gap-2">
                <span>{t({ fr: 'Marquer comme Nouveauté', ar: 'تحديد كمنتج جديد' })}</span>
                <span className="bg-[#006233]/10 text-[#006233] dark:bg-[#F9A826]/20 dark:text-[#F9A826] text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {t({ fr: 'Page d’accueil', ar: 'الصفحة الرئيسية' })}
                </span>
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t({ 
                  fr: 'Ce produit apparaîtra dans le carrousel "Nouveautés" de la page d\'accueil.', 
                  ar: 'سيظهر هذا المنتج في قسم "وصل حديثاً" بالصفحة الرئيسية.' 
                })}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="isNewProduct"
                name="isNewProduct" 
                checked={Boolean(formData.isNewProduct)} 
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#006233]"></div>
            </label>
          </div>
        </div>

        {/* L'outil Matrice (Variantes) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2 mb-6">
            <div>
              <h2 className="text-lg font-bold dark:text-white">{t({fr: 'Matrice des Variantes', ar: 'مصفوفة المتغيرات'})}</h2>
              <p className="text-sm text-gray-500">{t({fr: 'Gérez les couleurs, tailles, stocks et images.', ar: 'إدارة الألوان، المقاسات، المخزون والصور.'})}</p>
            </div>
            <button 
              type="button" 
              onClick={addVariant}
              className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-4 h-4" /> {t({fr: 'Ajouter une variante', ar: 'إضافة متغير'})}
            </button>
          </div>

          <div className="space-y-6">
            {formData.variants.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                {t({fr: 'Aucune variante. Ajoutez une combinaison de couleur/taille.', ar: 'لا توجد متغيرات. أضف مجموعة من اللون/المقاس.'})}
              </div>
            ) : (
              formData.variants.map((variant, vIdx) => (
                <div key={vIdx} className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 relative group">
                  
                  <button 
                    type="button" 
                    onClick={() => removeVariant(vIdx)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 ${lng === 'ar' ? 'pl-8' : 'pr-8'}`}>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t({fr: 'Couleur', ar: 'اللون'})}</label>
                      <input 
                        type="text" 
                        value={variant.color}
                        onChange={(e) => handleVariantChange(vIdx, 'color', e.target.value)}
                        placeholder={t({fr: 'Ex: Noir', ar: 'مثال: أسود'})}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t({fr: 'Code Hex', ar: 'رمز اللون (Hex)'})}</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={variant.colorCode}
                          onChange={(e) => handleVariantChange(vIdx, 'colorCode', e.target.value)}
                          className="w-10 h-10 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer flex-shrink-0"
                        />
                        <input 
                          type="text" 
                          value={variant.colorCode}
                          onChange={(e) => handleVariantChange(vIdx, 'colorCode', e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:text-white text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t({fr: 'Taille', ar: 'المقاس'})}</label>
                      <input 
                        type="text" 
                        value={variant.size}
                        onChange={(e) => handleVariantChange(vIdx, 'size', e.target.value)}
                        placeholder={t({fr: 'Ex: 42', ar: 'مثال: 42'})}
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{t({fr: 'Stock', ar: 'المخزون'})}</label>
                      <input 
                        type="number" 
                        value={variant.stock}
                        onChange={(e) => handleVariantChange(vIdx, 'stock', Number(e.target.value))}
                        min="0"
                        required
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-black dark:text-white text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Variant Images */}
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium dark:text-white flex items-center gap-2"><ImageIcon className="w-4 h-4"/> {t({fr: 'Images de cette variante', ar: 'صور هذا المتغير'})}</h4>
                      <button 
                        type="button" 
                        onClick={() => addVariantImage(vIdx)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t({fr: '+ Ajouter URL', ar: '+ إضافة رابط URL'})}
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {variant.images.map((img, iIdx) => (
                        <div key={iIdx} className="flex gap-3 items-center">
                          {img && (
                            <img src={img} alt="" className="w-10 h-10 rounded object-cover border border-gray-200 bg-gray-50 flex-shrink-0" />
                          )}
                          <div className="flex-1 flex items-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-black">
                            <input 
                              type="url" 
                              value={img}
                              onChange={(e) => handleVariantImageChange(vIdx, iIdx, e.target.value)}
                              placeholder="https://..."
                              className="flex-1 px-3 py-2 text-sm bg-transparent outline-none dark:text-white text-left"
                              dir="ltr"
                            />
                            <label className={`cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 text-sm font-medium transition-colors ${lng === 'ar' ? 'border-r border-gray-300 dark:border-gray-600' : 'border-l border-gray-300 dark:border-gray-600'}`}>
                              {t({fr: 'Parcourir...', ar: 'تصفح...'})}
                              <input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      handleVariantImageChange(vIdx, iIdx, reader.result);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          </div>
                          {variant.images.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => removeVariantImage(vIdx, iIdx)}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </form>
    </div>
  );
};

export default AdminProductEditPage;
