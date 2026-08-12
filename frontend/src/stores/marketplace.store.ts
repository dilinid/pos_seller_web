import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem, ProductSubCategory, PaymentMethodType, Order, UserReview, ReviewPeriod, OrderStatus, PaymentStatus } from '../types/marketplace.type';
import { fetchMarketplaceProducts, fetchMarketplaceCategories, fetchMyOrders, fetchSellerOrders, fetchOrderById, mapOrderRawToOrder } from '../apis/marketplace.api';
import { useSellerStore } from './seller.store';
import { ORDER_STATUS_VALUES } from '../data/order-status';

/** Inserts/updates a single fetched order without disturbing the rest of the
 * locally-held list — used for single-order fetches, where the response isn't
 * the user's complete order set and shouldn't be treated as one. */
function upsertOrder(existing: Order[], order: Order): Order[] {
  const idx = existing.findIndex((o) => o.id === order.id);
  if (idx === -1) return [order, ...existing];
  const updated = [...existing];
  updated[idx] = order;
  return updated;
}

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
  ordersLoading: boolean;
  ordersError: string | null;
  allReviews: UserReview[];
  reviewPeriods: ReviewPeriod[];
  loadOrders: () => Promise<void>;
  loadOrder: (orderId: string) => Promise<void>;
  loadSellerOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
  updateOrderItemStatus: (orderId: string, productId: string, status: OrderStatus) => void;
  updateOrderPaymentStatus: (orderId: string, status: PaymentStatus) => void;
  sellerUpdateItemStatus: (orderId: string, productId: string, status: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string; contactPhone?: string }) => void;
  sellerUpdateTracking: (orderId: string, productId: string, carrier: string, trackingNumber: string, contactPhone?: string) => void;
  sellerUpdateNote: (orderId: string, productId: string, note: string) => void;
  submitReview: (review: UserReview) => void;
  startReviewPeriod: (orderId: string, sellerId: string, buyerId: string) => void;
  closeReviewPeriod: (orderId: string, sellerId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;

  /** Wipes every per-account field (cart, checkout state, orders, reviews) so
   * a login or logout can never leave the previous account's data visible to
   * whoever uses the browser next. Catalog data (products/categories) is left
   * alone since it isn't account-scoped. */
  resetAccountState: () => void;
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
      products: [],
      categories: [],
      cart: [],
      selectedSubCategory: null,
      searchQuery: '',
      productsLoading: true,
      productsError: null,
      categoriesLoading: false,
      categoriesError: null,
      ...CHECKOUT_INIT,
      orders: [],
      ordersLoading: false,
      ordersError: null,
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

      loadOrders: async () => {
        set({ ordersLoading: true, ordersError: null });
        try {
          const raw = await fetchMyOrders();
          const { id: sellerId, storeName } = useSellerStore.getState().profile;
          const fetched = raw.map((o) => mapOrderRawToOrder(o, sellerId, storeName || 'Our Store'));
          // `fetched` is the complete, authoritative list for the signed-in buyer —
          // replace rather than merge, so a previous account's (or a stale) orders
          // can't linger in state past this fetch.
          set({ orders: fetched, ordersLoading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to load orders';
          set({ ordersError: message, ordersLoading: false });
        }
      },

      loadOrder: async (orderId) => {
        set({ ordersLoading: true, ordersError: null });
        try {
          const raw = await fetchOrderById(orderId);
          const { id: sellerId, storeName } = useSellerStore.getState().profile;
          const order = mapOrderRawToOrder(raw, sellerId, storeName || 'Our Store');
          set({ orders: upsertOrder(get().orders, order), ordersLoading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to load order';
          set({ ordersError: message, ordersLoading: false });
        }
      },

      loadSellerOrders: async () => {
        set({ ordersLoading: true, ordersError: null });
        try {
          const raw = await fetchSellerOrders();
          const { id: sellerId, storeName } = useSellerStore.getState().profile;
          const fetched = raw.map((o) => mapOrderRawToOrder(o, sellerId, storeName || 'Our Store'));
          // Complete, authoritative list of the store's orders — same reasoning as loadOrders.
          set({ orders: fetched, ordersLoading: false });
        } catch (err: any) {
          const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to load orders';
          set({ ordersError: message, ordersLoading: false });
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

      resetAccountState: () =>
        set({
          cart: [],
          ...CHECKOUT_INIT,
          orders: [],
          ordersLoading: false,
          ordersError: null,
          allReviews: [],
          reviewPeriods: [],
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
        // Orders persisted before an OrderStatus redesign can carry status strings that no
        // longer exist in ORDER_STATUS_META — rendering those crashes OrderStatusBadge, so
        // drop them here rather than letting stale localStorage data blank the whole app.
        // Also strips ORD-DEMO- orders from the since-removed fake seed data that browsers
        // may still have persisted from before it was deleted.
        const migratedOrders: Order[] = (p?.orders ?? [])
          .filter((o) => !o.id.startsWith('ORD-DEMO-'))
          .filter((o) => o.items.every((item) => (ORDER_STATUS_VALUES as string[]).includes(item.status)))
          .map((o) => ({
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
