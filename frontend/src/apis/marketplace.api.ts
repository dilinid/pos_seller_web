import { api } from '../shared/axios';
import type { Order, OrderItem, OrderStatus, PaymentMethodType, PaymentStatus, Product, ProductSubCategory } from '../types/marketplace.type';

export interface MarketplaceProductRaw {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  categoryId: string;
  subCategoryId: string;
  sellerId: string;
  unit: string;
  image: string | null;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications: Record<string, string>;
  weight: number | null;
  volume: number | null;
  code: string;
  barcode: string;
  stock: number;
  cost: number;
}

function mapRawToProduct(raw: MarketplaceProductRaw): Product {
  return {
    id: raw.id,
    name: raw.name,
    price: raw.price,
    mrp: raw.mrp ?? undefined,
    categoryId: raw.categoryId,
    subCategoryId: raw.subCategoryId,
    sellerId: raw.sellerId,
    unit: raw.unit,
    image: raw.image ?? '',
    images: raw.images,
    description: raw.description,
    rating: raw.rating,
    reviewCount: raw.reviewCount,
    features: raw.features,
    specifications: raw.specifications,
    weight: raw.weight,
    volume: raw.volume,
    quantity: raw.stock,
    reorderLevel: null,
  };
}

export async function fetchMarketplaceProducts(): Promise<Product[]> {
  const response = await api.get<MarketplaceProductRaw[]>('/api/marketplace/products');
  return response.data.map(mapRawToProduct);
}

export async function fetchMarketplaceCategories(): Promise<ProductSubCategory[]> {
  const response = await api.get<ProductSubCategory[]>('/api/marketplace/categories');
  return response.data;
}

export interface StoreLocation {
  code: string;
  name: string;
}

export async function fetchStoreLocations(): Promise<StoreLocation[]> {
  const response = await api.get<StoreLocation[]>('/api/location/stores');
  return response.data;
}

export interface PlaceOrderItem {
  itemCode: string;
  quantity: number;
  price: number;
}

export interface PlaceOrderRequest {
  items: PlaceOrderItem[];
  deliveryMethod: 'delivery' | 'pickup';
  deliveryAddress?: string;
  deliveryFee: number;
  paymentMethod: 'card' | 'cod';
  locationCode: string;
}

export interface PlaceOrderResponse {
  ordNo: string;
  status: string;
  createdAt: string;
}

export async function placeOrder(body: PlaceOrderRequest): Promise<PlaceOrderResponse> {
  const response = await api.post<PlaceOrderResponse>('/api/marketplace/orders', body);
  return response.data;
}

export interface OrderItemRaw {
  productId: string;
  productName: string;
  productImage: string | null;
  price: number;
  mrp: number | null;
  quantity: number;
  unit: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryFee: number;
  status: OrderStatus;
  isReturnable: boolean;
  returnReason: string | null;
  returnReasonNote: string | null;
}

export interface OrderRaw {
  id: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemRaw[];
  buyerName: string;
  buyerPhone: string | null;
  buyerEmail: string | null;
  deliveryAddress: string;
  deliveryDistrict: string;
  orderNotes: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  grandTotal: number;
  estimatedDelivery: string;
  isReturn: boolean;
  originalOrderId: string | null;
  returnEligible: boolean;
  locationCode: string | null;
  locationName: string | null;
  locationAddress: string | null;
  originalLocationName: string | null;
  originalLocationAddress: string | null;
}

