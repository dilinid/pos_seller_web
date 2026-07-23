import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PushItem, PushItemStatus } from '../types/push-item.type';

function generateId(): string {
  return `push_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface PushItemStoreState {
  items: PushItem[];
  updatePriceQuantity: (itemId: string, price: number, quantity: number, mrp?: number, reorderLevel?: number) => void;
  publishItem: (itemId: string) => PushItem | undefined;
  getPendingItems: (userId: string) => PushItem[];
  getPublishedItems: (userId: string) => PushItem[];
  seedMockData: (userId: string) => void;
  getItemById: (itemId: string) => PushItem | undefined;
}

function makeSeedItem(overrides: Partial<PushItem> & { name: string; userId: string }): PushItem {
  const now = new Date();
  const daysAgo = overrides.pushedAt
    ? new Date(overrides.pushedAt).getTime()
    : now.getTime() - Math.floor(Math.random() * 7) * 86400000;

  return {
    id: generateId(),
    sellerId: overrides.userId,
    description: '',
    categoryId: 'supermarket',
    subCategoryId: 'produce',
    unit: '1 pc',
    image: '📦',
    images: [],
    features: [],
    specifications: {},
    price: 0,
    quantity: 0,
    deliveryAvailable: true,
    pickupAvailable: true,
    pickupAddress: '',
    estimatedDeliveryDays: '1-2 days',
    status: 'ready_to_publish' as PushItemStatus,
    pushedAt: new Date(daysAgo).toISOString(),
    ...overrides,
  };
}

const SEED_TEMPLATES: Array<Omit<PushItem, 'id' | 'userId' | 'sellerId'>> = [
  {
    name: 'Organic Whole Milk',
    description: 'Fresh whole milk from grass-fed cows. Pasteurized and homogenized, rich in calcium and protein.',
    categoryId: 'supermarket',
    subCategoryId: 'dairy',
    unit: '1L Carton',
    image: '🥛',
    images: ['🥛'],
    features: ['Grass-fed', 'Pasteurized', 'No artificial hormones', 'Rich in Calcium'],
    specifications: { Weight: '1L', Storage: 'Refrigerated at 4°C', 'Shelf Life': '7 days', Origin: 'Local farm' },
    price: 4.50,
    quantity: 120,
    deliveryAvailable: true,
    pickupAvailable: true,
    pickupAddress: '456 Green Pastures Ave, Gampaha',
    estimatedDeliveryDays: '1-2 days',
    status: 'ready_to_publish',
    pushedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    mrp: 5.49,
  },
  {
    name: 'Aged Cheddar Block',
    description: 'Premium aged cheddar cheese with a sharp, rich flavor. Aged 12 months for the perfect taste.',
    categoryId: 'supermarket',
    subCategoryId: 'dairy',
    unit: '500g Block',
    image: '🧀',
    images: ['🧀'],
    features: ['Aged 12 months', 'Natural rind', 'No artificial colors', 'Vegetable rennet'],
    specifications: { Weight: '500g', Type: 'Hard cheese', Storage: 'Refrigerated', 'Shelf Life': '3 months' },
    price: 8.99,
    quantity: 60,
    deliveryAvailable: true,
    pickupAvailable: true,
    pickupAddress: '456 Green Pastures Ave, Gampaha',
    estimatedDeliveryDays: '1-2 days',
    status: 'ready_to_publish',
    pushedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    name: 'Free-Range Eggs (12pk)',
    description: 'Farm-fresh free-range eggs from pasture-raised hens. Rich orange yolks, perfect for any recipe.',
    categoryId: 'supermarket',
    subCategoryId: 'produce',
    unit: '12 Pack',
    image: '🥚',
    images: ['🥚'],
    features: ['Free-range', 'Pasture-raised', 'Omega-3 enriched', 'Grade A'],
    specifications: { Weight: '600g', Pack: '12 eggs', Storage: 'Refrigerated', 'Shelf Life': '21 days' },
    price: 6.00,
    quantity: 200,
    deliveryAvailable: true,
    pickupAvailable: true,
    pickupAddress: '123 Farm Road, Nuwara Eliya',
    estimatedDeliveryDays: '1-2 days',
    status: 'ready_to_publish',
    pushedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    name: 'Sourdough Bread Loaf',
    description: 'Handcrafted sourdough bread baked fresh daily. Made with organic flour and natural starter.',
    categoryId: 'supermarket',
    subCategoryId: 'bakery',
    unit: '1 Loaf (800g)',
    image: '🍞',
    images: ['🍞'],
    features: ['Handcrafted', 'Organic flour', 'Natural starter', 'No preservatives', 'Baked daily'],
    specifications: { Weight: '800g', Ingredients: 'Organic flour, water, salt, natural starter', Storage: 'Room temperature', 'Shelf Life': '5 days' },
    price: 7.50,
    quantity: 45,
    deliveryAvailable: true,
    pickupAvailable: true,
    pickupAddress: '789 Brewers Lane, Colombo 03',
    estimatedDeliveryDays: '1-2 days',
    status: 'ready_to_publish',
    pushedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    mrp: 8.99,
  },
  {
    name: 'Cold Brew Coffee (1L)',
    description: 'Smooth cold brew coffee concentrate. Brewed for 24 hours for a rich, low-acid flavor.',
    categoryId: 'supermarket',
    subCategoryId: 'beverages',
    unit: '1L Bottle',
    image: '☕',
    images: ['☕'],
    features: ['24-hour brew', 'Low acid', '100% Arabica', 'No added sugar', 'Concentrate'],
    specifications: { Volume: '1L', Beans: '100% Arabica', Brew: '24 hours cold steep', Storage: 'Refrigerated', 'Shelf Life': '14 days' },
    price: 12.00,
    quantity: 80,
    deliveryAvailable: true,
    pickupAvailable: false,
    pickupAddress: '',
    estimatedDeliveryDays: '2-3 days',
    status: 'ready_to_publish',
    pushedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    mrp: 14.99,
  },
];

export const usePushItemStore = create<PushItemStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      updatePriceQuantity: (itemId, price, quantity, mrp, reorderLevel) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item, price, quantity,
                  ...(mrp !== undefined ? { mrp } : {}),
                  ...(reorderLevel !== undefined ? { reorderLevel } : {}),
                }
              : item
          ),
        }));
      },

      publishItem: (itemId) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item || item.status !== 'ready_to_publish') return undefined;

        const published: PushItem = {
          ...item,
          status: 'published',
          publishedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: state.items.map((i) => (i.id === itemId ? published : i)),
        }));

        return published;
      },

      getPendingItems: (userId) => {
        return get().items.filter(
          (i) => i.userId === userId && i.status === 'ready_to_publish'
        );
      },

      getPublishedItems: (userId) => {
        return get().items.filter(
          (i) => i.userId === userId && i.status === 'published'
        );
      },

      getItemById: (itemId) => {
        return get().items.find((i) => i.id === itemId);
      },

      seedMockData: (userId) => {
        const existing = get().items.some((i) => i.userId === userId);
        if (existing) return;

        const seeds: PushItem[] = SEED_TEMPLATES.map((t) =>
          makeSeedItem({ ...t, userId })
        );

        set((state) => ({
          items: [...state.items, ...seeds],
        }));
      },
    }),
    {
      name: 'push-items',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
