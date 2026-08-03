import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SellerProfile } from '../types/seller.type';

const DEFAULT_PROFILE: SellerProfile = {
  id: 'store',
  storeName: '',
  description: '',
  contactPhone: '',
  contactEmail: '',
  pickupAddress: '',
  deliveryAvailable: true,
  pickupAvailable: true,
  estimatedDeliveryDays: '1-2 days',
  districtFees: {},
  freeDeliveryMin: null,
  weightFeeBrackets: [],
  volumeFeeBrackets: [],
  quantityFeeBrackets: [],
  payoutMethod: '',
  rating: 0,
  totalSales: 0,
  productCount: 0,
};

interface SellerStoreState {
  profile: SellerProfile;
  isSeller: (userRole?: string | null) => boolean;
  updateProfile: (updates: Partial<SellerProfile>) => void;
}

export const useSellerStore = create<SellerStoreState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,

      isSeller: (userRole?: string | null) => userRole === 'ADMIN',

      updateProfile: (updates: Partial<SellerProfile>) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
      },
    }),
    {
      name: 'seller-profiles',
      partialize: (state) => ({ profile: state.profile }),
      merge: (persisted, current) => {
        const raw = persisted as { profile?: Partial<SellerProfile>; profiles?: Partial<SellerProfile>[] } | undefined;
        const source = raw?.profile ?? raw?.profiles?.[0];
        return {
          ...current,
          profile: source ? { ...DEFAULT_PROFILE, ...source, id: 'store' } : DEFAULT_PROFILE,
        };
      },
    },
  ),
);
