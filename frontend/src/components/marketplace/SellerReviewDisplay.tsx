import { useMemo } from 'react';
import { MessageCircle } from 'lucide-react';
import type { UserReview } from '../../types/marketplace.type';
import type { SellerProfile } from '../../types/seller.type';
import { StarRating } from '../ui/StarRating';

interface SellerReviewDisplayProps {
  seller: SellerProfile;
  reviews: UserReview[];
}

export const SellerReviewDisplay: React.FC<SellerReviewDisplayProps> = ({ seller, reviews }) => {
  const sellerReviews = useMemo(
    () => reviews.filter((r) => r.targetType === 'seller' && r.targetId === seller.id && !r.autoRated),
    [reviews, seller.id],
  );

  const avgRating = useMemo(() => {
    if (sellerReviews.length === 0) return seller.rating;
    return sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length;
  }, [sellerReviews, seller.rating]);

  if (sellerReviews.length === 0) {
    return (
      <div className="premium-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          Seller Reviews
        </h3>
        <div style={{
          textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)',
        }}>
          <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <p style={{ fontSize: '0.88rem' }}>No reviews yet for this seller.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
            Seller Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={Math.round(avgRating * 10) / 10} showValue size="md" />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              ({sellerReviews.length} {sellerReviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sellerReviews.slice(0, 5).map((review) => (
          <div
            key={review.id}
            style={{
              padding: '12px', borderRadius: '10px', background: 'var(--bg-secondary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <StarRating rating={review.rating} size="sm" />
              <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{review.reviewerName}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
            </div>
            {review.title && (
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '2px' }}>
                {review.title}
              </div>
            )}
            {review.comment && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
