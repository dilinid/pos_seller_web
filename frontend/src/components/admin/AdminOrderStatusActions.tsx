import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderStatus } from '../../types/marketplace.type';
import { getTransitions, ORDER_STATUS_META } from '../../data/order-status';
import { AdminTrackingForm } from './AdminTrackingForm';

interface AdminOrderStatusActionsProps {
  status: OrderStatus;
  deliveryMethod: 'delivery' | 'pickup';
  trackingCarrier?: string;
  trackingNumber?: string;
  trackingPhone?: string;
  onUpdateStatus: (newStatus: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string; contactPhone?: string }) => void;
}

export const AdminOrderStatusActions: React.FC<AdminOrderStatusActionsProps> = ({
  status, deliveryMethod, trackingCarrier, trackingNumber, trackingPhone, onUpdateStatus,
}) => {
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState<OrderStatus | null>(null);
  const [trackingData, setTrackingData] = useState<{ carrier?: string; trackingNumber?: string; contactPhone?: string }>({});
  const transitions = getTransitions(status, deliveryMethod);
  const meta = ORDER_STATUS_META[status];

  if (transitions.length === 0) {
    return (
      <div style={{
        padding: '10px 14px', background: '#f9fafb', borderRadius: '10px',
        fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center',
      }}>
        No actions available for {meta.label.toLowerCase()} orders
      </div>
    );
  }

  const requiresTracking = deliveryMethod === 'delivery' && transitions.some((t) => t.requiresTracking);

  const handleConfirm = () => {
    if (confirmAction) {
      onUpdateStatus(confirmAction, requiresTracking ? trackingData : undefined);
    }
    setConfirmAction(null);
    setTrackingData({});
  };

  const handleTrackingApply = (carrier: string, tn: string, phone?: string) => {
    setTrackingData({ carrier, trackingNumber: tn, contactPhone: phone });
  };

  const hasTrackingInfo = trackingCarrier && trackingNumber;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {transitions.map((t) => (
          <button
            key={`${t.from}-${t.to}`}
            onClick={() => {
              if (t.navigateTo) {
                navigate(t.navigateTo);
              } else if (t.requiresTracking && !hasTrackingInfo) {
                setConfirmAction(t.to);
              } else {
                onUpdateStatus(t.to, t.requiresTracking ? trackingData : undefined);
              }
            }}
            className="btn"
            style={{
              padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600,
              background: t.color ? `${t.color}15` : 'var(--primary-light)',
              color: t.color ?? 'var(--primary)',
              border: `1px solid ${t.color ? `${t.color}30` : 'var(--primary)'}`,
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', gap: '6px',
              cursor: 'pointer', transition: 'var(--transition-fast)',
            }}
          >
            {t.icon && <span>{t.icon}</span>}
            {t.label}
          </button>
        ))}
      </div>

      {requiresTracking && !hasTrackingInfo && (
        <div style={{ marginTop: '14px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Tracking Information Required
          </div>
          <AdminTrackingForm
            currentCarrier={trackingCarrier}
            currentTracking={trackingNumber}
            currentPhone={trackingPhone}
            onApply={handleTrackingApply}
          />
        </div>
      )}

      {confirmAction && (
        <div style={{
          marginTop: '14px', padding: '14px', background: '#fffbeb', borderRadius: '10px',
          border: '1px solid #fde68a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
        }}>
          <span style={{ fontSize: '0.82rem', color: '#92400e' }}>
            Update status to <strong>{ORDER_STATUS_META[confirmAction].label}</strong>?
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setConfirmAction(null)}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '0.78rem' }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
