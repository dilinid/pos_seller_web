import { useState, useEffect } from 'react';
import { MapPin, Edit3, Check, X } from 'lucide-react';
import { useMarketplaceStore } from '../../stores/marketplace.store';
import { DISTRICTS } from '../../data/districts';
import { useAuthStore } from '../../stores/auth.store';

export const CheckoutDeliveryAddress: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const deliveryAddress = useMarketplaceStore((s) => s.deliveryAddress);
  const deliveryDistrict = useMarketplaceStore((s) => s.deliveryDistrict);
  const setDeliveryAddress = useMarketplaceStore((s) => s.setDeliveryAddress);
  const setDeliveryDistrict = useMarketplaceStore((s) => s.setDeliveryDistrict);

  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(deliveryAddress || user?.address || '');
  const [district, setDistrict] = useState(deliveryDistrict || 'dist-colombo');

  useEffect(() => {
    if (!deliveryAddress && user?.address) {
      setDeliveryAddress(user.address);
      setAddress(user.address);
    }
  }, [user, deliveryAddress, setDeliveryAddress]);

  const handleSave = () => {
    setDeliveryAddress(address);
    setDeliveryDistrict(district);
    setEditing(false);
  };

  const handleCancel = () => {
    setAddress(deliveryAddress || user?.address || '');
    setDistrict(deliveryDistrict || 'dist-colombo');
    setEditing(false);
  };

  return (
    <div className="premium-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={18} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Shipping Address</h3>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--primary)', fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            <Edit3 size={14} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Street Address</label>
            <textarea
              className="form-input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">District</label>
            <select
              className="form-input"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button onClick={handleCancel} className="btn btn-secondary" style={{ borderRadius: '20px', padding: '8px 18px', fontSize: '0.82rem' }}>
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary" style={{ borderRadius: '20px', padding: '8px 18px', fontSize: '0.82rem' }}>
              <Check size={14} /> Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
            {deliveryAddress || user?.address || 'No address set'}
          </p>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {DISTRICTS.find((d) => d.id === deliveryDistrict)?.name || 'Select district'}
          </p>
        </div>
      )}
    </div>
  );
};
