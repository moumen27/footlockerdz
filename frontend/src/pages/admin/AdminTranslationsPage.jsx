import React, { useState, useEffect } from 'react';
import { Save, Search, Languages, Globe } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminTranslationsPage() {
  const { t, lng } = useLanguage();
  const { user } = useAuth();
  const [translations, setTranslations] = useState({ fr: {}, ar: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedLang, setSelectedLang] = useState('fr');
  const [selectedNamespace, setSelectedNamespace] = useState('common');
  const [searchTerm, setSearchTerm] = useState('');

  // Pour stocker l'état local des inputs pendant l'édition
  const [editableData, setEditableData] = useState({});

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchTranslations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchTranslations = async () => {
    try {
      const res = await axiosInstance.get('/translations');
      setTranslations(res.data);
      if (res.data[selectedLang] && res.data[selectedLang][selectedNamespace]) {
        setEditableData(res.data[selectedLang][selectedNamespace]);
      }
    } catch (err) {
      toast.error(t({fr: 'Erreur lors du chargement des traductions', ar: 'خطأ أثناء تحميل الترجمات'}));
    } finally {
      setLoading(false);
    }
  };

  // Met à jour les données éditables quand on change de langue ou de namespace
  useEffect(() => {
    if (translations[selectedLang] && translations[selectedLang][selectedNamespace]) {
      setEditableData(translations[selectedLang][selectedNamespace]);
    } else {
      setEditableData({});
    }
  }, [selectedLang, selectedNamespace, translations]);

  const handleValueChange = (key, newValue) => {
    setEditableData(prev => ({
      ...prev,
      [key]: newValue
    }));
  };

  const handleAddKey = () => {
    const newKey = window.prompt(t({fr: "Nom de la nouvelle clé :", ar: "اسم المفتاح الجديد :"}));
    if (newKey && !editableData[newKey]) {
      setEditableData(prev => ({
        ...prev,
        [newKey]: ""
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axiosInstance.put('/translations', {
        lng: selectedLang,
        namespace: selectedNamespace,
        data: editableData
      });
      
      // Update local state
      setTranslations(prev => ({
        ...prev,
        [selectedLang]: {
          ...prev[selectedLang],
          [selectedNamespace]: editableData
        }
      }));
      
      toast.success(t({fr: 'Traduction sauvegardée avec succès', ar: 'تم حفظ الترجمة بنجاح'}));
    } catch (err) {
      toast.error(t({fr: 'Erreur lors de la sauvegarde', ar: 'خطأ أثناء الحفظ'}));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">{t({fr: 'Chargement...', ar: 'جاري التحميل...'})}</div>;

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center mt-10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t({fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)'})}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {t({fr: 'Cette section est strictement réservée au rôle "Super Admin". Vous ne pouvez pas modifier les traductions du site.', ar: 'هذا القسم مخصص حصريًا لدور "المشرف المتميز". لا يمكنك تعديل ترجمات الموقع.'})}
        </p>
      </div>
    );
  }

  const namespaces = Object.keys(translations[selectedLang] || {});

  // Filtrer les clés de traduction selon la recherche
  const filteredKeys = Object.keys(editableData).filter(key => 
    key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(editableData[key]).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Gestion des Traductions (i18n)', ar: 'إدارة الترجمات (i18n)'})}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t({fr: 'Modifiez les textes directement dans les fichiers JSON', ar: 'تعديل النصوص مباشرة في ملفات JSON'})}</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#006233] text-white px-6 py-2.5 rounded-lg hover:bg-[#004e28] transition-colors font-medium disabled:opacity-50"
        >
          <Save size={18} />
          <span>{saving ? t({fr: 'Sauvegarde...', ar: 'جاري الحفظ...'}) : t({fr: 'Sauvegarder', ar: 'حفظ'})}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Panneau de sélection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Globe size={18} className={lng === 'ar' ? 'ml-2' : 'mr-2'} /> {t({fr: 'Langue', ar: 'اللغة'})}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedLang('fr')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLang === 'fr' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {t({fr: 'Français (FR)', ar: 'الفرنسية (FR)'})}
              </button>
              <button 
                onClick={() => setSelectedLang('ar')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${selectedLang === 'ar' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                {t({fr: 'Arabe (AR)', ar: 'العربية (AR)'})}
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Languages size={18} className={lng === 'ar' ? 'ml-2' : 'mr-2'} /> {t({fr: 'Fichier (Namespace)', ar: 'الملف (مساحة الاسم)'})}
            </h3>
            <div className="space-y-1">
              {namespaces.map(ns => (
                <button
                  key={ns}
                  onClick={() => setSelectedNamespace(ns)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedNamespace === ns ? 'bg-gray-100 text-black font-medium dark:bg-gray-700 dark:text-white' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-750'}`}
                >
                  {ns}.json
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Éditeur */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-[calc(100vh-220px)] min-h-[500px]">
            
            <div className="p-4 border-b dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                {t({fr: 'Édition de', ar: 'تعديل'})} <span className="text-[#006233]" dir="ltr">{selectedNamespace}.json</span> ({selectedLang.toUpperCase()})
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-row-reverse sm:flex-row">
                <div className="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    placeholder={t({fr: 'Rechercher une clé ou un texte...', ar: 'ابحث عن مفتاح أو نص...'})}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${lng === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white`}
                  />
                  <Search size={16} className={`absolute ${lng === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
                </div>
                <button
                  onClick={handleAddKey}
                  className="px-3 py-2 bg-[#006233] text-white rounded-lg text-sm font-medium hover:bg-[#004f29] transition-colors whitespace-nowrap"
                >
                  {t({fr: '+ Ajouter une clé', ar: '+ إضافة مفتاح'})}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filteredKeys.length > 0 ? (
                <div className="space-y-4">
                  {filteredKeys.map(key => (
                    <div key={key} className="flex flex-col gap-1 border-b dark:border-gray-700 pb-4 last:border-0">
                      <label className="text-xs font-mono text-gray-500 dark:text-gray-400">{key}</label>
                      {/* Pour les textes très longs on peut utiliser un textarea, sinon un input */}
                      {String(editableData[key]).length > 100 ? (
                        <textarea
                          value={editableData[key]}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}
                          className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white min-h-[80px]"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editableData[key]}
                          onChange={(e) => handleValueChange(key, e.target.value)}
                          dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}
                          className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {t({fr: `Aucune traduction trouvée pour "${searchTerm}"`, ar: `لم يتم العثور على ترجمة لـ "${searchTerm}"`})}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
