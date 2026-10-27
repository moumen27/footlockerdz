import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquare, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../api/axios';

const AccountReviewsPage = () => {
  const { t, isAr } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axiosInstance.get('/reviews/user/me');
        setReviews(data);
      } catch (error) {
        console.error("Erreur lors du chargement des avis:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#11323B]"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">{t({ fr: 'Mes avis', ar: 'تقييماتي' })}</h2>
      
      {reviews.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#11323B]/10 text-[#11323B] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t({ fr: 'Aucun avis publié', ar: 'لم يتم نشر أي تقييمات' })}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {t({ fr: "Vous n'avez pas encore laissé d'avis sur nos produits. Partagez votre expérience !", ar: "لم تقم بترك أي تقييمات لمنتجاتنا حتى الآن. شارك تجربتك!" })}
          </p>
          <Link to="/shop?purchased=true" className="inline-block bg-[#11323B] text-white px-6 py-2 hover:bg-gray-800 transition-colors">
            {t({ fr: 'Voir mes produits achetés', ar: 'عرض منتجاتي المشتراة' })}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-[#F9A826] text-[#F9A826]' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 text-lg mb-1">
                {review.product?.name ? (typeof review.product.name === 'object' ? (isAr ? review.product.name.ar : review.product.name.fr) : review.product.name) : 'Produit inconnu'}
              </h4>
              {review.title && <p className="font-bold text-gray-800 text-sm mb-1">{review.title}</p>}
              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-md">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountReviewsPage;
