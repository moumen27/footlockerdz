import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { Save, AlertTriangle, Truck, Phone, Settings as SettingsIcon, Flame, Clock, Sparkles, Send, Users } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { newsletterApi } from '../../api/newsletterApi';

const WILAYAS = [
  { code: '01', name: 'Adrar' }, { code: '02', name: 'Chlef' }, { code: '03', name: 'Laghouat' },
  { code: '04', name: 'Oum El Bouaghi' }, { code: '05', name: 'Batna' }, { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' }, { code: '08', name: 'Béchar' }, { code: '09', name: 'Blida' },
  { code: '10', name: 'Bouira' }, { code: '11', name: 'Tamanrasset' }, { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' }, { code: '14', name: 'Tiaret' }, { code: '15', name: 'Tizi Ouzou' },
  { code: '16', name: 'Alger' }, { code: '17', name: 'Djelfa' }, { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' }, { code: '20', name: 'Saïda' }, { code: '21', name: 'Skikda' },
  { code: '22', name: 'Sidi Bel Abbès' }, { code: '23', name: 'Annaba' }, { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' }, { code: '26', name: 'Médéa' }, { code: '27', name: 'Mostaganem' },
  { code: '28', name: 'M\'Sila' }, { code: '29', name: 'Mascara' }, { code: '30', name: 'Ouargla' },
  { code: '31', name: 'Oran' }, { code: '32', name: 'El Bayadh' }, { code: '33', name: 'Illizi' },
  { code: '34', name: 'Bordj Bou Arreridj' }, { code: '35', name: 'Boumerdès' }, { code: '36', name: 'El Tarf' },
  { code: '37', name: 'Tindouf' }, { code: '38', name: 'Tissemsilt' }, { code: '39', name: 'El Oued' },
  { code: '40', name: 'Khenchela' }, { code: '41', name: 'Souk Ahras' }, { code: '42', name: 'Tipaza' },
  { code: '43', name: 'Mila' }, { code: '44', name: 'Aïn Defla' }, { code: '45', name: 'Naâma' },
  { code: '46', name: 'Aïn Témouchent' }, { code: '47', name: 'Ghardaïa' }, { code: '48', name: 'Relizane' },
  { code: '49', name: 'Timimoun' }, { code: '50', name: 'Bordj Badji Mokhtar' }, { code: '51', name: 'Ouled Djellal' },
  { code: '52', name: 'Béni Abbès' }, { code: '53', name: 'In Salah' }, { code: '54', name: 'In Guezzam' },
  { code: '55', name: 'Touggourt' }, { code: '56', name: 'Djanet' }, { code: '57', name: 'El M\'Ghair' },
  { code: '58', name: 'El Meniaa' }
];

// Helper to format date for datetime-local in local time (Algeria UTC+1) without UTC shift
const formatLocalDate = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AdminSettingsPage = () => {
  const { t, lng } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);
  
  const [formData, setFormData] = useState({
    whatsappNumber: '',
    phones: [''],
    socials: { facebook: '', instagram: '', tiktok: '' },
    maintenanceFlag: false,
    shippingRates: [],
    freeShippingThreshold: 15000,
    flashSale: {
      active: true,
      title: { fr: 'VENTE FLASH', ar: 'تخفيضات فلاش' },
      subtitle: { fr: "Jusqu'à -50% sur une sélection de produits.", ar: 'خصم يصل إلى 50٪ على مجموعة مختارة.' },
      endDate: '',
      discountPercentage: 50,
      targetType: 'all',
      targetValue: '',
      discountBadge: '-50%'
    }
  });

  useEffect(() => {
    const fetchSettings = async () => {
      if (user?.role !== 'super_admin') return;
      try {
        const [settingsRes, catRes, brandRes] = await Promise.all([
          axiosInstance.get('/settings'),
          axiosInstance.get('/categories').catch(() => ({ data: [] })),
          axiosInstance.get('/brands').catch(() => ({ data: [] }))
        ]);

        const data = settingsRes.data;
        setAvailableCategories(catRes.data || []);
        setAvailableBrands(brandRes.data || []);
        
        // Merge with our WILAYAS list to ensure all 58 are present in the form
        const populatedRates = WILAYAS.map(w => {
          const existing = data.shippingRates?.find(r => r.wilayaCode === w.code);
          return existing ? { ...existing, name: w.name } : { wilayaCode: w.code, name: w.name, homePrice: 600, deskPrice: 400 };
        });

        const defaultEnd = formatLocalDate(Date.now() + 2 * 24 * 60 * 60 * 1000);
        const fs = data.flashSale || {};

        setFormData({
          whatsappNumber: data.whatsappNumber || '',
          phones: data.phones?.length ? data.phones : [''],
          socials: data.socials || { facebook: '', instagram: '', tiktok: '' },
          maintenanceFlag: data.maintenanceFlag || false,
          shippingRates: populatedRates,
          freeShippingThreshold: data.freeShippingThreshold !== undefined ? data.freeShippingThreshold : 15000,
          flashSale: {
            active: fs.active !== undefined ? fs.active : true,
            title: {
              fr: fs.title?.fr || 'VENTE FLASH',
              ar: fs.title?.ar || 'تخفيضات فلاش'
            },
            subtitle: {
              fr: fs.subtitle?.fr || "Jusqu'à -50% sur une sélection de produits.",
              ar: fs.subtitle?.ar || 'خصم يصل إلى 50٪ على مجموعة مختارة.'
            },
            endDate: fs.endDate ? formatLocalDate(fs.endDate) : defaultEnd,
            discountPercentage: fs.discountPercentage !== undefined ? fs.discountPercentage : 50,
            targetType: fs.targetType || 'all',
            targetValue: fs.targetValue || '',
            discountBadge: fs.discountBadge || `-${fs.discountPercentage || 50}%`
          }
        });
      } catch (error) {
        toast.error(t({fr: 'Erreur lors du chargement des paramètres', ar: 'خطأ أثناء تحميل الإعدادات'}));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [user]);

  const [subscribersCount, setSubscribersCount] = useState(0);
  const [broadcastingFlash, setBroadcastingFlash] = useState(false);

  useEffect(() => {
    if (activeTab === 'flashSale') {
      newsletterApi.getStats()
        .then(res => setSubscribersCount(res?.count || 0))
        .catch(() => {});
    }
  }, [activeTab]);

  const handleBroadcastFlashSale = async () => {
    if (!formData.flashSale?.active) {
      toast.warning(t({
        fr: 'Veuillez activer et enregistrer la Vente Flash avant de la diffuser.',
        ar: 'يرجى تفعيل وحفظ تخفيضات فلاش أولاً قبل نشرها.'
      }));
      return;
    }

    if (subscribersCount === 0) {
      toast.info(t({
        fr: 'Aucun abonné inscrit pour le moment.',
        ar: 'لا يوجد مشتركون حالياً.'
      }));
      return;
    }

    const confirmed = window.confirm(t({
      fr: `Voulez-vous envoyer un email d'annonce de la Vente Flash à ${subscribersCount} abonné(s) ?`,
      ar: `هل تريد إرسال إعلان تخفيضات فلاش إلى ${subscribersCount} مشترك(ين) عبر البريد؟`
    }));

    if (!confirmed) return;

    setBroadcastingFlash(true);
    try {
      const res = await newsletterApi.broadcastFlashSale();
      toast.success(res.message || t({
        fr: 'Vente Flash diffusée avec succès par email !',
        ar: 'تم إرسال إعلان تخفيضات فلاش بنجاح!'
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || t({
        fr: 'Erreur lors de la diffusion par email.',
        ar: 'حدث خطأ أثناء الإرسال بالبريد.'
      }));
    } finally {
      setBroadcastingFlash(false);
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center mt-10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t({fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)'})}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {t({fr: 'Cette section est strictement réservée au rôle "Super Admin".', ar: 'هذا القسم مخصص حصريًا لدور "المشرف المتميز".'})}
        </p>
      </div>
    );
  }

  const handleShippingChange = (code, field, value) => {
    setFormData(prev => ({
      ...prev,
      shippingRates: prev.shippingRates.map(rate => 
        rate.wilayaCode === code ? { ...rate, [field]: Number(value) } : rate
      )
    }));
  };

  const handlePhoneChange = (index, value) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData({ ...formData, phones: newPhones });
  };

  const addPhoneField = () => {
    setFormData({ ...formData, phones: [...formData.phones, ''] });
  };

  const removePhoneField = (index) => {
    const newPhones = formData.phones.filter((_, i) => i !== index);
    setFormData({ ...formData, phones: newPhones });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Clean up before sending
      const payload = {
        ...formData,
        phones: formData.phones.filter(p => p.trim() !== ''),
        shippingRates: formData.shippingRates.map(({ wilayaCode, homePrice, deskPrice }) => ({
          wilayaCode, homePrice, deskPrice
        })),
        freeShippingThreshold: formData.freeShippingThreshold,
        flashSale: {
          ...formData.flashSale,
          endDate: formData.flashSale.endDate ? new Date(formData.flashSale.endDate) : new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        }
      };

      await axiosInstance.put('/settings', payload);
      toast.success(t({fr: 'Paramètres sauvegardés avec succès !', ar: 'تم حفظ الإعدادات بنجاح !'}));
    } catch (error) {
      toast.error(t({fr: 'Erreur lors de la sauvegarde', ar: 'خطأ أثناء الحفظ'}));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div></div>;
  }

  return (
    <div className="max-w-5xl mx-auto pb-10" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Paramètres Généraux', ar: 'الإعدادات العامة'})}</h1>
          <p className="text-sm text-gray-500">{t({fr: 'Configuration globale de la boutique Footlocker DZ', ar: 'الإعدادات العامة لمتجر Footlocker DZ'})}</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-lg font-bold flex items-center hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Save className={`w-5 h-5 ${lng === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {saving ? t({fr: 'Sauvegarde...', ar: 'جاري الحفظ...'}) : t({fr: 'Sauvegarder', ar: 'حفظ'})}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Tabs Sidebar */}
        <div className={`w-full md:w-64 border-b md:border-b-0 ${lng === 'ar' ? 'md:border-l' : 'md:border-r'} border-gray-100 dark:border-gray-700 p-4 space-y-2`}>
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'general' ? 'bg-gray-100 text-black dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
          >
            <SettingsIcon className={`w-5 h-5 ${lng === 'ar' ? 'ml-3' : 'mr-3'}`} />
            {t({fr: 'Général & Contacts', ar: 'عام وجهات الاتصال'})}
          </button>
          <button 
            onClick={() => setActiveTab('shipping')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'shipping' ? 'bg-gray-100 text-black dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
          >
            <Truck className={`w-5 h-5 ${lng === 'ar' ? 'ml-3' : 'mr-3'}`} />
            {t({fr: 'Frais de Livraison', ar: 'رسوم التوصيل'})}
          </button>
          <button 
            onClick={() => setActiveTab('flashSale')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'flashSale' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-semibold' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/50'}`}
          >
            <Flame className={`w-5 h-5 ${lng === 'ar' ? 'ml-3' : 'mr-3'} text-red-500`} />
            {t({fr: 'Vente Flash', ar: 'تخفيضات فلاش'})}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[800px]">
          
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fadeIn">
              
              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">{t({fr: 'Mode Maintenance', ar: 'وضع الصيانة'})}</h3>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="maintenanceFlag"
                    checked={formData.maintenanceFlag}
                    onChange={e => setFormData({...formData, maintenanceFlag: e.target.checked})}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-600 cursor-pointer"
                  />
                  <label htmlFor="maintenanceFlag" className={`block text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer ${lng === 'ar' ? 'mr-3' : 'ml-3'}`}>
                    {t({fr: 'Activer le mode maintenance (Seuls les admins pourront accéder au site)', ar: 'تفعيل وضع الصيانة (المسؤولون فقط يمكنهم الوصول إلى الموقع)'})}
                  </label>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">{t({fr: 'Coordonnées', ar: 'معلومات الاتصال'})}</h3>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Numéro WhatsApp', ar: 'رقم واتساب'})}</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${lng === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="text" 
                        value={formData.whatsappNumber}
                        onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
                        className={`w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 focus:border-black focus:ring-black text-left ${lng === 'ar' ? 'pr-10' : 'pl-10'}`}
                        dir="ltr"
                        placeholder="+213 555 000 000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Autres numéros de téléphone', ar: 'أرقام هواتف أخرى'})}</label>
                    {formData.phones.map((phone, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input 
                          type="text" 
                          value={phone}
                          onChange={e => handlePhoneChange(index, e.target.value)}
                          className="flex-1 rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 focus:border-black focus:ring-black text-left"
                          dir="ltr"
                          placeholder="0555 00 00 00"
                        />
                        {formData.phones.length > 1 && (
                          <button type="button" onClick={() => removePhoneField(index)} className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            {t({fr: 'Supprimer', ar: 'حذف'})}
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addPhoneField} className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                      {t({fr: '+ Ajouter un numéro', ar: '+ إضافة رقم'})}
                    </button>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4">{t({fr: 'Réseaux Sociaux', ar: 'وسائل التواصل الاجتماعي'})}</h3>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Lien Facebook', ar: 'رابط فيسبوك'})}</label>
                    <input 
                      type="url" 
                      value={formData.socials.facebook}
                      onChange={e => setFormData({...formData, socials: {...formData.socials, facebook: e.target.value}})}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 focus:border-black focus:ring-black text-left"
                      dir="ltr"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Lien Instagram', ar: 'رابط إنستغرام'})}</label>
                    <input 
                      type="url" 
                      value={formData.socials.instagram}
                      onChange={e => setFormData({...formData, socials: {...formData.socials, instagram: e.target.value}})}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 focus:border-black focus:ring-black text-left"
                      dir="ltr"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Lien TikTok', ar: 'رابط تيك توك'})}</label>
                    <input 
                      type="url" 
                      value={formData.socials.tiktok}
                      onChange={e => setFormData({...formData, socials: {...formData.socials, tiktok: e.target.value}})}
                      className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 focus:border-black focus:ring-black text-left"
                      dir="ltr"
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="animate-fadeIn">
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t({fr: 'Tarifs par Wilaya (DZD)', ar: 'الأسعار حسب الولاية (د.ج)'})}</h3>
                  <p className="text-sm text-gray-500">{t({fr: 'Configurez les frais de livraison à domicile et en point relais pour chaque wilaya.', ar: 'قم بتكوين رسوم التوصيل إلى المنزل ونقاط التوصيل لكل ولاية.'})}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Seuil Livraison Gratuite (DZD)', ar: 'حد التوصيل المجاني (د.ج)'})}</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.freeShippingThreshold}
                    onChange={e => setFormData({...formData, freeShippingThreshold: Number(e.target.value)})}
                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-3 py-1.5 focus:border-black focus:ring-black text-left"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">{t({fr: 'S\'affiche dans la barre du haut', ar: 'يظهر في الشريط العلوي'})}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className={`text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300 ${lng === 'ar' ? 'text-right' : 'text-left'}`}>
                    <tr>
                      <th className="px-4 py-3 w-16 text-center">{t({fr: 'N°', ar: 'رقم'})}</th>
                      <th className="px-4 py-3">{t({fr: 'Wilaya', ar: 'الولاية'})}</th>
                      <th className="px-4 py-3 w-40 text-center">{t({fr: 'Livraison Domicile', ar: 'توصيل للمنزل'})}</th>
                      <th className="px-4 py-3 w-40 text-center">{t({fr: 'Livraison Relais (Desk)', ar: 'توصيل لنقطة الاستلام'})}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.shippingRates.map((rate, idx) => (
                      <tr key={rate.wilayaCode} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-4 py-2 text-center font-bold text-gray-500 dark:text-gray-400">
                          {rate.wilayaCode}
                        </td>
                        <td className={`px-4 py-2 font-medium text-gray-900 dark:text-white ${lng === 'ar' ? 'text-right' : 'text-left'}`}>
                          {rate.name}
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number"
                            min="0"
                            value={rate.homePrice}
                            onChange={(e) => handleShippingChange(rate.wilayaCode, 'homePrice', e.target.value)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center py-1.5 focus:border-black focus:ring-black"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input 
                            type="number"
                            min="0"
                            value={rate.deskPrice}
                            onChange={(e) => handleShippingChange(rate.wilayaCode, 'deskPrice', e.target.value)}
                            className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-center py-1.5 focus:border-black focus:ring-black"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'flashSale' && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  <Flame className="w-6 h-6 text-red-500" />
                  {t({fr: 'Configuration de la Vente Flash', ar: 'إعدادات تخفيضات فلاش'})}
                </h3>
                <p className="text-sm text-gray-500">
                  {t({
                    fr: 'Activez ou désactivez le bandeau de compte à rebours affiché sur la page des soldes et personnalisez la date limite.',
                    ar: 'قم بتفعيل أو إلغاء تفعيل شريط العد التنازلي على صفحة التخفيضات وتحديد موعد النهاية.'
                  })}
                </p>
              </div>

              {/* Activation Switch */}
              <div className="bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-0.5">
                    {t({fr: 'Activer la Vente Flash', ar: 'تفعيل تخفيضات فلاش'})}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t({
                      fr: 'Si activé, le bandeau rouge et le compte à rebours s\'afficheront sur la page des soldes.',
                      ar: 'إذا تم التفعيل، فسيظهر الشريط الأحمر والعد التنازلي في صفحة التخفيضات.'
                    })}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.flashSale?.active ?? true}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      flashSale: { ...prev.flashSale, active: e.target.checked }
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              {/* Discount Percentage & Targeting */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" />
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {t({fr: 'Remise et Cible de la Vente Flash', ar: 'نسبة التخفيض والمنتجات المستهدفة'})}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Pourcentage de réduction (%)', ar: 'نسبة التخفيض (%)'})}
                    </label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="1"
                        max="95"
                        value={formData.flashSale?.discountPercentage || 50}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(95, Number(e.target.value) || 0));
                          setFormData(prev => ({
                            ...prev,
                            flashSale: { 
                              ...prev.flashSale, 
                              discountPercentage: val,
                              discountBadge: `-${val}%`
                            }
                          }));
                        }}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                    </div>
                  </div>

                  {/* Target Scope */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Appliquer la remise sur', ar: 'تطبيق التخفيض على'})}
                    </label>
                    <select
                      value={formData.flashSale?.targetType || 'all'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: { 
                          ...prev.flashSale, 
                          targetType: e.target.value,
                          targetValue: e.target.value === 'all' ? '' : (prev.flashSale.targetValue || '')
                        }
                      }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="all">{t({fr: 'Toute la boutique (Tous les produits)', ar: 'كامل المتجر (جميع المنتجات)'})}</option>
                      <option value="category">{t({fr: 'Par Sport / Catégorie (ex: Football)', ar: 'حسب الفئة / الرياضة (مثل كرة القدم)'})}</option>
                      <option value="brand">{t({fr: 'Par Marque (ex: Nike, Adidas)', ar: 'حسب الماركة (مثل Nike أو Adidas)'})}</option>
                    </select>
                  </div>
                </div>

                {/* Specific Category Selection */}
                {formData.flashSale?.targetType === 'category' && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Sélectionnez la catégorie cible', ar: 'اختر الفئة المستهدفة'})}
                    </label>
                    <select
                      value={formData.flashSale?.targetValue || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: { ...prev.flashSale, targetValue: e.target.value }
                      }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="">{t({fr: '-- Choisissez une catégorie --', ar: '-- اختر فئة --'})}</option>
                      {availableCategories.map(cat => (
                        <option key={cat._id || cat.slug} value={cat.slug || cat._id}>
                          {cat.name?.fr || cat.name || cat.slug}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Specific Brand Selection */}
                {formData.flashSale?.targetType === 'brand' && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 animate-fadeIn">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Sélectionnez la marque cible', ar: 'اختر الماركة المستهدفة'})}
                    </label>
                    <select
                      value={formData.flashSale?.targetValue || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: { ...prev.flashSale, targetValue: e.target.value }
                      }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-900/50 bg-red-50/30 dark:bg-red-950/20 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    >
                      <option value="">{t({fr: '-- Choisissez une marque --', ar: '-- اختر ماركة --'})}</option>
                      {availableBrands.map(b => (
                        <option key={b._id || b.slug} value={b.slug || b.name}>
                          {b.name || b.slug}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Explanatory Smart Rule Banner */}
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-lg p-3.5 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                  <div className="font-bold text-base leading-none">💡</div>
                  <div>
                    <span className="font-bold">
                      {t({fr: 'Règle intelligente des remises : ', ar: 'قاعدة ذكية للخصومات: '})}
                    </span>
                    {t({
                      fr: `Les produits ciblés recevront automatiquement -${formData.flashSale?.discountPercentage || 50}%. Si un produit possède déjà une réduction égale ou supérieure (ex: déjà -50% ou -60%), sa meilleure réduction est conservée. Dès la fin de la vente flash, les prix reprennent automatiquement leurs valeurs normales.`,
                      ar: `المنتجات المستهدفة ستحصل تلقائياً على خصم -${formData.flashSale?.discountPercentage || 50}%. وإذا كان المنتج مخفضاً مسبقاً بنسبة مساوية أو أكبر، فسيحتفظ بأفضل خصم له. بمجرد انتهاء العرض، تعود الأسعار تلقائياً إلى طبيعتها.`
                    })}
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h4 className="font-bold text-gray-900 dark:text-white">
                    {t({fr: 'Date et Heure de Fin du Compte à Rebours', ar: 'تاريخ ووقت انتهاء العد التنازلي'})}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      {t({fr: 'Fin de la promotion', ar: 'نهاية العرض'})}
                    </label>
                    <input 
                      type="datetime-local"
                      value={formData.flashSale?.endDate || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: { ...prev.flashSale, endDate: e.target.value }
                      }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  {/* Quick duration presets */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                      {t({fr: 'Raccourcis rapides', ar: 'اختصارات سريعة'})}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: '+24h', hours: 24 },
                        { label: '+48h', hours: 48 },
                        { label: '+3 jours', hours: 72 },
                        { label: '+1 semaine', hours: 168 }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            const newDate = formatLocalDate(Date.now() + preset.hours * 60 * 60 * 1000);
                            setFormData(prev => ({
                              ...prev,
                              flashSale: { ...prev.flashSale, endDate: newDate }
                            }));
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Titles & Texts */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  {t({fr: 'Textes et Titres du Bandeau', ar: 'نصوص وعناوين الشريط'})}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Titre (Français)', ar: 'العنوان (بالفرنسية)'})}
                    </label>
                    <input 
                      type="text"
                      value={formData.flashSale?.title?.fr || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: {
                          ...prev.flashSale,
                          title: { ...prev.flashSale?.title, fr: e.target.value }
                        }
                      }))}
                      placeholder="VENTE FLASH"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Titre (Arabe)', ar: 'العنوان (بالعربية)'})}
                    </label>
                    <input 
                      type="text"
                      dir="rtl"
                      value={formData.flashSale?.title?.ar || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: {
                          ...prev.flashSale,
                          title: { ...prev.flashSale?.title, ar: e.target.value }
                        }
                      }))}
                      placeholder="تخفيضات فلاش"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Sous-titre / Description (Français)', ar: 'الوصف (بالفرنسية)'})}
                    </label>
                    <input 
                      type="text"
                      value={formData.flashSale?.subtitle?.fr || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: {
                          ...prev.flashSale,
                          subtitle: { ...prev.flashSale?.subtitle, fr: e.target.value }
                        }
                      }))}
                      placeholder="Jusqu'à -50% sur une sélection de produits."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t({fr: 'Sous-titre / Description (Arabe)', ar: 'الوصف (بالعربية)'})}
                    </label>
                    <input 
                      type="text"
                      dir="rtl"
                      value={formData.flashSale?.subtitle?.ar || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        flashSale: {
                          ...prev.flashSale,
                          subtitle: { ...prev.flashSale?.subtitle, ar: e.target.value }
                        }
                      }))}
                      placeholder="خصم يصل إلى 50٪ على مجموعة مختارة."
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                    {t({fr: 'Aperçu en temps réel du bandeau client', ar: 'معاينة حية لشريط العميل'})}
                  </span>
                  {formData.flashSale?.active ? (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                      {t({fr: 'Actif sur la boutique', ar: 'نشط في المتجر'})}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full">
                      {t({fr: 'Désactivé (masqué)', ar: 'معطل (مخفي)'})}
                    </span>
                  )}
                </div>

                {formData.flashSale?.active ? (
                  <div className="bg-red-600 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-lg shadow-red-600/20">
                    <div>
                      <h2 className="font-bold text-lg mb-1">
                        {lng === 'ar' ? (formData.flashSale?.title?.ar || 'تخفيضات فلاش') : (formData.flashSale?.title?.fr || 'VENTE FLASH')}
                      </h2>
                      <p className="text-red-100 text-sm">
                        {lng === 'ar' ? (formData.flashSale?.subtitle?.ar || 'خصم يصل إلى 50٪ على مجموعة مختارة.') : (formData.flashSale?.subtitle?.fr || "Jusqu'à -50% sur une sélection de produits.")}
                      </p>
                    </div>
                    <div className="flex gap-4 mt-4 sm:mt-0 bg-red-700/50 p-2 px-4 rounded-lg">
                      <div className="text-center">
                        <span className="block text-2xl font-black">--</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">{t({fr: 'Jours', ar: 'أيام'})}</span>
                      </div>
                      <span className="text-2xl font-black opacity-50">:</span>
                      <div className="text-center">
                        <span className="block text-2xl font-black">--</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">{t({fr: 'Hrs', ar: 'ساعة'})}</span>
                      </div>
                      <span className="text-2xl font-black opacity-50">:</span>
                      <div className="text-center">
                        <span className="block text-2xl font-black">--</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider">{t({fr: 'Min', ar: 'دقيقة'})}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 text-sm">
                    {t({fr: 'Le bandeau est actuellement désactivé et n\'apparaîtra pas aux clients.', ar: 'الشريط معطل حالياً ولن يظهر للعملاء.'})}
                  </div>
                )}
              </div>

              {/* Broadcast Flash Sale to Subscribers */}
              <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-transparent border border-red-200 dark:border-red-900/50 rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Send className="w-5 h-5 text-red-600" />
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {t({ fr: 'Diffuser la Vente Flash aux abonnés', ar: 'إرسال تخفيضات فلاش للمشتركين' })}
                      </h4>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                        <Users className="w-3.5 h-3.5" />
                        {subscribersCount} {t({ fr: 'abonnés', ar: 'مشترك' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t({
                        fr: 'Envoyez un email percutant à tous vos abonnés pour leur annoncer le lancement de cette Vente Flash avec sa réduction et son lien direct.',
                        ar: 'أرسل بريداً إلكترونياً لجميع المشتركين للإعلان عن بدء تخفيضات فلاش مع نسبة الخصم ورابط الدخول المباشر.'
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleBroadcastFlashSale}
                    disabled={broadcastingFlash || !formData.flashSale?.active}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-md shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    <Send className={`w-4 h-4 ${broadcastingFlash ? 'animate-spin' : ''}`} />
                    <span>
                      {broadcastingFlash 
                        ? t({ fr: 'Envoi en cours...', ar: 'جاري الإرسال...' }) 
                        : t({ fr: 'Diffuser par Email', ar: 'إرسال عبر البريد' })}
                    </span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
