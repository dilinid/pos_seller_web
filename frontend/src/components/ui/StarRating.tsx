interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  color?: string;
  ariaLabel?: string;
}

const SIZE_MAP: Record<string, number> = { sm: 14, md: 18, lg: 24 };
const FONT_MAP: Record<string, string> = { sm: '0.75rem', md: '0.88rem', lg: '1rem' };

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';

interface StarIconProps {
  fill: 'full' | 'half' | 'empty';
  size: number;
  color: string;
  clipId?: string;
}

const StarIcon: React.FC<StarIconProps> = ({ fill, size, color, clipId }) => {
  const dim = `${size}px`;
  if (fill === 'half') {
    return (
      <svg width={dim} height={dim} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
        <defs>
          <clipPath id={`star-half-${clipId}`}>
            <rect x="0" y="0" width="12" height="24" />
          </clipPath>
        </defs>
        <path d={STAR_PATH} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
        <path d={STAR_PATH} fill={color} clipPath={`url(#star-half-${clipId})`} />
      </svg>
    );
  }
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" aria-hidden style={{ flexShrink: 0 }}>
      <path
        d={STAR_PATH}
        fill={fill === 'full' ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  reviewCount,
  interactive = false,
  onChange,
  color = '#f59e0b',
  ariaLabel,
}) => {
  const clipPrefix = `${size}-${rating.toString().replace('.', '_')}`;
  const starSize = SIZE_MAP[size] ?? 18;

  const getFill = (index: number): 'full' | 'half' | 'empty' => {
    const starNum = index + 1;
    if (rating >= starNum) return 'full';
    if (rating >= starNum - 0.5) return 'half';
    return 'empty';
  };

  const label = ariaLabel ?? `${rating.toFixed(1)} out of ${maxRating} stars`;

  const stars = Array.from({ length: maxRating }, (_, i) => {
    if (interactive) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i + 1)}
          onMouseEnter={(e) => {
            const container = e.currentTarget.parentElement;
            if (!container) return;
            const btns = container.querySelectorAll('button');
            btns.forEach((btn, idx) => {
              const path = btn.querySelector('path');
              if (!path) return;
              path.setAttribute('fill', idx <= i ? color : 'none');
            });
          }}
          onMouseLeave={() => {
            const container = document.querySelector(`[data-rating-id="${clipPrefix}"]`);
            if (!container) return;
            const btns = container.querySelectorAll('button');
            btns.forEach((btn, idx) => {
              const path = btn.querySelector('path');
              if (!path) return;
              path.setAttribute('fill', getFill(idx) === 'full' ? color : 'none');
            });
          }}
          aria-label={`Rate ${i + 1} star${i > 0 ? 's' : ''}`}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, lineHeight: 0, display: 'flex',
          }}
        >
          <StarIcon fill={getFill(i)} size={starSize} color={color} clipId={`${clipPrefix}-${i}`} />
        </button>
      );
    }
    return (
      <StarIcon
        key={`${i}`}
        fill={getFill(i)}
        size={starSize}
        color={color}
        clipId={`${clipPrefix}-${i}`}
      />
    );
  });

  return (
    <div
      data-rating-id={clipPrefix}
      role={interactive ? 'group' : 'img'}
      aria-label={interactive ? undefined : label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '3px',
        fontSize: FONT_MAP[size] ?? '0.88rem',
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>
        {stars}
      </div>
      {showValue && (
        <span style={{
          marginLeft: '2px', fontWeight: 700, color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span style={{
          marginLeft: '2px', color: 'var(--text-muted)', fontWeight: 500,
          lineHeight: 1,
        }}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
