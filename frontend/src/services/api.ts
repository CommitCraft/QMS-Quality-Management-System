/// <reference types="vite/client" />

import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qms_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const emitSessionExpired = (returnTo?: string) => {
  window.dispatchEvent(
    new CustomEvent('qms:session-expired', {
      detail: {
        returnTo,
      },
    }),
  );
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      refreshPromise = refreshPromise || refreshToken();
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (newToken) {
        localStorage.setItem('qms_access_token', newToken);
        if (originalRequest?.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return api(originalRequest);
      }
      localStorage.removeItem('qms_access_token');
      emitSessionExpired(typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}${window.location.hash}` : undefined);
    } else if (error.response?.status === 401) {
      localStorage.removeItem('qms_access_token');
      emitSessionExpired(typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}${window.location.hash}` : undefined);
    }
    return Promise.reject(error);
  },
);

async function refreshToken(): Promise<string | null> {
  try {
    const response = await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });
    return response.data.accessToken ?? null;
  } catch {
    return null;
  }
}
