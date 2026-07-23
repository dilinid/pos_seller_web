import { Check, Clock, User, Store } from 'lucide-react';
import type { ReviewPeriod } from '../../types/marketplace.type';

interface MutualReviewStatusProps {
  period: ReviewPeriod;
  compact?: boolean;
  buyerName?: string;
  sellerName?: string;
}

export const MutualReviewStatus: React.FC<MutualReviewStatusProps> = ({
  period, compact, buyerName, sellerName,
}) => {
  const expired = new Date(period.expiresAt) < new Date();

  const buyerDone = period.buyerReviewedProduct || period.buyerReviewedSeller;
  const sellerDone = period.sellerReviewedBuyer;
  const bothDone = (period.buyerReviewedProduct && period.buyerReviewedSeller) && sellerDone;

  if (period.closed) {
    if (compact) {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          <Check size={12} /> Reviews closed
        </div>
      );
    }
    return (
      <div style={{
        padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)',
        fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)',
      }}>
        <Check size={16} color="var(--accent)" />
        <span>Review period closed. All ratings published.</span>
      </div>
    );
  }

  if (bothDone) {
    if (compact) {
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
          <Check size={12} /> Both reviewed
        </div>
      );
    }
    return (
      <div style={{
        padding: '10px', borderRadius: '8px', background: 'var(--accent-light)',
        fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 600,
      }}>
        <Check size={16} />
        <span>You both reviewed each other. Ratings will be revealed once the review period closes.</span>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(period.expiresAt).getTime() - Date.now()) / 86400000));

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        <Clock size={12} /> {daysLeft > 0 ? `${daysLeft}d left` : 'Expiring'}
      </div>
    );
  }

  return (
    <div style={{
      padding: '10px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a',
      fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
        <Clock size={15} color="#d97706" />
        <span style={{ color: '#92400e' }}>
          Review period active — {daysLeft > 0 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining` : 'expiring today'}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '21px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: buyerDone ? 'var(--accent)' : 'var(--text-muted)', fontWeight: buyerDone ? 600 : 400 }}>
          {buyerDone ? <Check size={13} /> : <Clock size={13} />}
          <span>{buyerName || 'Buyer'}: {buyerDone ? 'Reviewed' : 'Pending review'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: sellerDone ? 'var(--accent)' : 'var(--text-muted)', fontWeight: sellerDone ? 600 : 400 }}>
          {sellerDone ? <Check size={13} /> : <Clock size={13} />}
          <span>{sellerName || 'Seller'}: {sellerDone ? 'Reviewed' : 'Pending review'}</span>
        </div>
      </div>
    </div>
  );
};
