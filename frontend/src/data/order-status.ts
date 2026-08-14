import type { OrderStatus, PaymentStatus, ReturnReason, PayoutStatus } from '../types/marketplace.type';

interface StatusMeta {
  label: string;
  color: string;
  bg: string;
}

// Single source of truth for order status — values match the backend's
// OrderStatus enum (backend/app/models/pos_ordhed.py) exactly. UI surfaces
// (tabs, badges, timelines) derive from this rather than hardcoding statuses.
export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  picking: { label: 'Picking', color: '#3b82f6', bg: '#eff6ff' },
  packing: { label: 'Packing', color: '#8b5cf6', bg: '#f5f3ff' },
  shipped: { label: 'Shipped', color: '#06b6d4', bg: '#ecfeff' },
  delivered: { label: 'Delivered', color: '#10b981', bg: '#ecfdf5' },
  returned: { label: 'Returned', color: '#d97706', bg: '#fffbeb' },
  refunded: { label: 'Refunded', color: '#16a34a', bg: '#dcfce7' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: '#fef2f2' },
};

export const ORDER_STATUS_VALUES = Object.keys(ORDER_STATUS_META) as OrderStatus[];

export const PAYMENT_STATUS_META: Record<PaymentStatus, StatusMeta> = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fffbeb' },
  paid: { label: 'Paid', color: '#10b981', bg: '#ecfdf5' },
};

export const PAYOUT_STATUS_META: Record<PayoutStatus, StatusMeta> = {
  pending: { label: 'Pending', color: '#d97706', bg: '#fef3c7' },
  processing: { label: 'Processing', color: '#2563eb', bg: '#dbeafe' },
  paid: { label: 'Paid', color: '#16a34a', bg: '#dcfce7' },
  on_hold: { label: 'On Hold', color: '#dc2626', bg: '#fef2f2' },
};

// The statuses an order moves through on the happy path, in order. cancelled/
// returned are terminal off-path statuses and are rendered as separate blocks
// by their consumers (see AdminOrderTimeline's isCancelled/isReturned) rather
// than appearing as a step here.
export const ORDER_TIMELINE_STEPS: OrderStatus[] = ['pending', 'picking', 'packing', 'shipped', 'delivered'];

export function getTimelineStep(status: OrderStatus): number {
  const map: Record<OrderStatus, number> = {
    pending: 0, picking: 1, packing: 2, shipped: 3, delivered: 4, returned: -1, refunded: -1, cancelled: -1,
  };
  return map[status] ?? 0;
}

// Preset reasons offered on the buyer-side return request form.
export const RETURN_REASON_META: Record<ReturnReason, { label: string }> = {
  defective: { label: 'Defective / Damaged' },
  wrong_item: { label: 'Wrong Item Received' },
  no_longer_needed: { label: 'No Longer Needed' },
  wrong_size: { label: 'Wrong Size / Fit' },
  other: { label: 'Other' },
};

export const RETURN_REASON_VALUES = Object.keys(RETURN_REASON_META) as ReturnReason[];

export interface StatusTransition {
  from: OrderStatus;
  to: OrderStatus;
  label: string;
  icon?: string;
  requiresTracking?: boolean;
  color?: string;
  /** When set, clicking this transition navigates to this route instead of
   * updating the order's status — used for "Start Picking", where the status
   * only actually moves to 'picking' once real picking begins on that page. */
  navigateTo?: string;
}

export const ADMIN_DELIVERY_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'picking', label: 'Start Picking', color: '#3b82f6', navigateTo: '/admin/pickup-list' },
  { from: 'pending', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'picking', to: 'packing', label: 'Start Packing', color: '#8b5cf6' },
  { from: 'picking', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'packing', to: 'shipped', label: 'Mark as Shipped', requiresTracking: true, color: '#06b6d4' },
  { from: 'packing', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'shipped', to: 'delivered', label: 'Mark as Delivered', color: '#10b981' },
];

export const ADMIN_PICKUP_TRANSITIONS: StatusTransition[] = [
  { from: 'pending', to: 'picking', label: 'Start Picking', color: '#3b82f6', navigateTo: '/admin/pickup-list' },
  { from: 'pending', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'picking', to: 'packing', label: 'Start Packing', color: '#8b5cf6' },
  { from: 'picking', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'packing', to: 'shipped', label: 'Ready for Pickup', color: '#f59e0b' },
  { from: 'packing', to: 'cancelled', label: 'Cancel Order', icon: '✕', color: '#ef4444' },
  { from: 'shipped', to: 'delivered', label: 'Confirm Pickup', color: '#10b981' },
];

export const PICKUP_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  shipped: 'Ready for Pickup',
  delivered: 'Picked Up',
};

/** The single place that decides what word to show for a status — every UI
 * surface (badges, timelines, steppers) should call this rather than keeping
 * its own label copy, so a status can't read differently in different parts
 * of the same page (e.g. "Shipped" in one place, "In Transit" in another). */
export function getStatusLabel(status: OrderStatus, deliveryMethod?: 'delivery' | 'pickup'): string {
  if (deliveryMethod === 'pickup' && PICKUP_STATUS_LABELS[status]) {
    return PICKUP_STATUS_LABELS[status]!;
  }
  return (ORDER_STATUS_META[status] ?? ORDER_STATUS_META.pending).label;
}

export function getTransitions(status: OrderStatus, method: 'delivery' | 'pickup'): StatusTransition[] {
  const map = method === 'pickup' ? ADMIN_PICKUP_TRANSITIONS : ADMIN_DELIVERY_TRANSITIONS;
  return map.filter((t) => t.from === status);
}
