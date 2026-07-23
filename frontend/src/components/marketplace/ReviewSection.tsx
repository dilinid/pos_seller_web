import { useState } from 'react';
import type { Review } from '../../types/marketplace.type';
import { StarRating } from '../ui/StarRating';

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

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface ReviewSectionProps {
  reviews: Review[];
  rating: number;
  reviewCount: number;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, rating, reviewCount }) => {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="premium-card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
            Customer Reviews
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StarRating rating={rating} showValue size="lg" />
            {reviewCount > 0 && (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {displayed.map((review) => (
          <div
            key={review.id}
            style={{
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: getAvatarColor(review.userName),
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(review.userName)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{review.userName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{review.date}</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                  <StarRating rating={review.rating} size="sm" />
                </span>
              </div>
            </div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '4px', paddingLeft: '42px' }}>
              {review.title}
            </h4>
            <p style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              paddingLeft: '42px',
            }}>
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="btn btn-secondary"
          style={{
            marginTop: '16px',
            width: '100%',
            borderRadius: '12px',
            padding: '10px',
            fontSize: '0.85rem',
          }}
        >
          {showAll ? 'Show less' : `Show all ${reviewCount} reviews`}
        </button>
      )}
    </div>
  );
};
