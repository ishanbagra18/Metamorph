/**
 * Authentication API Endpoints
 */
import { apiClient, setAuthToken } from './client';

export const authApi = {
  async register({ name, email, password, company = '' }) {
    const data = await apiClient('/auth/register', {
      method: 'POST',
      body: { name, email, password, company },
      requiresAuth: false
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async login({ email, password }) {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async getMe() {
    return await apiClient('/auth/me');
  },

  async refreshToken() {
    const data = await apiClient('/auth/refresh', {
      method: 'POST',
      requiresAuth: false
    });
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async logout() {
    try {
      await apiClient('/auth/logout', { method: 'POST', requiresAuth: false });
    } finally {
      setAuthToken(null);
    }
  },

  async updateProfile({ name, company, avatar }) {
    return await apiClient('/auth/profile', {
      method: 'PUT',
      body: { name, company, avatar }
    });
  },

  async updatePassword({ currentPassword, newPassword }) {
    return await apiClient('/auth/password', {
      method: 'PUT',
      body: { current_password: currentPassword, new_password: newPassword }
    });
  },

  async deleteAccount() {
    const res = await apiClient('/auth/account', { method: 'DELETE' });
    setAuthToken(null);
    return res;
  },

  async forgotPassword(email) {
    return await apiClient('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      requiresAuth: false
    });
  },

  async resetPassword({ token, newPassword }) {
    return await apiClient('/auth/reset-password', {
      method: 'POST',
      body: { token, new_password: newPassword },
      requiresAuth: false
    });
  }
};
