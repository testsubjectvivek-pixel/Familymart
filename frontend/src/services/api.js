import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── Simple in-memory GET cache ───────────────────────────────────────────────
const cache = new Map();
const CACHE_TTL = 60_000; // 60 seconds
let lastToken = null;
let isRefreshing = false;
let refreshPromise = null;

export const clearCache = (keyPrefix = null) => {
  if (keyPrefix) {
    for (const key of cache.keys()) {
      if (key.startsWith(keyPrefix)) cache.delete(key);
    }
  } else {
    cache.clear();
  }
};

// Wrap api.get with caching
const originalGet = api.get.bind(api);
api.get = async (url, config = {}) => {
  // Skip cache for requests with custom params that change frequently
  const skipCache = config.skipCache === true;
  const token = localStorage.getItem('token') || '';
  const cacheKey = `${token}:${url}:${JSON.stringify(config.params || '')}`;

  if (!skipCache && cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (Date.now() - timestamp < CACHE_TTL) {
      return { data };
    }
    cache.delete(cacheKey);
  }

  const response = await originalGet(url, config);

  if (!skipCache) {
    cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
  }

  return response;
};

// Invalidate cache on mutations
const invalidateOnMutation = (url) => {
  // Invalidate related resource caches
  if (url.includes('/products')) clearCache('/products');
  if (url.includes('/categories')) clearCache('/categories');
  if (url.includes('/orders')) clearCache('/orders');
};

const originalPost = api.post.bind(api);
api.post = async (url, data, config) => {
  const response = await originalPost(url, data, config);
  invalidateOnMutation(url);
  clearCache(); // token mutations often follow writes
  return response;
};

const originalPut = api.put.bind(api);
api.put = async (url, data, config) => {
  const response = await originalPut(url, data, config);
  invalidateOnMutation(url);
  clearCache();
  return response;
};

const originalDelete = api.delete.bind(api);
api.delete = async (url, config) => {
  const response = await originalDelete(url, config);
  invalidateOnMutation(url);
  clearCache();
  return response;
};
// ─────────────────────────────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (token !== lastToken) {
      clearCache();
      lastToken = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = api.post('/auth/refresh');
        }
        const refreshResponse = await refreshPromise;
        isRefreshing = false;
        const newToken = refreshResponse.data?.token;
        if (newToken) {
          localStorage.setItem('token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          clearCache();
          return api(originalRequest);
        }
      } catch (refreshErr) {
        isRefreshing = false;
        localStorage.removeItem('token');
        clearCache();
      }
    }

    if (error.response?.status === 401) {
      if (
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
