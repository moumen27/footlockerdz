import axios from 'axios';

// L'URL de base devrait venir d'une variable d'environnement
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Indispensable pour envoyer et recevoir les cookies httpOnly
});

// Intercepteur de réponse pour gérer les erreurs globales (ex: 401)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si l'erreur est 401 (Non autorisé)
    if (error.response?.status === 401 && error.config.url !== '/auth/login') {
      // Émission d'un événement global que le AuthContext pourra écouter pour nettoyer son état
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