export function mapOrderRawToOrder(raw: OrderRaw): Order {
  const items: OrderItem[] = raw.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage ?? '',
    price: item.price,
    mrp: item.mrp ?? undefined,
    quantity: item.quantity,
    unit: item.unit,
    deliveryMethod: item.deliveryMethod,
    deliveryFee: item.deliveryFee,
    status: item.status,
    isReturnable: item.isReturnable,
    returnReason: (item.returnReason ?? undefined) as OrderItem['returnReason'],
    returnReasonNote: item.returnReasonNote ?? undefined,
  }));

  return {
    id: raw.id,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    items,
    buyerName: raw.buyerName,
    buyerPhone: raw.buyerPhone ?? undefined,
    buyerEmail: raw.buyerEmail ?? undefined,
    deliveryAddress: raw.deliveryAddress,
    deliveryDistrict: raw.deliveryDistrict,
    orderNotes: raw.orderNotes,
    paymentMethod: raw.paymentMethod,
    paymentStatus: raw.paymentStatus,
    grandTotal: raw.grandTotal,
    estimatedDelivery: raw.estimatedDelivery,
    isReturn: raw.isReturn,
    originalOrderId: raw.originalOrderId ?? undefined,
    returnEligible: raw.returnEligible,
    locationCode: raw.locationCode ?? undefined,
    locationName: raw.locationName ?? undefined,
    locationAddress: raw.locationAddress ?? undefined,
    originalLocationName: raw.originalLocationName ?? undefined,
    originalLocationAddress: raw.originalLocationAddress ?? undefined,
  };
}

export async function fetchMyOrders(): Promise<OrderRaw[]> {
  const response = await api.get<OrderRaw[]>('/api/marketplace/orders');
  return response.data;
}

/** Every online order for the store, across all customers — the store admin's
 * counterpart to fetchMyOrders. */
export async function fetchAdminOrders(): Promise<OrderRaw[]> {
  const response = await api.get<OrderRaw[]>('/api/marketplace/seller/orders');
  return response.data;
}

export async function fetchOrderById(orderId: string): Promise<OrderRaw> {
  const response = await api.get<OrderRaw>(`/api/marketplace/orders/${encodeURIComponent(orderId)}`);
  return response.data;
}

export interface ReturnRequestItem {
  itemCode: string;
  quantity: number;
}

export interface ReturnRequestBody {
  items: ReturnRequestItem[];
  reason: string;
  note?: string;
  /** The pos_loc.loc_code the buyer picked as where they intend to drop off /
   * ship back the item — informational only, doesn't affect where the item's
   * stock is restocked at refund time. */
  returnLocationCode: string;
}

/** Files a return request against one of the buyer's own delivered orders —
 * creates a real 'RTN' pos_ordhed row (no approval step). */
export async function submitReturn(ordNo: string, body: ReturnRequestBody): Promise<OrderRaw> {
  const response = await api.post<OrderRaw>(`/api/marketplace/orders/${encodeURIComponent(ordNo)}/return`, body);
  return response.data;
}

/** The current buyer's own return requests. */
export async function fetchMyReturns(): Promise<OrderRaw[]> {
  const response = await api.get<OrderRaw[]>('/api/marketplace/orders/returns');
  return response.data;
}

/** Every return request across all customers — backs the store dashboard's
 * refunding queue. */
export async function fetchSellerReturns(): Promise<OrderRaw[]> {
  const response = await api.get<OrderRaw[]>('/api/marketplace/seller/orders/returns');
  return response.data;
}

export type RefundMethod = 'card' | 'cash';

/** Card reference details the cashier enters when refunding to a card — no
 * real payment gateway here, this is just kept as a paper trail on the
 * refund's pos_invpay row (paytypedesc/crdcardno). */
export interface RefundCardDetails {
  cardType: string;
  cardLastFour: string;
}

/** Store-side action: marks a filed return as refunded, and records it as an
 * invoice (pos_invhed/invdtl/invpay) paid out via the given method. */
export async function refundReturn(
  rtnOrdNo: string,
  method: RefundMethod = 'card',
  cardDetails?: RefundCardDetails,
): Promise<OrderRaw> {
  const response = await api.post<OrderRaw>(
    `/api/marketplace/seller/orders/returns/${encodeURIComponent(rtnOrdNo)}/refund`,
    { method, ...(method === 'card' ? cardDetails : {}) },
  );
  return response.data;
}
