import { formatCurrency } from '../../utils/currency';

interface PriceDisplayProps {
  price: number;
  mrp?: number | null;
  size?: 'sm' | 'md' | 'lg';
  showSavings?: boolean;
  showDiscountBadge?: boolean;
}

function calcDiscount(mrp: number, price: number): number {
  return Math.round(((mrp - price) / mrp) * 100);
}

const sizeStyles = {
  sm: { price: '0.82rem', mrp: '0.7rem', badge: '0.62rem', savings: '0.68rem' },
  md: { price: '0.95rem', mrp: '0.78rem', badge: '0.68rem', savings: '0.72rem' },
  lg: { price: '2rem', mrp: '1rem', badge: '0.72rem', savings: '0.82rem' },
};

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  mrp,
  size = 'md',
  showSavings = false,
  showDiscountBadge = true,
}) => {
  const s = sizeStyles[size];
  const safeMrp = (mrp != null && mrp > price) ? mrp : null;

  if (!safeMrp) {
    return (
      <span style={{ fontSize: s.price, fontWeight: 700, color: 'var(--text-primary)' }}>
        {formatCurrency(price)}
      </span>
    );
  }

  const discount = calcDiscount(safeMrp, price);
  const savings = Number((safeMrp - price).toFixed(2));

  return (
    <div style={{ display: 'flex', flexDirection: size === 'sm' ? 'row' : 'column', gap: '2px 6px', alignItems: size === 'sm' ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: s.price,
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          {formatCurrency(price)}
        </span>
        <span
          style={{
            fontSize: s.mrp,
            color: 'var(--text-muted)',
            textDecoration: 'line-through',
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {formatCurrency(safeMrp)}
        </span>
        {showDiscountBadge && discount > 0 && (
          <span
            style={{
              fontSize: s.badge,
              fontWeight: 700,
              color: '#fff',
              background: discount >= 30 ? '#16a34a' : discount >= 15 ? '#2563eb' : '#6b7280',
              padding: '1px 6px',
              borderRadius: '4px',
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
            }}
          >
            {discount}% OFF
          </span>
        )}
      </div>
      {showSavings && savings > 0 && (
        <span
          style={{
            fontSize: s.savings,
            color: '#16a34a',
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          You save {formatCurrency(savings)}
        </span>
      )}
    </div>
  );
};
