import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { 
  Star, 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Trash2, 
  Search, 
  ShieldAlert, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';

const getAuthorInfo = (userData, defaultLabel = 'Client') => {
  if (!userData) return { displayName: defaultLabel, email: null };

  const fullName = [userData.firstName, userData.lastName].filter(Boolean).join(' ').trim() 
    || (userData.name || '').trim();

  const email = userData.email || null;

  if (fullName) {
    return { displayName: fullName, email };
  }

  if (email) {
    const username = email.split('@')[0];
    return { displayName: username, email };
  }

  return { displayName: defaultLabel, email: null };
};

const AdminReviewsModerationPage = () => {
  const { user } = useAuth();
  const { t, lng } = useLanguage();

  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' | 'comments'
  const [reviews, setReviews] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'approved' | 'rejected'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    if (user?.role !== 'super_admin') return;
    setLoading(true);
    try {
      const [reviewsRes, commentsRes] = await Promise.all([
        axiosInstance.get('/reviews/admin/all').catch(() => ({ data: [] })),
        axiosInstance.get('/comments/admin/all').catch(() => ({ data: [] }))
      ]);

      setReviews(reviewsRes.data || []);
      setComments(commentsRes.data || []);
    } catch (err) {
      toast.error(t({ fr: 'Erreur lors du chargement des données', ar: 'خطأ أثناء تحميل البيانات' }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Review Status Toggle
  const handleToggleReviewStatus = async (review) => {
    const newStatus = review.status === 'approved' ? 'rejected' : 'approved';
    try {
      await axiosInstance.patch(`/reviews/${review._id}/status`, { status: newStatus });
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, status: newStatus } : r));
      toast.success(
        newStatus === 'approved' 
          ? t({ fr: 'Avis approuvé et publié', ar: 'تمت الموافقة على التقييم ونشره' })
          : t({ fr: 'Avis masqué', ar: 'تم إخفاء التقييم' })
      );
    } catch (err) {
      toast.error(t({ fr: 'Erreur lors de la mise à jour', ar: 'خطأ أثناء التحديث' }));
    }
  };

  // Delete Review
  const handleDeleteReview = async (id) => {
    if (!window.confirm(t({ fr: 'Êtes-vous sûr de vouloir supprimer définitivement cet avis ?', ar: 'هل أنت متأكد من حذف هذا التقييم نهائياً؟' }))) return;
    try {
      await axiosInstance.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success(t({ fr: 'Avis supprimé avec succès', ar: 'تم حذف التقييم بنجاح' }));
    } catch (err) {
      toast.error(t({ fr: 'Erreur lors de la suppression', ar: 'خطأ أثناء الحذف' }));
    }
  };

  // Comment Status Toggle
  const handleToggleCommentStatus = async (comment) => {
    const newStatus = comment.status === 'approved' ? 'rejected' : 'approved';
    try {
      await axiosInstance.patch(`/comments/${comment._id}/status`, { status: newStatus });
      setComments(prev => prev.map(c => c._id === comment._id ? { ...c, status: newStatus } : c));
      toast.success(
        newStatus === 'approved'
          ? t({ fr: 'Commentaire approuvé et visible', ar: 'تمت الموافقة على التعليق وجعله مرئياً' })
          : t({ fr: 'Commentaire masqué', ar: 'تم إخفاء التعليق' })
      );
    } catch (err) {
      toast.error(t({ fr: 'Erreur lors de la mise à jour', ar: 'خطأ أثناء التحديث' }));
    }
  };

  // Delete Comment
  const handleDeleteComment = async (id) => {
    if (!window.confirm(t({ fr: 'Êtes-vous sûr de vouloir supprimer définitivement ce commentaire ?', ar: 'هل أنت متأكد من حذف هذا التعليق نهائياً؟' }))) return;
    try {
      await axiosInstance.delete(`/comments/${id}`);
      setComments(prev => prev.filter(c => c._id !== id));
      toast.success(t({ fr: 'Commentaire supprimé avec succès', ar: 'تم حذف التعليق بنجاح' }));
    } catch (err) {
      toast.error(t({ fr: 'Erreur lors de la suppression', ar: 'خطأ أثناء الحذف' }));
    }
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center mt-10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t({ fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)' })}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {t({ fr: 'Cette section est strictement réservée au rôle "Super Admin".', ar: 'هذا القسم مخصص حصريًا لدور "المشرف المتميز".' })}
        </p>
      </div>
    );
  }

  // Filter items
  const filteredReviews = reviews.filter(r => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const authorName = `${r.user?.firstName || ''} ${r.user?.lastName || ''}`.toLowerCase();
    const productName = (r.product?.name?.fr || r.product?.name?.ar || '').toLowerCase();
    const textMatch = (r.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (r.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      authorName.includes(searchTerm.toLowerCase()) ||
                      productName.includes(searchTerm.toLowerCase());
    return matchesStatus && textMatch;
  });

  const filteredComments = comments.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const authorName = `${c.user?.firstName || ''} ${c.user?.lastName || ''}`.toLowerCase();
    const productName = (c.product?.name?.fr || c.product?.name?.ar || '').toLowerCase();
    const textMatch = (c.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      authorName.includes(searchTerm.toLowerCase()) ||
                      productName.includes(searchTerm.toLowerCase());
    return matchesStatus && textMatch;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-emerald-600" />
            {t({ fr: 'Modération des Avis & Commentaires', ar: 'إشراف على التقييمات والتعليقات' })}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {t({ 
              fr: 'Consultez, publiez ou masquez les avis et les questions déposés par les clients.', 
              ar: 'عرض ونشر أو إخفاء التقييمات والأسئلة المقدمة من العملاء.' 
            })}
          </p>
        </div>

        {/* Global counters */}
        <div className="flex gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
            {reviews.length} {t({ fr: 'Avis', ar: 'تقييمات' })}
          </span>
          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 rounded-lg border border-purple-200 dark:border-purple-800">
            {comments.length} {t({ fr: 'Commentaires', ar: 'تعليقات' })}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          {t({ fr: 'Avis Produits', ar: 'تقييمات المنتجات' })} ({reviews.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-purple-500" />
          {t({ fr: 'Commentaires & Questions', ar: 'التعليقات والأسئلة' })} ({comments.length})
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className={`w-4 h-4 text-gray-400 absolute top-1/2 -translate-y-1/2 ${lng === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t({ fr: 'Rechercher auteur, produit, mot...', ar: 'بحث عن الكاتب، المنتج...' })}
            className={`w-full py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${lng === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t({ fr: 'Statut :', ar: 'الحالة :' })}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">{t({ fr: 'Tous les statuts', ar: 'جميع الحالات' })}</option>
            <option value="approved">{t({ fr: 'Publiés (Visibles)', ar: 'منشورة (مرئية)' })}</option>
            <option value="rejected">{t({ fr: 'Masqués (Rejetés)', ar: 'مخفية (مرفوضة)' })}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-600"></div>
        </div>
      ) : activeTab === 'reviews' ? (
        // REVIEWS LIST
        filteredReviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400">
            <Star className="w-12 h-12 mx-auto mb-3 opacity-30 text-amber-500" />
            <p className="font-semibold">{t({ fr: 'Aucun avis trouvé.', ar: 'لا توجد تقييمات مطابقة.' })}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const { displayName: author, email: authorEmail } = getAuthorInfo(review.user, 'Client anonyme');
              const isApproved = review.status === 'approved';
              const prod = review.product;
              const prodName = prod?.name?.fr || prod?.name?.ar || 'Produit';

              return (
                <div 
                  key={review._id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl p-5 border transition-all shadow-sm ${
                    isApproved 
                      ? 'border-gray-200 dark:border-gray-700' 
                      : 'border-red-200 dark:border-red-900/50 bg-red-50/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">{author}</span>
                          {authorEmail && (
                            <span className="text-xs text-gray-400">({authorEmail})</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString(lng === 'ar' ? 'ar-DZ' : 'fr-FR', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          {t({ fr: 'Publié (Visible)', ar: 'منشور (مرئي)' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          {t({ fr: 'Masqué (Rejeté)', ar: 'مخفي (مرفوض)' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product & Review Content */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Product info */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                        {prod?.variants?.[0]?.images?.[0] ? (
                          <img src={prod.variants[0].images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{prodName}</p>
                        {prod?.sku && <p className="text-[10px] text-gray-400">{prod.sku}</p>}
                      </div>
                    </div>

                    {/* Stars + Title + Comment */}
                    <div className="md:col-span-3 space-y-1.5">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} 
                          />
                        ))}
                        <span className="text-xs font-bold ml-1.5 text-gray-700 dark:text-gray-300">
                          {review.rating}/5
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-base">{review.title}</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-900/20 p-2.5 rounded border border-gray-100 dark:border-gray-800">
                        "{review.comment}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <button
                      onClick={() => handleToggleReviewStatus(review)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        isApproved
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-green-50 hover:bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          {t({ fr: 'Masquer l\'avis', ar: 'إخفاء التقييم' })}
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          {t({ fr: 'Publier l\'avis', ar: 'نشر التقييم' })}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t({ fr: 'Supprimer', ar: 'حذف' })}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // COMMENTS LIST
        filteredComments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-12 text-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30 text-purple-500" />
            <p className="font-semibold">{t({ fr: 'Aucun commentaire trouvé.', ar: 'لا توجد تعليقات مطابقة.' })}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredComments.map((comment) => {
              const { displayName: author, email: authorEmail } = getAuthorInfo(comment.user, 'Visiteur');
              const isApproved = comment.status === 'approved';
              const prod = comment.product;
              const prodName = prod?.name?.fr || prod?.name?.ar || 'Produit';

              return (
                <div 
                  key={comment._id} 
                  className={`bg-white dark:bg-gray-800 rounded-xl p-5 border transition-all shadow-sm ${
                    isApproved 
                      ? 'border-gray-200 dark:border-gray-700' 
                      : 'border-red-200 dark:border-red-900/50 bg-red-50/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-sm">
                        {author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">{author}</span>
                          {authorEmail && (
                            <span className="text-xs text-gray-400">({authorEmail})</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(comment.createdAt).toLocaleDateString(lng === 'ar' ? 'ar-DZ' : 'fr-FR', {
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isApproved ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          {t({ fr: 'Publié (Visible)', ar: 'منشور (مرئي)' })}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          {t({ fr: 'Masqué (Rejeté)', ar: 'مخفي (مرفوض)' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product & Comment Content */}
                  <div className="py-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Product info */}
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded flex items-center justify-center shrink-0 overflow-hidden border border-gray-200 dark:border-gray-600">
                        {prod?.variants?.[0]?.images?.[0] ? (
                          <img src={prod.variants[0].images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{prodName}</p>
                        {prod?.sku && <p className="text-[10px] text-gray-400">{prod.sku}</p>}
                      </div>
                    </div>

                    {/* Comment Text */}
                    <div className="md:col-span-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50/50 dark:bg-gray-900/20 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                        "{comment.content}"
                      </p>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex justify-end items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/60">
                    <button
                      onClick={() => handleToggleCommentStatus(comment)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                        isApproved
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-green-50 hover:bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200 dark:border-green-800'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          {t({ fr: 'Masquer', ar: 'إخفاء' })}
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          {t({ fr: 'Publier', ar: 'نشر' })}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="px-3.5 py-1.5 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t({ fr: 'Supprimer', ar: 'حذف' })}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default AdminReviewsModerationPage;
