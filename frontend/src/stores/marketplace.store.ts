import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, ProductSubCategory, PaymentMethodType, Order, UserReview, ReviewPeriod, OrderStatus, PaymentStatus } from '../types/marketplace.type';
import { PRODUCT_CATALOG } from '../data/products';
import { MARKETPLACE_CATEGORIES } from '../data/categories';
import { fetchMarketplaceProducts, fetchMarketplaceCategories } from '../apis/marketplace.api';

interface MarketplaceStoreState {
  products: Product[];
  categories: ProductSubCategory[];
  cart: CartItem[];
  selectedSubCategory: string | null;
  searchQuery: string;
  productsLoading: boolean;
  productsError: string | null;
  categoriesLoading: boolean;
  categoriesError: string | null;

  setSubCategory: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  loadProducts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCartItem: (productId: string) => void;
  toggleAllCartItems: () => void;
  removeCheckedItems: () => void;

  deliveryAddress: string;
  deliveryDistrict: string;
  deliveryMethod: 'delivery' | 'pickup' | null;
  orderNotes: string;
  setDeliveryAddress: (address: string) => void;
  setDeliveryDistrict: (district: string) => void;
  setDeliveryMethod: (method: 'delivery' | 'pickup') => void;
  setOrderNotes: (notes: string) => void;
  resetCheckout: () => void;

  paymentMethod: PaymentMethodType;
  setPaymentMethod: (method: PaymentMethodType) => void;

  directBuyItem: { product: Product; quantity: number } | null;
  setDirectBuyItem: (item: { product: Product; quantity: number } | null) => void;

