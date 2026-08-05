import { api } from '../shared/axios';

export interface StaffMember {
  id: number;
  name: string;
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const response = await api.get<StaffMember[]>('/api/seller/staff');
  return response.data;
}
