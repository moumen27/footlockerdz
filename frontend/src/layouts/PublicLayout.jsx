import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/cart/CartDrawer';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const PublicLayout = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const res = await axiosInstance.get('/settings');
        if (res.data?.maintenanceFlag) {
          setIsMaintenance(true);
        }
      } catch (error) {
        console.error('Erreur vérification maintenance', error);
      } finally {
        setChecking(false);
      }
    };
    checkMaintenance();
  }, []);

  if (checking || isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  // Si le site est en maintenance, que l'utilisateur n'est PAS un SUPER admin, ET qu'il n'essaie pas de se connecter
  const isAuthPage = location.pathname.startsWith('/auth');
  if (isMaintenance && (!user || user.role !== 'super_admin') && !isAuthPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-4xl font-bold mb-4">Site en maintenance 🚧</h1>
        <p className="text-gray-600 max-w-md mx-auto">
          Nous mettons actuellement à jour notre boutique pour vous offrir une meilleure expérience. Revenez dans quelques instants !
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      <Header />
      <main className="w-full">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
};

export default PublicLayout;
