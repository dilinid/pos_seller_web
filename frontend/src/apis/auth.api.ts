import axios from "axios";
import type { LoginResponse, RegisterRequest } from "../types/auth.type";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const OAUTH_URL = import.meta.env.VITE_OAUTH_URL;
const CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_OAUTH_CLIENT_SECRET;

const authApi = axios.create();

export const loginApi = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const params = new URLSearchParams();

  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  const response = await authApi.post(`${OAUTH_URL}`, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
};


export async function registerNewUser(user: RegisterRequest){
   const response = await authApi.post(`${BASE_URL}/client/sign_up`, {
    'fullName': user.fullname,
      'iniName': user.fullname,
      'nic': user.nic,
      'dateOfBirth': user.dob,
      'mobile1': user.phoneNumber,
      'email': user.email,
      'userName': user.username,
      'password': user.password,
      'confirmPassword': user.confirmPassword,
   })

   return response.data
}

export async function refreshTokenApi(refreshToken: string): Promise<LoginResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);

  const response = await authApi.post(`${OAUTH_URL}`, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}
