import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StoreProfile } from '../types/store.type';
import { fetchStoreProfile } from '../apis/store.api';

const DEFAULT_PROFILE: StoreProfile = {
  id: 'store',
  storeName: '',
  description: '',
  contactPhone: '',
  contactEmail: '',
  pickupAddress: '',
  logoUrl: undefined,
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

interface StoreStoreState {
  profile: StoreProfile;
  profileLoading: boolean;
  profileError: string | null;
  /** Pulls the POS-owned identity fields (name/address/phone/logo) from
   * pos_setup and merges them into `profile`, overwriting only those fields —
   * everything else (description, delivery config, fee brackets, payout
   * method) has no pos_setup equivalent and stays whatever was last saved via
   * updateProfile(). */
  loadStoreProfile: () => Promise<void>;
  updateProfile: (updates: Partial<StoreProfile>) => void;
  resetProfile: () => void;
}

export const useStoreStore = create<StoreStoreState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      profileLoading: false,
      profileError: null,

      loadStoreProfile: async () => {
        if (get().profileLoading) return;
        set({ profileLoading: true, profileError: null });
        try {
          const identity = await fetchStoreProfile();
          set((state) => ({
            profile: {
              ...state.profile,
              storeName: identity.name || state.profile.storeName,
              pickupAddress: identity.address || state.profile.pickupAddress,
              contactPhone: identity.phone || state.profile.contactPhone,
              logoUrl: identity.logo ?? state.profile.logoUrl,
            },
            profileLoading: false,
          }));
        } catch (err: any) {
          const message = err?.response?.data?.detail ?? err?.message ?? 'Failed to load store profile';
          set({ profileError: message, profileLoading: false });
        }
      },

      updateProfile: (updates: Partial<StoreProfile>) => {
        set((state) => ({ profile: { ...state.profile, ...updates } }));
      },

      resetProfile: () => set({ profile: DEFAULT_PROFILE }),
    }),
    {
      name: 'store-profile',
      partialize: (state) => ({ profile: state.profile }),
      merge: (persisted, current) => {
        const raw = persisted as { profile?: Partial<StoreProfile>; profiles?: Partial<StoreProfile>[] } | undefined;
        const source = raw?.profile ?? raw?.profiles?.[0];
        return {
          ...current,
          profile: source ? { ...DEFAULT_PROFILE, ...source, id: 'store' } : DEFAULT_PROFILE,
        };
      },
    },
  ),
);
