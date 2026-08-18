import type { PayoutStatus } from '../../types/marketplace.type';
import { PAYOUT_STATUS_META } from '../../data/order-status';

interface AdminPayoutBadgeProps {
  status: PayoutStatus;
}

export const AdminPayoutBadge: React.FC<AdminPayoutBadgeProps> = ({ status }) => {
  const meta = PAYOUT_STATUS_META[status];
  if (!meta) return null;
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '3px 10px', borderRadius: '20px',
        fontSize: '0.72rem', fontWeight: 600,
        background: meta.bg, color: meta.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: meta.color, flexShrink: 0,
      }} />
      {meta.label}
    </span>
  );
};
