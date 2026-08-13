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
}

/** Fills in the single-tenant seller identity (see useSellerStore's `id: 'store'`)
 * that the backend doesn't know about — this app has exactly one seller. */
export function mapOrderRawToOrder(raw: OrderRaw, sellerId: string, sellerName: string): Order {
  const items: OrderItem[] = raw.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage ?? '',
    price: item.price,
    mrp: item.mrp ?? undefined,
    quantity: item.quantity,
    unit: item.unit,
    sellerId,
    sellerName,
    deliveryMethod: item.deliveryMethod,
    deliveryFee: item.deliveryFee,
    status: item.status,
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
  };
}

export async function fetchMyOrders(): Promise<OrderRaw[]> {
  const response = await api.get<OrderRaw[]>('/api/marketplace/orders');
  return response.data;
}

/** Every online order for the store, across all customers — the seller-side
 * counterpart to fetchMyOrders. */
export async function fetchSellerOrders(): Promise<OrderRaw[]> {
  const response = await api.get<OrderRaw[]>('/api/marketplace/seller/orders');
  return response.data;
}

export async function fetchOrderById(orderId: string): Promise<OrderRaw> {
  const response = await api.get<OrderRaw>(`/api/marketplace/orders/${encodeURIComponent(orderId)}`);
  return response.data;
}
