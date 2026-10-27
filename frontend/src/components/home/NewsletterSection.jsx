import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { newsletterApi } from '../../api/newsletterApi';

export default function NewsletterSection() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage(t({
        fr: "Veuillez entrer une adresse email valide.",
        ar: "يرجى إدخال بريد إلكتروني صالح."
      }));
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await newsletterApi.subscribe(email);
      setStatus('success');
      setSuccessMessage(res?.message || t({
        fr: "Merci pour votre inscription ! Vous recevrez nos offres et nouveautés en avant-première.",
        ar: "شكراً لاشتراكك! ستصلك أحدث عروضنا وتخفيضاتنا أولاً بأول في بريدك الإلكتروني."
      }));
      setEmail('');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.message || t({
        fr: "Une erreur est survenue lors de l'inscription.",
        ar: "حدث خطأ أثناء التسجيل."
      }));
    }
  };

  return (
    <div className="py-20 bg-[#f1f1f1] dark:bg-gray-800 transition-colors">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t({ fr: "Rejoignez notre Newsletter", ar: "اشترك في النشرة الإخبارية" })}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {t({
              fr: "Inscrivez-vous pour recevoir nos dernières offres, nouveautés et conseils de style directement dans votre boîte mail.",
              ar: "سجل لتلقي أحدث عروضنا، إصداراتنا ونصائح الأناقة مباشرة في بريدك الإلكتروني."
            })}
          </p>

          {status === 'success' ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-6 py-4 rounded-xl flex items-center justify-center gap-3 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="font-medium text-sm sm:text-base">
                {successMessage}
              </p>
            </div>
          ) : (
            <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={handleSubmit}>
              <div className="flex-1 max-w-sm">
                <label htmlFor="newsletter-email-input" className="sr-only">
                  {t({ fr: "Votre adresse email", ar: "بريدك الإلكتروني" })}
                </label>
                <input 
                  id="newsletter-email-input"
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t({ fr: "Votre adresse email", ar: "بريدك الإلكتروني" })} 
                  className="w-full px-6 py-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  required 
                  disabled={status === 'loading'}
                />
              </div>
              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="min-h-[48px] px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-xl hover:bg-black dark:hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-emerald-500 transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t({ fr: "Envoi...", ar: "جاري الإرسال..." })}</span>
                  </>
                ) : (
                  <span>{t({ fr: "S'inscrire", ar: "اشتراك" })}</span>
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
