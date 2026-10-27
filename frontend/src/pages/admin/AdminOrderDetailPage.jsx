import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, MapPin, CreditCard, Package, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const AdminOrderDetailPage = () => {
  const { t } = useLanguage();
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [status, setStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/orders/${id}/admin`);
        setOrder(data);
        setStatus(data.status);
        setAdminNote(data.adminNote || '');
      } catch (err) {
        if (err.response?.status === 403) {
          setError(t({fr: "Accès Refusé. Vous n'avez pas les permissions pour voir les détails de cette commande.", ar: "وصول مرفوض. ليس لديك الصلاحيات لعرض تفاصيل هذا الطلب."}));
        } else {
          setError(t({fr: 'Erreur lors du chargement de la commande.', ar: 'خطأ أثناء تحميل الطلب.'}));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await axiosInstance.patch(`/orders/${id}/status`, { status, adminNote });
      setOrder(data);
      toast.success('Commande mise à jour avec succès');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour de la commande');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-red-100">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-xl font-bold dark:text-white mb-2">Erreur</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
      <Link to="/admin/orders" className="text-[#F9A826] hover:underline">← Retour aux commandes</Link>
    </div>
  );

  if (!order) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 dark:text-white" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Commande {order.number}</h1>
            <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString('fr-FR')}</p>
          </div>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-1 rounded-full text-sm font-bold uppercase dark:text-white">
          {order.status}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Info) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Articles commandés
            </h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center border-b dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium dark:text-white text-sm">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-gray-500">Taille: {item.variant.size} | Couleur: {item.variant.color}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold dark:text-white">{item.price.toLocaleString()} DZD</p>
                    <p className="text-xs text-gray-500">Qté: {item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" /> Client
              </h2>
              <div className="text-sm space-y-2 dark:text-gray-300">
                <p><span className="text-gray-500">Nom :</span> {order.userId?.name || 'Invité'}</p>
                <p><span className="text-gray-500">Email :</span> {order.userId?.email || order.guestEmail || 'N/A'}</p>
                <p><span className="text-gray-500">Tél :</span> {order.guestPhone || order.shipping?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" /> Livraison
              </h2>
              <div className="text-sm space-y-2 dark:text-gray-300">
                <p><span className="text-gray-500">Méthode :</span> {order.shipping?.method === 'home' ? 'À domicile' : 'Point Relais'}</p>
                <p><span className="text-gray-500">Adresse :</span> {order.shipping?.address}</p>
                <p><span className="text-gray-500">Lieu :</span> {order.shipping?.commune}, {order.shipping?.wilaya}</p>
              </div>
            </div>
          </div>
          
          {/* Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gray-400" /> Notes Client
            </h2>
            {order.customerNote ? (
              <p className="text-sm italic text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">"{order.customerNote}"</p>
            ) : (
              <p className="text-sm text-gray-400">Aucune note laissée par le client.</p>
            )}
          </div>
        </div>

        {/* Right Column (Actions & Timeline & Totals) */}
        <div className="space-y-6">
          
          {/* Status Management */}
          <form onSubmit={handleStatusUpdate} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-lg mb-4 dark:text-white">Gestion de la Commande</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modifier le Statut</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#F9A826] outline-none"
                >
                  <option value="pending">À Traiter (Pending)</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="packed">Préparée (Packed)</option>
                  <option value="shipped">Expédiée (Shipped)</option>
                  <option value="delivered">Livrée (Delivered)</option>
                  <option value="cancelled">Annulée (Cancelled)</option>
                  <option value="returned">Retournée (Returned)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Note Interne (Admin uniquement)
                </label>
                <textarea 
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Ex: Tracking Yalidine #123456"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white h-24 focus:ring-2 focus:ring-[#F9A826] outline-none text-sm"
                />
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>

          {/* Totals & Payment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-400" /> Paiement
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500">Méthode : <span className="font-bold text-black dark:text-white uppercase">{order.payment?.method}</span></p>
              <p className="text-sm text-gray-500">
                Statut : 
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${
                  order.payment?.status === 'paid' ? 'bg-green-100 text-green-700' : 
                  order.payment?.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {order.payment?.status}
                </span>
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t dark:border-gray-700 text-sm">
              <div className="flex justify-between dark:text-gray-300"><span>Sous-total</span> <span>{order.amounts?.subtotal?.toLocaleString()} DZD</span></div>
              <div className="flex justify-between dark:text-gray-300"><span>Livraison</span> <span>{order.amounts?.shipping?.toLocaleString()} DZD</span></div>
              {order.amounts?.discount > 0 && (
                <div className="flex justify-between text-red-500"><span>Remise</span> <span>-{order.amounts?.discount?.toLocaleString()} DZD</span></div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t dark:border-gray-700 dark:text-white">
                <span>Total</span> <span>{order.amounts?.total?.toLocaleString()} DZD</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Historique (Timeline)
            </h2>
            <div className="space-y-4">
              {[...order.timeline].reverse().map((event, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-[#F9A826]"></div>
                    {idx !== order.timeline.length - 1 && <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold uppercase dark:text-white">{event.status}</p>
                    <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString('fr-FR')}</p>
                    {event.note && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 italic">"{event.note}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
