import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Promotion, BannerPlacement } from '../types/promotion.type';

function generateId(): string {
  return `promo_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function makePromotion(data: {
  sellerId: string; sellerName: string; title: string; description: string;
  icon: string; bgColor: string; placement: BannerPlacement;
  startDate: string; endDate: string;
}): Promotion {
  return {
    id: generateId(),
    status: 'approved',
    createdAt: new Date().toISOString(),
    ...data,
  };
}

interface PromotionStoreState {
  promotions: Promotion[];
  submitPromotion: (data: {
    sellerId: string; sellerName: string; title: string; description: string;
    icon: string; bgColor: string; placement: BannerPlacement;
    startDate: string; endDate: string;
  }) => void;
  cancelPromotion: (id: string) => void;
  getActivePromotions: (placement: BannerPlacement) => Promotion[];
}

export const usePromotionStore = create<PromotionStoreState>()(
  persist(
    (set, get) => ({
      promotions: [],

      submitPromotion: (data) => {
        const promo = makePromotion(data);
        set((s) => ({ promotions: [promo, ...s.promotions] }));
      },

      cancelPromotion: (id) => {
        set((s) => ({
          promotions: s.promotions.map((p) =>
            p.id === id ? { ...p, status: 'expired' as const } : p
          ),
        }));
      },

      getActivePromotions: (placement) => {
        const now = Date.now();
        return get().promotions
          .filter(
            (p) =>
              p.status === 'approved' &&
              p.placement === placement &&
              new Date(p.startDate).getTime() <= now &&
              new Date(p.endDate).getTime() >= now
          )
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 1);
      },
    }),
    {
      name: 'promotions',
      partialize: (state) => ({ promotions: state.promotions }),
      merge: (persisted, current) => {
        const p = persisted as Partial<PromotionStoreState> | undefined;
        // Strip the fake seed promotions previously shipped with this store so
        // browsers that already persisted them don't keep showing fake banners.
        const SEED_IDS = new Set(['promo_seed_hero', 'promo_seed_sidebar', 'promo_seed_popup']);
        return {
          ...current,
          ...p,
          promotions: (p?.promotions ?? []).filter((promo) => !SEED_IDS.has(promo.id)),
        };
      },
    },
  ),
);
