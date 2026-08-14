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

// Mirrors the backend's OrderStatus enum (libs/pos_common/pos_common/models/pos_ordhed.py) 1:1.
export type OrderStatus = 'pending' | 'picking' | 'packing' | 'shipped' | 'delivered' | 'returned' | 'refunded' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid';

export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'on_hold';

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
  deliveryMethod: 'delivery' | 'pickup';
  deliveryFee: number;
  status: OrderStatus;
  trackingNumber?: string;
  trackingCarrier?: string;
  deliveryContactPhone?: string;
  adminNotes?: string;
  payoutStatus?: PayoutStatus;
  payoutDate?: string;
  payoutMethod?: string;
  payoutRef?: string;
  payoutNote?: string;
  /** Whether pos_itemlots.is_returnable is set for this item — gates whether
   * it can be selected on the return request form at all. */
  isReturnable?: boolean;
  /** Set only on items belonging to a return order (Order.isReturn). */
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
  /** True for return orders (a real pos_ordhed row with type 'RTN') created by
   * submitReturnRequest — see stores/marketplace.store.ts. */
  isReturn?: boolean;
  /** The real order this return was filed against. Only set when isReturn is true. */
  originalOrderId?: string;
  /** Only meaningful (and only ever true) on a non-return order: whether the
   * buyer can still file a return request against it right now. */
  returnEligible?: boolean;
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

