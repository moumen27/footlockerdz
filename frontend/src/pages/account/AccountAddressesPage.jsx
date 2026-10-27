import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MapPin, Edit, Trash2, CheckCircle } from 'lucide-react';
import geoData from '../../data/algeria-cities.json';
import { useLanguage } from '../../context/LanguageContext';

const wilayas = geoData.wilayas;
const allCommunes = geoData.communes;

const AccountAddressesPage = () => {
  const { user, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const { t } = useLanguage();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    wilayaCode: '01',
    commune: '',
    street: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (address = null) => {
    if (address) {
      setEditingId(address._id);
      setFormData({
        label: address.label,
        wilayaCode: address.wilayaCode,
        commune: address.commune,
        street: address.street,
        phone: address.phone
      });
    } else {
      setEditingId(null);
      setFormData({
        label: '',
        wilayaCode: '01',
        commune: '',
        street: '',
        phone: ''
      });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'wilayaCode') {
        newData.commune = ''; // Reset commune when wilaya changes
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let result;
    if (editingId) {
      result = await updateAddress(editingId, formData);
    } else {
      result = await addAddress(formData);
    }

    if (result.success) {
      toast.success(editingId ? t({ fr: 'Adresse modifiée avec succès', ar: 'تم تعديل العنوان بنجاح' }) : t({ fr: 'Adresse ajoutée avec succès', ar: 'تم إضافة العنوان بنجاح' }));
      handleCloseForm();
    } else {
      toast.error(result.message || t({ fr: 'Erreur lors de la sauvegarde', ar: 'خطأ أثناء الحفظ' }));
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t({ fr: 'Voulez-vous vraiment supprimer cette adresse ?', ar: 'هل تريد حقًا حذف هذا العنوان؟' }))) {
      const result = await deleteAddress(id);
      if (result.success) {
        toast.success(t({ fr: 'Adresse supprimée', ar: 'تم حذف العنوان' }));
      } else {
        toast.error(t({ fr: 'Erreur lors de la suppression', ar: 'خطأ أثناء الحذف' }));
      }
    }
  };

  const handleSetDefault = async (id) => {
    const result = await setDefaultAddress(id);
    if (result.success) {
      toast.success(t({ fr: 'Adresse par défaut mise à jour', ar: 'تم تحديث العنوان الافتراضي' }));
    }
  };

  const addresses = user?.addresses || [];
  const defaultAddressId = user?.defaultAddressId;

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{t({ fr: 'Mes adresses', ar: 'عناويني' })}</h2>
        {!showForm && (
          <button 
            onClick={() => handleOpenForm()}
            className="bg-[#F9A826] text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium"
          >
            {t({ fr: 'Ajouter une adresse', ar: 'إضافة عنوان جديد' })}
          </button>
        )}
      </div>
      
      {showForm ? (
        <div className="bg-white border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">{editingId ? t({ fr: "Modifier l'adresse", ar: 'تعديل العنوان' }) : t({ fr: 'Ajouter une adresse', ar: 'إضافة عنوان جديد' })}</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Label (ex: Maison, Travail) *', ar: 'التسمية (مثال: المنزل، العمل) *' })}</label>
              <input 
                type="text" 
                name="label"
                value={formData.label}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Wilaya *', ar: 'الولاية *' })}</label>
                <select 
                  name="wilayaCode"
                  value={formData.wilayaCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none cursor-pointer"
                >
                  {wilayas.map(w => (
                    <option key={w.code} value={w.code}>{w.code} - {w.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Commune *', ar: 'البلدية *' })}</label>
                <select 
                  name="commune"
                  value={formData.commune}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none cursor-pointer"
                >
                  <option value="" disabled>{t({ fr: 'Sélectionnez une commune', ar: 'اختر بلدية' })}</option>
                  {allCommunes
                    .filter(c => c.wilayaCode === formData.wilayaCode)
                    .map((c, index) => (
                      <option key={index} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Rue / Numéro *', ar: 'الشارع / الرقم *' })}</label>
              <input 
                type="text" 
                name="street"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Téléphone *', ar: 'رقم الهاتف *' })}</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white border border-gray-200 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#11323B] text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors rounded-none disabled:opacity-50"
              >
                {isSubmitting ? t({ fr: 'Sauvegarde...', ar: 'جاري الحفظ...' }) : t({ fr: 'Sauvegarder', ar: 'حفظ' })}
              </button>
              <button 
                type="button" 
                onClick={handleCloseForm}
                className="bg-gray-200 text-gray-800 px-8 py-3 font-medium hover:bg-gray-300 transition-colors rounded-none"
              >
                {t({ fr: 'Annuler', ar: 'إلغاء' })}
              </button>
            </div>
          </form>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-orange-100 text-[#F9A826] rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t({ fr: 'Aucune adresse', ar: 'لا توجد عناوين' })}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {t({ fr: "Vous n'avez pas encore ajouté d'adresse de livraison. Ajoutez-en une pour faciliter vos prochaines commandes.", ar: "لم تقم بإضافة عنوان توصيل بعد. أضف واحدًا لتسهيل طلباتك القادمة." })}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => {
            const isDefault = defaultAddressId === address._id;
            return (
              <div 
                key={address._id} 
                className={`border p-6 relative ${isDefault ? 'border-[#F9A826] bg-orange-50/30' : 'border-gray-200 bg-white'}`}
              >
                {isDefault && (
                  <span className="absolute top-4 right-4 text-[#F9A826] flex items-center gap-1 text-sm font-semibold">
                    <CheckCircle size={16} /> {t({ fr: 'Par défaut', ar: 'الافتراضي' })}
                  </span>
                )}
                
                <h3 className="font-bold text-lg mb-2">{address.label}</h3>
                <div className="text-gray-600 space-y-1 mb-6 text-sm">
                  <p>{address.street}</p>
                  <p>{address.commune}, {t({ fr: 'Wilaya', ar: 'ولاية' })} {address.wilayaCode}</p>
                  <p className="pt-2 font-medium">{t({ fr: 'Tél', ar: 'هاتف' })}: {address.phone}</p>
                </div>
                
                <div className="flex gap-4 border-t border-gray-100 pt-4 mt-auto">
                  <button 
                    onClick={() => handleOpenForm(address)}
                    className="flex items-center gap-1 text-gray-600 hover:text-[#11323B] transition-colors text-sm font-medium"
                  >
                    <Edit size={16} /> {t({ fr: 'Modifier', ar: 'تعديل' })}
                  </button>
                  <button 
                    onClick={() => handleDelete(address._id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 size={16} /> {t({ fr: 'Supprimer', ar: 'حذف' })}
                  </button>
                  
                  {!isDefault && (
                    <button 
                      onClick={() => handleSetDefault(address._id)}
                      className="ml-auto text-sm font-semibold text-[#F9A826] hover:text-orange-600"
                    >
                      {t({ fr: 'Définir par défaut', ar: 'تعيين كافتراضي' })}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AccountAddressesPage;
