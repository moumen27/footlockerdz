import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const AccountPasswordPage = () => {
  const { changePassword } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t({ fr: 'Les nouveaux mots de passe ne correspondent pas', ar: 'كلمات المرور الجديدة غير متطابقة' }));
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error(t({ fr: 'Le nouveau mot de passe doit contenir au moins 6 caractères', ar: 'يجب أن تحتوي كلمة المرور الجديدة على 6 أحرف على الأقل' }));
      return;
    }

    setIsSubmitting(true);
    
    const result = await changePassword(formData.oldPassword, formData.newPassword);
    
    if (result.success) {
      toast.success(t({ fr: 'Mot de passe mis à jour avec succès', ar: 'تم تحديث كلمة المرور بنجاح' }));
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } else {
      toast.error(result.message || t({ fr: 'Erreur lors de la modification', ar: 'خطأ أثناء التعديل' }));
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">{t({ fr: 'Modifier le mot de passe', ar: 'تغيير كلمة المرور' })}</h2>

      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
        {/* Ancien mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Ancien mot de passe *', ar: 'كلمة المرور القديمة *' })}</label>
          <input 
            type="password" 
            name="oldPassword"
            value={formData.oldPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
          />
        </div>
        
        {/* Nouveau mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Nouveau mot de passe *', ar: 'كلمة المرور الجديدة *' })}</label>
          <input 
            type="password" 
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
          />
        </div>

        {/* Confirmer le nouveau mot de passe */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">{t({ fr: 'Confirmer le nouveau mot de passe *', ar: 'تأكيد كلمة المرور الجديدة *' })}</label>
          <input 
            type="password" 
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-[#F9A826] transition-colors rounded-none"
          />
        </div>

        {/* Update Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-[#11323B] text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors rounded-none border border-[#11323B] disabled:opacity-50"
          >
            {isSubmitting ? t({ fr: 'Modification...', ar: 'جاري التعديل...' }) : t({ fr: 'Enregistrer le nouveau mot de passe', ar: 'حفظ كلمة المرور الجديدة' })}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountPasswordPage;
