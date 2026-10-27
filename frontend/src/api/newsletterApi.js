import axiosInstance from './axios';

export const newsletterApi = {
  subscribe: async (email) => {
    const { data } = await axiosInstance.post('/newsletter/subscribe', { email });
    return data;
  },

  getStats: async () => {
    const { data } = await axiosInstance.get('/newsletter/stats');
    return data;
  },

  broadcastFlashSale: async () => {
    const { data } = await axiosInstance.post('/newsletter/broadcast-flash-sale');
    return data;
  },

  broadcastProduct: async (productId) => {
    const { data } = await axiosInstance.post(`/newsletter/broadcast-product/${productId}`);
    return data;
  }
};
