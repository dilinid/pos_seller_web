import type { ProductDraftStatus } from '../../types/product-draft.type';

const BADGE_STYLES: Record<ProductDraftStatus, { bg: string; color: string; label: string }> = {
  draft: { bg: '#f1f5f9', color: '#64748b', label: 'Draft' },
  pending_review: { bg: '#fef3c7', color: '#d97706', label: 'Pending Review' },
  approved: { bg: '#dbeafe', color: '#2563eb', label: 'Approved' },
  changes_requested: { bg: '#fef2f2', color: '#dc2626', label: 'Changes Requested' },
  published: { bg: '#f0fdf4', color: '#16a34a', label: 'Published' },
};

interface ProductStatusBadgeProps {
  status: ProductDraftStatus;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({ status }) => {
  const style = BADGE_STYLES[status];
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 600,
      padding: '3px 10px', borderRadius: '20px',
      background: style.bg, color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {style.label}
    </span>
  );
};
