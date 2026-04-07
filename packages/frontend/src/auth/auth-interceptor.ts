/**
 * Axios Auth Interceptor
 *
 * Attaches JWT token to requests and handles 401 refresh flow.
 */

import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token-storage';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export function setupAuthInterceptors(): void {
  // Request interceptor: attach token
  axios.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor: handle 401 with token refresh
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Don't retry auth endpoints or already-retried requests
      if (
        !originalRequest ||
        originalRequest._retry ||
        originalRequest.url?.includes('/api/auth/')
      ) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401) {
        if (isRefreshing) {
          // Queue this request until refresh completes
          return new Promise((resolve) => {
            addRefreshSubscriber((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearTokens();
          window.location.reload();
          return Promise.reject(error);
        }

        try {
          const response = await axios.post('/api/auth/refresh', { refreshToken });
          const { token, refreshToken: newRefreshToken } = response.data;
          setTokens(token, newRefreshToken);
          isRefreshing = false;
          onRefreshed(token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios(originalRequest);
        } catch {
          isRefreshing = false;
          refreshSubscribers = [];
          clearTokens();
          window.location.reload();
          return Promise.reject(error);
        }
      }

      return Promise.reject(error);
    }
  );
}
