import type { OrderStatus } from '../../types/marketplace.type';
import { ORDER_TIMELINE_STEPS, getTimelineStep } from '../../data/order-status';

interface OrderTimelineProps {
  status: OrderStatus;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const currentStep = getTimelineStep(status);
  const isCancelled = status === 'cancelled';

  if (isCancelled) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px', background: '#fef2f2', borderRadius: '12px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: '#ef4444', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
        }}>
          ✕
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#dc2626' }}>Order Cancelled</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>This order has been cancelled.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {ORDER_TIMELINE_STEPS.map((step, idx) => {
        const isComplete = idx < currentStep;
        const isCurrent = idx === currentStep;
        const isPending = idx > currentStep;

        return (
          <div key={step.key} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px', flexShrink: 0 }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: isComplete ? 'var(--accent)' : isCurrent ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: isComplete || isCurrent ? '#fff' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                transition: 'var(--transition-fast)',
              }}>
                {isComplete ? '✓' : isCurrent ? '●' : idx + 1}
              </div>
              {idx < ORDER_TIMELINE_STEPS.length - 1 && (
                <div style={{
                  width: '2px', flex: 1, minHeight: '24px',
                  background: isComplete ? 'var(--accent)' : 'var(--border-color)',
                }} />
              )}
            </div>
            <div style={{ paddingBottom: idx < ORDER_TIMELINE_STEPS.length - 1 ? '20px' : '0', marginTop: '2px' }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 500,
                color: isComplete ? 'var(--accent)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
              }}>
                {step.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
