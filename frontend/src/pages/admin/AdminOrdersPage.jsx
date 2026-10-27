import React, { useState, useEffect } from 'react';
import { Download, Search, RefreshCw, MessageSquare, Truck, DollarSign, ExternalLink } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

const KanbanColumn = ({ title, statusId, orders, onStatusChange, onAddNote, loading }) => {
  const { t, lng } = useLanguage();
  return (
    <div className="flex-1 min-w-[300px] bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex flex-col h-[calc(100vh-200px)] overflow-hidden">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-bold text-gray-900 dark:text-white capitalize">{title}</h3>
        <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-bold">
          {orders.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-center py-10 text-gray-400">{t({fr: 'Chargement...', ar: 'جاري التحميل...'})}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            {t({fr: 'Aucune commande', ar: 'لا توجد طلبات'})}
          </div>
        ) : (
          orders.map(order => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onStatusChange={onStatusChange}
              onAddNote={onAddNote}
            />
          ))
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ order, onStatusChange, onAddNote }) => {
  const { t, lng } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [noteText, setNoteText] = useState(order.adminNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);

  const paymentColors = {
    pending: 'text-orange-600 bg-orange-100',
    paid: 'text-green-600 bg-green-100',
    failed: 'text-red-600 bg-red-100'
  };

  const nextStatusMap = {
    pending: 'confirmed',
    confirmed: 'packed',
    packed: 'shipped',
    shipped: 'delivered'
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    onAddNote(order._id, noteText);
    setIsEditingNote(false);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex justify-between items-start mb-2">
        <Link to={`/admin/orders/${order._id}`} className="font-bold text-[#F9A826] hover:underline flex items-center gap-1">
          {order.number} <ExternalLink size={12} />
        </Link>
        <span className="text-xs text-gray-500">
          {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-1 font-medium">
        {order.userId?.name || order.guestEmail || t({fr: 'Client Inconnu', ar: 'عميل غير معروف'})}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
          <DollarSign size={14} />
          <span className="font-bold">{order.amounts?.total?.toLocaleString()} DZD</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded font-medium ${paymentColors[order.payment?.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.payment?.method?.toUpperCase()} - {order.payment?.status}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 col-span-2 mt-1">
          <Truck size={14} />
          <span>{order.shipping?.method === 'home' ? t({fr: 'À domicile', ar: 'توصيل للمنزل'}) : t({fr: 'Point Relais', ar: 'نقطة استلام'})}</span>
        </div>
      </div>

      {isEditingNote ? (
        <form onSubmit={handleNoteSubmit} className="mb-3">
          <textarea 
            className="w-full text-xs p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder={t({fr: 'Note interne...', ar: 'ملاحظة داخلية...'})}
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <button type="submit" className="text-xs bg-black text-white px-2 py-1 rounded">{t({fr: 'Ok', ar: 'موافق'})}</button>
            <button type="button" onClick={() => setIsEditingNote(false)} className="text-xs text-gray-500">{t({fr: 'Annuler', ar: 'إلغاء'})}</button>
          </div>
        </form>
      ) : order.adminNote ? (
        <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 text-xs rounded border border-yellow-100 dark:border-yellow-900/50 flex justify-between items-start group">
          <span className="italic">"{order.adminNote}"</span>
          <button onClick={() => setIsEditingNote(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black">✎</button>
        </div>
      ) : (
        <button onClick={() => setIsEditingNote(true)} className="text-xs text-gray-400 hover:text-black dark:hover:text-white flex items-center gap-1 mb-3">
          <MessageSquare size={12} /> {t({fr: 'Ajouter une note interne', ar: 'إضافة ملاحظة داخلية'})}
        </button>
      )}

      {/* Quick Action Button for Status */}
      {nextStatusMap[order.status] && (
        <button 
          onClick={() => onStatusChange(order._id, nextStatusMap[order.status])}
          className={`w-full bg-[#11323B] hover:bg-gray-800 text-white text-xs font-medium py-2 rounded transition-colors flex items-center justify-center gap-2 ${lng === 'ar' ? 'flex-row-reverse' : ''}`}
        >
          {t({fr: `Passer à ${nextStatusMap[order.status]}`, ar: `الانتقال إلى ${nextStatusMap[order.status]}`})} {lng === 'ar' ? '←' : '→'}
        </button>
      )}

      {/* Button to signal return/cancel if order is active */}
      {!['delivered', 'cancelled', 'returned'].includes(order.status) && (
        <button 
          type="button"
          onClick={() => {
            if (window.confirm(t({fr: 'Marquer cette commande en Exception (Refus / Retour) ? Le stock sera réintégré.', ar: 'تحويل هذا الطلب إلى الاستثناءات (إرجاع)؟ سيتم استعادة المخزون.'}))) {
              onStatusChange(order._id, order.status === 'shipped' ? 'returned' : 'cancelled');
            }
          }}
          className="w-full mt-1.5 text-center text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 py-1 rounded transition-colors"
        >
          {order.status === 'shipped' 
            ? t({fr: '↩️ Signaler retour / refus livreur', ar: '↩️ تسجيل إرجاع / رفض الزبون'})
            : t({fr: '❌ Annuler la commande', ar: '❌ إلغاء الطلب'})}
        </button>
      )}
      
      {/* If it's delivered, show success + option for post-delivery return */}
      {order.status === 'delivered' && (
        <div className="space-y-1.5">
          <div className="w-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold py-1.5 rounded text-center">
            {t({fr: 'Livrée avec succès 🎉', ar: 'تم التوصيل بنجاح 🎉'})}
          </div>
          <button 
            type="button"
            onClick={() => {
              if (window.confirm(t({fr: 'Marquer cette commande comme retournée ? Le stock sera réintégré.', ar: 'تحديد هذا الطلب كمرتجع؟ سيتم استعادة المخزون.'}))) {
                onStatusChange(order._id, 'returned');
              }
            }}
            className="w-full text-center text-[11px] text-red-500 hover:underline py-0.5"
          >
            {t({fr: '↩️ Signaler un retour client', ar: '↩️ تسجيل إرجاع بعد التوصيل'})}
          </button>
        </div>
      )}

      {/* If it's an exception (cancelled / returned) */}
      {['cancelled', 'returned'].includes(order.status) && (
        <div className="w-full bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-bold py-2 rounded text-center">
          {order.status === 'returned' 
            ? t({fr: 'Colis retourné (Échec livraison) ↩️', ar: 'طرد مسترجع (فشل التوصيل) ↩️'})
            : t({fr: 'Commande annulée ❌', ar: 'طلب ملغى ❌'})}
        </div>
      )}
    </div>
  );
};

const AdminOrdersPage = () => {
  const { t, lng } = useLanguage();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);
      const { data } = await axiosInstance.get('/orders/all');
      setOrders(data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setAccessDenied(true);
      } else {
        toast.error(t({fr: 'Erreur de chargement des commandes', ar: 'خطأ في تحميل الطلبات'}));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data } = await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(t({fr: `Statut mis à jour : ${newStatus}`, ar: `تم تحديث الحالة : ${newStatus}`}));
      // Optimistic update
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus, timeline: data.timeline } : o));
    } catch (error) {
      toast.error(t({fr: 'Erreur lors du changement de statut', ar: 'خطأ أثناء تغيير الحالة'}));
    }
  };

  const handleAddNote = async (orderId, note) => {
    try {
      const { data } = await axiosInstance.patch(`/orders/${orderId}/status`, { adminNote: note });
      toast.success(t({fr: 'Note enregistrée', ar: 'تم حفظ الملاحظة'}));
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, adminNote: note, timeline: data.timeline } : o));
    } catch (error) {
      toast.error(t({fr: "Erreur lors de l'enregistrement de la note", ar: "خطأ أثناء حفظ الملاحظة"}));
    }
  };

  const handleExportCSV = () => {
    const headers = ['Number', 'Date', 'Customer', 'Email', 'Phone', 'Total', 'Payment', 'Status', 'Shipping Method', 'Notes'];
    const rows = orders.map(o => [
      o.number,
      new Date(o.createdAt).toLocaleDateString(),
      o.userId?.name || 'Guest',
      o.userId?.email || o.guestEmail || '',
      o.shipping?.phone || o.guestPhone || '',
      o.amounts?.total || 0,
      o.payment?.status,
      o.status,
      o.shipping?.method,
      `"${(o.adminNote || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + rows.map(e => e.join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_commandes_footlocker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredOrders = orders.filter(o => 
    o.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.guestEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.shipping?.phone || '').includes(searchTerm)
  );

  const getOrdersByStatus = (statusGroup) => {
    if (statusGroup === 'exceptions') {
      return filteredOrders.filter(o => ['cancelled', 'returned'].includes(o.status));
    }
    return filteredOrders.filter(o => o.status === statusGroup);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Commandes (Kanban)', ar: 'الطلبات (كانبان)'})}</h1>
          <p className="text-sm text-gray-500 mt-1">{t({fr: 'Glissez et gérez les flux de commandes de bout en bout.', ar: 'إدارة سير عمل الطلبات من البداية إلى النهاية.'})}</p>
        </div>
        
        {!accessDenied && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className={`absolute ${lng === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
              <input 
                type="text" 
                placeholder={t({fr: 'Chercher (N°, Nom, Email, Tél)', ar: 'بحث (رقم، اسم، إيميل، هاتف)'})} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full ${lng === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#F9A826]`}
              />
            </div>
            <button onClick={fetchOrders} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800" title={t({fr: 'Rafraîchir', ar: 'تحديث'})}>
              <RefreshCw size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download size={16} /> <span className="hidden sm:inline">{t({fr: 'Export CSV', ar: 'تصدير CSV'})}</span>
            </button>
          </div>
        )}
      </div>

      {accessDenied ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl border border-red-100 dark:border-red-900 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t({fr: 'Accès Refusé (403)', ar: 'وصول مرفوض (403)'})}</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {t({fr: 'Votre compte possède le rôle "Admin Catalogue". Le Cahier des Charges stipule que ce rôle n\'a aucune permission liée aux commandes.', ar: 'حسابك لديه دور "مسؤول الكتالوج". دفتر الشروط ينص على أن هذا الدور ليس لديه أي صلاحيات تتعلق بالطلبات.'})}
          </p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar h-full">
        <KanbanColumn 
          title={t({fr: 'À Traiter (Pending)', ar: 'قيد الانتظار'})} 
          statusId="pending"
          orders={getOrdersByStatus('pending')} 
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          loading={loading}
        />
        <KanbanColumn 
          title={t({fr: 'Confirmées', ar: 'مؤكدة'})}
          statusId="confirmed"
          orders={getOrdersByStatus('confirmed')} 
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          loading={loading}
        />
        <KanbanColumn 
          title={t({fr: 'Préparées (Packed)', ar: 'مجهزة'})}
          statusId="packed"
          orders={getOrdersByStatus('packed')} 
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          loading={loading}
        />
        <KanbanColumn 
          title={t({fr: 'Expédiées (Shipped)', ar: 'مشحونة'})}
          statusId="shipped"
          orders={getOrdersByStatus('shipped')} 
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          loading={loading}
        />
        <KanbanColumn 
          title={t({fr: 'Livrées', ar: 'تم التوصيل'})}
          statusId="delivered"
          orders={getOrdersByStatus('delivered')} 
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          loading={loading}
        />
        <KanbanColumn 
          title={t({fr: 'Exceptions (Annulées / Retournées)', ar: 'استثناءات (ملغاة / مسترجعة)'})}
          statusId="exceptions"
          orders={getOrdersByStatus('exceptions')} 
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          loading={loading}
        />
      </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
