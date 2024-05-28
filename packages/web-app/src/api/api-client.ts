import axios, { type AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.log('api interceptor token', token);
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    alert(`api interceptor Error response ${error.response}`);

    return Promise.reject(error);
  }
);

let isTokenRefreshing = false;

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isTokenRefreshing
    ) {
      try {
        originalRequest._retry = true;
        isTokenRefreshing = true;

        const refreshToken = localStorage.getItem('refreshToken');

        console.log('original request', originalRequest);

        await authApi.refreshToken(refreshToken!);
        isTokenRefreshing = false;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh error', refreshError);
        window.location.href = '/login/sign-in';
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (username: string, password: string) => {
    const loginData = {
      username: username,
      password: password,
    };
    try {
      const response = await api.post('/auth/login', loginData);
      localStorage.setItem('authToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      if (response.data && response.data.accessToken) {
        const accessToken = response.data.accessToken;
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error('Authorization error', error);
      throw error;
    }
  },
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
        withCredentials: true,
      });

      if (response.data && response.data.accessToken) {
        const accessToken = response.data.accessToken;
        localStorage.setItem('authToken', response.data.accessToken);
        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      window.location.href = '/login/sign-in';
      console.error('Authorization error', error);
      throw error;
    }
  },
  getCurrentUser: async (tryAgain = false) => {
    tryAgain = !tryAgain;
    try {
      const response = await api.get('/users/me');
      console.log('original current user response: ', response.data);
      return response.data;
    } catch (error) {
      if (tryAgain) {
        console.log('trying again to get current user');
        await authApi.getCurrentUser(true);
      } else {
        window.location.href = '/login/sign-in';
      }
      console.error('Get current user error', error);
    }
  },
  getAuthToken(): string {
    return localStorage.getItem('authToken')!;
  }
};
