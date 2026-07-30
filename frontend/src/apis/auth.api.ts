import axios from "axios";
import type { LoginResponse } from "../types/auth.type";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const authApi = axios.create();

export const loginApi = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const response = await authApi.post(`${BASE_URL}/auth/login`, {
    username,
    password,
  });

  return response.data;
};
