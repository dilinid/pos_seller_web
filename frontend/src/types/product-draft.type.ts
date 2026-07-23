export type ProductDraftStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'changes_requested'
  | 'published';

export interface ProductDraft {
  id: string;
  sellerUserId: string;

  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  unit: string;

  image: string;
  images: string[];

  price: number;
  mrp?: number;
  quantity: number;
  reorderLevel?: number;

  weight: number | null;
  volume: number | null;

  features: string[];
  specifications: Record<string, string>;

  deliveryAvailable: boolean;
  pickupAvailable: boolean;

  status: ProductDraftStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  publishedAt?: string;
  publishedProductId?: string;
  adminNotes?: string;
}
