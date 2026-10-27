import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import profileBg from '../assets/image/profile-bg.jpg';

const AccountLayout = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t({ fr: 'Veuillez vous connecter', ar: 'الرجاء تسجيل الدخول' })}</h2>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-[#F9A826] text-white px-6 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            {t({ fr: 'Se connecter', ar: 'تسجيل الدخول' })}
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: '/account', label: { fr: 'Aperçu', ar: 'نظرة عامة' }, end: true },
    { path: '/account/orders', label: { fr: 'Mes commandes', ar: 'طلباتي' } },
    { path: '/favorites', label: { fr: 'Mes favoris ❤️', ar: 'مفضلتي ❤️' } },
    { path: '/account/addresses', label: { fr: 'Mes adresses', ar: 'عناويني' } },
    { path: '/account/reviews', label: { fr: 'Mes avis', ar: 'تقييماتي' } },
    { path: '/account/settings', label: { fr: 'Réglages', ar: 'الإعدادات' } },
  ];

  return (
    <div className="w-full bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors">
      {/* Top Banner */}
      <div 
        className="py-24 relative overflow-hidden flex flex-col items-center justify-center border-b border-gray-100 bg-cover bg-center"
        style={{ backgroundImage: `url(${profileBg})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>


        <h1 className="text-4xl md:text-5xl font-serif text-white mb-3 z-10 font-normal tracking-wide drop-shadow-md">{t({ fr: 'Mon compte', ar: 'حسابي' })}</h1>
        <p className="text-sm text-gray-200 z-10 font-medium drop-shadow-sm">{t({ fr: 'Accueil', ar: 'الرئيسية' })} / <span className="text-white font-semibold">{t({ fr: 'Mon compte', ar: 'حسابي' })}</span></p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col">
              {navItems.map((item) => {
                const isActive = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`px-6 py-4 border border-b-0 last:border-b transition-colors ${
                      isActive
                        ? 'bg-[#F9A826] text-gray-900 font-semibold border-[#F9A826]'
                        : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t(item.label)}
                  </NavLink>
                )
              })}
              
              <button
                onClick={handleLogout}
                className="px-6 py-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full"
              >
                {t({ fr: 'Déconnexion', ar: 'تسجيل الخروج' })}
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="w-full max-w-3xl">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
