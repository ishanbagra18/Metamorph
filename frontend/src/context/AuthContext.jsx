import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api/auth';
import { getAuthToken, setAuthToken } from '../lib/api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const loadCurrentUser = useCallback(async () => {
    setIsLoading(true);
    const token = getAuthToken();
    try {
      if (token) {
        const res = await authApi.getMe();
        setUser(res.user);
      } else {
        // Try refresh via httpOnly cookie if present
        try {
          const refreshRes = await authApi.refreshToken();
          if (refreshRes.user) {
            setUser(refreshRes.user);
          }
        } catch {
          setUser(null);
        }
      }
    } catch {
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();

    const handleUnauthorized = () => {
      setUser(null);
      setAuthToken(null);
      toast.error('Session expired. Please sign in again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [loadCurrentUser, toast]);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await authApi.login({ email, password });
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async ({ name, email, password, company }) => {
    setIsLoading(true);
    try {
      const data = await authApi.register({ name, email, password, company });
      setUser(data.user);
      toast.success('Account created successfully! Welcome to Metamorph.');
      return data.user;
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error ignored:', err);
    } finally {
      setUser(null);
      setAuthToken(null);
      toast.info('You have been logged out.');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await authApi.updateProfile(profileData);
      setUser(res.user);
      toast.success('Profile updated successfully.');
      return res.user;
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      const res = await authApi.updatePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully.');
      return res;
    } catch (err) {
      toast.error(err.message || 'Failed to change password.');
      throw err;
    }
  };

  const deleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      setUser(null);
      setAuthToken(null);
      toast.info('Your account has been deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete account.');
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    deleteAccount,
    refreshUser: loadCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
