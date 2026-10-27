import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        await axiosInstance.post('/stripe/mark-paid', { orderId });
        clearCart();
      } catch (error) {
        console.error('Erreur lors de la confirmation du paiement', error);
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9A826]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 shadow-sm border border-gray-200 rounded-xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600 w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Paiement Réussi !</h1>
        <p className="text-gray-600 mb-8">
          Merci pour votre commande. Votre paiement a été traité avec succès et votre commande est maintenant confirmée.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/account/orders" 
            className="w-full bg-[#11323B] text-white py-3 font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Voir mes commandes
          </Link>
          <Link 
            to="/shop" 
            className="w-full bg-gray-100 text-gray-900 py-3 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            Continuer mes achats <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