  orders: Order[];
  allReviews: UserReview[];
  reviewPeriods: ReviewPeriod[];
  addOrder: (order: Order) => void;
  updateOrderItemStatus: (orderId: string, productId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => void;
  sellerUpdateItemStatus: (orderId: string, productId: string, status: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string; contactPhone?: string }) => void;
  sellerUpdateTracking: (orderId: string, productId: string, carrier: string, trackingNumber: string, contactPhone?: string) => void;
  sellerUpdateNote: (orderId: string, productId: string, note: string) => void;
  seedSellerOrders: (sellerId: string) => void;
  submitReview: (review: UserReview) => void;
  startReviewPeriod: (orderId: string, sellerId: string, buyerId: string) => void;
  closeReviewPeriod: (orderId: string, sellerId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
}

const CHECKOUT_INIT = {
  deliveryAddress: '',
  deliveryDistrict: 'dist-colombo',
  deliveryMethod: null as 'delivery' | 'pickup' | null,
  orderNotes: '',
  paymentMethod: 'card' as PaymentMethodType,
  directBuyItem: null as { product: Product; quantity: number } | null,
};

export const useMarketplaceStore = create<MarketplaceStoreState>()(
  persist(
    (set, get) => ({
      products: PRODUCT_CATALOG,
      categories: MARKETPLACE_CATEGORIES,
      cart: [],
      selectedSubCategory: null,
      searchQuery: '',
      productsLoading: true,
      productsError: null,
      categoriesLoading: false,
      categoriesError: null,
      ...CHECKOUT_INIT,
      orders: [],
      allReviews: [],
      reviewPeriods: [],

      setSubCategory: (id) => {
        set({ selectedSubCategory: get().selectedSubCategory === id ? null : id });
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      loadProducts: async () => {
        set({ productsLoading: true, productsError: null });
        try {
          const products = await fetchMarketplaceProducts();
          set({ products, productsLoading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to load products';
          set({ productsError: message, productsLoading: false });
        }
      },

      loadCategories: async () => {
        set({ categoriesLoading: true, categoriesError: null });
        try {
          const categories = await fetchMarketplaceCategories();
          set({ categories, categoriesLoading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to load categories';
          set({ categoriesError: message, categoriesLoading: false });
        }
      },

      addToCart: (product) => {
        const { cart } = get();
        const existingIndex = cart.findIndex((item) => item.product.id === product.id);
        if (existingIndex > -1) {
          const updated = [...cart];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
            checked: true,
          };
          set({ cart: updated });
        } else {
          set({ cart: [...cart, { product, quantity: 1, checked: true }] });
        }
      },

      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({
            cart: get().cart.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },

      clearCart: () => set({ cart: [] }),

      toggleCartItem: (productId) => {
        set({
          cart: get().cart.map((item) =>
            item.product.id === productId ? { ...item, checked: !item.checked } : item
          ),
        });
      },

      toggleAllCartItems: () => {
        const { cart } = get();
        const allChecked = cart.every((item) => item.checked);
        set({
          cart: cart.map((item) => ({ ...item, checked: !allChecked })),
        });
      },

      removeCheckedItems: () => {
        set({ cart: get().cart.filter((item) => !item.checked) });
      },

      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setDeliveryDistrict: (district) => set({ deliveryDistrict: district }),
      setDeliveryMethod: (method) => set({ deliveryMethod: method }),
      setOrderNotes: (notes) => set({ orderNotes: notes }),
      resetCheckout: () => set({ ...CHECKOUT_INIT }),

      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setDirectBuyItem: (item) => set({ directBuyItem: item }),

      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrderItemStatus: (orderId, productId, status) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  updatedAt: new Date().toISOString(),
                  items: o.items.map((item) =>
                    item.productId === productId ? { ...item, status } : item
                  ),
                }
              : o
          ),
        });
      },
      sellerUpdateItemStatus: (orderId, productId, status, tracking) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  updatedAt: new Date().toISOString(),
                  items: o.items.map((item) =>
                    item.productId === productId
                      ? {
                          ...item,
                          status,
                          ...(tracking?.carrier ? { trackingCarrier: tracking.carrier } : {}),
                          ...(tracking?.trackingNumber ? { trackingNumber: tracking.trackingNumber } : {}),
                          ...(tracking?.contactPhone ? { deliveryContactPhone: tracking.contactPhone } : {}),
                        }
                      : item
                  ),
                }
              : o
          ),
        });
      },
      sellerUpdateTracking: (orderId, productId, carrier, trackingNumber, contactPhone) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  updatedAt: new Date().toISOString(),
                  items: o.items.map((item) =>
                    item.productId === productId
                      ? { ...item, trackingCarrier: carrier, trackingNumber, ...(contactPhone ? { deliveryContactPhone: contactPhone } : {}) }
                      : item
                  ),
                }
              : o
          ),
        });
      },
      sellerUpdateNote: (orderId, productId, note) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  updatedAt: new Date().toISOString(),
                  items: o.items.map((item) =>
                    item.productId === productId ? { ...item, sellerNotes: note } : item
                  ),
                }
              : o
          ),
        });
      },
      seedSellerOrders: (sellerId: string) => {
        const { orders } = get();
        const existingDemoMatch = orders.some(
          (o) => o.id.startsWith('ORD-DEMO-') && o.items.some((i) => i.sellerId === sellerId)
        );
        if (!existingDemoMatch) {
          const nonDemo = orders.filter((o) => !o.id.startsWith('ORD-DEMO-'));
          const now = Date.now();
          const day = 86400000;
          const hour = 3600000;
          function ago(d: number) { return new Date(now - d * day).toISOString(); }
          function hoursAgo(h: number) { return new Date(now - h * hour).toISOString(); }

          function item(
            pid: string, name: string, img: string, price: number, qty: number,
            status: OrderStatus, overrides?: Partial<any>
          ): any {
            return {
              productId: pid, productName: name, productImage: img, price,
              quantity: qty, unit: '1 pc', sellerId, sellerName: 'Green Harvest Market',
              deliveryMethod: 'delivery' as const, deliveryFee: 3.50, status,
              ...overrides,
            };
          }

          function itemPickup(
            pid: string, name: string, img: string, price: number, qty: number,
            status: OrderStatus, overrides?: Partial<any>
          ): any {
            return {
              productId: pid, productName: name, productImage: img, price,
              quantity: qty, unit: '1 pc', sellerId, sellerName: 'Green Harvest Market',
              deliveryMethod: 'pickup' as const, deliveryFee: 0, status,
              ...overrides,
            };
          }

          const seedOrders: Order[] = [
            {
              id: 'ORD-DEMO-001', createdAt: ago(0.5), updatedAt: ago(0.5),
              buyerName: 'Kasun Perera', buyerEmail: 'kasun@example.com', buyerPhone: '+94 77 123 4567',
              deliveryAddress: '42 Galle Road, Colombo 03', deliveryDistrict: 'dist-colombo',
              orderNotes: 'Please deliver in the morning', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 45.97, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 2, 'pending', { unit: '1L Carton', mrp: 5.49 }),
                item('prod_super_7', 'Aged Cheddar Block', '🧀', 8.99, 1, 'pending', { unit: '500g Block' }),
              ],
            },
            {
              id: 'ORD-DEMO-002', createdAt: ago(1.2), updatedAt: ago(0.8),
              buyerName: 'Amaya Silva', buyerEmail: 'amaya@example.com',
              deliveryAddress: '123 Temple Road, Kandy', deliveryDistrict: 'dist-kandy',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 28.50, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_3', 'Free-Range Eggs (12pk)', '🥚', 6.00, 2, 'confirmed', { unit: '12 Pack' }),
                item('prod_super_4', 'Sourdough Bread Loaf', '🍞', 7.50, 1, 'confirmed', { unit: '1 Loaf (800g)', mrp: 8.99 }),
              ],
            },
            {
              id: 'ORD-DEMO-003', createdAt: ago(2.5), updatedAt: ago(1.5),
              buyerName: 'Nimal Fernando', buyerEmail: 'nimal@example.com', buyerPhone: '+94 71 987 6543',
              deliveryAddress: '55 Lake Drive, Nuwara Eliya', deliveryDistrict: 'dist-nuwaraeliya',
              orderNotes: 'Leave at the gate', paymentMethod: 'cod', paymentStatus: 'pending',
              grandTotal: 67.48, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_5', 'Cold Brew Coffee (1L)', '☕', 12.00, 3, 'processing', { unit: '1L Bottle', mrp: 14.99 }),
              ],
            },
            {
              id: 'ORD-DEMO-004', createdAt: ago(3), updatedAt: ago(2),
              buyerName: 'Samanthi Jayasuriya', buyerEmail: 'samanthi@example.com',
              deliveryAddress: '88 Main Street, Gampaha', deliveryDistrict: 'dist-gampaha',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 34.50, estimatedDelivery: '3-5 business days',
              items: [
                itemPickup('prod_super_2', 'Organic Whole Milk', '🥛', 4.50, 1, 'shipped', { unit: '1L Carton', mrp: 5.49, trackingNumber: 'DHL-7890123', trackingCarrier: 'DHL' }),
                itemPickup('prod_super_6', 'Aged Cheddar Block', '🧀', 8.99, 2, 'shipped', { unit: '500g Block', trackingNumber: 'DHL-7890123', trackingCarrier: 'DHL' }),
              ],
            },
            {
              id: 'ORD-DEMO-005', createdAt: ago(5), updatedAt: ago(3),
              buyerName: 'Priya Kumar', buyerEmail: 'priya@example.com',
              deliveryAddress: '22 Beach Road, Galle', deliveryDistrict: 'dist-galle',
              orderNotes: 'Ring the bell twice', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 18.99, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_4', 'Sourdough Bread Loaf', '🍞', 7.50, 2, 'shipped', { unit: '1 Loaf (800g)', mrp: 8.99, trackingCarrier: 'UPS', trackingNumber: '1Z999AA10123456784' }),
              ],
            },
            {
              id: 'ORD-DEMO-006', createdAt: ago(7), updatedAt: ago(6),
              buyerName: 'Dinesh Rathnayake', buyerEmail: 'dinesh@example.com',
              deliveryAddress: '100 Hill Street, Badulla', deliveryDistrict: 'dist-badulla',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 52.50, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_5', 'Cold Brew Coffee (1L)', '☕', 12.00, 2, 'delivered', { unit: '1L Bottle', mrp: 14.99, sellerPayoutStatus: 'paid', sellerPayoutMethod: 'bank_transfer', sellerPayoutRef: 'BT-2025-001', sellerPayoutDate: '2026-07-15' }),
              ],
            },
            {
              id: 'ORD-DEMO-007', createdAt: ago(10), updatedAt: ago(8),
              buyerName: 'Ruwani Dissanayake', buyerEmail: 'ruwani@example.com',
              deliveryAddress: '7 Park Avenue, Colombo 07', deliveryDistrict: 'dist-colombo',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 23.99, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 1, 'cancelled', { unit: '1L Carton', mrp: 5.49 }),
              ],
            },
            {
              id: 'ORD-DEMO-008', createdAt: hoursAgo(2), updatedAt: hoursAgo(1),
              buyerName: 'Tharindu Wickramasinghe', buyerEmail: 'tharindu@example.com',
              deliveryAddress: '15 Lake Crescent, Kandy', deliveryDistrict: 'dist-kandy',
              orderNotes: 'Leave with neighbor if not home', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 58.95, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 3, 'processing', { unit: '1L Carton', mrp: 5.49 }),
                item('prod_super_3', 'Free-Range Eggs (12pk)', '🥚', 6.00, 2, 'processing', { unit: '12 Pack' }),
                item('prod_super_4', 'Sourdough Bread Loaf', '🍞', 7.50, 1, 'processing', { unit: '1 Loaf (800g)', mrp: 8.99 }),
                item('prod_super_5', 'Cold Brew Coffee (1L)', '☕', 12.00, 1, 'processing', { unit: '1L Bottle', mrp: 14.99 }),
              ],
            },
            {
              id: 'ORD-DEMO-009', createdAt: ago(4), updatedAt: ago(3.5),
              buyerName: 'Malsha Perera', buyerEmail: 'malsha@example.com', buyerPhone: '+94 76 543 2109',
              deliveryAddress: '30 Seaside Road, Galle', deliveryDistrict: 'dist-galle',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 42.48, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 2, 'confirmed', { unit: '1L Carton', mrp: 5.49 }),
                item('prod_super_3', 'Free-Range Eggs (12pk)', '🥚', 6.00, 1, 'confirmed', { unit: '12 Pack' }),
                item('prod_ext_1', 'Artisan Sourdough', '🍞', 8.50, 1, 'confirmed'),
              ],
            },
            {
              id: 'ORD-DEMO-010', createdAt: ago(14), updatedAt: ago(10),
              buyerName: 'Harsha Jayasinghe', buyerEmail: 'harsha@example.com',
              deliveryAddress: '5 Mountain View, Badulla', deliveryDistrict: 'dist-badulla',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 24.48, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_7', 'Aged Cheddar Block', '🧀', 8.99, 1, 'completed', { unit: '500g Block', sellerPayoutStatus: 'paid', sellerPayoutMethod: 'bank_transfer', sellerPayoutRef: 'BT-2025-002', sellerPayoutDate: '2026-07-12' }),
                item('prod_super_5', 'Cold Brew Coffee (1L)', '☕', 12.00, 1, 'completed', { unit: '1L Bottle', mrp: 14.99, sellerPayoutStatus: 'paid', sellerPayoutMethod: 'bank_transfer', sellerPayoutRef: 'BT-2025-002', sellerPayoutDate: '2026-07-12' }),
              ],
            },
            {
              id: 'ORD-DEMO-011', createdAt: hoursAgo(6), updatedAt: hoursAgo(5),
              buyerName: 'Sachini Mendis', buyerEmail: 'sachini@example.com',
              deliveryAddress: '12 Park Street, Colombo 05', deliveryDistrict: 'dist-colombo',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 15.50, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_3', 'Free-Range Eggs (12pk)', '🥚', 6.00, 1, 'pending', { unit: '12 Pack' }),
                item('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 1, 'pending', { unit: '1L Carton', mrp: 5.49 }),
              ],
            },
            {
              id: 'ORD-DEMO-012', createdAt: ago(6), updatedAt: ago(4),
              buyerName: 'Ishara Fonseka', buyerEmail: 'ishara@example.com',
              deliveryAddress: '22 Temple Road, Kandy', deliveryDistrict: 'dist-kandy',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 28.50, estimatedDelivery: '3-5 business days',
              items: [
                itemPickup('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 2, 'shipped', { unit: '1L Carton', mrp: 5.49, trackingNumber: 'FEDEX-987654', trackingCarrier: 'FedEx' }),
                itemPickup('prod_super_4', 'Sourdough Bread Loaf', '🍞', 7.50, 1, 'shipped', { unit: '1 Loaf (800g)', mrp: 8.99, trackingNumber: 'FEDEX-987654', trackingCarrier: 'FedEx' }),
              ],
            },
            {
              id: 'ORD-DEMO-013', createdAt: ago(12), updatedAt: ago(9),
              buyerName: 'Ranil Fernando', buyerEmail: 'ranil@example.com',
              deliveryAddress: '8 River Side, Nuwara Eliya', deliveryDistrict: 'dist-nuwaraeliya',
              orderNotes: 'Call before delivery', paymentMethod: 'cod', paymentStatus: 'pending',
              grandTotal: 32.50, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_5', 'Cold Brew Coffee (1L)', '☕', 12.00, 2, 'delivered', { unit: '1L Bottle', mrp: 14.99, sellerPayoutStatus: 'processing', sellerPayoutMethod: 'cheque', sellerPayoutRef: 'CHQ-0042', sellerPayoutDate: '2026-07-18' }),
              ],
            },
            {
              id: 'ORD-DEMO-014', createdAt: ago(8), updatedAt: ago(7.5),
              buyerName: 'Dilani Gunawardena', buyerEmail: 'dilani@example.com',
              deliveryAddress: '44 Lotus Road, Colombo 04', deliveryDistrict: 'dist-colombo',
              orderNotes: '', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 35.48, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_1', 'Organic Whole Milk', '🥛', 4.50, 1, 'cancelled', { unit: '1L Carton', mrp: 5.49 }),
                item('prod_super_7', 'Aged Cheddar Block', '🧀', 8.99, 1, 'cancelled', { unit: '500g Block' }),
                item('prod_ext_2', 'Chocolate Croissant', '🥐', 5.50, 2, 'cancelled'),
              ],
            },
            {
              id: 'ORD-DEMO-015', createdAt: hoursAgo(0.25), updatedAt: hoursAgo(0.25),
              buyerName: 'Chamika Silva', buyerEmail: 'chamika@example.com', buyerPhone: '+94 72 333 4444',
              deliveryAddress: '99 Hillcrest Avenue, Colombo 07', deliveryDistrict: 'dist-colombo',
              orderNotes: 'Ring doorbell', paymentMethod: 'card', paymentStatus: 'paid',
              grandTotal: 18.50, estimatedDelivery: '3-5 business days',
              items: [
                item('prod_super_3', 'Free-Range Eggs (12pk)', '🥚', 6.00, 1, 'confirmed', { unit: '12 Pack' }),
                item('prod_super_4', 'Sourdough Bread Loaf', '🍞', 7.50, 1, 'confirmed', { unit: '1 Loaf (800g)', mrp: 8.99 }),
              ],
            },
          ];
          set({ orders: [...nonDemo, ...seedOrders] });
        }
        // Always seed review periods — covers both newly created and pre-existing demo orders
        const currentPeriods = get().reviewPeriods;
        for (const order of get().orders) {
          if (!order.id.startsWith('ORD-DEMO-')) continue;
          const sellerItems = order.items.filter((i) => i.sellerId === sellerId);
          const allDelivered = sellerItems.length > 0 && sellerItems.every(
            (i) => i.status === 'delivered' || i.status === 'completed'
          );
          if (allDelivered && !currentPeriods.some((rp) => rp.orderId === order.id && rp.sellerId === sellerId)) {
            get().startReviewPeriod(order.id, sellerId, order.buyerName);
          }
        }
      },
      updateOrderPaymentStatus: (orderId, status) => {
        set({
          orders: get().orders.map((o) =>
            o.id === orderId ? { ...o, paymentStatus: status } : o
          ),
        });
      },
      submitReview: (review) => {
        const state = get();
        const updatedReviews = [...state.allReviews, review];
        const updates: Partial<MarketplaceStoreState> = { allReviews: updatedReviews };

        if (review.targetType === 'product') {
          const productReviews = updatedReviews.filter((r) => r.targetType === 'product' && r.targetId === review.targetId);
          const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
          updates.products = state.products.map((p) =>
            p.id === review.targetId ? { ...p, rating: Math.round(avg * 10) / 10, reviewCount: productReviews.length } : p
          );
        }

        if (review.targetType === 'seller') {
          updates.reviewPeriods = state.reviewPeriods.map((rp) =>
            rp.orderId === review.orderId && rp.sellerId === review.targetId
              ? { ...rp, buyerReviewedSeller: true } : rp
          );
        }

        if (review.targetType === 'buyer') {
          updates.reviewPeriods = state.reviewPeriods.map((rp) =>
            rp.orderId === review.orderId && rp.sellerId === review.targetId
              ? { ...rp, sellerReviewedBuyer: true } : rp
          );
        }

        if (review.targetType === 'product') {
          const orderItem = state.orders
            .flatMap((o) => o.items)
            .find((i) => i.productId === review.targetId && i.sellerId === state.orders.flatMap(o => o.items).find(i => i.productId === review.targetId)?.sellerId);
          if (orderItem) {
            updates.reviewPeriods = (updates.reviewPeriods || state.reviewPeriods).map((rp) =>
              rp.orderId === review.orderId && rp.sellerId === orderItem.sellerId
                ? { ...rp, buyerReviewedProduct: true } : rp
            );
          }
        }

        set(updates);
      },

      startReviewPeriod: (orderId, sellerId, buyerId) => {
        const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();
        set({
          reviewPeriods: [
            ...get().reviewPeriods,
            { orderId, sellerId, buyerId, buyerReviewedProduct: false, buyerReviewedSeller: false, sellerReviewedBuyer: false, expiresAt, closed: false },
          ],
        });
      },

      closeReviewPeriod: (orderId, sellerId) => {
        const { reviewPeriods, allReviews } = get();
        const period = reviewPeriods.find((rp) => rp.orderId === orderId && rp.sellerId === sellerId);
        if (!period || period.closed) return;

        const autoReviews: UserReview[] = [];
        const now = new Date().toISOString();

        if (!period.buyerReviewedProduct) {
          const order = get().orders.find((o) => o.id === orderId);
          const items = order?.items.filter((i) => i.sellerId === sellerId) ?? [];
          items.forEach((item) => {
            autoReviews.push({
              id: `auto-${orderId}-${sellerId}-${item.productId}`,
              targetType: 'product',
              targetId: item.productId,
              orderId,
              orderItemProductId: item.productId,
              reviewerId: 'system',
              reviewerName: 'System',
              rating: 5,
              title: 'Auto-rated',
              comment: 'Review period expired. Auto-rated 5 stars.',
              createdAt: now,
              autoRated: true,
            });
          });
        }

        if (!period.buyerReviewedSeller) {
          autoReviews.push({
            id: `auto-${orderId}-${sellerId}-seller`,
            targetType: 'seller',
            targetId: sellerId,
            orderId,
            reviewerId: 'system',
            reviewerName: 'System',
            rating: 5,
            title: 'Auto-rated',
            comment: 'Review period expired. Auto-rated 5 stars.',
            createdAt: now,
            autoRated: true,
          });
        }

        if (!period.sellerReviewedBuyer) {
          autoReviews.push({
            id: `auto-${orderId}-${sellerId}-buyer`,
            targetType: 'buyer',
            targetId: period.buyerId,
            orderId,
            reviewerId: 'system',
            reviewerName: 'System',
            rating: 5,
            title: 'Auto-rated',
            comment: 'Review period expired. Auto-rated 5 stars.',
            createdAt: now,
            autoRated: true,
          });
        }

        const updatedReviews = [...allReviews, ...autoReviews];
        const updatedPeriods = reviewPeriods.map((rp) =>
          rp.orderId === orderId && rp.sellerId === sellerId ? { ...rp, closed: true } : rp
        );

        const updates: Partial<MarketplaceStoreState> = {
          allReviews: updatedReviews,
          reviewPeriods: updatedPeriods,
        };

        if (autoReviews.length > 0) {
          const newProductReviews = updatedReviews.filter((r) => r.targetType === 'product');

          const seen = new Set<string>();
          newProductReviews.forEach((r) => {
            if (!seen.has(r.targetId)) {
              seen.add(r.targetId);
              const revs = newProductReviews.filter((rr) => rr.targetId === r.targetId);
              const avg = revs.reduce((s, rr) => s + rr.rating, 0) / revs.length;
              updates.products = (updates.products || get().products).map((p) =>
                p.id === r.targetId ? { ...p, rating: Math.round(avg * 10) / 10, reviewCount: revs.length } : p
              );
            }
          });
        }

        set(updates);
      },

      addProduct: (product) => set({ products: [...get().products, product] }),
      updateProduct: (productId, updates) => set({
        products: get().products.map((p) => p.id === productId ? { ...p, ...updates } : p),
      }),
      removeProduct: (productId) => set({
        products: get().products.filter((p) => p.id !== productId),
      }),
    }),
    {
      name: 'marketplace-cart',
      partialize: (state) => ({
        cart: state.cart,
        deliveryAddress: state.deliveryAddress,
        deliveryDistrict: state.deliveryDistrict,
        orders: state.orders,
        allReviews: state.allReviews,
        reviewPeriods: state.reviewPeriods,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<MarketplaceStoreState> | undefined;
        const migratedOrders: Order[] = (p?.orders ?? []).map((o) => ({
          ...o,
          updatedAt: (o as any).updatedAt ?? o.createdAt,
          buyerName: (o as any).buyerName ?? 'Unknown',
          buyerPhone: (o as any).buyerPhone,
          buyerEmail: (o as any).buyerEmail,
          items: o.items.map((item) => ({
            ...item,
            trackingNumber: (item as any).trackingNumber,
            trackingCarrier: (item as any).trackingCarrier,
            sellerNotes: (item as any).sellerNotes,
          })),
        }));
        const oldUserReviews = (p as any)?.userReviews ?? [];
        const migratedReviews: UserReview[] = (p?.allReviews ?? []).map((r) => ({
          ...r,
          targetType: (r as any).targetType ?? 'product',
          targetId: (r as any).targetId ?? (r as any).productId ?? '',
          reviewerId: (r as any).reviewerId ?? 'unknown',
          reviewerName: (r as any).reviewerName ?? 'Unknown',
          orderItemProductId: (r as any).orderItemProductId,
          autoRated: (r as any).autoRated,
        }));
        const allReviews = [
          ...migratedReviews,
          ...oldUserReviews
            .filter((old: any) => !migratedReviews.some((m) => m.id === old.id || (m.orderId === old.orderId && m.targetId === old.productId)))
            .map((old: any) => ({
              id: old.id ?? `migrated-${old.orderId}-${old.productId}`,
              targetType: 'product' as const,
              targetId: old.productId,
              orderId: old.orderId,
              reviewerId: 'unknown',
              reviewerName: 'Unknown',
              rating: old.rating,
              title: old.title,
              comment: old.comment,
              createdAt: old.createdAt,
            })),
        ];
        return {
          ...current,
          ...p,
          orders: migratedOrders,
          allReviews,
          reviewPeriods: p?.reviewPeriods ?? [],
          cart: (p?.cart ?? []).map((item) => ({
            ...item,
            checked: item.checked ?? true,
          })),
        };
      },
    }
  )
);

export const getFilteredProducts = (state: MarketplaceStoreState): Product[] => {
  return state.products.filter((product) => {
    const matchesSubCategory =
      !state.selectedSubCategory ||
      product.categoryId === state.selectedSubCategory ||
      product.subCategoryId === state.selectedSubCategory;
    const query = state.searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);
    return matchesSubCategory && matchesSearch;
  });
};

export const getCurrentSubCategories = (state: MarketplaceStoreState): ProductSubCategory[] => {
  return state.categories;
};
