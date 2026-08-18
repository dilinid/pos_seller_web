import { useNavigate } from 'react-router-dom';
import { Star, Package } from 'lucide-react';
import type { StoreProfile } from '../../types/store.type';

const AVATAR_COLORS = [
  '#0060e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarColor(storeId: string): string {
  let hash = 0;
  for (let i = 0; i < storeId.length; i++) {
    hash = storeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface StoreCardProps {
  seller: StoreProfile;
}

export const StoreCard: React.FC<StoreCardProps> = ({ seller }) => {
  const navigate = useNavigate();
  const storeName = seller.storeName || 'Our Store';
  const color = getAvatarColor(seller.id);

  return (
    <div
      className="premium-card"
      style={{ padding: '20px', cursor: 'pointer', transition: 'var(--transition-fast)' }}
      onClick={() => navigate('/store')}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--hover-shadow)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--card-shadow)'; }}
    >
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 700,
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {seller.logoUrl ? (
            <img src={seller.logoUrl} alt={storeName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            getInitials(storeName)
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {storeName}
            </h4>
            <span style={{
              fontSize: '0.8rem',
              color: 'var(--accent)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}>
              <Star size={13} fill="currentColor" />
              {seller.rating}
            </span>
          </div>
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '10px',
          }}>
            {seller.description}
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <Package size={14} />
              <span>{seller.totalSales.toLocaleString()} sales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
