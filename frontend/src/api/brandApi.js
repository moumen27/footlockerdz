import axiosInstance from './axios';

export const brandApi = {
  getBrands: async () => {
    const { data } = await axiosInstance.get('/brands');
    return data;
  },
  createBrand: async (payload) => {
    const { data } = await axiosInstance.post('/brands', payload);
    return data;
  },
  updateBrand: async (id, payload) => {
    const { data } = await axiosInstance.put(`/brands/${id}`, payload);
    return data;
  },
  deleteBrand: async (id) => {
    const { data } = await axiosInstance.delete(`/brands/${id}`);
    return data;
  }
};
