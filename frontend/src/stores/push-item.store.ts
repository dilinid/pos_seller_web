import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PushItem } from '../types/push-item.type';

interface PushItemStoreState {
  items: PushItem[];
  updatePriceQuantity: (itemId: string, price: number, quantity: number, mrp?: number, reorderLevel?: number) => void;
  publishItem: (itemId: string) => PushItem | undefined;
  getPendingItems: (userId: string) => PushItem[];
  getPublishedItems: (userId: string) => PushItem[];
  getItemById: (itemId: string) => PushItem | undefined;
}

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
    }),
    {
      name: 'push-items',
      partialize: (state) => ({ items: state.items }),
      // No code path has ever populated this store other than the removed mock
      // seed — any persisted items in an existing browser are stale fake data.
      merge: (_persisted, current) => current,
    }
  )
);
