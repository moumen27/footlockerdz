import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axios';
import { ArrowLeft, Package, Truck, CreditCard, Clock, Printer, MessageCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const AccountOrderDetailPage = () => {
  const { id: number } = useParams(); // Using `id` param from router mapped to `number`
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axiosInstance.get(`/orders/${number}`);
        setOrder(response.data);
      } catch (error) {
        toast.error('Commande introuvable');
        navigate('/account/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [number, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9A826]"></div>
      </div>
    );
  }

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(`Bonjour, j'ai besoin d'aide concernant ma commande ${order.number}.`);
  const whatsappLink = `https://wa.me/213000000000?text=${whatsappMessage}`; // Add real number

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto printable-area">
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .printable-area, .printable-area * { visibility: visible; }
            .printable-area { position: absolute; left: 0; top: 0; width: 100%; padding: 20px; }
            .no-print { display: none !important; }
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-6 no-print">
        <Link to="/account/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#11323B] font-medium transition-colors">
          <ArrowLeft size={20} /> Retour aux commandes
        </Link>
        <div className="flex gap-4">
          <a 
            href={whatsappLink} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded font-medium hover:bg-green-600 transition-colors"
          >
            <MessageCircle size={18} /> Aide WhatsApp
          </a>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#11323B] text-white px-4 py-2 rounded font-medium hover:bg-gray-800 transition-colors"
          >
            <Printer size={18} /> Facture
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande {order.number}</h2>
          <p className="text-gray-500">
            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold text-[#F9A826] block mb-1">
            {order.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4 text-[#11323B] font-bold text-lg">
            <Truck size={24} />
            <h3>Livraison & Paiement</h3>
          </div>
          <div className="text-gray-600 space-y-2 text-sm">
            <p><span className="font-semibold text-gray-900">Méthode d'expédition :</span> {order.shipping.method === 'home' ? 'À domicile' : 'Point relais'}</p>
            <p><span className="font-semibold text-gray-900">Adresse :</span> {order.shipping.address}, {order.shipping.commune}, Wilaya {order.shipping.wilaya}</p>
            <p><span className="font-semibold text-gray-900">Téléphone :</span> {order.shipping.phone}</p>
            <div className="pt-2 mt-2 border-t border-gray-200">
              <p><span className="font-semibold text-gray-900">Méthode de paiement :</span> {order.payment.method.toUpperCase()}</p>
              <p><span className="font-semibold text-gray-900">Statut de paiement :</span> {order.payment.status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-[#11323B] font-bold text-lg">
            <Clock size={24} />
            <h3>Timeline (Historique)</h3>
          </div>
          <div className="space-y-4">
            {order.timeline.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-[#F9A826] rounded-full mt-1"></div>
                  {index !== order.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 my-1"></div>}
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-gray-900 capitalize">{step.status}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(step.date).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {step.note && <p className="text-sm text-gray-600 mt-1 italic">{step.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-gray-900">Récapitulatif des articles (Snapshot)</h3>
      <div className="border border-gray-200 bg-white mb-8">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0">
            <div className="w-16 h-16 bg-gray-100 flex-shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{item.name}</p>
              <p className="text-gray-500 text-sm mt-1">Qté: {item.qty} x {item.price.toFixed(2)} {order.currency}</p>
            </div>
            <div className="text-right font-bold text-gray-900">
              {(item.qty * item.price).toFixed(2)} {order.currency}
            </div>
          </div>
        ))}
        <div className="p-4 bg-gray-50 space-y-2 border-t border-gray-200 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{order.amounts.subtotal.toFixed(2)} {order.currency}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Frais de livraison</span>
            <span>{order.amounts.shipping.toFixed(2)} {order.currency}</span>
          </div>
          {order.amounts.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Remise</span>
              <span>-{order.amounts.discount.toFixed(2)} {order.currency}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-200">
            <span>Total</span>
            <span>{order.amounts.total.toFixed(2)} {order.currency}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountOrderDetailPage;
