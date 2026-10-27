import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import logodark from '../../assets/icons/logo-dark.jpg';
import logolight from '../../assets/icons/logo-light.jpg';

// Normalisation du téléphone vers E.164 (CDC)
const normalizeIdentifier = (val) => {
  const trimmed = val.trim();
  // Regex pour numéro local DZ (05, 06, 07)
  if (/^0[567]\d{8}$/.test(trimmed)) {
    return '+213' + trimmed.substring(1);
  }
  // Nettoyage des espaces pour le format international
  const noSpaces = trimmed.replace(/\s/g, '');
  if (/^\+213[567]\d{8}$/.test(noSpaces)) {
    return noSpaces;
  }
  // Par défaut, on le traite comme un email
  return trimmed;
};

export default function AuthPage() {
  const { token } = useParams();
  const [mode, setMode] = useState(token ? 'reset' : 'login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  
  // Form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { t } = useTranslation();
  const { isAr } = useLanguage();
  const { login, register, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const identifierRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  useEffect(() => {
    if (token) setMode('reset');
  }, [token]);

  const toggleMode = (newMode) => {
    setMode(newMode);
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    setIsLoading(true);

    const normalizedIdentifier = normalizeIdentifier(identifier);

    try {
      if (mode === 'login') {
        // We pass the identifier as email to match backend for now
        const res = await login(normalizedIdentifier, password);
        if (res.success) {
          const searchParams = new URLSearchParams(location.search);
          const next = searchParams.get('next') || '/';
          navigate(next);
        } else {
          setApiError(res.message[isAr ? 'ar' : 'fr'] || res.message);
          identifierRef.current?.focus();
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
           setApiError(isAr ? 'كلمتا المرور غير متطابقتين' : 'Les mots de passe ne correspondent pas');
           confirmPasswordRef.current?.focus();
           setIsLoading(false);
           return;
        }
        if (!termsAccepted) {
           setApiError(isAr ? 'يجب الموافقة على الشروط' : 'Vous devez accepter les CGV');
           setIsLoading(false);
           return;
        }
        const res = await register({ email: normalizedIdentifier, password, name: fullName });
        if (res.success) {
           setMode('login');
           setApiSuccess(isAr ? 'تم إرسال رابط التحقق إلى بريدك الإلكتروني.' : 'Un lien de vérification a été envoyé à votre email.');
        } else {
          setApiError(res.message[isAr ? 'ar' : 'fr'] || res.message);
          identifierRef.current?.focus();
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(normalizedIdentifier);
        if (res.success) {
           setApiSuccess(isAr ? 'تم إرسال رابط إعادة التعيين' : 'Lien de réinitialisation envoyé');
           setIdentifier('');
        } else {
          setApiError(res.message[isAr ? 'ar' : 'fr'] || res.message);
          identifierRef.current?.focus();
        }
      } else if (mode === 'reset') {
        const res = await resetPassword(token, password);
        if (res.success) {
           setMode('login');
           setApiSuccess(isAr ? 'تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول.' : 'Mot de passe modifié avec succès. Veuillez vous connecter.');
        } else {
          setApiError(res.message[isAr ? 'ar' : 'fr'] || res.message);
          passwordRef.current?.focus();
        }
      }
    } catch (err) {
      setApiError(isAr ? 'حدث خطأ غير متوقع' : 'Une erreur inattendue est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'login') return t('Bon retour !');
    if (mode === 'register') return t('Créer un compte');
    if (mode === 'forgot') return t('Mot de passe oublié ?');
    if (mode === 'reset') return t('Nouveau mot de passe');
  };

  const getSubtitle = () => {
    if (mode === 'login') return t('Veuillez entrer vos identifiants pour vous connecter.');
    if (mode === 'register') return t('Remplissez le formulaire ci-dessous pour nous rejoindre.');
    if (mode === 'forgot') return t('Entrez votre identifiant pour recevoir un lien.');
    if (mode === 'reset') return t('Saisissez votre nouveau mot de passe.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300 p-4 sm:p-8" dir={isAr ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{getTitle()} - FootLockerDZ</title>
      </Helmet>

      <div className="w-full max-w-6xl bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] relative">
        
        {/* Left Side: Image / Branding */}
        <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden group">
          <img 
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Sneakers" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          <div className="absolute top-8 left-8 z-10">
            <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-black/40">
              <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              {t('Retour à l\'accueil')}
            </Link>
          </div>

          <div className="absolute bottom-12 left-12 right-12 text-white z-10">
            <div className="inline-block px-3 py-1 bg-[#006233] text-white text-xs font-bold uppercase tracking-wider rounded-md mb-4">FootLockerDZ</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              {mode === 'login' ? t('Rejoignez le mouvement.') : t('Bienvenue dans la famille.')}
            </h2>
            <p className="text-gray-300 font-medium text-lg max-w-md">
              {t('Découvrez les dernières tendances, accédez à des exclusivités et profitez d\'offres réservées aux membres.')}
            </p>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center relative bg-white dark:bg-gray-800 transition-colors duration-300">
          
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <img src={logolight} alt="Footlocker Logo" className="h-16 dark:hidden" />
              <img src={logodark} alt="Footlocker Logo" className="h-16 hidden dark:block" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {getTitle()}
            </h3>
            <p className="text-gray-500 mb-8 text-center">
              {getSubtitle()}
            </p>

            {location.search.includes('verify=success') && (
              <div 
                className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium text-center border border-green-200 dark:border-green-800/50 mb-6"
              >
                {isAr ? 'تم التحقق من بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.' : 'Email validé avec succès ! Vous pouvez maintenant vous connecter.'}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              
              {apiError && (
                <div 
                  className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-medium text-center border border-red-200 dark:border-red-800/50"
                  role="alert"
                  aria-live="assertive"
                >
                  {apiError}
                </div>
              )}

              {apiSuccess && (
                <div 
                  className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-medium text-center border border-green-200 dark:border-green-800/50"
                  role="status"
                  aria-live="polite"
                >
                  {apiSuccess}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('Nom complet')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#006233] transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input 
                      id="fullName"
                      type="text" 
                      placeholder={t('entrer votre nom')}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all text-gray-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              )}

              {mode !== 'reset' && (
                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {t('Email ou Numéro de téléphone')}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#006233] transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input 
                      id="identifier"
                      ref={identifierRef}
                      type="text" 
                      placeholder={isAr ? 'أدخل بريدك الإلكتروني أو رقم هاتفك' : 'entrer votre email ou telephone'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      aria-invalid={!!apiError}
                      aria-describedby={apiError ? "auth-error" : undefined}
                      className={`w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium ${apiError ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#006233] focus:border-[#006233]'}`}
                    />
                  </div>
                </div>
              )}

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('Mot de passe')}</label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => toggleMode('forgot')} className="text-sm text-[#006233] hover:underline font-semibold focus:outline-none">
                        {t('Mot de passe oublié ?')}
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#006233] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      id="password"
                      ref={passwordRef}
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      aria-invalid={mode === 'reset' && !!apiError}
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all text-gray-900 dark:text-white font-medium"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">{t('Confirmer le mot de passe')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#006233] transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input 
                      id="confirmPassword"
                      ref={confirmPasswordRef}
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all text-gray-900 dark:text-white font-medium"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="flex items-start mt-4">
                  <div className="flex items-center h-5">
                    <input 
                      id="terms" 
                      type="checkbox" 
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4 h-4 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-[#006233] dark:bg-gray-700 dark:border-gray-600 accent-[#006233]" 
                      required 
                    />
                  </div>
                  <label htmlFor="terms" className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    {t('J\'accepte les')} <Link to="/terms" className="text-[#006233] hover:underline font-medium focus:outline-none">{t('Conditions Générales de Vente')}</Link>
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-[#006233] hover:bg-[#004e28] text-white font-bold py-4 px-4 rounded-xl transition-all active:scale-[0.98] mt-4 shadow-lg shadow-[#006233]/25 hover:shadow-xl hover:shadow-[#006233]/40 disabled:opacity-70 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006233] dark:focus:ring-offset-gray-800"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {t('Chargement...')}
                  </span>
                ) : (
                  mode === 'login' ? t('Se connecter') : 
                  mode === 'register' ? t('Créer mon compte') : 
                  mode === 'forgot' ? t('Envoyer le lien') : 
                  t('Réinitialiser')
                )}
              </button>

              {/* Informative text for CGV on non-register modes */}
              {mode !== 'register' && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
                  {t('En continuant, vous acceptez nos')} <Link to="/terms" className="text-[#006233] hover:underline focus:outline-none">{t('Conditions Générales de Vente')}</Link>.
                </p>
              )}
            </form>

            <p className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              {mode === 'login' && (
                <>
                  {t('Vous n\'avez pas de compte ?')}{' '}
                  <button type="button" onClick={() => toggleMode('register')} className="text-[#006233] font-bold hover:underline focus:outline-none ml-1">
                    {t('Inscrivez-vous')}
                  </button>
                </>
              )}
              {mode === 'register' && (
                <>
                  {t('Vous avez déjà un compte ?')}{' '}
                  <button type="button" onClick={() => toggleMode('login')} className="text-[#006233] font-bold hover:underline focus:outline-none ml-1">
                    {t('Connectez-vous')}
                  </button>
                </>
              )}
              {mode === 'forgot' && (
                <>
                  <button type="button" onClick={() => toggleMode('login')} className="text-[#006233] font-bold hover:underline focus:outline-none flex items-center justify-center w-full">
                    <ArrowLeft className="w-4 h-4 mr-1" /> {t('Retour à la connexion')}
                  </button>
                </>
              )}
            </p>

          </div>
        </div>
      </div>
      
      {/* Hidden element for screen readers to announce errors */}
      <div id="auth-error" className="sr-only" aria-live="assertive">
        {apiError}
      </div>
    </div>
  );
}
