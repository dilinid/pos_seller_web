import type { OrderStatus, PaymentStatus, SellerPayoutStatus } from '../types/marketplace.type';

interface StatusMeta {
  label: string;
  color: string;
  bg: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  confirmed: { label: 'Confirmed', color: '#3b82f6', bg: '#eff6ff' },
  processing: { label: 'Processing', color: '#8b5cf6', bg: '#f5f3ff' },
  shipped: { label: 'Shipped', color: '#06b6d4', bg: '#ecfeff' },
  delivered: { label: 'Delivered', color: '#10b981', bg: '#ecfdf5' },
  completed: { label: 'Completed', color: '#059669', bg: '#ecfdf5' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
};

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  paid: { label: 'Paid', color: '#10b981', bg: '#ecfdf5' },
  awaiting_receipt: { label: 'Awaiting Receipt', color: '#f59e0b', bg: '#fffbeb' },
  receipt_uploaded: { label: 'Receipt Uploaded', color: '#3b82f6', bg: '#eff6ff' },
  verified: { label: 'Verified', color: '#10b981', bg: '#ecfdf5' },
};

export const PAYOUT_STATUS_META: Record<SellerPayoutStatus, StatusMeta> = {
  pending: { label: 'Pending', color: '#d97706', bg: '#fef3c7' },
  processing: { label: 'Processing', color: '#2563eb', bg: '#dbeafe' },
  paid: { label: 'Paid', color: '#16a34a', bg: '#dcfce7' },
  on_hold: { label: 'On Hold', color: '#dc2626', bg: '#fef2f2' },
};

export const ORDER_TIMELINE_STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const;

export function getTimelineStep(status: OrderStatus): number {
  const map: Record<OrderStatus, number> = {
    pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, completed: 4, cancelled: -1,
  };
  return map[status] ?? 0;
}

export interface StatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  label: string;
  icon?: string;
  requiresTracking?: boolean;
  color?: string;
}

export const SELLER_DELIVERY_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'confirmed', to: 'processing', label: 'Start Processing', color: '#8b5cf6' },
  { from: 'confirmed', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'processing', to: 'shipped', label: 'Mark as Shipped', requiresTracking: true, color: '#06b6d4' },
  { from: 'processing', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'shipped', to: 'delivered', label: 'Mark as Delivered', color: '#10b981' },
];

export const SELLER_PICKUP_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'confirmed', to: 'processing', label: 'Start Processing', color: '#8b5cf6' },
  { from: 'confirmed', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'processing', to: 'shipped', label: 'Ready for Pickup', color: '#f59e0b' },
  { from: 'processing', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'shipped', to: 'delivered', label: 'Confirm Pickup', color: '#10b981' },
];

export const PICKUP_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  shipped: 'Ready for Pickup',
  delivered: 'Picked Up',
};

export function getTransitions(status: OrderStatus, method: 'delivery' | 'pickup'): StatusTransition[] {
  const map = method === 'pickup' ? SELLER_PICKUP_TRANSITIONS : SELLER_DELIVERY_TRANSITIONS;
  return map.filter((t) => t.from === status);
}
