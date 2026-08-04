import { api } from '../shared/axios';

export interface PickupOrder {
  orderNo: string;
  orderDate: string | null;
  customer: string;
  totalItems: number;
  status: 'Pending' | 'Confirmed';
  pickNo: string;
  remarks: string;
}

export interface PickupItem {
  lineno: number;
  itemCode: string;
  itemName: string;
  location: string;
  qtyOrdered: number;
  qtyPicked: number | null;
}

export interface PickupDetail {
  order: PickupOrder;
  items: PickupItem[];
  printedBy?: string | null;
}

const BASE_URL = '/api/seller/pickup-list';

export async function fetchPickupList(): Promise<PickupOrder[]> {
  const response = await api.get<PickupOrder[]>(BASE_URL);
  return response.data;
}

export async function fetchPickupDetail(orderNo: string): Promise<PickupDetail> {
  const response = await api.get<PickupDetail>(`${BASE_URL}/${orderNo}`);
  return response.data;
}

export async function printPickupOrder(orderNo: string): Promise<PickupDetail> {
  const response = await api.post<PickupDetail>(`${BASE_URL}/${orderNo}/print`);
  return response.data;
}

export async function updatePickupRemarks(orderNo: string, remarks: string): Promise<PickupOrder> {
  const response = await api.patch<PickupOrder>(`${BASE_URL}/${orderNo}/remarks`, { remarks });
  return response.data;
}

export async function confirmPickupOrder(
  orderNo: string,
  items: { lineno: number; qtyPicked: number }[],
  remarks?: string,
): Promise<PickupDetail> {
  const response = await api.post<PickupDetail>(`${BASE_URL}/${orderNo}/confirm`, { items, remarks });
  return response.data;
}
