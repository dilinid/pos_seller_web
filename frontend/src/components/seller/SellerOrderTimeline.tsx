import type { OrderStatus } from '../../types/marketplace.type';
import { ORDER_TIMELINE_STEPS, getTimelineStep, PICKUP_STATUS_LABELS } from '../../data/order-status';

interface SellerOrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  deliveryMethod: 'delivery' | 'pickup';
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export const SellerOrderTimeline: React.FC<SellerOrderTimelineProps> = ({
  status, createdAt, updatedAt, deliveryMethod,
}) => {
  const current = getTimelineStep(status);
  const isCancelled = status === 'cancelled';
  const isReturned = status === 'returned';

  const steps = ORDER_TIMELINE_STEPS.filter((s) => {
    if (deliveryMethod === 'pickup' && s.key === 'shipped') return false;
    return true;
  });

  return (
    <div style={{ padding: '4px 0' }}>
      {steps.map((step, idx) => {
        const stepIdx = ORDER_TIMELINE_STEPS.findIndex((s) => s.key === step.key);
        const isComplete = stepIdx < current;
        const isCurrent = stepIdx === current;
        const future = stepIdx > current;

        let timestamp = '';
        if (isComplete || isCurrent) {
          timestamp = formatTime(isCurrent ? updatedAt : createdAt);
        }

        return (
          <div
            key={step.key}
            style={{
              display: 'flex', gap: '12px',
              opacity: future ? 0.45 : 1,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
                background: isComplete ? 'var(--primary)' : isCurrent ? 'var(--primary)' : 'transparent',
                border: isCurrent ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                boxShadow: isCurrent ? '0 0 0 3px var(--primary-glow)' : 'none',
                transition: 'var(--transition-fast)',
              }} />
              {idx < steps.length - 1 && (
                <div style={{
                  width: '2px', flex: 1, minHeight: '24px',
                  background: isComplete ? 'var(--primary)' : 'var(--border-color)',
                }} />
              )}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              paddingBottom: idx < steps.length - 1 ? '16px' : 0,
              minHeight: '28px',
            }}>
              <span style={{
                fontSize: '0.82rem', fontWeight: isCurrent ? 600 : 400,
                color: isComplete ? 'var(--text-primary)' : future ? 'var(--text-muted)' : 'var(--text-primary)',
              }}>
                {deliveryMethod === 'pickup' && PICKUP_STATUS_LABELS[step.key as keyof typeof PICKUP_STATUS_LABELS]
                  ? PICKUP_STATUS_LABELS[step.key as keyof typeof PICKUP_STATUS_LABELS]
                  : step.label}
              </span>
              {isCurrent && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                  color: 'var(--primary)', background: 'var(--primary-light)',
                  padding: '1px 8px', borderRadius: '6px',
                }}>
                  Current
                </span>
              )}
              {timestamp && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {timestamp}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
              background: '#ef4444',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#dc2626' }}>
              Cancelled
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {formatTime(updatedAt)}
            </span>
          </div>
        </div>
      )}

      {isReturned && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' }}>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%', flexShrink: 0,
              background: '#d97706',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#92400e' }}>
              Returned
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {formatTime(updatedAt)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
