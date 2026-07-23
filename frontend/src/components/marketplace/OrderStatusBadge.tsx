import type { OrderStatus, PaymentStatus } from '../../types/marketplace.type';
import { ORDER_STATUS_META, PAYMENT_STATUS_META, PICKUP_STATUS_LABELS } from '../../data/order-status';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  deliveryMethod?: 'delivery' | 'pickup';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, deliveryMethod }) => {
  const meta = ORDER_STATUS_META[status];
  const label = deliveryMethod === 'pickup' && PICKUP_STATUS_LABELS[status]
    ? PICKUP_STATUS_LABELS[status]
    : meta.label;
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
  const meta = PAYMENT_STATUS_META[status];
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
