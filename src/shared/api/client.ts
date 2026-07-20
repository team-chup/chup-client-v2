'use client';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';

import { COOKIE_KEYS } from '@/shared/config';
import { deleteCookie, getCookie, setCookie } from '@/shared/lib';

import { authUrl } from './endpoints';

type QueueEntry = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: QueueEntry[] = [];

const flushQueue = (token: string | null, error?: unknown) => {
  refreshQueue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
  refreshQueue = [];
};

export const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 리프레시 요청은 인터셉터를 타지 않아야 401 무한 루프가 안 생김
const refreshAxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getCookie(COOKIE_KEYS.ACCESS_TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (newToken) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };
            resolve(axiosInstance(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshToken = getCookie(COOKIE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await refreshAxiosInstance.put(authUrl.putRefresh(), {
        refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data.data;

      if (!newAccessToken) throw new Error('No new token returned');

      setCookie(COOKIE_KEYS.ACCESS_TOKEN, newAccessToken);
      setCookie(COOKIE_KEYS.REFRESH_TOKEN, newRefreshToken);

      flushQueue(newAccessToken);

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${newAccessToken}`,
      };

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      flushQueue(null, refreshError);

      deleteCookie(COOKIE_KEYS.ACCESS_TOKEN);
      deleteCookie(COOKIE_KEYS.REFRESH_TOKEN);
      location.href = '/signin';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
