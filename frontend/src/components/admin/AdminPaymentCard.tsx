import { useMemo } from 'react';
import { Package, Wallet, Calendar } from 'lucide-react';
import type { Order, PayoutStatus } from '../../types/marketplace.type';
import { AdminPayoutBadge } from './AdminPayoutBadge';
import { ProductImage } from '../ui/ProductImage';
import { formatCurrency } from '../../utils/currency';

interface AdminPaymentCardProps {
  order: Order;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

function getPayoutMethodLabel(method?: string): string {
  const map: Record<string, string> = {
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    direct_deposit: 'Direct Deposit',
  };
  return method ? map[method] ?? method : '';
}

function getPayoutIcon(method?: string): string {
  const map: Record<string, string> = {
    bank_transfer: '🏦',
    cheque: '📄',
    direct_deposit: '💳',
  };
  return method ? map[method] ?? '💰' : '💰';
}

export const AdminPaymentCard: React.FC<AdminPaymentCardProps> = ({ order, onClick }) => {
  const items = order.items;

  const itemsTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  const deliveryFee = items.length > 0 ? items[0].deliveryFee : 0;
  const payoutAmount = itemsTotal + deliveryFee;

  const itemImages = items.slice(0, 2).map((i) => i.productImage);

  const payoutStatus: PayoutStatus = useMemo(() => {
    const statuses = items.map((i) => i.payoutStatus ?? 'pending');
    if (statuses.every((s) => s === 'paid')) return 'paid';
    if (statuses.some((s) => s === 'paid')) return 'processing';
    if (statuses.some((s) => s === 'on_hold')) return 'on_hold';
    if (statuses.some((s) => s === 'processing')) return 'processing';
    return 'pending';
  }, [items]);

  const paidItem = items.find((i) => i.payoutStatus === 'paid' || i.payoutStatus === 'processing');
  const payoutMethod = paidItem?.payoutMethod;
  const payoutRef = paidItem?.payoutRef;
  const payoutDate = paidItem?.payoutDate;

  return (
    <div
      onClick={onClick}
      className="premium-card premium-card-hover"
      style={{
        padding: '16px 20px', cursor: 'pointer', marginBottom: '10px',
        transition: 'var(--transition-smooth)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {itemImages.map((img, i) => (
              <ProductImage key={i} image={img} alt="Order item" size="1.4rem" />
            ))}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {order.id}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>
              {order.buyerName}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <AdminPayoutBadge status={payoutStatus} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {timeAgo(order.updatedAt)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 0 }}>
          <Package size={13} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {items.map((i) => i.productName).join(', ')}
          </span>
        </div>
        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', flexShrink: 0 }}>
          {formatCurrency(payoutAmount)}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px', borderRadius: '8px',
        background: payoutStatus === 'paid' ? '#f0fdf4' : payoutStatus === 'on_hold' ? '#fef2f2' : '#f8fafc',
        fontSize: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {payoutMethod ? (
            <>
              <span>{getPayoutIcon(payoutMethod)}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                {getPayoutMethodLabel(payoutMethod)}
              </span>
              {payoutRef && (
                <span style={{ color: 'var(--text-muted)' }}>
                  · {payoutRef}
                </span>
              )}
            </>
          ) : (
            <>
              <Wallet size={13} style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-muted)' }}>Awaiting payout</span>
            </>
          )}
        </div>
        {payoutDate && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
            <Calendar size={11} />
            {new Date(payoutDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );
};
