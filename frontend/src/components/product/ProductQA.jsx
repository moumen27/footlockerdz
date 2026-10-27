import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CornerDownRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const ProductQA = ({ productId }) => {
  const { t, lng, isAr } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQ, setNewQ] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/comments/${productId}`);
      setComments(res.data || []);
    } catch (err) {
      console.error('Erreur chargement questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!newQ.trim()) return;

    if (!isAuthenticated) {
      toast.info(t('Veuillez vous connecter pour poser une question'));
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/comments', {
        productId,
        content: newQ.trim()
      });
      toast.success(t({ fr: 'Votre question a été publiée avec succès !', ar: 'تم إرسال سؤالك بنجاح!' }));
      setNewQ('');
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('Erreur lors de l\'envoi'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (parentCommentId) => {
    if (!replyText.trim()) return;

    if (!isAuthenticated) {
      toast.info(t('Veuillez vous connecter pour répondre'));
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/comments', {
        productId,
        content: replyText.trim(),
        parentCommentId
      });
      toast.success(t({ fr: 'Réponse envoyée !', ar: 'تم إرسال الرد!' }));
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || t('Erreur lors de l\'envoi'));
    } finally {
      setSubmitting(false);
    }
  };

  // Separate parent questions and replies
  const parentQuestions = comments.filter(c => !c.parentComment);
  const getReplies = (parentId) => comments.filter(c => c.parentComment === parentId);

  return (
    <div className="max-w-3xl">
      {/* Ask Question Form */}
      <div className="mb-10 bg-white dark:bg-gray-800/80 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#006233]" />
          {t({ fr: 'Poser une question sur ce produit', ar: 'طرح سؤال حول هذا المنتج' })}
        </h4>
        <p className="text-sm text-gray-500 mb-4">
          {t({ fr: 'Une hésitation sur la taille, la matière ou la livraison ? Notre équipe et la communauté vous répondent.', ar: 'هل لديك استفسار حول المقاس، المادة أو التوصيل؟ فريقنا والمجتمع يجيبونك.' })}
        </p>

        {isAuthenticated ? (
          <form onSubmit={handleSubmitQuestion} className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              placeholder={t({ fr: 'Ex: Sont-elles adaptées pour la course sur tapis ?', ar: 'مثال: هل هي مناسبة للجري على جهاز المشي؟' })} 
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#006233] outline-none transition"
              required
            />
            <button 
              type="submit" 
              disabled={submitting || !newQ.trim()}
              className="px-6 py-3 bg-[#006233] hover:bg-[#004e28] disabled:opacity-50 text-white font-medium rounded-xl whitespace-nowrap transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? t({ fr: 'Envoi...', ar: 'جارٍ الإرسال...' }) : t({ fr: 'Envoyer', ar: 'إرسال' })}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t({ fr: 'Connectez-vous pour poser votre question et recevoir une réponse.', ar: 'قم بتسجيل الدخول لطرح سؤالك وتلقي الإجابة.' })}
            </span>
            <Link 
              to="/login"
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg hover:opacity-90 transition whitespace-nowrap"
            >
              {t({ fr: 'Se connecter', ar: 'تسجيل الدخول' })}
            </Link>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <h5 className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-between">
          <span>{t({ fr: 'Questions & Réponses', ar: 'الأسئلة والأجوبة' })} ({parentQuestions.length})</span>
        </h5>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 h-28 rounded-2xl"></div>
            ))}
          </div>
        ) : parentQuestions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
             <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#006233]" />
             <p className="font-medium text-gray-600 dark:text-gray-400">{t({ fr: 'Aucune question pour le moment. Soyez le premier !', ar: 'لا توجد أسئلة حتى الآن. كن أول من يسأل!' })}</p>
          </div>
        ) : (
          parentQuestions.map((item) => {
            const replies = getReplies(item._id);
            const author = item.user 
              ? ([item.user.firstName, item.user.lastName].filter(Boolean).join(' ').trim() || item.user.name || (item.user.email ? item.user.email.split('@')[0] : 'Client'))
              : t({ fr: 'Client', ar: 'زبون' });

            return (
              <div key={item._id} className="bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700/80 p-6 rounded-2xl shadow-sm">
                {/* Question Item */}
                <div className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#006233] dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                    Q
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg text-gray-900 dark:text-white leading-relaxed">{item.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span className="font-medium text-gray-600 dark:text-gray-300">{author}</span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString(lng === 'ar' ? 'ar-DZ' : 'fr-FR', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>

                {/* Replies Thread (1 level) */}
                <div className="mt-4 pl-6 sm:pl-12 space-y-3 border-l-2 border-emerald-500/20 dark:border-emerald-500/30 ml-4">
                  {replies.length > 0 ? (
                    replies.map(reply => {
                      const replyAuthor = reply.user ? `${reply.user.firstName || ''} ${reply.user.lastName || ''}`.trim() || 'Équipe FootLockerDZ' : t({ fr: 'Équipe FootLockerDZ', ar: 'فريق FootLockerDZ' });
                      const isAdmin = reply.user?.role === 'super_admin' || reply.user?.role === 'admin';

                      return (
                        <div key={reply._id} className="bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl flex gap-3 items-start">
                          <div className="w-7 h-7 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            R
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">{replyAuthor}</span>
                              {isAdmin && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                                  <ShieldCheck className="w-3 h-3" /> Staff
                                </span>
                              )}
                              <span className="text-[11px] text-gray-400">
                                {new Date(reply.createdAt).toLocaleDateString(lng === 'ar' ? 'ar-DZ' : 'fr-FR', {
                                  month: 'short', day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-200">{reply.content}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-gray-400 italic py-1">
                      {t({ fr: 'En attente de réponse par l\'équipe ou la communauté...', ar: 'في انتظار الرد من الفريق أو المجتمع...' })}
                    </p>
                  )}

                  {/* Reply Button / Form */}
                  {replyingTo === item._id ? (
                    <div className="pt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={t({ fr: 'Votre réponse...', ar: 'إجابتك...' })}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#006233]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendReply(item._id)}
                          disabled={submitting || !replyText.trim()}
                          className="px-4 py-2 bg-[#006233] text-white text-sm font-semibold rounded-lg hover:bg-[#004e28] disabled:opacity-50"
                        >
                          {t({ fr: 'Répondre', ar: 'رد' })}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setReplyingTo(null); setReplyText(''); }}
                          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                          {t({ fr: 'Annuler', ar: 'إلغاء' })}
                        </button>
                      </div>
                    </div>
                  ) : (
                    isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => { setReplyingTo(item._id); setReplyText(''); }}
                        className="text-xs font-semibold text-[#006233] hover:underline flex items-center gap-1 pt-1"
                      >
                        <CornerDownRight className="w-3.5 h-3.5" />
                        {t({ fr: 'Ajouter une réponse', ar: 'إضافة رد' })}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductQA;
