import { getStockStatus, STOCK_STATUS_META } from '../../utils/stock.utils';

interface StockBadgeProps {
  quantity: number;
  reorderLevel?: number;
  size?: 'sm' | 'md';
}

export const StockBadge: React.FC<StockBadgeProps> = ({ quantity, reorderLevel, size = 'sm' }) => {
  if (reorderLevel == null) return null;

  const status = getStockStatus(quantity, reorderLevel);
  const meta = STOCK_STATUS_META[status];
  const fontSize = size === 'md' ? '0.78rem' : '0.7rem';
  const padding = size === 'md' ? '4px 12px' : '3px 10px';

  return (
    <span
      style={{
        fontSize,
        fontWeight: 600,
        padding,
        borderRadius: '20px',
        background: meta.bg,
        color: meta.color,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        lineHeight: 1.4,
      }}
    >
      {meta.label}
      {status === 'low_stock' && quantity > 0 && (
        <span style={{ marginLeft: '4px', fontWeight: 500, opacity: 0.85 }}>
          ({quantity})
        </span>
      )}
    </span>
  );
};
