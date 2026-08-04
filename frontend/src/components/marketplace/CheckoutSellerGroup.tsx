import { Truck, MapPin, Package } from 'lucide-react';
import type { CartItem } from '../../types/marketplace.type';
import type { SellerProfile } from '../../types/seller.type';
import { SellerBadge } from './SellerBadge';
import { PriceDisplay } from '../ui/PriceDisplay';
import { ProductImage } from '../ui/ProductImage';
import { calculateDeliveryFee } from '../../utils/delivery.utils';
import { formatCurrency } from '../../utils/currency';

interface CheckoutSellerGroupProps {
  seller: SellerProfile;
  items: CartItem[];
  deliveryMethod: 'delivery' | 'pickup';
  districtId: string;
  onDeliveryMethodChange: (method: 'delivery' | 'pickup') => void;
}

export const CheckoutSellerGroup: React.FC<CheckoutSellerGroupProps> = ({
  seller, items, deliveryMethod, districtId, onDeliveryMethodChange,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(
    seller,
    deliveryMethod === 'delivery' ? districtId : null,
    items.map((i) => ({ productId: i.product.id, quantity: i.quantity, weight: i.product.weight, volume: i.product.volume })),
    subtotal,
  );

  return (
    <div className="premium-card" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <SellerBadge seller={seller} size="md" to="/store" />

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {seller.deliveryAvailable && (
            <button
              onClick={() => onDeliveryMethodChange('delivery')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '20px', border: 'none',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                transition: 'var(--transition-fast)',
                background: deliveryMethod === 'delivery' ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: deliveryMethod === 'delivery' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <Truck size={13} /> Delivery
            </button>
          )}
          {seller.pickupAvailable && (
            <button
              onClick={() => onDeliveryMethodChange('pickup')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '20px', border: 'none',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                transition: 'var(--transition-fast)',
                background: deliveryMethod === 'pickup' ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: deliveryMethod === 'pickup' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <MapPin size={13} /> Pickup
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {items.map((item) => (
          <div
            key={item.product.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 0',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <ProductImage image={item.product.image} alt={item.product.name} size="1.3rem" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {item.product.name}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <PriceDisplay price={item.product.price} mrp={item.product.mrp} size="sm" /> × {item.quantity}
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {deliveryMethod === 'pickup' && (
        <div style={{
          marginTop: '12px', padding: '10px', borderRadius: '8px',
          background: 'var(--bg-secondary)', fontSize: '0.82rem',
          display: 'flex', alignItems: 'flex-start', gap: '6px',
        }}>
          <MapPin size={14} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Pickup at: <strong style={{ color: 'var(--text-primary)' }}>{seller.pickupAddress}</strong>
          </span>
        </div>
      )}

      {deliveryMethod === 'delivery' && (
        <div style={{
          marginTop: '12px', padding: '10px', borderRadius: '8px',
          background: 'var(--bg-secondary)', fontSize: '0.82rem',
          display: 'flex', alignItems: 'flex-start', gap: '6px',
        }}>
          <Truck size={14} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {deliveryFee === 0 ? (
                <strong style={{ color: 'var(--accent)' }}>Free Delivery</strong>
              ) : (
                <>Delivery fee: <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(deliveryFee)}</strong></>
              )}
            </span>
            {seller.freeDeliveryMin !== null && deliveryFee > 0 && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Free delivery on orders over {formatCurrency(seller.freeDeliveryMin)}
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Estimated delivery: {seller.estimatedDeliveryDays}
            </div>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '12px', textAlign: 'right', fontSize: '0.9rem',
        fontWeight: 700, color: 'var(--text-primary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          <Package size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
          Subtotal
        </span>
        <span>{formatCurrency(subtotal + (deliveryMethod === 'delivery' ? deliveryFee : 0))}</span>
      </div>
    </div>
  );
};
