export interface FeeBracket {
  id: string;
  label: string;
  fromValue: number;
  toValue: number | null;
  fee: number;
}

export interface SellerProfile {
  id: string;
  storeName: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  pickupAddress: string;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  estimatedDeliveryDays: string;
  districtFees: Record<string, number>;
  freeDeliveryMin: number | null;
  weightFeeBrackets: FeeBracket[];
  volumeFeeBrackets: FeeBracket[];
  quantityFeeBrackets: FeeBracket[];
  payoutMethod: string;
  rating: number;
  totalSales: number;
  productCount: number;
}
