import { useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import type { UserReview } from '../../types/marketplace.type';

const BUYER_TAGS = [
  'Paid on time',
  'Great communication',
  'Prompt pickup',
  'Easy return',
];

interface SellerRatingFormProps {
  orderId: string;
  buyerId: string;
  buyerName: string;
  reviewerId: string;
  reviewerName: string;
  onSubmit: (review: UserReview) => void;
}

let reviewIdCounter = Date.now();

export const SellerRatingForm: React.FC<SellerRatingFormProps> = ({
  orderId, buyerId, buyerName, reviewerId, reviewerName, onSubmit,
}) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    const comment = selectedTags.length > 0 ? selectedTags.join(', ') : '';
    onSubmit({
      id: `rev-seller-${reviewIdCounter++}`,
      targetType: 'buyer',
      targetId: buyerId,
      orderId,
      reviewerId,
      reviewerName,
      rating,
      title: `Rating for ${buyerName}`,
      comment,
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
        Buyer rating submitted! Thank you.
      </div>
    );
  }

  return (
    <div style={{
      padding: '14px', borderRadius: '10px', background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'var(--primary-light)', color: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={16} />
        </div>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Rate {buyerName}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>How was your experience with this buyer?</div>
        </div>
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
            <Star size={22} fill={star <= (hover || rating) ? 'var(--accent)' : 'none'} />
          </button>
        ))}
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Quick tags <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {BUYER_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: '5px 12px', borderRadius: '20px', border: 'none',
                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                background: selectedTags.includes(tag) ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: selectedTags.includes(tag) ? '#fff' : 'var(--text-secondary)',
                transition: 'var(--transition-fast)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={rating === 0}
        className="btn btn-primary"
        style={{
          alignSelf: 'flex-end', padding: '8px 20px', fontSize: '0.82rem',
          borderRadius: '20px', gap: '5px',
          opacity: rating === 0 ? 0.5 : 1,
          cursor: rating === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        <Send size={13} /> Submit Rating
      </button>
    </div>
  );
};
