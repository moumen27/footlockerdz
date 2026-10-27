import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import { Globe, Moon, Bell, Lock, Download, Trash2, Info } from 'lucide-react';
import axiosInstance from '../../api/axios';

const AccountSettingsPage = () => {
  const { user, changePassword, logout } = useAuth();
  const { t, lng, changeLanguage, isAr } = useLanguage();
  const { theme, changeTheme } = useTheme();

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmittingPwd, setIsSubmittingPwd] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fallback if ThemeContext doesn't expose changeTheme properly
  const handleThemeChange = (newTheme) => {
    if (changeTheme) changeTheme(newTheme);
    else {
      // Mock update if ThemeContext doesn't support it yet
      localStorage.setItem('fldz.theme', newTheme);
      if (newTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      window.dispatchEvent(new Event('storage'));
    }
    toast.success(t({ fr: 'Thème mis à jour', ar: 'تم تحديث المظهر' }));
  };

  const handleLangChange = (lang) => {
    changeLanguage(lang);
    toast.success(t({ fr: 'Langue mise à jour', ar: 'تم تحديث اللغة' }));
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t({ fr: 'Les nouveaux mots de passe ne correspondent pas', ar: 'كلمات المرور الجديدة غير متطابقة' }));
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error(t({ fr: 'Le mot de passe doit contenir au moins 6 caractères', ar: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل' }));
      return;
    }
    setIsSubmittingPwd(true);
    const result = await changePassword(passwordData.oldPassword, passwordData.newPassword);
    if (result.success) {
      toast.success(t({ fr: 'Mot de passe mis à jour', ar: 'تم تحديث كلمة المرور' }));
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      toast.error(result.message || t({ fr: 'Erreur lors de la modification', ar: 'خطأ أثناء التعديل' }));
    }
    setIsSubmittingPwd(false);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Mocking export logic
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "mes-donnees-fldz.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      toast.success(t({ fr: 'Exportation réussie', ar: 'تم التصدير بنجاح' }));
    } catch (e) {
      toast.error(t({ fr: 'Erreur d\'exportation', ar: 'خطأ في التصدير' }));
    }
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm(t({ fr: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.', ar: 'هل أنت متأكد أنك تريد حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.' }))) return;
    
    setIsDeleting(true);
    try {
      await axiosInstance.delete('/auth/me');
      toast.success(t({ fr: 'Compte supprimé', ar: 'تم حذف الحساب' }));
      logout();
    } catch (e) {
      toast.error(t({ fr: 'Erreur lors de la suppression', ar: 'خطأ أثناء الحذف' }));
    }
    setIsDeleting(false);
  };

  return (
    <div className="animate-fade-in w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">{t({ fr: 'Réglages', ar: 'الإعدادات' })}</h2>

      {/* Language */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-gray-500" />
          {t({ fr: 'Langue', ar: 'اللغة' })}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t({ fr: 'Vous pouvez aussi changer la langue depuis la barre du haut.', ar: 'يمكنك أيضًا تغيير اللغة من الشريط العلوي.' })}
        </p>
        <div className="flex gap-4">
          <label className={`flex items-center justify-center px-4 py-3 border cursor-pointer flex-1 transition-colors ${lng === 'fr' ? 'border-[#11323B] bg-[#11323B]/5 font-semibold text-[#11323B]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <input type="radio" name="lang" value="fr" checked={lng === 'fr'} onChange={() => handleLangChange('fr')} className="hidden" />
            Français
          </label>
          <label className={`flex items-center justify-center px-4 py-3 border cursor-pointer flex-1 transition-colors ${lng === 'ar' ? 'border-[#11323B] bg-[#11323B]/5 font-semibold text-[#11323B]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <input type="radio" name="lang" value="ar" checked={lng === 'ar'} onChange={() => handleLangChange('ar')} className="hidden" />
            العربية
          </label>
        </div>
      </div>

      {/* Theme */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-gray-500" />
          {t({ fr: 'Thème', ar: 'المظهر' })}
        </h3>
        <div className="flex gap-4">
          <label className={`flex items-center justify-center px-4 py-3 border cursor-pointer flex-1 transition-colors ${theme === 'light' ? 'border-[#11323B] bg-[#11323B]/5 font-semibold text-[#11323B]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <input type="radio" name="theme" value="light" checked={theme === 'light'} onChange={() => handleThemeChange('light')} className="hidden" />
            {t({ fr: 'Clair', ar: 'فاتح' })}
          </label>
          <label className={`flex items-center justify-center px-4 py-3 border cursor-pointer flex-1 transition-colors ${theme === 'dark' ? 'border-[#11323B] bg-[#11323B]/5 font-semibold text-[#11323B]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <input type="radio" name="theme" value="dark" checked={theme === 'dark'} onChange={() => handleThemeChange('dark')} className="hidden" />
            {t({ fr: 'Sombre', ar: 'داكن' })}
          </label>
          <label className={`flex items-center justify-center px-4 py-3 border cursor-pointer flex-1 transition-colors ${theme === 'system' ? 'border-[#11323B] bg-[#11323B]/5 font-semibold text-[#11323B]' : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            <input type="radio" name="theme" value="system" checked={theme === 'system'} onChange={() => handleThemeChange('system')} className="hidden" />
            {t({ fr: 'Système', ar: 'النظام' })}
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-500" />
          {t({ fr: 'Préférences de notifications', ar: 'تفضيلات الإشعارات' })}
        </h3>
        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#F9A826] focus:ring-[#F9A826]" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{t({ fr: 'Emails de commande', ar: 'رسائل الطلبات' })}</p>
              <p className="text-sm text-gray-500">{t({ fr: 'Confirmation et suivi de livraison', ar: 'التأكيد وتتبع التوصيل' })}</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-[#F9A826] focus:ring-[#F9A826]" />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-200">{t({ fr: 'Newsletter', ar: 'النشرة الإخبارية' })}</p>
              <p className="text-sm text-gray-500">{t({ fr: 'Promotions et nouveautés', ar: 'العروض والمنتجات الجديدة' })}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Password */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-500" />
          {t({ fr: 'Mot de passe', ar: 'كلمة المرور' })}
        </h3>
        <form onSubmit={handlePwdSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{t({ fr: 'Ancien mot de passe', ar: 'كلمة المرور القديمة' })}</label>
            <input type="password" name="oldPassword" value={passwordData.oldPassword} onChange={handlePwdChange} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#F9A826]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{t({ fr: 'Nouveau mot de passe', ar: 'كلمة المرور الجديدة' })}</label>
            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePwdChange} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#F9A826]" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{t({ fr: 'Confirmer', ar: 'تأكيد' })}</label>
            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePwdChange} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#F9A826]" />
          </div>
          <button type="submit" disabled={isSubmittingPwd} className="bg-[#11323B] text-white px-6 py-2 hover:bg-gray-800 transition-colors disabled:opacity-50">
            {t({ fr: 'Enregistrer', ar: 'حفظ' })}
          </button>
        </form>
      </div>

      {/* Data & Privacy */}
      <div className="mb-8 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
          <Info className="w-5 h-5" />
          {t({ fr: 'Compte et données', ar: 'الحساب والبيانات' })}
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleExportData} disabled={isExporting} className="flex-1 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            {t({ fr: 'Exporter mes données', ar: 'تصدير بياناتي' })}
          </button>
          <button onClick={handleDeleteAccount} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 px-4 py-3 hover:bg-red-100 transition-colors">
            <Trash2 className="w-4 h-4" />
            {t({ fr: 'Supprimer mon compte', ar: 'حذف حسابي' })}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AccountSettingsPage;
