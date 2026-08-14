import { api } from '../shared/axios';

export interface StoreProfileApiResponse {
  name: string;
  address: string;
  phone: string;
  logo: string | null;
}

export async function fetchStoreProfile(): Promise<StoreProfileApiResponse> {
  const response = await api.get<StoreProfileApiResponse>('/api/store/profile');
  return response.data;
}
