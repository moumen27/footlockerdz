import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, UserCheck, UserX, X } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminUsersPage() {
  const { t, lng } = useLanguage();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin_orders', isBlocked: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users/admin');
      setUsers(res.data);
    } catch (err) {
      toast.error(t({fr: 'Erreur lors du chargement des admins', ar: 'خطأ أثناء تحميل المسؤولين'}));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', password: '', role: 'admin_orders', isBlocked: false });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({ 
      name: user.name || '', 
      email: user.email || '', 
      password: '', // Only for creation usually, or reset. Our backend only updates role/isBlocked for now
      role: user.role, 
      isBlocked: user.isBlocked 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (selectedUser) {
        // Edit (Our backend only expects role and isBlocked for update)
        await axiosInstance.patch(`/users/admin/${selectedUser._id}`, {
          role: formData.role,
          isBlocked: formData.isBlocked
        });
        toast.success(t({fr: 'Administrateur mis à jour', ar: 'تم تحديث المسؤول'}));
      } else {
        // Create
        await axiosInstance.post('/users/admin', formData);
        toast.success(t({fr: 'Administrateur créé', ar: 'تم إنشاء المسؤول'}));
      }
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || t({fr: 'Erreur lors de la sauvegarde', ar: 'خطأ أثناء الحفظ'}));
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
          {t({fr: 'Cette section est strictement réservée au rôle "Super Admin". Vous n\'êtes pas autorisé à gérer les administrateurs.', ar: 'هذا القسم مخصص حصريًا لدور "المشرف المتميز". غير مصرح لك بإدارة المسؤولين.'})}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Gestion des Administrateurs', ar: 'إدارة المسؤولين'})}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t({fr: 'Gérez les accès et les rôles de l\'équipe', ar: 'إدارة صلاحيات وأدوار الفريق'})}</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
        >
          <Plus size={18} className={lng === 'ar' ? 'ml-1' : 'mr-1'} />
          <span>{t({fr: 'Nouvel Admin', ar: 'مسؤول جديد'})}</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4">{t({fr: 'Utilisateur', ar: 'المستخدم'})}</th>
                <th className="px-6 py-4">{t({fr: 'Rôle', ar: 'الدور'})}</th>
                <th className="px-6 py-4">{t({fr: 'Statut', ar: 'الحالة'})}</th>
                <th className={`px-6 py-4 ${lng === 'ar' ? 'text-left' : 'text-right'}`}>{t({fr: 'Actions', ar: 'الإجراءات'})}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                        {user.name ? user.name[0].toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name || t({fr: 'Sans nom', ar: 'بدون اسم'})}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                      {user.role === 'admin_catalog' ? t({fr: 'Admin Catalog', ar: 'مسؤول الكتالوج'}) : 
                       user.role === 'admin_orders' ? t({fr: 'Admin Orders', ar: 'مسؤول الطلبات'}) : 
                       user.role === 'super_admin' ? t({fr: 'Super Admin', ar: 'مشرف متميز'}) : 
                       user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.isBlocked ? (
                      <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <UserX size={16} /> {t({fr: 'Suspendu', ar: 'موقوف'})}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                        <UserCheck size={16} /> {t({fr: 'Actif', ar: 'نشط'})}
                      </span>
                    )}
                  </td>
                  <td className={`px-6 py-4 ${lng === 'ar' ? 'text-left' : 'text-right'}`}>
                    <div className={`flex gap-2 ${lng === 'ar' ? 'justify-start' : 'justify-end'}`}>
                      {user.role !== 'super_admin' && (
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors" 
                          title={t({fr: 'Modifier', ar: 'تعديل'})}
                        >
                          <Edit size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    {t({fr: 'Aucun administrateur trouvé', ar: 'لم يتم العثور على أي مسؤول'})}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedUser ? t({fr: 'Modifier l\'administrateur', ar: 'تعديل المسؤول'}) : t({fr: 'Nouvel administrateur', ar: 'مسؤول جديد'})}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {!selectedUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Nom complet', ar: 'الاسم الكامل'})}</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Email', ar: 'البريد الإلكتروني'})}</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white text-left"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Mot de passe', ar: 'كلمة المرور'})}</label>
                    <input 
                      type="password" 
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white text-left"
                      dir="ltr"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Rôle', ar: 'الدور'})}</label>
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className={`w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white ${lng === 'ar' ? 'text-right' : ''}`}
                >
                  <option value="admin_catalog">{t({fr: 'Admin Catalog (Produits & Bannières)', ar: 'مسؤول الكتالوج (المنتجات واللافتات)'})}</option>
                  <option value="admin_orders">{t({fr: 'Admin Orders (Commandes seulement)', ar: 'مسؤول الطلبات (الطلبات فقط)'})}</option>
                  <option value="super_admin">{t({fr: 'Super Admin (Accès total)', ar: 'مشرف متميز (وصول كامل)'})}</option>
                </select>
              </div>

              {selectedUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t({fr: 'Statut du compte', ar: 'حالة الحساب'})}</label>
                  <select 
                    value={formData.isBlocked ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isBlocked: e.target.value === 'true'})}
                    className={`w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-[#006233] outline-none dark:text-white ${lng === 'ar' ? 'text-right' : ''}`}
                  >
                    <option value="false">{t({fr: 'Actif', ar: 'نشط'})}</option>
                    <option value="true">{t({fr: 'Suspendu (Bloqué)', ar: 'موقوف (محظور)'})}</option>
                  </select>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  {t({fr: 'Annuler', ar: 'إلغاء'})}
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#006233] text-white rounded-lg hover:bg-[#004e28] transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? t({fr: 'Enregistrement...', ar: 'جاري الحفظ...'}) : t({fr: 'Enregistrer', ar: 'حفظ'})}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
