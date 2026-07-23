import type { Product, CartItem } from '../../types/marketplace.type';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  cart: CartItem[];
  loading?: boolean;
}

const SkeletonCard: React.FC = () => (
  <div
    className="premium-card"
    style={{
      padding: '16px',
      minHeight: '340px',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div className="skeleton-block" style={{ width: '60px', height: '16px', borderRadius: '10px', marginBottom: '16px' }} />
    <div className="skeleton-block" style={{ width: '100%', height: '120px', borderRadius: '12px', marginBottom: '12px' }} />
    <div className="skeleton-block" style={{ width: '70%', height: '16px', borderRadius: '6px', marginBottom: '6px' }} />
    <div className="skeleton-block" style={{ width: '40%', height: '12px', borderRadius: '6px', marginBottom: '8px' }} />
    <div className="skeleton-block" style={{ width: '80px', height: '12px', borderRadius: '6px', marginBottom: '8px' }} />
    <div className="skeleton-block" style={{ width: '30%', height: '20px', borderRadius: '6px', marginBottom: '8px' }} />
    <div className="skeleton-block" style={{ width: '50%', height: '14px', borderRadius: '6px', marginBottom: '16px' }} />
    <div className="skeleton-block" style={{ width: '100%', height: '40px', borderRadius: '24px', marginTop: 'auto' }} />
  </div>
);

export const ProductGrid: React.FC<ProductGridProps> = ({ products, cart, loading }) => {
  if (loading) {
    return (
      <div className="grid-4" style={{ gap: '24px' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '80px 20px',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
        <h3
          style={{
            fontSize: '1.2rem',
            fontWeight: 600,
            marginBottom: '8px',
            color: 'var(--text-primary)',
          }}
        >
          No products found
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Try adjusting your search or category filter to find what you&apos;re looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-4" style={{ gap: '24px' }}>
      {products.map((product) => {
        const cartItem = cart.find((item) => item.product.id === product.id);
        return <ProductCard key={product.id} product={product} cartItem={cartItem} />;
      })}
    </div>
  );
};
