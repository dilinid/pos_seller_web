import type { OrderStatus } from '../../types/marketplace.type';
import { ORDER_STATUS_META, ORDER_TIMELINE_STEPS, getStatusLabel, getTimelineStep } from '../../data/order-status';

interface OrderProgressStepperProps {
  status: OrderStatus;
  deliveryMethod: 'delivery' | 'pickup';
}

export const OrderProgressStepper: React.FC<OrderProgressStepperProps> = ({ status, deliveryMethod }) => {
  const current = getTimelineStep(status);
  const isCancelled = status === 'cancelled';
  const isReturned = status === 'returned';

  // Return pseudo-orders don't move through the normal ordering funnel —
  // show a plain pill instead of a stepper stuck at step 0.
  if (isReturned) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '2px 8px', borderRadius: '6px', background: ORDER_STATUS_META.returned.bg,
      }}>
        <span style={{ fontSize: '0.65rem', color: ORDER_STATUS_META.returned.color, fontWeight: 700 }}>↩</span>
        <span style={{ fontSize: '0.65rem', color: ORDER_STATUS_META.returned.color, fontWeight: 600 }}>
          {ORDER_STATUS_META.returned.label}
        </span>
      </div>
    );
  }

  const steps = ORDER_TIMELINE_STEPS.filter((s) => !(deliveryMethod === 'pickup' && s === 'shipped'));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
      {steps.map((step, idx) => {
        const isComplete = idx < current;
        const isCurrent = idx === current;
        const future = idx > current;

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
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
                {getStatusLabel(step, deliveryMethod)}
              </span>
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          marginLeft: '8px', padding: '2px 8px', borderRadius: '6px',
          background: ORDER_STATUS_META.cancelled.bg,
        }}>
          <span style={{ fontSize: '0.65rem', color: ORDER_STATUS_META.cancelled.color, fontWeight: 700 }}>✕</span>
          <span style={{ fontSize: '0.65rem', color: ORDER_STATUS_META.cancelled.color, fontWeight: 600 }}>
            {ORDER_STATUS_META.cancelled.label}
          </span>
        </div>
      )}
    </div>
  );
};
