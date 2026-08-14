import { MapPin, Truck } from 'lucide-react';
import type { OrderStatus } from '../../types/marketplace.type';
import { getTimelineStep } from '../../data/order-status';

interface DeliveryTrackerProps {
  status: OrderStatus;
  storePickupAddress: string;
  estimatedDeliveryDays: string;
}

export const DeliveryTracker: React.FC<DeliveryTrackerProps> = ({ status, storePickupAddress, estimatedDeliveryDays }) => {
  const current = getTimelineStep(status);
  const shippedStage = current >= 3;
  const deliveredStage = current >= 4;
  const isCancelled = status === 'cancelled';
  const isReturned = status === 'returned';

  // Neither cancelled nor returned orders are "in transit" — the delivery
  // funnel this tracker visualizes doesn't apply to either.
  if (isCancelled || isReturned) return null;

  return (
    <div style={{
      padding: '12px', borderRadius: '10px',
      background: 'var(--bg-secondary)', fontSize: '0.82rem',
    }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Delivery Tracking
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: current >= 1 ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: current >= 1 ? '#fff' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition-fast)',
          }}>
            <MapPin size={13} />
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
            Store
          </span>
        </div>

        <div style={{
          flex: 1, height: '2px',
          background: shippedStage ? 'var(--primary)' : 'var(--border-color)',
          position: 'relative', transition: 'var(--transition-fast)',
        }}>
          {shippedStage && (
            <div style={{
              position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
              fontSize: '0.65rem', animation: 'none',
            }}>
              🚚
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: shippedStage ? 'var(--primary)' : 'var(--bg-tertiary)',
            color: shippedStage ? '#fff' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition-fast)',
          }}>
            <Truck size={13} />
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
            Transit
          </span>
        </div>

        <div style={{
          flex: 1, height: '2px',
          background: deliveredStage ? 'var(--accent)' : 'var(--border-color)',
          transition: 'var(--transition-fast)',
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: deliveredStage ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: deliveredStage ? '#fff' : 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition-fast)',
          }}>
            <MapPin size={13} />
          </div>
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
            You
          </span>
        </div>
      </div>

      <div style={{
        marginTop: '10px', display: 'flex', justifyContent: 'space-between',
        fontSize: '0.72rem', color: 'var(--text-muted)',
      }}>
        <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {storePickupAddress}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
          Est. {estimatedDeliveryDays}
        </span>
      </div>
    </div>
  );
};
