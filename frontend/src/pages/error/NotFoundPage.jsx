import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const { t, isAr } = useLanguage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[var(--bg)] transition-colors px-4 py-20" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t({fr: 'Page Introuvable – FootLockerDZ', ar: 'الصفحة غير موجودة – FootLockerDZ'})}</title>
      </Helmet>

      <div className="max-w-2xl w-full text-center space-y-8">
        
        {/* Animated 404 Graphic */}
        <div className="relative">
          <h1 className="text-[150px] md:text-[200px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-800 dark:to-gray-900 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <div className="bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-gray-100 dark:border-gray-800 shadow-xl mb-4 transform -rotate-2">
              <span className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">
                {t({fr: 'Oups !', ar: 'أوبس !'})}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {t({
              fr: 'Cette page a fait fausse route', 
              ar: 'هذه الصفحة اتخذت طريقا خاطئا'
            })}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
            {t({
              fr: 'La page que vous recherchez semble introuvable. Elle a peut-être été déplacée, supprimée, ou le lien est cassé.', 
              ar: 'يبدو أن الصفحة التي تبحث عنها غير موجودة. ربما تم نقلها، حذفها، أو الرابط مكسور.'
            })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            to="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#006233] hover:bg-[#004e28] text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <Home className="w-5 h-5" />
            {t({fr: 'Retour à l\'accueil', ar: 'العودة للصفحة الرئيسية'})}
          </Link>
          <Link 
            to="/shop" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm hover:shadow-md"
          >
            <Search className="w-5 h-5" />
            {t({fr: 'Explorer la boutique', ar: 'استكشف المتجر'})}
          </Link>
        </div>
        
        {/* Support Link */}
        <div className="pt-12">
          <Link to="/contact" className="text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors underline-offset-4 hover:underline">
            {t({fr: 'Besoin d\'aide ? Contactez notre support', ar: 'هل تحتاج إلى مساعدة؟ اتصل بالدعم'})}
          </Link>
        </div>

      </div>
    </div>
  );
}
