export interface Seller {
  id: string;
  name: string;
  rating: number;
  productCount: number;
  memberSince: string;
  description: string;
  responseTime: string;
  totalSales: number;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  pickupAddress: string;
  estimatedDeliveryDays: string;
}

export interface FeeBracket {
  id: string;
  label: string;
  fromValue: number;
  toValue: number | null;
  fee: number;
}

export interface SellerDeliveryConfig {
  districtFees: Record<string, number>;
  freeDeliveryMin: number | null;
  weightFeeBrackets: FeeBracket[];
  volumeFeeBrackets: FeeBracket[];
  quantityFeeBrackets: FeeBracket[];
}

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

export type PaymentMethodType = 'bank' | 'cod' | 'card' | 'payment_slip';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'awaiting_receipt' | 'receipt_uploaded' | 'verified';

export type SellerPayoutStatus = 'pending' | 'processing' | 'paid' | 'on_hold';

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

export interface MarketplaceStore {
  products: Product[];
  sellers: Seller[];
  categories: ProductSubCategory[];
  cart: CartItem[];
  selectedSubCategory: string | null;
  searchQuery: string;
  setSubCategory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCartItem: (productId: string) => void;
  toggleSellerItems: (sellerId: string) => void;
  filteredProducts: () => Product[];
  currentSubCategories: () => ProductSubCategory[];
  cartCount: () => number;
  cartTotal: () => number;
  getSeller: (sellerId: string) => Seller | undefined;
}
