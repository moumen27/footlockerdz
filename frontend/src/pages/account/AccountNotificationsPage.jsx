import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, Check, Clock, ShieldCheck, Tag, ShoppingBag } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

const AccountNotificationsPage = () => {
  const { t, isAr } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      toast.error(t({ fr: 'Erreur lors du chargement des notifications', ar: 'خطأ في تحميل الإشعارات' }));
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(notif => notif._id === id ? { ...notif, isRead: true } : notif)
      );
    } catch (error) {
      toast.error(t({ fr: 'Impossible de mettre à jour la notification', ar: 'تعذر تحديث الإشعار' }));
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      toast.success(t({ fr: 'Toutes les notifications ont été marquées comme lues', ar: 'تم تحديد جميع الإشعارات كمقروءة' }));
    } catch (error) {
      toast.error(t({ fr: 'Erreur', ar: 'خطأ' }));
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'order': return <ShoppingBag className="text-blue-500" size={24} />;
      case 'promotion': return <Tag className="text-green-500" size={24} />;
      case 'security': return <ShieldCheck className="text-red-500" size={24} />;
      default: return <Bell className="text-gray-500" size={24} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9A826]"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {t({ fr: 'Notifications', ar: 'الإشعارات' })}
          {unreadCount > 0 && (
            <span className="ml-2 bg-[#F9A826] text-white text-sm px-2 py-0.5 rounded-full align-middle">
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-sm font-medium text-[#11323B] hover:text-[#F9A826] flex items-center gap-1"
          >
            <Check size={16} />
            {t({ fr: 'Tout marquer comme lu', ar: 'تحديد الكل كمقروء' })}
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#11323B]/10 text-[#11323B] rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t({ fr: 'Aucune notification', ar: 'لا توجد إشعارات' })}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {t({ fr: "Vous n'avez aucune nouvelle notification pour le moment.", ar: "ليس لديك أي إشعارات جديدة في الوقت الحالي." })}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif._id} 
              className={`p-4 border ${notif.isRead ? 'bg-white border-gray-200' : 'bg-[#f9f7f0] border-[#d9b671]'} flex gap-4 transition-colors`}
            >
              <div className="shrink-0 mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-semibold ${notif.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0 ml-4">
                    <Clock size={12} />
                    {new Date(notif.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                
                {!notif.isRead && (
                  <button 
                    onClick={() => markAsRead(notif._id)}
                    className="text-xs font-semibold text-[#F9A826] hover:text-orange-600 uppercase tracking-wider"
                  >
                    {t({ fr: 'Marquer comme lu', ar: 'تحديد كمقروء' })}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccountNotificationsPage;
