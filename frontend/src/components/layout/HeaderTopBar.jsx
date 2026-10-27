import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, MessageCircle, Sun, Moon, Languages, User } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMoney } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';

export default function HeaderTopBar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, lng, toggleLanguage } = useLanguage();
  const { format } = useMoney();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({ whatsappNumber: '', phones: [] });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Failed to load settings in header', error);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const displayPhone = settings.phones && settings.phones.length > 0 ? settings.phones[0] : settings.whatsappNumber;
  const waNumber = settings.whatsappNumber;
  const cleanPhone = (phone) => phone ? phone.replace(/[^0-9+]/g, '') : '';

  return (
    <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-xs py-2 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        
        {/* Contact Info */}
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
          {displayPhone && (
            <a href={`tel:${cleanPhone(displayPhone)}`} className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors group min-h-[44px] sm:min-h-0 sm:py-1">
              <Phone size={14} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{displayPhone}</span>
            </a>
          )}
          {waNumber && (
            <a href={`https://wa.me/${cleanPhone(waNumber)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors group min-h-[44px] sm:min-h-0 sm:py-1">
              <MessageCircle size={14} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>

        {/* Center message - Shipping */}
        <div className="hidden md:block font-medium text-black dark:text-white">
          {t({fr: 'Livraison gratuite à partir de', ar: 'توصيل مجاني ابتداءً من'})} {format(settings?.freeShippingThreshold !== undefined ? settings.freeShippingThreshold : 15000)}
        </div>

        {/* Utilities */}
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
          
          {/* Language Toggle (Mockup) */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors group min-h-[44px] min-w-[44px] justify-center sm:min-h-0 sm:min-w-0 sm:justify-start"
            aria-label="Toggle Language"
          >
            <Languages size={16} />
            <span className="hidden sm:inline">{lng === 'fr' ? 'FR / ع' : 'ع / FR'}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors group min-h-[44px] min-w-[44px] justify-center sm:min-h-0 sm:min-w-0 sm:justify-start"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span className="hidden sm:inline">{isDarkMode ? t({fr: 'Clair', ar: 'فاتح'}) : t({fr: 'Sombre', ar: 'داكن'})}</span>
          </button>

          <span className="hidden sm:block text-gray-300 dark:text-gray-700">|</span>

          {/* Login / Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <button 
                className="flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors font-medium min-h-[44px] justify-center sm:min-h-0 sm:justify-start"
              >
                <div className="w-6 h-6 rounded-full bg-[#006233] text-white flex items-center justify-center text-[10px] font-bold uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <Link 
                    to="/account" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors w-full text-left"
                  >
                    <User size={16} />
                    {t({fr: 'Profil', ar: 'الملف الشخصي'})}
                  </Link>
                  {['admin_catalog', 'admin_orders', 'super_admin'].includes(user?.role) && (
                    <Link 
                      to="/admin" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[#F9A826] hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors w-full text-left"
                    >
                      <User size={16} /> {/* Can use Shield or LayoutDashboard icon if imported, falling back to User to avoid breaking */}
                      Admin Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full text-left"
                  >
                    <User size={16} />
                    {t({fr: 'Déconnexion', ar: 'تسجيل الخروج'})}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className="flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors font-medium min-h-[44px] min-w-[44px] justify-center sm:min-h-0 sm:min-w-0 sm:justify-start"
            >
              <User size={16} />
              <span className="hidden sm:inline">{t({fr: 'Connexion', ar: 'تسجيل الدخول'})}</span>
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
