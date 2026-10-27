import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Pencil } from 'lucide-react';
import { toast } from 'react-toastify';

const AccountOverviewPage = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await updateProfile(formData);
    
    if (result.success) {
      toast.success(t({ fr: 'Profil mis à jour avec succès', ar: 'تم تحديث الملف الشخصي بنجاح' }));
    } else {
      toast.error(result.message || t({ fr: 'Erreur lors de la mise à jour', ar: 'حدث خطأ أثناء التحديث' }));
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in w-full">
      {/* Profile Picture */}
      <div className="mb-10">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-600 shadow-sm flex items-center justify-center">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-semibold text-gray-400 dark:text-gray-300 uppercase">
                {formData.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
              </span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-[#11323B] text-white p-1.5 rounded-full border-2 border-white dark:border-gray-700 hover:bg-gray-800 transition-colors shadow-sm">
            <Pencil size={14} />
          </button>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t({ fr: 'Nom complet *', ar: 'الاسم الكامل *' })}
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
            />
          </div>
          
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {t({ fr: 'Email *', ar: 'البريد الإلكتروني *' })}
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
            {t({ fr: 'Téléphone *', ar: 'رقم الهاتف *' })}
          </label>
          <input 
            type="tel" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
          />
        </div>

        {/* Update Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#11323B] text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors rounded-none border border-[#11323B] disabled:opacity-50"
          >
            {isSubmitting ? t({ fr: 'Mise à jour...', ar: 'جاري التحديث...' }) : t({ fr: 'Enregistrer les modifications', ar: 'حفظ التغييرات' })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountOverviewPage;
