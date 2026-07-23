export type PushItemStatus = 'pending_super_admin' | 'ready_to_publish' | 'published' | 'changes_requested';

export interface PushItem {
  id: string;
  userId: string;
  sellerId: string;

  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  unit: string;
  image: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;

  price: number;
  mrp?: number;
  quantity: number;
  reorderLevel?: number;

  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  pickupAddress: string;
  estimatedDeliveryDays: string;

  status: PushItemStatus;
  pushedAt: string;
  publishedAt?: string;
  adminNotes?: string;
}
