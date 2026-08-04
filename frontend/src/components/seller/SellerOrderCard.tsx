import { useMemo } from 'react';
import { Package, ChevronRight, MapPin, Store } from 'lucide-react';
import type { Order } from '../../types/marketplace.type';
import { OrderStatusBadge } from '../marketplace/OrderStatusBadge';
import { ProductImage } from '../ui/ProductImage';
import { formatCurrency } from '../../utils/currency';

interface SellerOrderCardProps {
  order: Order;
  sellerId: string;
  deliveryMethod: 'delivery' | 'pickup';
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

export const SellerOrderCard: React.FC<SellerOrderCardProps> = ({ order, sellerId, deliveryMethod, onClick }) => {
  const sellerItems = useMemo(
    () => order.items.filter((i) => i.sellerId === sellerId),
    [order.items, sellerId]
  );

  const sellerTotal = useMemo(
    () => sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [sellerItems]
  );

  const sellerDeliveryFee = sellerItems.length > 0 ? sellerItems[0].deliveryFee : 0;

  const itemImages = sellerItems.slice(0, 2).map((i) => i.productImage);

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
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {deliveryMethod === 'delivery' ? (
                <><MapPin size={11} style={{ flexShrink: 0 }} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{order.deliveryAddress}</span></>
              ) : (
                <><Store size={11} style={{ flexShrink: 0 }} />Pickup</>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <OrderStatusBadge status={sellerItems[0]?.status ?? 'pending'} deliveryMethod={deliveryMethod} />
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {timeAgo(order.updatedAt)}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', minWidth: 0 }}>
          <Package size={13} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {sellerItems.map((i) => i.productName).join(', ')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {formatCurrency(sellerTotal + sellerDeliveryFee)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {sellerItems.reduce((s, i) => s + i.quantity, 0)} item{sellerItems.length > 1 ? 's' : ''}
            </div>
          </div>
          <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </div>
  );
};
