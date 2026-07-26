import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

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
    if (error.response?.status === 401) {
      useAuthStore.getState().clearState();
    }
    return Promise.reject(error);
  },
);
