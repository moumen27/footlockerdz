import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();

  // On mount, check if there's a valid session (try to refresh token silently)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userRes = await axiosInstance.get('/auth/me');
        if (userRes.data) {
          setUser(userRes.data);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        // No valid session
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
    
    // Listen for unauthorized events to clear state
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const userData = response.data;
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Séquence de merge (CDC §8.3, §8.5)
      try {
        if (cartItems && cartItems.length > 0) {
          await axiosInstance.post('/cart/merge', { cartItems });
        }
        if (wishlistItems && wishlistItems.length > 0) {
          await axiosInstance.post('/wishlist/merge', { wishlistItems });
        }
      } catch (mergeError) {
        console.error('Erreur lors du merge panier/likes:', mergeError);
        // On continue même si le merge échoue
      }
      
      return { success: true };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        // Retry-After header indicates seconds to wait
        const retryAfter = error.response.headers['retry-after'] || 900; // default 15 min
        const minutes = Math.ceil(retryAfter / 60);
        return {
          success: false,
          code: 429,
          message: { 
            fr: `Trop de tentatives. Veuillez réessayer dans ${minutes} minute(s).`, 
            ar: `محاولات كثيرة. يرجى المحاولة مرة أخرى بعد ${minutes} دقيقة.` 
          }
        };
      }

      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || { fr: 'Erreur de connexion', ar: 'خطأ في تسجيل الدخول' }
      };
    }
  };

  const register = async (userData) => {
    try {
      await axiosInstance.post('/auth/register', userData);
      // On ne loggue pas l'utilisateur automatiquement car il doit vérifier son email
      return { success: true };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || { fr: 'Erreur d\'inscription', ar: 'خطأ في التسجيل' }
      };
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      // Optionnel : Vider le panier local
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      await axiosInstance.post(`/auth/reset`, { token, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || { fr: 'Erreur de réinitialisation', ar: 'خطأ في إعادة التعيين' }
      };
    }
  };

  const forgotPassword = async (identifier) => {
    try {
      await axiosInstance.post(`/auth/forgot`, { identifier });
      return { success: true };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'] || 900;
        const minutes = Math.ceil(retryAfter / 60);
        return {
          success: false,
          code: 429,
          message: { fr: `Veuillez patienter ${minutes} minute(s).`, ar: `يرجى الانتظار ${minutes} دقيقة.` }
        };
      }
      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || { fr: 'Erreur', ar: 'خطأ' }
      };
    }
  };

  const verifyEmail = async (token) => {
    try {
      await axiosInstance.get(`/auth/verify/${token}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || { fr: 'Erreur de vérification', ar: 'خطأ في التحقق' }
      };
    }
  };

  const updateProfile = async (userData) => {
    try {
      const response = await axiosInstance.put('/auth/me', userData);
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || 'Erreur de mise à jour'
      };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      const response = await axiosInstance.put('/auth/password', { oldPassword, newPassword });
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        code: error.response?.status,
        message: error.response?.data?.message || 'Erreur de mise à jour du mot de passe'
      };
    }
  };

  const addAddress = async (addressData) => {
    try {
      const response = await axiosInstance.post('/auth/me/addresses', addressData);
      setUser(prev => ({ ...prev, addresses: response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur' };
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const response = await axiosInstance.put(`/auth/me/addresses/${id}`, addressData);
      setUser(prev => ({ ...prev, addresses: response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur' };
    }
  };

  const deleteAddress = async (id) => {
    try {
      const response = await axiosInstance.delete(`/auth/me/addresses/${id}`);
      setUser(prev => ({ ...prev, addresses: response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur' };
    }
  };

  const setDefaultAddress = async (id) => {
    try {
      const response = await axiosInstance.put(`/auth/me/addresses/${id}/default`);
      setUser(prev => ({ ...prev, defaultAddressId: response.data.defaultAddressId }));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Erreur' };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, isAuthenticated, isLoading, login, register, logout, resetPassword, forgotPassword, verifyEmail, updateProfile, changePassword,
      addAddress, updateAddress, deleteAddress, setDefaultAddress 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
