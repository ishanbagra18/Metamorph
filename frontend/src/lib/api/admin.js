/**
 * Admin API Endpoints
 */
import { apiClient } from './client';

export const adminApi = {
  async getStats() {
    return await apiClient('/admin/stats', { method: 'GET' });
  },

  async listUsers() {
    return await apiClient('/admin/users', { method: 'GET' });
  },

  async updateUserRole(userId, role) {
    return await apiClient(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role }
    });
  },

  async deleteUser(userId) {
    return await apiClient(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
};
