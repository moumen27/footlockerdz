import axiosInstance from './axios';

export const settingsApi = {
  getSettings: async () => {
    try {
      const { data } = await axiosInstance.get('/settings');
      return data;
    } catch (error) {
      console.error('Failed to fetch settings', error);
      return { freeShippingThreshold: 10000 }; // fallback
    }
  }
};
