import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';

export default function Footer() {
  const { t, isAr } = useLanguage();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axiosInstance.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Failed to load settings in footer', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="footer-wrapper block px-5 font-sans text-sm leading-snug cursor-crosshair transition-all border-t border-gray-100 dark:border-gray-800 bg-[#fcfcfc] dark:bg-gray-950 text-gray-900 dark:text-gray-200 pt-16" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="container mx-auto max-w-7xl">
        <div className="footer-content grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Navigation */}
          <div className="footer-common-menu flex flex-col gap-3">
            <h3 className="footer-common-title font-bold text-lg mb-2 text-black dark:text-white">{t({fr: 'Navigation', ar: 'تصفح'})}</h3>
            <Link to="/" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Accueil', ar: 'الرئيسية'})}</Link>
            <Link to="/brands" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Marques', ar: 'ماركات'})}</Link>
            <Link to="/shop" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Boutique', ar: 'المتجر'})}</Link>
            <Link to="/new" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Nouveautés', ar: 'جديدنا'})}</Link>
            <Link to="/sale" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Soldes', ar: 'تخفيضات'})}</Link>
            <Link to="/favorites" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Favoris', ar: 'المفضلة'})}</Link>
          </div>

          {/* Categories */}
          <div className="footer-common-menu flex flex-col gap-3">
            <h3 className="footer-common-title font-bold text-lg mb-2 text-black dark:text-white">{t({fr: 'Catégories', ar: 'الفئات'})}</h3>
            <Link to="/shop/running" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Running', ar: 'جري'})}</Link>
            <Link to="/shop/basketball" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Basketball', ar: 'كرة السلة'})}</Link>
            <Link to="/shop/football" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Football', ar: 'كرة القدم'})}</Link>
            <Link to="/shop/lifestyle" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Lifestyle', ar: 'لايف ستايل'})}</Link>
            <Link to="/shop/training" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Training', ar: 'تدريب'})}</Link>
          </div>

          {/* Utility Pages */}
          <div className="footer-common-menu flex flex-col gap-3">
            <h3 className="footer-common-title font-bold text-lg mb-2 text-black dark:text-white">{t({fr: 'Pages Utiles', ar: 'صفحات مفيدة'})}</h3>
            <Link to="/" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Guide des tailles', ar: 'دليل المقاسات'})}</Link>
            <Link to="/" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Licences', ar: 'التراخيص'})}</Link>
            <Link to="/" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Changelog', ar: 'سجل التغييرات'})}</Link>
            <Link to="/auth" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Mon Compte', ar: 'حسابي'})}</Link>
            <Link to="/cart" className="footer-common-list hover:opacity-70 transition-opacity">{t({fr: 'Panier', ar: 'عربة التسوق'})}</Link>
          </div>

          {/* Contact Us */}
          <div className="footer-locations flex flex-col gap-3">
            <h3 className="footer-common-title font-bold text-lg mb-2 text-black dark:text-white">{t({fr: 'Nous Contacter', ar: 'اتصل بنا'})}</h3>
            <a href="https://www.google.com/maps" target="_blank" rel="noreferrer" className="footer-common-list hover:opacity-70 transition-opacity font-semibold">{t({fr: 'Boutique Alger', ar: 'متجر الجزائر'})}</a>
            <p className="footer-common-list text-gray-600 dark:text-gray-400 mb-2">{t({fr: 'Didouche Mourad, Alger Centre, Algérie', ar: 'ديدوش مراد، الجزائر الوسطى، الجزائر'})}</p>
            
            {settings?.whatsappNumber && (
              <a href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noreferrer" className="footer-common-list hover:opacity-70 transition-opacity font-semibold mt-2 flex items-center gap-2">
                <span className="text-[#25D366]">WhatsApp:</span> {settings.whatsappNumber}
              </a>
            )}

            {settings?.phones?.map((phone, idx) => (
              <a key={idx} href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="footer-common-list hover:opacity-70 transition-opacity">
                {phone}
              </a>
            ))}
            
            {/* Social Icons */}
            <div className="social-media-icons flex items-center gap-4 mt-6">
              {settings?.socials?.facebook && (
                <a href={settings.socials.facebook} target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity dark:invert">
                  {/* FB icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="black"><path d="M10 0C4.477 0 0 4.477 0 10C0 14.991 3.657 19.128 8.438 19.879V12.89H5.898V10H8.438V7.797C8.438 5.291 9.93 3.907 12.215 3.907C13.309 3.907 14.453 4.102 14.453 4.102V6.562H13.193C11.95 6.562 11.563 7.333 11.563 8.124V10H14.336L13.893 12.89H11.563V19.879C16.343 19.129 20 14.99 20 10C20 4.477 15.523 0 10 0Z" fill="black"></path></svg>
                </a>
              )}
              {settings?.socials?.instagram && (
                <a href={settings.socials.instagram.startsWith('http') ? settings.socials.instagram : `https://${settings.socials.instagram}`} target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity dark:invert">
                  {/* IG icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 0C12.717 0 13.056 0.00999994 14.122 0.0599999C15.187 0.11 15.912 0.277 16.55 0.525C17.21 0.779 17.766 1.123 18.322 1.678C18.8305 2.1779 19.224 2.78259 19.475 3.45C19.722 4.087 19.89 4.813 19.94 5.878C19.987 6.944 20 7.283 20 10C20 12.717 19.99 13.056 19.94 14.122C19.89 15.187 19.722 15.912 19.475 16.55C19.2247 17.2178 18.8311 17.8226 18.322 18.322C17.822 18.8303 17.2173 19.2238 16.55 19.475C15.913 19.722 15.187 19.89 14.122 19.94C13.056 19.987 12.717 20 10 20C7.283 20 6.944 19.99 5.878 19.94C4.813 19.89 4.088 19.722 3.45 19.475C2.78233 19.2245 2.17753 18.8309 1.678 18.322C1.16941 17.8222 0.775931 17.2175 0.525 16.55C0.277 15.913 0.11 15.187 0.0599999 14.122C0.0129999 13.056 0 12.717 0 10C0 7.283 0.00999994 6.944 0.0599999 5.878C0.11 4.812 0.277 4.088 0.525 3.45C0.775236 2.78218 1.1688 2.17732 1.678 1.678C2.17767 1.16923 2.78243 0.775729 3.45 0.525C4.088 0.277 4.812 0.11 5.878 0.0599999C6.944 0.0129999 7.283 0 10 0ZM10 5C8.67392 5 7.40215 5.52678 6.46447 6.46447C5.52678 7.40215 5 8.67392 5 10C5 11.3261 5.52678 12.5979 6.46447 13.5355C7.40215 14.4732 8.67392 15 10 15C11.3261 15 12.5979 14.4732 13.5355 13.5355C14.4732 12.5979 15 11.3261 15 10C15 8.67392 14.4732 7.40215 13.5355 6.46447C12.5979 5.52678 11.3261 5 10 5ZM16.5 4.75C16.5 4.41848 16.3683 4.10054 16.1339 3.86612C15.8995 3.6317 15.5815 3.5 15.25 3.5C14.9185 3.5 14.6005 3.6317 14.3661 3.86612C14.1317 4.10054 14 4.41848 14 4.75C14 5.08152 14.1317 5.39946 14.3661 5.63388C14.6005 5.8683 14.9185 6 15.25 6C15.5815 6 15.8995 5.8683 16.1339 5.63388C16.3683 5.39946 16.5 5.08152 16.5 4.75ZM10 7C10.7956 7 11.5587 7.31607 12.1213 7.87868C12.6839 8.44129 13 9.20435 13 10C13 10.7956 12.6839 11.5587 12.1213 12.1213C11.5587 12.6839 10.7956 13 10 13C9.20435 13 8.44129 12.6839 7.87868 12.1213C7.31607 11.5587 7 10.7956 7 10C7 9.20435 7.31607 8.44129 7.87868 7.87868C8.44129 7.31607 9.20435 7 10 7Z" fill="black"></path></svg>
                </a>
              )}
              {settings?.socials?.tiktok && (
                <a href={settings.socials.tiktok.startsWith('http') ? settings.socials.tiktok : `https://${settings.socials.tiktok}`} target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity dark:invert">
                  {/* TikTok icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="black"><path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/></svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="copyright-section border-t border-gray-200 dark:border-gray-800 py-8 text-sm">
          <div className="w-layout-vflex flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="copyright-content-left flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <div className="design-by-text-wrapper flex gap-1">
                <span className="design-by">Design by</span>
                <a href="https://webflow.com/templates/designers/meta-flow" target="_blank" rel="noreferrer" className="footer-company-linkup text-black dark:text-white font-semibold hover:underline">Meta Flow</a>
              </div>
              <div className="straight-line">|</div>
              <div className="powered-by-text-wrapper flex gap-1">
                <span className="design-by">Powered by</span>
                <a href="https://webflow.com" target="_blank" rel="noreferrer" className="footer-company-linkup text-black dark:text-white font-semibold hover:underline">Webflow</a>
              </div>
            </div>
            
            <div className="copyright-content-middle text-gray-500 dark:text-gray-400 font-medium">
              Copyright @FootLockerDZ. {t({fr: 'Tous droits réservés', ar: 'جميع الحقوق محفوظة'})}
            </div>
            
            <div className="copyright-content-right flex gap-6 font-semibold">
              <Link to="/privacy-policy" className="privacy-policy hover:underline text-gray-900 dark:text-gray-200">{t({fr: 'Politique de confidentialité', ar: 'سياسة الخصوصية'})}</Link>
              <Link to="/terms-conditions" className="privacy-policy terms hover:underline text-gray-900 dark:text-gray-200">{t({fr: 'Conditions Générales', ar: 'الشروط والأحكام'})}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
