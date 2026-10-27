import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, AlertTriangle, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import axiosInstance from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const { t, lng } = useLanguage();
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [allOrders, setAllOrders] = useState([]);

  const [stats, setStats] = useState({
    revenue: 0,
    topSku: '-',
    outOfStock: 0,
    monthlyData: [
      { month: 'Jan', value: 40000 },
      { month: 'Fév', value: 65000 },
      { month: 'Mar', value: 55000 },
      { month: 'Avr', value: 90000 },
      { month: 'Mai', value: 85000 },
      { month: 'Juin', value: 120000 },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dans une version complète, on appellerait un endpoint /api/admin/stats
    // Ici, on va simuler ou calculer basiquement depuis les produits
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch products and optionally orders depending on role
        const [productsRes, ordersRes] = await Promise.all([
          axiosInstance.get('/products?limit=1000').catch(() => ({ data: { products: [] } })),
          axiosInstance.get('/orders/stats').catch(() => ({ data: [] }))
        ]);
        
        const products = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || []);
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        // 2. We will just save all orders so we can recalculate when year changes
        setAllOrders(orders);
        
        let outOfStockCount = 0;
        products.forEach(p => {
          const totalStock = p.variants ? p.variants.reduce((acc, v) => acc + (v.stock || 0), 0) : (p.totalStock || 0);
          if (totalStock === 0) outOfStockCount++;
        });

        // Set initial stats using selectedYear
        calculateStatsForYear(orders, selectedYear, outOfStockCount);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateStatsForYear = (ordersData, targetYear, oosCount = stats.outOfStock) => {
    let lifetimeRevenue = 0;
    const allTimeSkuCounts = {};
    const monthlyRevenues = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };

    ordersData.forEach(order => {
      const date = new Date(order.createdAt);
      const orderTotal = order.amounts?.total || 0;
      
      // All-time stats for the top cards
      lifetimeRevenue += orderTotal;
      if (order.items) {
        order.items.forEach(item => {
          const sku = item.name;
          allTimeSkuCounts[sku] = (allTimeSkuCounts[sku] || 0) + (item.qty || 0);
        });
      }

      // Year-specific stats for the graph
      if (date.getFullYear() === targetYear) {
        monthlyRevenues[date.getMonth()] += orderTotal;
      }
    });

    // Find top SKU (All-time)
    let topSkuName = 'Aucun';
    let maxSkuCount = 0;
    for (const [sku, count] of Object.entries(allTimeSkuCounts)) {
      if (count > maxSkuCount) {
        maxSkuCount = count;
        topSkuName = sku;
      }
    }

    // Static months Jan-Dec
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const monthlyData = monthNames.map((m, idx) => ({
      monthIdx: idx,
      month: m,
      value: monthlyRevenues[idx]
    }));

    setStats({
      revenue: lifetimeRevenue,
      topSku: topSkuName,
      topSkuCount: maxSkuCount,
      outOfStock: oosCount,
      monthlyData,
      isDemo: false
    });
  };

  const handleYearChange = (newYear) => {
    setSelectedYear(newYear);
    calculateStatsForYear(allOrders, newYear);
  };

  const maxValue = Math.max(...stats.monthlyData.map(d => d.value));

  // Dynamically calculate which years have orders
  const availableYears = useMemo(() => {
    const years = new Set(allOrders.map(o => new Date(o.createdAt).getFullYear()));
    years.add(currentYear); // Always include current year
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [allOrders, currentYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  const monthNamesAr = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const monthNamesFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

  return (
    <div className="space-y-8 animate-fade-in" dir={lng === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t({fr: 'Tableau de bord', ar: 'لوحة القيادة'})}</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* KPI 1: Chiffre d'Affaires */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
              <div className={`absolute ${lng === 'ar' ? '-left-6' : '-right-6'} -top-6 bg-green-50 dark:bg-green-900/20 w-24 h-24 rounded-full flex items-end ${lng === 'ar' ? 'justify-end' : 'justify-start'} p-4 group-hover:scale-110 transition-transform`}>
                <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t({fr: 'Chiffre d\'Affaires', ar: 'الإيرادات'})}</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.revenue.toLocaleString()} <span className="text-lg text-gray-500">DZD</span>
              </h3>
              <p className="text-xs font-medium text-green-600 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {t({fr: 'Données réelles', ar: 'بيانات حقيقية'})}
              </p>
            </div>

            {/* KPI 2: Top SKU */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
              <div className={`absolute ${lng === 'ar' ? '-left-6' : '-right-6'} -top-6 bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-full flex items-end ${lng === 'ar' ? 'justify-end' : 'justify-start'} p-4 group-hover:scale-110 transition-transform`}>
                <Activity className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t({fr: 'Top SKU (Meilleure vente)', ar: 'أفضل وحدة بيع (SKU)'})}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={stats.topSku}>
                {stats.topSku === 'Aucun' ? t({fr: 'Aucun', ar: 'لا يوجد'}) : stats.topSku}
              </h3>
              <p className="text-xs font-medium text-blue-600 mt-2 flex items-center gap-1">
                {stats.topSkuCount || 0} {t({fr: 'unités vendues', ar: 'الوحدات المباعة'})}
              </p>
            </div>

        {/* KPI 3: Ruptures de stock */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden group">
          <div className={`absolute ${lng === 'ar' ? '-left-6' : '-right-6'} -top-6 bg-red-50 dark:bg-red-900/20 w-24 h-24 rounded-full flex items-end ${lng === 'ar' ? 'justify-end' : 'justify-start'} p-4 group-hover:scale-110 transition-transform`}>
            <AlertTriangle className="w-8 h-8 text-red-500 opacity-50" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{t({fr: 'En Rupture de Stock', ar: 'نفد من المخزون'})}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.outOfStock} <span className="text-lg text-gray-500">{t({fr: 'produits', ar: 'منتجات'})}</span>
          </h3>
          <p className="text-xs font-medium text-red-600 mt-2 flex items-center gap-1">
            {t({fr: 'À réapprovisionner urgemment', ar: 'إعادة التخزين عاجلاً'})}
          </p>
        </div>
      </div>

      {/* Graphique Amélioré: Évolution du CA */}
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t({fr: 'Évolution du Chiffre d\'Affaires', ar: 'تطور الإيرادات'})}</h3>
          <div className="flex items-center gap-3">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t({fr: 'Année :', ar: 'السنة :'})}
            </label>
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
               <button 
                  onClick={() => handleYearChange(selectedYear - 1)}
                  disabled={selectedYear <= 2025}
                  className={`p-1 rounded transition-colors ${selectedYear <= 2025 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
               >
                 {lng === 'ar' ? <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300"/> : <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300"/>}
               </button>
               <span className="font-bold text-sm text-gray-900 dark:text-white px-2 min-w-[3rem] text-center">{selectedYear}</span>
               <button 
                  onClick={() => handleYearChange(selectedYear + 1)}
                  disabled={selectedYear >= 2032}
                  className={`p-1 rounded transition-colors ${selectedYear >= 2032 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
               >
                 {lng === 'ar' ? <ChevronLeft className="w-4 h-4 text-gray-700 dark:text-gray-300"/> : <ChevronRight className="w-4 h-4 text-gray-700 dark:text-gray-300"/>}
               </button>
            </div>
          </div>
        </div>
          
        {/* CSS Chart Container */}
        <div className="relative h-72 w-full mt-4">
          
          {/* Y-Axis Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[4, 3, 2, 1, 0].map(i => (
              <div key={i} className="relative w-full border-t border-dashed border-gray-200 dark:border-gray-700 h-0 flex items-center">
                <span className={`absolute ${lng === 'ar' ? '-right-2 translate-x-full' : '-left-2 -translate-x-full'} text-[10px] sm:text-xs text-gray-400 font-medium`}>
                  {maxValue > 0 ? ((maxValue / 4) * i).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                </span>
              </div>
            ))}
          </div>

          {/* Bars */}
          <div className={`absolute inset-0 ${lng === 'ar' ? 'pr-10 sm:pr-12 pl-2' : 'pl-10 sm:pl-12 pr-2'} flex items-end justify-between gap-1 sm:gap-4 z-10`}>
            {stats.monthlyData.map((data, index) => {
              const heightPercent = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
              const monthLabel = lng === 'ar' ? monthNamesAr[data.monthIdx] : monthNamesFr[data.monthIdx];
              return (
                <div key={index} className="flex flex-col items-center flex-1 h-full group">
                  <div className="relative w-full flex justify-center h-full items-end pb-6">
                    
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold py-1.5 px-3 rounded shadow-lg pointer-events-none whitespace-nowrap z-20 transform translate-y-2 group-hover:translate-y-0">
                      {data.value.toLocaleString()} DZD
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
                    </div>
                    
                    {/* The Bar */}
                    <div 
                      className="w-full max-w-[2.5rem] bg-gradient-to-t from-gray-900 to-gray-500 dark:from-white dark:to-gray-300 rounded-t-md transition-all duration-1000 ease-out hover:opacity-80 hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      style={{ height: `${Math.max(heightPercent, 2)}%` }}
                    ></div>
                    
                  </div>
                  {/* X-Axis Label */}
                  <span className="absolute bottom-0 text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                    {monthLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default AdminDashboardPage;
