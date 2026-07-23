import { useNavigate } from 'react-router-dom';
import type { Seller } from '../../types/marketplace.type';

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

function getAvatarColor(sellerId: string): string {
  let hash = 0;
  for (let i = 0; i < sellerId.length; i++) {
    hash = sellerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface SellerBadgeProps {
  seller: Seller;
  size?: 'sm' | 'md';
  to?: string;
}

export const SellerBadge: React.FC<SellerBadgeProps> = ({ seller, size = 'sm', to }) => {
  const navigate = useNavigate();
  const avatarSize = size === 'md' ? 32 : 24;
  const fontSize = size === 'md' ? '0.75rem' : '0.6rem';
  const color = getAvatarColor(seller.id);

  const inner = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <div
        style={{
          width: avatarSize,
          height: avatarSize,
          borderRadius: '50%',
          background: color,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize,
          fontWeight: 700,
          flexShrink: 0,
          lineHeight: 1,
        }}
      >
        {getInitials(seller.name)}
      </div>
      <span
        style={{
          fontSize: size === 'md' ? '0.85rem' : '0.75rem',
          color: 'var(--text-secondary)',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {seller.name}
      </span>
    </div>
  );

  if (to) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          navigate(to);
        }}
        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
      >
        {inner}
      </div>
    );
  }

  return inner;
};
