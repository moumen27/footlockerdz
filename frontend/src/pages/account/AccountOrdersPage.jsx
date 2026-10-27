import React, { useEffect, useState } from 'react';
import axiosInstance from '../../api/axios';
import { Package, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

const STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const AccountOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/orders');
        setOrders(response.data);
      } catch (error) {
        toast.error(t({ fr: 'Erreur lors du chargement des commandes', ar: 'خطأ في تحميل الطلبات' }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStepIndex = (status) => {
    if (status === 'cancelled' || status === 'returned') return -1;
    return STEPS.indexOf(status);
  };

  const Tracker = ({ status }) => {
    const currentIndex = getStepIndex(status);

    if (status === 'cancelled' || status === 'returned') {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
          {status === 'cancelled' ? t({ fr: 'Annulée', ar: 'ملغاة' }) : t({ fr: 'Retournée', ar: 'مرتجعة' })}
        </span>
      );
    }

    return (
      <div className="flex items-center w-full max-w-xs">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <React.Fragment key={step}>
              {/* Circle */}
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 shrink-0 
                  ${isCompleted ? 'bg-[#F9A826] text-white' : 'bg-gray-200 text-gray-400'}`}
                title={step}
              >
                {isCompleted ? <Check size={12} /> : index + 1}
              </div>
              {/* Line */}
              {!isLast && (
                <div 
                  className={`flex-1 h-1 mx-1 rounded 
                    ${index < currentIndex ? 'bg-[#F9A826]' : 'bg-gray-200'}`}
                ></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F9A826]"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full">
      <h2 className="text-2xl font-bold mb-8 text-gray-900">{t({ fr: 'Mes Commandes', ar: 'طلباتي' })}</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#11323B]/10 text-[#11323B] rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t({ fr: 'Aucune commande', ar: 'لا توجد طلبات' })}</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            {t({ fr: "Vous n'avez pas encore passé de commande. Découvrez nos produits et commencez vos achats !", ar: "لم تقم بأي طلب بعد. اكتشف منتجاتنا وابدأ التسوق!" })}
          </p>
          <Link to="/shop" className="inline-block bg-[#F9A826] text-white px-8 py-3 font-medium hover:bg-orange-600 transition-colors">
            {t({ fr: 'Découvrir nos produits', ar: 'اكتشف منتجاتنا' })}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-4 font-semibold text-gray-600">{t({ fr: 'Numéro', ar: 'رقم' })}</th>
                <th className="pb-4 font-semibold text-gray-600">{t({ fr: 'Date', ar: 'التاريخ' })}</th>
                <th className="pb-4 font-semibold text-gray-600">{t({ fr: 'Total', ar: 'الإجمالي' })}</th>
                <th className="pb-4 font-semibold text-gray-600">{t({ fr: 'Suivi', ar: 'التتبع' })}</th>
                <th className="pb-4 font-semibold text-gray-600 text-right">{t({ fr: 'Action', ar: 'إجراء' })}</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 font-medium text-gray-900">{order.number}</td>
                  <td className="py-4 text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="py-4 font-bold text-gray-900">{order.amounts?.total.toFixed(2)} {order.currency}</td>
                  <td className="py-4"><Tracker status={order.status} /></td>
                  <td className="py-4 text-right">
                    <Link 
                      to={`/account/orders/${order.number}`} 
                      className="inline-flex items-center gap-1 text-[#F9A826] hover:text-orange-600 font-semibold text-sm"
                    >
                      <Eye size={16} /> {t({ fr: 'Détails', ar: 'التفاصيل' })}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountOrdersPage;
