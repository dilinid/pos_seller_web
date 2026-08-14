import type { OrderStatus, PaymentStatus } from '../../types/marketplace.type';
import { ORDER_STATUS_META, PAYMENT_STATUS_META, getStatusLabel } from '../../data/order-status';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  deliveryMethod?: 'delivery' | 'pickup';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, deliveryMethod }) => {
  // Falls back to `pending`'s styling for any status that isn't (or is no longer) a
  // recognized OrderStatus, rather than crashing the whole page on stale/unexpected data.
  const meta = ORDER_STATUS_META[status] ?? ORDER_STATUS_META.pending;
  const label = getStatusLabel(status, deliveryMethod);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '10px',
      fontSize: '0.72rem', fontWeight: 700,
      color: meta.color, background: meta.bg,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color }} />
      {label}
    </span>
  );
};

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const meta = PAYMENT_STATUS_META[status] ?? PAYMENT_STATUS_META.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '3px 10px', borderRadius: '10px',
      fontSize: '0.72rem', fontWeight: 600,
      color: meta.color, background: meta.bg,
      whiteSpace: 'nowrap',
    }}>
      {meta.label}
    </span>
  );
};
