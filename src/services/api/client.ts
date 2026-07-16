import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/config';
import { storage } from '@/utils/storage';
import { useAuthStore } from '@/store/authStore';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

const joinUrl = (...parts: Array<string | undefined>) =>
  parts
    .filter(Boolean)
    .map((p) => String(p))
    .join('/')
    .replace(/([^:]\/)\/+/g, '$1')
    .replace(/\/+$/, '');

const apiBase = joinUrl(config.api.baseUrl, config.api.prefix);
const gatewayBase = joinUrl(config.api.baseUrl);
const hackerrankBase = joinUrl(config.api.hackerrankBaseUrl);

const shouldDebug = () => config.api.debug && process.env.NODE_ENV !== 'production';

const fullUrl = (cfg: InternalAxiosRequestConfig, baseURL: string) => {
  const url = cfg.url ?? '';
  // Axios may pass absolute urls; keep them as-is.
  if (/^https?:\/\//i.test(url)) return url;
  return joinUrl(baseURL, url);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBase,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// For endpoints that are mounted at the gateway root (no `/api` prefix),
// e.g. `/leetcode/*` forwarded to AI service.
export const gatewayClient: AxiosInstance = axios.create({
  baseURL: gatewayBase,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// HackerRank mentor routes go through the gateway (`/hackerrank/*`), same as LeetCode.
export const hackerrankClient: AxiosInstance = axios.create({
  baseURL: hackerrankBase,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const accessToken = storage.get<string>(config.auth.tokenKey);
    if (accessToken && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (shouldDebug()) {
      console.debug('[api]', requestConfig.method?.toUpperCase(), fullUrl(requestConfig, apiBase));
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

gatewayClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const accessToken = storage.get<string>(config.auth.tokenKey);
    if (accessToken && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (shouldDebug()) {
      console.debug(
        '[gateway]',
        requestConfig.method?.toUpperCase(),
        fullUrl(requestConfig, gatewayBase),
      );
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

hackerrankClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    const accessToken = storage.get<string>(config.auth.tokenKey);
    if (accessToken && requestConfig.headers) {
      requestConfig.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (shouldDebug()) {
      console.debug(
        '[hackerrank]',
        requestConfig.method?.toUpperCase(),
        fullUrl(requestConfig, hackerrankBase),
      );
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

gatewayClient.interceptors.response.use(
  (response) => {
    if (shouldDebug()) {
      console.debug(
        '[gateway]',
        response.status,
        response.config.method?.toUpperCase(),
        fullUrl(response.config, gatewayBase),
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (shouldDebug()) {
      const cfg = error.config as InternalAxiosRequestConfig | undefined;

      console.debug(
        '[gateway]',
        error.response?.status ?? 'ERR',
        cfg?.method?.toUpperCase(),
        cfg ? fullUrl(cfg, gatewayBase) : '(no-config)',
      );
    }
    return Promise.reject(error);
  },
);

hackerrankClient.interceptors.response.use(
  (response) => {
    if (shouldDebug()) {
      console.debug(
        '[hackerrank]',
        response.status,
        response.config.method?.toUpperCase(),
        fullUrl(response.config, hackerrankBase),
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (shouldDebug()) {
      const cfg = error.config as InternalAxiosRequestConfig | undefined;

      console.debug(
        '[hackerrank]',
        error.response?.status ?? 'ERR',
        cfg?.method?.toUpperCase(),
        cfg ? fullUrl(cfg, hackerrankBase) : '(no-config)',
      );
    }
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    if (shouldDebug()) {
      console.debug(
        '[api]',
        response.status,
        response.config.method?.toUpperCase(),
        fullUrl(response.config, apiBase),
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    if (shouldDebug()) {
      const cfg = error.config as InternalAxiosRequestConfig | undefined;

      console.debug(
        '[api]',
        error.response?.status ?? 'ERR',
        cfg?.method?.toUpperCase(),
        cfg ? fullUrl(cfg, apiBase) : '(no-config)',
      );
    }
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = storage.get<string>(config.auth.refreshTokenKey);
      if (!refreshToken) throw new Error('No refresh token available');

      // Use a plain axios call here to avoid recursive interceptor loops.
      const response = await axios.post(`${apiBase}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token } = response.data as {
        access_token: string;
        refresh_token: string;
      };

      storage.set(config.auth.tokenKey, access_token);
      storage.set(config.auth.refreshTokenKey, refresh_token);

      processQueue(null, access_token);

      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().logout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
