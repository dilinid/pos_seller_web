import type { OrderStatus } from '../../types/marketplace.type';

interface SellerOrderStatusProps {
  status: OrderStatus;
  deliveryMethod: 'delivery' | 'pickup';
}

interface StepDef {
  key: string;
  status: OrderStatus;
  label: string;
  pickupLabel: string;
}

const STEPS: StepDef[] = [
  { key: 'pending', status: 'pending', label: 'Ordered', pickupLabel: 'Ordered' },
  { key: 'confirmed', status: 'confirmed', label: 'Confirmed', pickupLabel: 'Confirmed' },
  { key: 'processing', status: 'processing', label: 'Processing', pickupLabel: 'Processing' },
  { key: 'shipped', status: 'shipped', label: 'In Transit', pickupLabel: 'Ready' },
  { key: 'delivered', status: 'delivered', label: 'Delivered', pickupLabel: 'Completed' },
];

function stepIndex(status: OrderStatus): number {
  const map: Record<OrderStatus, number> = {
    pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, completed: 4, cancelled: -1,
  };
  return map[status] ?? 0;
}

export const SellerOrderStatus: React.FC<SellerOrderStatusProps> = ({ status, deliveryMethod }) => {
  const current = stepIndex(status);
  const isCancelled = status === 'cancelled';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {STEPS.map((step, idx) => {
        if (deliveryMethod === 'pickup' && step.key === 'shipped') return null;

        const isComplete = idx < current;
        const isCurrent = idx === current;
        const future = idx > current;
        const stepLabel = deliveryMethod === 'pickup' ? step.pickupLabel : step.label;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
            {idx > 0 && (
              <div style={{
                width: '20px',
                height: '2px',
                background: isComplete ? 'var(--primary)' : 'var(--border-color)',
              }} />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: isComplete ? 'var(--primary)' : 'transparent',
                border: isCurrent ? '2px solid var(--primary)' : '2px solid var(--border-color)',
              }} />
              <span style={{
                fontSize: '0.6rem', fontWeight: 600,
                color: isComplete ? 'var(--primary)' : future ? 'var(--text-muted)' : 'var(--text-primary)',
                whiteSpace: 'nowrap', lineHeight: 1.2,
              }}>
                {stepLabel}
              </span>
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          marginLeft: '8px', padding: '2px 8px', borderRadius: '6px',
          background: '#fef2f2',
        }}>
          <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700 }}>✕</span>
          <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 600 }}>Cancelled</span>
        </div>
      )}
    </div>
  );
};
