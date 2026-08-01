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

const SEED_PROMOTIONS: Promotion[] = [
  {
    id: 'promo_seed_hero',
    sellerId: 's1',
    sellerName: 'Green Valley Organics',
    title: 'Fresh Organic Harvest',
    description: 'Get 15% off on all organic produce. Use code ORGANIC15 at checkout.',
    icon: '🥬',
    bgColor: 'linear-gradient(135deg, #166534, #22c55e)',
    placement: 'hero',
    status: 'approved',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'promo_seed_sidebar',
    sellerId: 's3',
    sellerName: 'Fresh Brew Co.',
    title: 'New Coffee Collection',
    description: 'Explore our latest artisan blends. Free shipping on orders over $50.',
    icon: '☕',
    bgColor: 'linear-gradient(135deg, #92400e, #d97706)',
    placement: 'sidebar',
    status: 'approved',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'promo_seed_popup',
    sellerId: 's4',
    sellerName: 'Artisan Bakery',
    title: 'Welcome Offer',
    description: '25% off your first order! Minimum purchase $50. Fresh baked daily.',
    icon: '🥐',
    bgColor: 'linear-gradient(135deg, #991b1b, #ef4444)',
    placement: 'popup',
    status: 'approved',
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2027-12-31T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

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
      promotions: SEED_PROMOTIONS,

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
    },
  ),
);
