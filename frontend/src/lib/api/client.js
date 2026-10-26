/**
 * Metamorph HTTP API Client
 * Provides base fetch handling, bearer token injection, automatic 401 refresh, and normalized error formatting.
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

let memoryToken = localStorage.getItem('metamorph_token') || null;
let isRefreshing = false;
let refreshSubscribers = [];

export function setAuthToken(token) {
  memoryToken = token;
  if (token) {
    localStorage.setItem('metamorph_token', token);
  } else {
    localStorage.removeItem('metamorph_token');
  }
}

export function getAuthToken() {
  return memoryToken;
}

function onRefreshed(newToken) {
  refreshSubscribers.forEach(cb => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

export class ApiError extends Error {
  constructor(message, status = 500, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function formatErrorMessage(errorData, fallbackStatus) {
  if (!errorData) return `Request failed with status ${fallbackStatus}`;
  if (typeof errorData === 'string') return errorData;
  if (typeof errorData.detail === 'string') return errorData.detail;
  if (Array.isArray(errorData.detail)) {
    return errorData.detail.map(e => `${e.loc?.slice(-1)[0] || 'field'}: ${e.msg}`).join(', ');
  }
  if (errorData.message) return errorData.message;
  return JSON.stringify(errorData);
}

export async function apiClient(endpoint, options = {}) {
  const {
    body,
    method = 'GET',
    headers = {},
    requiresAuth = true,
    isFormData = false,
    ...rest
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const requestHeaders = { ...headers };
  if (!isFormData && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token && requiresAuth) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers: requestHeaders,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    credentials: 'include', // sends cookies
    ...rest
  };

  try {
    let response = await fetch(url, config);

    // Handle 401 Unauthorized with token refresh
    if (response.status === 401 && requiresAuth && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newToken = data.access_token;
            setAuthToken(newToken);
            isRefreshing = false;
            onRefreshed(newToken);
          } else {
            isRefreshing = false;
            setAuthToken(null);
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            throw new ApiError('Session expired. Please log in again.', 401);
          }
        } catch (err) {
          isRefreshing = false;
          setAuthToken(null);
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
          throw err;
        }
      }

      // Queue original request until refresh is done
      return new Promise((resolve, reject) => {
        addRefreshSubscriber(async (newToken) => {
          config.headers['Authorization'] = `Bearer ${newToken}`;
          try {
            const retryRes = await fetch(url, config);
            if (!retryRes.ok) {
              const errData = await retryRes.json().catch(() => null);
              return reject(new ApiError(formatErrorMessage(errData, retryRes.status), retryRes.status, errData));
            }
            const data = await retryRes.json().catch(() => ({}));
            resolve(data);
          } catch (retryErr) {
            reject(retryErr);
          }
        });
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(formatErrorMessage(errorData, response.status), response.status, errorData);
    }

    // Check if response is json or blob
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || 'Network request failed', 0, error);
  }
}
