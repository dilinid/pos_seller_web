import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import type { UserReview, ReviewTarget } from '../../types/marketplace.type';

interface ReviewFormProps {
  targetType: ReviewTarget;
  targetId: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  orderItemProductId?: string;
  targetLabel?: string;
  onSubmit: (review: UserReview) => void;
}

const TARGET_LABELS: Record<ReviewTarget, string> = {
  product: 'product',
  seller: 'store',
  buyer: 'buyer',
};

const TARGET_PLACEHOLDERS: Record<ReviewTarget, string> = {
  product: 'Tell us what you think about this product...',
  seller: 'Describe your experience with this store...',
  buyer: 'Describe your experience with this buyer...',
};

const SUBMIT_LABELS: Record<ReviewTarget, string> = {
  product: 'Submit Review',
  seller: 'Rate Store',
  buyer: 'Rate Buyer',
};

const SUBMITTED_MESSAGES: Record<ReviewTarget, string> = {
  product: 'Review submitted! Thank you.',
  seller: 'Store rating submitted! Thank you.',
  buyer: 'Buyer rating submitted! Thank you.',
};

let reviewIdCounter = Date.now();

export const ReviewForm: React.FC<ReviewFormProps> = ({
  targetType, targetId, orderId, reviewerId, reviewerName,
  orderItemProductId, targetLabel, onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (rating === 0 || !title.trim() || !comment.trim()) return;
    onSubmit({
      id: `rev-${reviewIdCounter++}`,
      targetType,
      targetId,
      orderId,
      orderItemProductId,
      reviewerId,
      reviewerName,
      rating,
      title: title.trim(),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{
        padding: '12px', borderRadius: '8px', background: 'var(--accent-light)',
        fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <Star size={14} fill="currentColor" />
        {SUBMITTED_MESSAGES[targetType]}
      </div>
    );
  }

  const label = targetLabel ?? TARGET_LABELS[targetType];

  return (
    <div style={{
      padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {targetType === 'product' ? 'Write your review' : `Rate this ${label}`}
      </div>

      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: star <= (hover || rating) ? 'var(--accent)' : 'var(--border-color)',
              transition: 'var(--transition-fast)', padding: '2px',
            }}
          >
            <Star size={18} fill={star <= (hover || rating) ? 'var(--accent)' : 'none'} />
          </button>
        ))}
      </div>

      <input
        className="form-input"
        placeholder="Review title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ fontSize: '0.82rem', padding: '8px 12px' }}
      />
      <textarea
        className="form-input"
        placeholder={TARGET_PLACEHOLDERS[targetType]}
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        style={{ fontSize: '0.82rem', padding: '8px 12px', resize: 'vertical', minHeight: '50px' }}
      />
      <button
        onClick={handleSubmit}
        disabled={rating === 0 || !title.trim() || !comment.trim()}
        className="btn btn-primary"
        style={{
          alignSelf: 'flex-end', padding: '7px 16px', fontSize: '0.8rem',
          borderRadius: '20px', gap: '5px',
          opacity: rating === 0 || !title.trim() || !comment.trim() ? 0.5 : 1,
          cursor: rating === 0 || !title.trim() || !comment.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        <Send size={13} /> {SUBMIT_LABELS[targetType]}
      </button>
    </div>
  );
};
