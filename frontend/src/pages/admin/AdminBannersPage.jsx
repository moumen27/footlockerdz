import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const BannerCard = ({ banner, onToggleStatus, onEdit, onDelete }) => {
  const { t, lng } = useLanguage();
  const [showDark, setShowDark] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-all">
      <div className="relative aspect-[21/9] bg-gray-100 dark:bg-gray-900 group">
        
        {/* Toggle Button */}
        <button 
          onClick={() => setShowDark(!showDark)}
          className={`absolute top-2 ${lng === 'ar' ? 'right-2' : 'left-2'} z-20 bg-white/90 dark:bg-black/90 text-black dark:text-white text-[10px] font-bold px-3 py-1 rounded shadow-sm hover:scale-105 transition-transform flex items-center gap-1`}
        >
          {showDark ? '🌙 DARK MODE' : '☀️ LIGHT MODE'}
          <span className={`text-[8px] opacity-70 ${lng === 'ar' ? 'mr-1' : 'ml-1'}`}>{t({fr: '(cliquer pour changer)', ar: '(انقر للتغيير)'})}</span>
        </button>

        {/* Status Badge */}
        <div className={`absolute top-2 ${lng === 'ar' ? 'left-2' : 'right-2'} z-20`}>
          <span className={`px-2 py-1 text-xs font-bold rounded shadow-sm ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {banner.isActive ? t({fr: 'Active', ar: 'نشط'}) : t({fr: 'Inactive', ar: 'غير نشط'})}
          </span>
        </div>

        {/* Images with transition */}
        <img 
          src={showDark ? banner.imageDark : banner.imageLight} 
          alt={banner.title} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1">{banner.title?.[lng] || banner.title?.fr || banner.title}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-1">
          CTA: {banner.cta?.text?.[lng] || banner.cta?.text?.fr || banner.cta?.text || t({fr: 'Aucun', ar: 'لا يوجد'})} <br/>
          {t({fr: 'Lien: ', ar: 'الرابط: '})} {banner.cta?.link || '#'}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => onToggleStatus(banner)}
            className={`text-sm font-medium ${banner.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}`}
          >
            {banner.isActive ? t({fr: 'Désactiver', ar: 'تعطيل'}) : t({fr: 'Activer', ar: 'تفعيل'})}
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(banner)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(banner._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminBannersPage = () => {
  const { t, lng } = useLanguage();
  const { user } = useAuth();
  
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: { fr: '', ar: '' },
    imageLight: '',
    imageDark: '',
    cta: { text: { fr: '', ar: '' }, link: '' },
    schedule: { startDate: '', endDate: '' },
    isActive: true
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/banners/all');
      setBanners(data);
    } catch (error) {
      toast.error(t({fr: 'Erreur lors du chargement des bannières', ar: 'خطأ أثناء تحميل اللافتات'}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchBanners();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center mt-10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t({fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)'})}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {t({fr: 'Cette section est réservée aux administrateurs.', ar: 'هذا القسم مخصص للمسؤولين.'})}
        </p>
      </div>
    );
  }

  const toLocalDatetime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: {
          fr: banner.title?.fr || banner.title || '',
          ar: banner.title?.ar || banner.title || ''
        },
        imageLight: banner.imageLight,
        imageDark: banner.imageDark,
        cta: { 
          text: {
            fr: banner.cta?.text?.fr || banner.cta?.text || '',
            ar: banner.cta?.text?.ar || banner.cta?.text || ''
          }, 
          link: banner.cta?.link || '' 
        },
        schedule: { 
          startDate: toLocalDatetime(banner.schedule?.startDate),
          endDate: toLocalDatetime(banner.schedule?.endDate)
        },
        isActive: banner.isActive
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: { fr: '', ar: '' },
        imageLight: '',
        imageDark: '',
        cta: { text: { fr: '', ar: '' }, link: '' },
        schedule: { startDate: '', endDate: '' },
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const [isUploadingLight, setIsUploadingLight] = useState(false);
  const [isUploadingDark, setIsUploadingDark] = useState(false);

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (field === 'imageLight') setIsUploadingLight(true);
    if (field === 'imageDark') setIsUploadingDark(true);
    
    const form = new FormData();
    form.append('image', file);

    try {
      const { data } = await axiosInstance.post('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, [field]: data.url }));
      toast.success(t({fr: 'Image téléchargée avec succès', ar: 'تم تحميل الصورة بنجاح'}));
    } catch (error) {
      toast.error(t({fr: 'Erreur lors du téléchargement de l\'image', ar: 'خطأ أثناء تحميل الصورة'}));
    } finally {
      if (field === 'imageLight') setIsUploadingLight(false);
      if (field === 'imageDark') setIsUploadingDark(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        schedule: {
          startDate: formData.schedule.startDate ? new Date(formData.schedule.startDate).toISOString() : null,
          endDate: formData.schedule.endDate ? new Date(formData.schedule.endDate).toISOString() : null
        }
      };

      if (editingBanner) {
        await axiosInstance.put(`/banners/${editingBanner._id}`, payload);
        toast.success(t({fr: 'Bannière mise à jour', ar: 'تم تحديث اللافتة'}));
      } else {
        await axiosInstance.post('/banners', payload);
        toast.success(t({fr: 'Bannière créée', ar: 'تم إنشاء اللافتة'}));
      }
      fetchBanners();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.message || t({fr: 'Erreur lors de la sauvegarde', ar: 'خطأ أثناء الحفظ'}));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t({fr: 'Êtes-vous sûr de vouloir supprimer cette bannière ?', ar: 'هل أنت متأكد أنك تريد حذف هذه اللافتة؟'}))) {
      try {
        await axiosInstance.delete(`/banners/${id}`);
        toast.success(t({fr: 'Bannière supprimée', ar: 'تم حذف اللافتة'}));
        fetchBanners();
      } catch (error) {
        toast.error(t({fr: 'Erreur lors de la suppression', ar: 'خطأ أثناء الحذف'}));
      }
    }
  };

  const toggleStatus = async (banner) => {
    try {
      await axiosInstance.put(`/banners/${banner._id}`, { isActive: !banner.isActive });
      toast.success(t({fr: `Bannière ${!banner.isActive ? 'activée' : 'désactivée'}`, ar: `تم ${!banner.isActive ? 'تفعيل' : 'تعطيل'} اللافتة`}));
      fetchBanners();
    } catch (error) {
      toast.error(t({fr: 'Erreur lors de la mise à jour', ar: 'خطأ أثناء التحديث'}));
    }
  };

  return (
    <div dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Gestion des Bannières', ar: 'إدارة اللافتات'})}</h1>
          <p className="text-sm text-gray-500">{t({fr: 'Gérez les visuels promotionnels de la page d\'accueil', ar: 'إدارة الصور الترويجية للصفحة الرئيسية'})}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium flex items-center hover:opacity-90 transition-opacity"
        >
          <Plus className={`w-5 h-5 ${lng === 'ar' ? 'ml-2' : 'mr-2'}`} />
          {t({fr: 'Ajouter une Bannière', ar: 'إضافة لافتة'})}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">{t({fr: 'Aucune bannière', ar: 'لا توجد لافتات'})}</h3>
          <p className="text-gray-500">{t({fr: 'Commencez par ajouter votre première bannière promotionnelle.', ar: 'ابدأ بإضافة أول لافتة ترويجية لك.'})}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <BannerCard 
              key={banner._id}
              banner={banner}
              onToggleStatus={toggleStatus}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">
                {editingBanner ? t({fr: 'Modifier la bannière', ar: 'تعديل اللافتة'}) : t({fr: 'Nouvelle bannière', ar: 'لافتة جديدة'})}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Titre (Français)', ar: 'العنوان (بالفرنسية)'})}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title.fr}
                    onChange={e => setFormData({...formData, title: {...formData.title, fr: e.target.value}})}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-left"
                    dir="ltr"
                    placeholder="Ex: Solde d'hiver 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Titre (Arabe)', ar: 'العنوان (بالعربية)'})}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title.ar}
                    onChange={e => setFormData({...formData, title: {...formData.title, ar: e.target.value}})}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-right"
                    dir="rtl"
                    placeholder="مثال: تخفيضات الشتاء 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Image (Thème Clair)', ar: 'صورة (السمة الفاتحة)'})}</label>
                  <div className="flex flex-col gap-2">
                    {formData.imageLight && (
                      <div className="relative aspect-[21/9] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img src={formData.imageLight} alt="Preview Light" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isUploadingLight ? t({fr: 'Téléchargement...', ar: 'جاري التحميل...'}) : t({fr: 'Choisir une image...', ar: 'اختيار صورة...'})}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        disabled={isUploadingLight}
                        onChange={(e) => handleFileUpload(e, 'imageLight')}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Image (Thème Sombre)', ar: 'صورة (السمة الداكنة)'})}</label>
                  <div className="flex flex-col gap-2">
                    {formData.imageDark && (
                      <div className="relative aspect-[21/9] bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                        <img src={formData.imageDark} alt="Preview Dark" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <label className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isUploadingDark ? t({fr: 'Téléchargement...', ar: 'جاري التحميل...'}) : t({fr: 'Choisir une image...', ar: 'اختيار صورة...'})}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        disabled={isUploadingDark}
                        onChange={(e) => handleFileUpload(e, 'imageDark')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Texte CTA (Français)', ar: 'نص الزر (بالفرنسية)'})}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.cta.text.fr}
                    onChange={e => setFormData({...formData, cta: {...formData.cta, text: {...formData.cta.text, fr: e.target.value}}})}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-left"
                    dir="ltr"
                    placeholder="Acheter maintenant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Texte CTA (Arabe)', ar: 'نص الزر (بالعربية)'})}</label>
                  <input 
                    type="text" 
                    required
                    value={formData.cta.text.ar}
                    onChange={e => setFormData({...formData, cta: {...formData.cta, text: {...formData.cta.text, ar: e.target.value}}})}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-right"
                    dir="rtl"
                    placeholder="اشتري الآن"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Lien de redirection', ar: 'رابط التوجيه'})}</label>
                <input 
                  type="text" 
                  required
                  value={formData.cta.link}
                  onChange={e => setFormData({...formData, cta: {...formData.cta, link: e.target.value}})}
                  className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-left"
                  dir="ltr"
                  placeholder="/shop/sale"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Date de début (Optionnel)', ar: 'تاريخ البدء (اختياري)'})}</label>
                  <input 
                    type="datetime-local" 
                    value={formData.schedule.startDate}
                    onChange={e => setFormData({...formData, schedule: {...formData.schedule, startDate: e.target.value}})}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-left"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Date de fin (Optionnel)', ar: 'تاريخ الانتهاء (اختياري)'})}</label>
                  <input 
                    type="datetime-local" 
                    value={formData.schedule.endDate}
                    onChange={e => setFormData({...formData, schedule: {...formData.schedule, endDate: e.target.value}})}
                    className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-4 py-2 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
                />
                <label htmlFor="isActive" className={`block text-sm text-gray-900 dark:text-gray-300 ${lng === 'ar' ? 'mr-2' : 'ml-2'}`}>
                  {t({fr: 'Activer immédiatement cette bannière', ar: 'تفعيل هذه اللافتة فوراً'})}
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-medium"
                >
                  {t({fr: 'Annuler', ar: 'إلغاء'})}
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 rounded-lg font-medium"
                >
                  {editingBanner ? t({fr: 'Mettre à jour', ar: 'تحديث'}) : t({fr: 'Créer la bannière', ar: 'إنشاء اللافتة'})}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBannersPage;
