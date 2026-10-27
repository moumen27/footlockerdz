import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  MessageSquare,
  LogOut,
  Menu,
  X,
  Store,
  Languages,
  Sun,
  Moon,
  User,
  ShieldAlert,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import logolight from '../assets/icons/logo-light.jpg';
import logodark from '../assets/icons/logo-dark.jpg';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { t, lng, toggleLanguage } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const isRTL = lng === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth';
  };

  const allNavigation = [
    { name: { fr: 'Tableau de bord', ar: 'لوحة القيادة' }, href: '/admin', icon: LayoutDashboard, exact: true, roles: ['super_admin', 'admin_orders', 'admin_catalog'] },
    { name: { fr: 'Commandes', ar: 'الطلبات' }, href: '/admin/orders', icon: ShoppingBag, roles: ['super_admin', 'admin_orders'] },
    { name: { fr: 'Produits', ar: 'المنتجات' }, href: '/admin/products', icon: Package, roles: ['super_admin', 'admin_catalog'] },
    { name: { fr: 'Marques', ar: 'العلامات التجارية' }, href: '/admin/brands', icon: Tag, roles: ['super_admin', 'admin_catalog'] },
    { name: { fr: 'Bannières', ar: 'اللافتات' }, href: '/admin/banners', icon: MessageSquare, roles: ['super_admin'] },
    { name: { fr: 'Utilisateurs', ar: 'المستخدمين' }, href: '/admin/users', icon: Users, roles: ['super_admin'] },
    { name: { fr: 'Modération', ar: 'الإشراف' }, href: '/admin/moderation', icon: ShieldAlert, roles: ['super_admin'] },
    { name: { fr: 'Paramètres', ar: 'الإعدادات' }, href: '/admin/settings', icon: Settings, roles: ['super_admin'] },
  ];

  const navigation = allNavigation;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex ${isRTL ? 'rtl' : 'ltr'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 ${isRTL ? 'right-0' : 'left-0'} z-50
        w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0')}
      `}>
        <div className="h-16 flex items-center justify-center px-4 border-b dark:border-gray-700">
          <Link to="/" className="flex items-center justify-center w-full overflow-hidden" aria-label="Retour à l'accueil">
            <img
              src={isDarkMode ? logodark : logolight}
              className="h-10 md:h-12 scale-[1.5] md:scale-[2.1] px-4"
              alt="Footlocker Logo"
            />
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute right-4">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                ${isActive 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }
              `}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 ${isRTL ? 'ml-3' : 'mr-3'}`} />
              {item.name[lng] || item.name.fr}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t dark:border-gray-700">
          <Link
            to="/"
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-1"
          >
            <Store className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {lng === 'ar' ? 'العودة للمتجر' : 'Retour à la boutique'}
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {lng === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
            >
              <Languages size={16} />
              <span>{lng === 'fr' ? 'FR / ع' : 'ع / FR'}</span>
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDarkMode ? (lng === 'ar' ? 'فاتح' : 'Clair') : (lng === 'ar' ? 'داكن' : 'Sombre')}</span>
            </button>

            <span className="text-gray-300 dark:text-gray-700">|</span>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors h-16">
                <div className="w-8 h-8 rounded-full bg-[#006233] text-white flex items-center justify-center font-bold uppercase">
                  {user?.name ? user.name.charAt(0) : (user?.firstName?.[0] || 'A')}
                </div>
                <span className="font-medium hidden sm:block">
                  {user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full -mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                <div className="py-2">
                  <Link 
                    to="/account" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <User size={16} />
                    {lng === 'ar' ? 'الملف الشخصي' : 'Profil'}
                  </Link>
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#F9A826] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors w-full text-left"
                  >
                    <User size={16} />
                    {lng === 'ar' ? 'لوحة تحكم المشرف' : 'Admin Dashboard'}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                  >
                    <User size={16} />
                    {lng === 'ar' ? 'تسجيل الخروج' : 'Déconnexion'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
