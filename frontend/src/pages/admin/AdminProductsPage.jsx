import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, AlertCircle, Send, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosInstance from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { newsletterApi } from '../../api/newsletterApi';

const AdminProductsPage = () => {
  const { user } = useAuth();
  const { t, lng } = useLanguage();
  const queryClient = useQueryClient();
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingProductId, setSendingProductId] = useState(null);

  if (user?.role === 'admin_orders') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center mt-10">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t({fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)'})}</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          {t({fr: 'Votre compte possède le rôle "Admin Commandes". La gestion du catalogue et des produits vous est inaccessible.', ar: 'حسابك لديه دور "مسؤول الطلبات". إدارة الكتالوج والمنتجات غير متاحة لك.'})}
        </p>
      </div>
    );
  }
  
  // Pagination & Search
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Constructing query string
      const params = new URLSearchParams();
      if (search) params.append('search', search);

      // We use the public /products endpoint (which supports search/pagination).
      // Assuming it returns data as an array. If it returns an object with pagination, we'll adapt.
      // Wait, shopApi uses `/products?search=...` and data is an array in shopApi.js (or an object?).
      // Let's assume it returns an array for now, or adapt based on shopApi.
      const response = await axiosInstance.get(`/products?${params.toString()}`);
      
      // Some backends return { data, total, pages }, others just an array.
      if (Array.isArray(response.data)) {
        setAllProducts(response.data);
        setTotalPages(Math.ceil(response.data.length / limit) || 1);
      } else if (response.data && response.data.products) {
        setAllProducts(response.data.products);
        setTotalPages(response.data.pages || 1);
      } else {
        setAllProducts([]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t({fr: 'Erreur lors du chargement des produits.', ar: 'خطأ أثناء تحميل المنتجات.'}));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]); // Removed page so it doesn't refetch on page change

  useEffect(() => {
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    setProducts(allProducts.slice(startIdx, endIdx));
  }, [allProducts, page, limit]);

  const handleDelete = async (id) => {
    if (window.confirm(t({fr: 'Voulez-vous vraiment supprimer ce produit ?', ar: 'هل تريد حقًا حذف هذا المنتج؟'}))) {
      try {
        await axiosInstance.delete(`/products/${id}`); 
        const newAll = allProducts.filter(p => (p._id || p.id) !== id);
        setAllProducts(newAll);
        setTotalPages(Math.ceil(newAll.length / limit) || 1);
        queryClient.invalidateQueries({ queryKey: ['products'] });
      } catch (err) {
        alert(t({fr: 'Erreur lors de la suppression.', ar: 'خطأ أثناء الحذف.'}));
      }
    }
  };

  const handleBroadcastProduct = async (product) => {
    const pName = product.name?.fr || product.name || 'ce produit';
    const confirmed = window.confirm(t({
      fr: `Envoyer un email d'annonce de la nouveauté « ${pName} » à tous les abonnés de la newsletter ?`,
      ar: `هل تريد إرسال إعلان عن « ${pName} » إلى جميع المشتركين في النشرة الإخبارية؟`
    }));

    if (!confirmed) return;

    const prodId = product._id || product.id;
    setSendingProductId(prodId);
    try {
      const res = await newsletterApi.broadcastProduct(prodId);
      toast.success(res.message || t({
        fr: `Email envoyé avec succès aux abonnés !`,
        ar: `تم إرسال البريد الإلكتروني بنجاح للمشتركين!`
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || t({
        fr: `Erreur lors de l'envoi de l'email aux abonnés.`,
        ar: `حدث خطأ أثناء إرسال البريد للمشتركين.`
      }));
    } finally {
      setSendingProductId(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on new search
  };

  return (
    <div className="space-y-6" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Produits', ar: 'المنتجات'})}</h1>
        <Link 
          to="/admin/products/new" 
          className="inline-flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t({fr: 'Ajouter un produit', ar: 'إضافة منتج'})}
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center">
        <div className="relative w-full max-w-md">
          <Search className={`absolute ${lng === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
          <input 
            type="text" 
            placeholder={t({fr: 'Rechercher par nom, SKU...', ar: 'البحث بالاسم أو SKU...'})} 
            value={search}
            onChange={handleSearchChange}
            className={`w-full ${lng === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white outline-none dark:text-white`}
          />
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs uppercase text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-6 py-4 font-medium">{t({fr: 'Image', ar: 'صورة'})}</th>
                  <th className="px-6 py-4 font-medium">{t({fr: 'SKU', ar: 'SKU'})}</th>
                  <th className="px-6 py-4 font-medium">{t({fr: 'Nom', ar: 'الاسم'})}</th>
                  <th className="px-6 py-4 font-medium">{t({fr: 'Prix', ar: 'السعر'})}</th>
                  <th className="px-6 py-4 font-medium">{t({fr: 'Stock Global', ar: 'المخزون الإجمالي'})}</th>
                  <th className={`px-6 py-4 font-medium ${lng === 'ar' ? 'text-left' : 'text-right'}`}>{t({fr: 'Actions', ar: 'إجراءات'})}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-black border-t-transparent dark:border-white dark:border-t-transparent rounded-full mx-auto"></div>
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      {t({fr: 'Aucun produit trouvé.', ar: 'لم يتم العثور على أي منتج.'})}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    const imgUrl = product.variants?.[0]?.images?.[0] || 'https://via.placeholder.com/50';
                    const name = product.name?.fr || product.name || 'Sans nom';
                    // Calculate global stock
                    const totalStock = product.variants 
                      ? product.variants.reduce((acc, v) => acc + (v.stock || 0), 0)
                      : (product.totalStock || 0);

                    return (
                      <tr key={product._id || product.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <td className="px-6 py-4">
                          <img src={imgUrl} alt={name} className="w-12 h-12 rounded object-cover border border-gray-200 dark:border-gray-700" />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 max-w-[200px] truncate">
                          {name}
                        </td>
                        <td className="px-6 py-4">
                          {product.price} DZD
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            totalStock > 10 ? 'bg-green-100 text-green-700' :
                            totalStock > 0 ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {totalStock} {t({fr: 'unités', ar: 'وحدة'})}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              type="button"
                              onClick={() => handleBroadcastProduct(product)}
                              disabled={sendingProductId === (product._id || product.id)}
                              className="text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
                              title={t({ fr: "Diffuser aux abonnés par email", ar: "إرسال للمشتركين عبر البريد" })}
                            >
                              {sendingProductId === (product._id || product.id) ? (
                                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                              ) : (
                                <Send className="w-5 h-5" />
                              )}
                            </button>
                            <Link 
                              to={`/admin/products/${product._id || product.id}`}
                              className="text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                              title="Éditer"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(product._id || product.id)}
                              className="text-gray-500 hover:text-red-600 transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t({fr: 'Précédent', ar: 'السابق'})}
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t({fr: `Page ${page} sur ${totalPages}`, ar: `صفحة ${page} من ${totalPages}`})}
              </span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t({fr: 'Suivant', ar: 'التالي'})}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
