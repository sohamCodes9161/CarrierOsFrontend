import {api} from './client.js'; // Assuming this points to your configured axios instance

export const adminApi = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    // Unwraps { success: true, data: { totalUsers, stats } } -> returns { totalUsers, stats }
    return response.data || response;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    // Unwraps { success: true, data: { users: [...] } } -> returns [...]
    return response.users || response.data?.users || response;
  },
  resetQuota: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/reset-quota`);
    return response;
  }
};