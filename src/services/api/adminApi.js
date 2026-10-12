import api from './client.js'; // Assuming this points to your configured axios instance

export const adminApi = {
  getStats: async () => {
    const { data } = await api.get('/admin/stats');
    return data.data;
  },
  getUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data.data.users;
  },
  resetQuota: async (userId) => {
    const { data } = await api.post(`/admin/users/${userId}/reset-quota`);
    return data;
  }
};