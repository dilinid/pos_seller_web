import type { FC } from 'react';
import { Bell } from 'lucide-react';

interface DashboardActionsProps {
  onChangeBank: () => void;
  onOpenNotifications: () => void;
}

const DashboardActions: FC<DashboardActionsProps> = ({
  onChangeBank,
  onOpenNotifications,
}) => {
  return (
    <div
      className="premium-card"
      style={{
        background: '#ffffff',
        padding: '18px 20px',
        borderRadius: 'var(--border-radius-md)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '18px',
        flexWrap: 'wrap',
        textAlign: 'left',
      }}
    >
      <div style={{ minWidth: 0, flex: '1 1 260px' }}>
        <h4
          style={{
            fontSize: '0.95rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            margin: 0,
            color: 'var(--text-primary)',
          }}
        >
          Account Services
        </h4>
        <p
          style={{
            margin: '4px 0 0 0',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
          }}
        >
          Change your linked bank or open your notification center.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onChangeBank}
          className="btn btn-secondary"
          style={{ padding: '11px 16px', fontSize: '0.82rem', borderRadius: '20px', whiteSpace: 'nowrap' }}
        >
          Change Bank
        </button>
        <button
          type="button"
          onClick={onOpenNotifications}
          className="btn btn-secondary"
          style={{
            padding: '11px 14px',
            fontSize: '0.82rem',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Bell size={14} />
          Notifications Center
        </button>
      </div>
    </div>
  );
};

export default DashboardActions;
