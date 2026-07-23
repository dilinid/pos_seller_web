import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SellerProfile, SellerApplicationSubmission } from '../types/seller.type';

function generateId(): string {
  return `seller_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface SellerStoreState {
  profiles: SellerProfile[];
  submitApplication: (userId: string, userEmail: string, data: SellerApplicationSubmission) => Promise<SellerProfile>;
  getProfileByUserId: (userId: string) => SellerProfile | undefined;
  isSeller: (userId: string) => boolean;
  hasPendingApplication: (userId: string) => boolean;
  updateProfile: (sellerId: string, updates: Partial<SellerProfile>) => void;
}

export const useSellerStore = create<SellerStoreState>()(
  persist(
    (set, get) => ({
      profiles: [],

      submitApplication: async (userId: string, userEmail: string, data: SellerApplicationSubmission) => {
        const newProfile: SellerProfile = {
          id: generateId(),
          userId,
          contactEmail: data.contactEmail || userEmail,
          ...data,
          districtFees: data.districtFees ?? {},
          freeDeliveryMin: data.freeDeliveryMin ?? null,
          weightFeeBrackets: data.weightFeeBrackets ?? [],
          volumeFeeBrackets: data.volumeFeeBrackets ?? [],
          quantityFeeBrackets: data.quantityFeeBrackets ?? [],
          status: 'pending',
          appliedAt: new Date().toISOString(),
          rating: 0,
          totalSales: 0,
          productCount: 0,
        };

        set((state) => ({ profiles: [...state.profiles, newProfile] }));

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const approved: SellerProfile = { ...newProfile, status: 'approved', approvedAt: new Date().toISOString() };
        set((state) => ({
          profiles: state.profiles.map((p) => (p.id === newProfile.id ? approved : p)),
        }));

        return approved;
      },

      getProfileByUserId: (userId: string) => {
        return get().profiles.find((p) => p.userId === userId && p.status === 'approved');
      },

      isSeller: (userId: string) => {
        return get().profiles.some((p) => p.userId === userId && p.status === 'approved');
      },

      hasPendingApplication: (userId: string) => {
        return get().profiles.some((p) => p.userId === userId && p.status === 'pending');
      },

      updateProfile: (sellerId: string, updates: Partial<SellerProfile>) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === sellerId
              ? {
                  ...p, ...updates,
                  districtFees: updates.districtFees ?? p.districtFees ?? {},
                  freeDeliveryMin: updates.freeDeliveryMin ?? p.freeDeliveryMin ?? null,
                  weightFeeBrackets: updates.weightFeeBrackets ?? p.weightFeeBrackets ?? [],
                  volumeFeeBrackets: updates.volumeFeeBrackets ?? p.volumeFeeBrackets ?? [],
                  quantityFeeBrackets: updates.quantityFeeBrackets ?? p.quantityFeeBrackets ?? [],
                }
              : p,
          ),
        }));
      },
    }),
    {
      name: 'seller-profiles',
      partialize: (state) => ({ profiles: state.profiles }),
      merge: (persisted, current) => {
        const raw = persisted as { profiles?: any[] };
        const profiles = (raw.profiles ?? []).map((p: any) => ({
          ...p,
          districtFees: p.districtFees ?? {},
          freeDeliveryMin: p.freeDeliveryMin ?? null,
          weightFeeBrackets: p.weightFeeBrackets ?? [],
          volumeFeeBrackets: p.volumeFeeBrackets ?? [],
          quantityFeeBrackets: p.quantityFeeBrackets ?? [],
        }));
        return { ...current, profiles };
      },
    },
  ),
);
