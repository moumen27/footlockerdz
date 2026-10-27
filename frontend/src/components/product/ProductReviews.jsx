import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Check } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ProductReviews = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchReviews = async () => {
    try {
      const { data } = await axiosInstance.get(`/reviews/${productId}`);
      setReviews(data);
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      await axiosInstance.post('/reviews', {
        productId,
        rating,
        title,
        comment
      });
      toast.success('Votre avis a été publié avec succès !');
      // Reset form
      setRating(5);
      setTitle('');
      setComment('');
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      const message = error.response?.data?.message || 'Erreur lors de la publication de votre avis.';
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current user has already reviewed
  const userHasReviewed = isAuthenticated && reviews.some(r => r.user?._id === user?._id);

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Chargement des avis...</div>;
  }

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-gray-900" />
        <h2 className="text-3xl font-extrabold text-gray-900">Avis Clients</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Summary & Form */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Summary Box */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
            <div className="text-5xl font-black text-gray-900">{avgRating}</div>
            <div className="flex justify-center gap-1 my-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-6 h-6 ${star <= Math.round(avgRating) ? 'fill-[#F9A826] text-[#F9A826]' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <p className="text-gray-500 font-medium">Basé sur {reviews.length} avis</p>
          </div>

          {/* Add Review Form */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Donnez votre avis</h3>
            
            {!isAuthenticated ? (
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm font-medium">
                Vous devez être connecté et avoir acheté ce produit pour laisser un avis.
              </div>
            ) : userHasReviewed ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium flex items-start gap-2">
                <Check className="w-5 h-5 shrink-0" />
                Merci ! Vous avez déjà donné votre avis sur ce produit.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{formError}</div>
                )}
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Note globale</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        type="button" 
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star className={`w-8 h-8 ${star <= rating ? 'fill-[#F9A826] text-[#F9A826]' : 'text-gray-200 hover:text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Titre de l'avis *</label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Super produit !"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F9A826] focus:border-[#F9A826] outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Votre commentaire *</label>
                  <textarea 
                    required
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Qu'avez-vous pensé de cet article ?"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F9A826] focus:border-[#F9A826] outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-[#11323B] hover:bg-gray-900 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Publier mon avis'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Reviews List */}
        <div className="lg:col-span-2">
          {reviews.length === 0 ? (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-12 text-center h-full flex flex-col items-center justify-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun avis pour le moment</h3>
              <p className="text-gray-500">Soyez le premier à partager votre expérience !</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-[#F9A826] text-[#F9A826]' : 'text-gray-200'}`} 
                          />
                        ))}
                      </div>
                      <h4 className="font-bold text-lg text-gray-900">{review.title}</h4>
                    </div>
                    <span className="text-sm text-gray-400 font-medium">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed mb-4">{review.comment}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-gray-50 inline-flex px-3 py-1.5 rounded-lg">
                    <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-xs uppercase">
                      {review.user?.firstName?.charAt(0) || 'U'}
                    </span>
                    {review.user?.firstName} {review.user?.lastName?.charAt(0)}.
                    <span className="flex items-center text-green-600 ml-2 gap-1 bg-green-100/50 px-2 py-0.5 rounded text-xs font-bold">
                      Achat vérifié
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
