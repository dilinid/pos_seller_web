import { Package } from 'lucide-react';
import type { SellerProfile } from '../../types/seller.type';
import { StarRating } from '../ui/StarRating';

const AVATAR_COLORS = [
  '#0060e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarColor(sellerId: string): string {
  let hash = 0;
  for (let i = 0; i < sellerId.length; i++) {
    hash = sellerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface StoreHeaderProps {
  seller: SellerProfile;
  dynamicRating?: number;
  dynamicReviewCount?: number;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({ seller, dynamicRating, dynamicReviewCount }) => {
  const storeName = seller.storeName || 'Our Store';
  const color = getAvatarColor(seller.id);
  const displayRating = dynamicRating ?? seller.rating;
  const displayReviewCount = dynamicReviewCount;

  return (
    <div
      style={{
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}, ${hexToRgba(color, 0.6)})`,
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: hexToRgba('#ffffff', 0.08),
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          left: '30%',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: hexToRgba('#ffffff', 0.05),
        }}
      />

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: hexToRgba('#ffffff', 0.2),
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            fontWeight: 700,
            flexShrink: 0,
            backdropFilter: 'blur(4px)',
          }}
        >
          {getInitials(storeName)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              textShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }}
          >
            {storeName}
          </h1>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: hexToRgba('#ffffff', 0.9) }}>
              <StarRating rating={displayRating} reviewCount={displayReviewCount} size="sm" color="#fff" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: hexToRgba('#ffffff', 0.9) }}>
              <Package size={14} /> {seller.productCount} products
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: hexToRgba('#ffffff', 0.9) }}>
              {seller.totalSales.toLocaleString()} sales
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
