import type { FC } from 'react';
import { X } from 'lucide-react';
import type {
  DashboardCommCenterView,
  DashboardMessageItem,
} from './dashboard.types';

interface CommunicationsCenterModalProps {
  open: boolean;
  view: DashboardCommCenterView;
  messages: DashboardMessageItem[];
  alerts: DashboardMessageItem[];
  onClose: () => void;
  onViewChange: (view: DashboardCommCenterView) => void;
}

const CommunicationsCenterModal: FC<CommunicationsCenterModalProps> = ({
  open,
  view,
  messages,
  alerts,
  onClose,
  onViewChange,
}) => {
  if (!open) {
    return null;
  }

  const items = view === 'messages' ? messages : alerts;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(17, 24, 39, 0.42)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 2200,
      }}
    >
      <div
        className="premium-card animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Communications center"
        style={{
          width: '100%',
          maxWidth: '620px',
          background: '#ffffff',
          borderRadius: '16px',
          border: 'none',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
              {view === 'messages' ? 'Bank Messages' : 'Bank Alerts'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {view === 'messages' ? 'Secure bank messages.' : 'Bank alerts and service notices.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close communications center"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onViewChange('messages')}
              style={{
                appearance: 'none',
                padding: '8px 12px',
                borderRadius: '18px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: view === 'messages' ? 'var(--primary)' : 'var(--text-secondary)',
                background: view === 'messages' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              Bank Messages
            </button>
            <button
              type="button"
              onClick={() => onViewChange('alerts')}
              style={{
                appearance: 'none',
                padding: '8px 12px',
                borderRadius: '18px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: view === 'alerts' ? 'var(--primary)' : 'var(--text-secondary)',
                background: view === 'alerts' ? 'var(--primary-light)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              Bank Alerts
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div
                key={item.title}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-secondary)',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {item.time}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsCenterModal;
