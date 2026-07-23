export type BannerPlacement = 'hero' | 'sidebar' | 'popup';

export type PromotionStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface Promotion {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  icon: string;
  bgColor: string;
  placement: BannerPlacement;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  createdAt: string;
  adminNote?: string;
}
