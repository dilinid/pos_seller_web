export interface District {
  id: string;
  name: string;
}

export interface ProductSubCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subCategories?: ProductSubCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  subCategories: ProductSubCategory[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  categoryId: string;
  subCategoryId: string;
  sellerId: string;
  unit: string;
  image: string;
  images: string[];
  description: string;
  rating: number;
  reviewCount: number;
  features: string[];
  specifications: Record<string, string>;
  weight: number | null;
  volume: number | null;
  quantity: number;
  reorderLevel: number | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  checked: boolean;
}

export type PaymentMethodType = 'card' | 'cod';

// Mirrors the backend's OrderStatus enum (backend/app/models/pos_ordhed.py) 1:1,
// plus 'returned' — a UI-only addition ahead of backend support (see
// stores/marketplace.store.ts's returnOrders: return requests aren't persisted
// via the API yet, only modeled client-side as pseudo-orders with this status).
export type OrderStatus = 'pending' | 'picking' | 'packing' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid';

export type SellerPayoutStatus = 'pending' | 'processing' | 'paid' | 'on_hold';

// Preset reasons a buyer can pick when requesting a return.
export type ReturnReason = 'defective' | 'wrong_item' | 'no_longer_needed' | 'wrong_size' | 'other';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  mrp?: number;
  quantity: number;
  unit: string;
  sellerId: string;
  sellerName: string;
  deliveryMethod: 'delivery' | 'pickup';
  deliveryFee: number;
  status: OrderStatus;
  trackingNumber?: string;
  trackingCarrier?: string;
  deliveryContactPhone?: string;
  sellerNotes?: string;
  sellerPayoutStatus?: SellerPayoutStatus;
  sellerPayoutDate?: string;
  sellerPayoutMethod?: string;
  sellerPayoutRef?: string;
  sellerPayoutNote?: string;
  /** Set only on items belonging to a return pseudo-order (Order.isReturn). */
  returnReason?: ReturnReason;
  returnReasonNote?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  deliveryAddress: string;
  deliveryDistrict: string;
  orderNotes: string;
  paymentMethod: PaymentMethodType;
  paymentStatus: PaymentStatus;
  grandTotal: number;
  estimatedDelivery: string;
  /** True for the client-only return pseudo-orders created by
   * submitReturnRequest — see stores/marketplace.store.ts. Would map to a real
   * pos_ordhed row with type 'RTN' (from pos_return_type) once the backend
   * supports returns; for now these live only in local persisted state. */
  isReturn?: boolean;
  /** The real order this return was filed against. Only set when isReturn is true. */
  originalOrderId?: string;
}

export interface UserReview {
  id: string;
  targetType: ReviewTarget;
  targetId: string;
  orderId: string;
  orderItemProductId?: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  autoRated?: boolean;
}

export type ReviewTarget = 'product' | 'seller' | 'buyer';

export interface ReviewPeriod {
  orderId: string;
  sellerId: string;
  buyerId: string;
  buyerReviewedProduct: boolean;
  buyerReviewedSeller: boolean;
  sellerReviewedBuyer: boolean;
  expiresAt: string;
  closed: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

