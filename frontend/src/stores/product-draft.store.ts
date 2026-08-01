import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductDraft, ProductDraftStatus } from '../types/product-draft.type';
import { useMarketplaceStore } from './marketplace.store';
import type { Product } from '../types/marketplace.type';

function generateId(): string {
  return `draft_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

interface ProductDraftStoreState {
  items: ProductDraft[];
  saveDraft: (userId: string, data: Omit<ProductDraft, 'id' | 'sellerUserId' | 'status' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'publishedAt' | 'adminNotes'>) => ProductDraft;
  updateDraft: (id: string, data: Partial<ProductDraft>) => void;
  submitForReview: (id: string) => Promise<void>;
  publishDraft: (id: string) => void;
  deleteDraft: (id: string) => void;
  getDraftsBySeller: (userId: string) => ProductDraft[];
  getDraftById: (id: string) => ProductDraft | undefined;
}

export const useProductDraftStore = create<ProductDraftStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      saveDraft: (userId, data) => {
        const now = new Date().toISOString();
        const draft: ProductDraft = {
          id: generateId(),
          sellerUserId: userId,
          ...data,
          status: 'draft',
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ items: [...state.items, draft] }));
        return draft;
      },

      updateDraft: (id, data) => {
        set((state) => ({
          items: state.items.map((d) =>
            d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      submitForReview: async (id) => {
        const draft = get().items.find((d) => d.id === id);

        // If draft was previously published, remove from marketplace during re-review
        if (draft?.publishedProductId) {
          useMarketplaceStore.getState().removeProduct(draft.publishedProductId);
        }

        set((state) => ({
          items: state.items.map((d) =>
            d.id === id
              ? { ...d, status: 'pending_review' as ProductDraftStatus, submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
              : d
          ),
        }));

        await new Promise((resolve) => setTimeout(resolve, 3000));

        set((state) => ({
          items: state.items.map((d) =>
            d.id === id && d.status === 'pending_review'
              ? { ...d, status: 'approved' as ProductDraftStatus, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      publishDraft: (id) => {
        const draft = get().items.find((d) => d.id === id);
        if (!draft || draft.status !== 'approved') return;

        const published: ProductDraft = {
          ...draft,
          status: 'published',
          publishedAt: new Date().toISOString(),
          publishedProductId: draft.publishedProductId || `prod_${draft.id}`,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          items: state.items.map((d) => (d.id === id ? published : d)),
        }));

        const productData: Product = {
          id: published.publishedProductId!,
          name: published.name,
          price: published.price,
          mrp: published.mrp,
          categoryId: published.categoryId,
          subCategoryId: published.subCategoryId,
          sellerId: published.sellerUserId,
          unit: published.unit,
          image: published.image,
          images: published.images,
          description: published.description,
          rating: 0,
          reviewCount: 0,
          features: published.features,
          specifications: published.specifications,
          weight: published.weight,
          volume: published.volume,
          quantity: 100,
          reorderLevel: null,
        };

        const marketplace = useMarketplaceStore.getState();
        const existing = marketplace.products.find((p) => p.id === published.publishedProductId);

        if (existing) {
          marketplace.updateProduct(published.publishedProductId!, productData);
        } else {
          marketplace.addProduct(productData);
        }
      },

      deleteDraft: (id) => {
        const draft = get().items.find((d) => d.id === id);
        if (draft?.publishedProductId) {
          useMarketplaceStore.getState().removeProduct(draft.publishedProductId);
        }
        set((state) => ({ items: state.items.filter((d) => d.id !== id) }));
      },

      getDraftsBySeller: (userId) => {
        return get().items.filter((d) => d.sellerUserId === userId);
      },

      getDraftById: (id) => {
        return get().items.find((d) => d.id === id);
      },
    }),
    {
      name: 'product-drafts',
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => {
        const raw = persisted as { items?: any[] };
        const items = (raw.items ?? []).map((d: any) => ({
          id: d.id,
          sellerUserId: d.sellerUserId,
          name: d.name,
          description: d.description,
          categoryId: d.categoryId,
          subCategoryId: d.subCategoryId,
          unit: d.unit,
          image: d.image,
          images: d.images ?? [],
          price: d.price,
          mrp: d.mrp ?? undefined,
          quantity: d.quantity,
          reorderLevel: d.reorderLevel ?? undefined,
          weight: d.weight ?? null,
          volume: d.volume ?? null,
          features: d.features ?? [],
          specifications: d.specifications ?? {},
          deliveryAvailable: d.deliveryAvailable ?? true,
          pickupAvailable: d.pickupAvailable ?? true,
          status: d.status ?? 'draft',
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
          submittedAt: d.submittedAt,
          publishedAt: d.publishedAt,
          publishedProductId: d.publishedProductId,
          adminNotes: d.adminNotes,
        }));
        return { ...current, items };
      },
    }
  )
);
