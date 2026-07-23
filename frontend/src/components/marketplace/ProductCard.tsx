import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Minus } from 'lucide-react';
import type { Product, CartItem, Seller, ProductSubCategory } from '../../types/marketplace.type';
import { useMarketplaceStore } from '../../stores/marketplace.store';
import { SELLERS } from '../../data/sellers';
import { MARKETPLACE_CATEGORIES } from '../../data/categories';
import { SellerBadge } from './SellerBadge';
import { PriceDisplay } from '../ui/PriceDisplay';
import { StarRating } from '../ui/StarRating';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, cartItem }) => {
  const addToCart = useMarketplaceStore((s) => s.addToCart);
  const updateQuantity = useMarketplaceStore((s) => s.updateQuantity);
  const seller = useMemo<Seller | undefined>(
    () => SELLERS.find((s) => s.id === product.sellerId),
    [product.sellerId]
  );

  const subCategory = useMemo<ProductSubCategory | undefined>(() => {
    for (const cat of MARKETPLACE_CATEGORIES) {
      const found = cat.subCategories.find((s) => s.id === product.subCategoryId);
      if (found) return found;
    }
    return undefined;
  }, [product.subCategoryId]);

  return (
    <Link
      to={`/product/${product.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="premium-card animate-fade-in"
        style={{
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '340px',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            fontSize: '0.62rem',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {subCategory?.icon} {subCategory?.name ?? product.subCategoryId}
        </span>

        <div
          style={{
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            marginTop: '16px',
            marginBottom: '12px',
          }}
        >
          {product.image}
        </div>

        <div style={{ textAlign: 'left', marginBottom: '10px', flex: 1 }}>
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '2px',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </h4>
          <p
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              lineHeight: 1.3,
            }}
          >
            {product.unit}
          </p>
          <div style={{ marginBottom: '6px' }}>
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>
          <PriceDisplay price={product.price} mrp={product.mrp} size="md" showDiscountBadge />
        </div>

        {seller && (
          <div style={{ marginBottom: '8px' }}>
            <SellerBadge seller={seller} size="sm" to={`/store/${seller.id}`} />
          </div>
        )}

        {cartItem ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'var(--primary-light)',
              border: '1px solid rgba(0, 96, 229, 0.12)',
              borderRadius: '24px',
              padding: '4px',
            }}
            onClick={(e) => e.preventDefault()}
          >
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(product.id, cartItem.quantity - 1); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                color: 'var(--primary)',
              }}
            >
              <Minus size={14} />
            </button>
            <span
              style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--primary)',
              }}
            >
              {cartItem.quantity}
            </span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                color: 'var(--primary)',
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
            className="btn btn-secondary"
            style={{
              width: '100%',
              borderRadius: '24px',
              padding: '10px 16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            <Plus size={14} />
            Add to Cart
          </button>
        )}
      </div>
    </Link>
  );
};
