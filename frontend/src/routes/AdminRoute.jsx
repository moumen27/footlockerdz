import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  React.useEffect(() => {
    const checkMaintenance = async () => {
      try {
        // Pour éviter une dépendance circulaire ou un import non défini si axiosInstance n'est pas dispo,
        // on importe axiosInstance localement, mais on l'a importé en haut ou non?
        // Je vais utiliser window.fetch ou ajouter l'import
        const response = await fetch('http://localhost:5000/api/settings');
        const data = await response.json();
        if (data?.maintenanceFlag) {
          setIsMaintenance(true);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingMaintenance(false);
      }
    };
    checkMaintenance();
  }, []);

  if (isLoading || checkingMaintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!['admin_catalog', 'admin_orders', 'super_admin'].includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Accès Refusé</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Vous n'avez pas les droits nécessaires pour accéder à cette page.
          </p>
          <a href="/" className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-medium transition-transform hover:scale-105">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  if (isMaintenance && user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Site en maintenance</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            L'accès au panneau d'administration est temporairement restreint au Super Admin.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;
