import axios from "axios";
import { useAuthStore } from "../stores/auth.store";
import { refreshTokenApi } from "../apis/auth.api";

export const api = axios.create();

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().userSession?.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userSession = useAuthStore.getState().userSession;
        if (!userSession || !userSession.refreshToken) {
          useAuthStore.getState().clearState();
          return Promise.reject(error);
        }

        const response = await refreshTokenApi(userSession.refreshToken);
        if (!response) {
          useAuthStore.getState().clearState();
          return Promise.reject(error);
        }

        useAuthStore.getState().setUserSession({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          username: userSession.username,
        });
        originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
        return api.request(originalRequest);
      } catch (e) {
        console.error(e);
        useAuthStore.getState().clearState();
      }
    }
    return Promise.reject(error);
  },
);
