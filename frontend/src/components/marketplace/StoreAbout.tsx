import { Truck, MapPin, Clock, Package } from 'lucide-react';
import type { Seller } from '../../types/marketplace.type';

interface StoreAboutProps {
  seller: Seller;
}

export const StoreAbout: React.FC<StoreAboutProps> = ({ seller }) => {
  return (
    <div className="premium-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        About {seller.name}
      </h3>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
        {seller.description}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Package size={16} color="var(--text-muted)" />
          <span><strong style={{ color: 'var(--text-primary)' }}>{seller.totalSales.toLocaleString()}</strong> total sales</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Clock size={16} color="var(--text-muted)" />
          <span>Response time: <strong style={{ color: 'var(--text-primary)' }}>{seller.responseTime}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <MapPin size={16} color="var(--text-muted)" />
          <span>Member since <strong style={{ color: 'var(--text-primary)' }}>{seller.memberSince}</strong></span>
        </div>
        {seller.deliveryAvailable && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <Truck size={16} color="var(--text-muted)" />
            <span>Delivery available · Estimated {seller.estimatedDeliveryDays}</span>
          </div>
        )}
        {seller.pickupAvailable && seller.pickupAddress && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <MapPin size={16} color="var(--text-muted)" />
            <span>Pickup available at <strong style={{ color: 'var(--text-primary)' }}>{seller.pickupAddress}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
};
