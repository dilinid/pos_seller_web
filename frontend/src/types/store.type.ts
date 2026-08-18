export interface FeeBracket {
  id: string;
  label: string;
  fromValue: number;
  toValue: number | null;
  fee: number;
}

export interface StoreProfile {
  id: string;
  storeName: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  pickupAddress: string;
  /** Data URI or URL sourced from pos_setup.setup_comlogo — see store.store.ts's
   * loadStoreProfile(). Falls back to a generated initials avatar when unset. */
  logoUrl?: string;
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
