import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

export default function VerifyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const { t } = useTranslation();
  const { isAr } = useLanguage();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const hasCalledRef = useRef(false);

  useEffect(() => {
    if (!token || hasCalledRef.current) return;
    hasCalledRef.current = true;
    
    const verify = async () => {
      const res = await verifyEmail(token);
      if (res.success) {
        setStatus('success');
        // Redirect to login page after 2 seconds with success message
        setTimeout(() => {
          navigate('/auth?verify=success', { replace: true });
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage(res.message[isAr ? 'ar' : 'fr'] || res.message);
      }
    };
    
    verify();
  }, [token, verifyEmail, navigate, isAr]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === 'loading' && (
          <div>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#006233] border-t-transparent mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isAr ? 'جاري التحقق من بريدك الإلكتروني...' : 'Vérification de votre email en cours...'}
            </h2>
          </div>
        )}
        
        {status === 'success' && (
          <div>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isAr ? 'تم التحقق بنجاح!' : 'Vérification réussie !'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {isAr ? 'سيتم توجيهك إلى صفحة تسجيل الدخول...' : 'Redirection vers la page de connexion...'}
            </p>
          </div>
        )}
        
        {status === 'error' && (
          <div>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {isAr ? 'فشل التحقق' : 'Échec de la vérification'}
            </h2>
            <p className="text-red-500 mb-6">{errorMessage}</p>
            <button 
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-[#006233] text-white font-semibold rounded-xl hover:bg-[#004e28] transition-colors"
            >
              {isAr ? 'العودة لتسجيل الدخول' : 'Retour à la connexion'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
