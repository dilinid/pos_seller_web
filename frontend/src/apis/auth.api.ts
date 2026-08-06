import axios from "axios";
import type { LoginResponse, SignupRequest } from "../types/auth.type";
import type { District, DsDivision, GnDivision } from "../types/profile.type";
import { api } from "../shared/axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const authApi = axios.create();

export interface CustomerContactInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
  gender: string | null;
  address: string | null;
  district: District | null;
  dsDivision: DsDivision | null;
  gnDivision: GnDivision | null;
}

/** The current user's contact details as stored in pos_customer (cus_name/cus_tep1/cus_email/cus_title/
 * cus_add1-4) — the source of truth for Full Legal Name, Active Phone Number, Email Address, Gender, and
 * Delivery / Billing Address on the profile page. */
export const fetchMyContactInfo = async (): Promise<CustomerContactInfo> => {
  const response = await api.get(`${BASE_URL}/auth/me`);
  return response.data;
};

export interface UpdateCustomerContactRequest {
  gender?: string;
  districtId?: string;
  dsDivisionId?: string;
  gnDivisionId?: string;
  address?: string;
}

/** Persists gender/district/dsDivision/gnDivision/address to pos_customer. */
export const updateMyContactInfo = async (
  payload: UpdateCustomerContactRequest,
): Promise<CustomerContactInfo> => {
  const response = await api.patch(`${BASE_URL}/auth/me`, payload);
  return response.data;
};

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

export const signupApi = async (
  payload: SignupRequest,
): Promise<LoginResponse> => {
  const response = await authApi.post(`${BASE_URL}/auth/signup`, payload);

  return response.data;
};
