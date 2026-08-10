import { api } from '../shared/axios';

export interface PackageType {
  id: number;
  type: string;
  length: number | null;
  width: number | null;
  height: number | null;
}

export interface PackingItem {
  lineno: number;
  itemCode: string;
  itemName: string;
  qtyOrdered: number;
  qtyPicked: number | null;
  packed: boolean;
}

export interface PackingOrder {
  orderNo: string;
  date: string | null;
  customer: string;
  shippingAddress: string;
  totalItems: number;
  status: 'Pending' | 'Packed & Ready' | 'Delivered';
  packNo: string;
  packageType: string | null;
  weight: number | null;
  dimensions: string | null;
  packedBy: string | null;
  remarks: string;
  deliveryAgent: string | null;
  deliveryAgentContact: string | null;
  deliveryVehicle: string | null;
  deliveryRefNo: string | null;
  deliveryCusPhone: string | null;
  deliveryEstimateDays: number | null;
  deliveryRemark: string | null;
}

export interface PackingDetail {
  order: PackingOrder;
  items: PackingItem[];
}

const BASE_URL = '/api/seller/packing-list';

export async function fetchPackageTypes(): Promise<PackageType[]> {
  const response = await api.get<PackageType[]>('/api/seller/package-types');
  return response.data;
}

export async function fetchPackingList(): Promise<PackingOrder[]> {
  const response = await api.get<PackingOrder[]>(BASE_URL);
  return response.data;
}

export async function fetchPackingDetail(orderNo: string): Promise<PackingDetail> {
  const response = await api.get<PackingDetail>(`${BASE_URL}/${orderNo}`);
  return response.data;
}

export async function markPacked(
  orderNo: string,
  body: { packageTypeId: number; packerId: number; weight: number; remarks?: string },
): Promise<PackingDetail> {
  const response = await api.post<PackingDetail>(`${BASE_URL}/${orderNo}/pack`, body);
  return response.data;
}

export async function updatePackingRemarks(orderNo: string, remarks: string): Promise<PackingOrder> {
  const response = await api.patch<PackingOrder>(`${BASE_URL}/${orderNo}/remarks`, { remarks });
  return response.data;
}

export async function markDelivered(orderNo: string): Promise<PackingDetail> {
  const response = await api.post<PackingDetail>(`${BASE_URL}/${orderNo}/deliver`);
  return response.data;
}

export interface DeliveryDetailsInput {
  agent?: string;
  agentContact?: string;
  vehicleNo?: string;
  refNo?: string;
  cusPhone?: string;
  estimateDays?: number;
  remark?: string;
}

export async function updateDeliveryDetails(
  orderNo: string,
  body: DeliveryDetailsInput,
): Promise<PackingOrder> {
  const response = await api.patch<PackingOrder>(`${BASE_URL}/${orderNo}/delivery-details`, body);
  return response.data;
}
