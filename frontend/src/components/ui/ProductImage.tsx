import type { CSSProperties } from 'react';

const isImageUrl = (value?: string | null): boolean =>
  !!value && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'));

interface ProductImageProps {
  image?: string | null;
  alt: string;
  /** Fixed icon-style box (e.g. '1.3rem', '32px'). Ignored when `fill` is set. */
  size?: string;
  /** Fill the parent container (100% width/height) instead of using `size`. */
  fill?: boolean;
  style?: CSSProperties;
}

/** Renders a product's image: a real photo URL as <img>, or a legacy emoji as text. */
export const ProductImage: React.FC<ProductImageProps> = ({ image, alt, size, fill, style }) => {
  if (isImageUrl(image)) {
    return (
      <img
        src={image as string}
        alt={alt}
        style={{
          width: fill ? '100%' : size,
          height: fill ? '100%' : size,
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  return (
    <span
      style={{
        display: fill ? undefined : 'inline-flex',
        alignItems: fill ? undefined : 'center',
        justifyContent: fill ? undefined : 'center',
        width: fill ? undefined : size,
        height: fill ? undefined : size,
        fontSize: fill ? undefined : size,
        lineHeight: 1,
        flexShrink: 0,
        ...style,
      }}
    >
      {image || '🛍️'}
    </span>
  );
};
