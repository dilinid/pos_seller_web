import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { useSellerStore } from '../stores/seller.store';
import { DistrictFeeTable } from '../components/seller/DistrictFeeTable';
import { FeeBracketEditor } from '../components/seller/FeeBracketEditor';
import type { FeeBracket } from '../types/seller.type';

const SellerSettings: React.FC = () => {
  const navigate = useNavigate();
  const profile = useSellerStore((s) => s.profile);
  const updateProfile = useSellerStore((s) => s.updateProfile);

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('1-2 days');
  const [districtFees, setDistrictFees] = useState<Record<string, number>>({});
  const [freeDeliveryMin, setFreeDeliveryMin] = useState('');
  const [weightFeeBrackets, setWeightFeeBrackets] = useState<FeeBracket[]>([]);
  const [volumeFeeBrackets, setVolumeFeeBrackets] = useState<FeeBracket[]>([]);
  const [quantityFeeBrackets, setQuantityFeeBrackets] = useState<FeeBracket[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStoreName(profile.storeName);
    setDescription(profile.description);
    setContactPhone(profile.contactPhone);
    setPickupAddress(profile.pickupAddress);
    setDeliveryAvailable(profile.deliveryAvailable);
    setPickupAvailable(profile.pickupAvailable);
    setEstimatedDeliveryDays(profile.estimatedDeliveryDays);
    setDistrictFees(profile.districtFees ?? {});
    setFreeDeliveryMin(profile.freeDeliveryMin != null ? String(profile.freeDeliveryMin) : '');
    setWeightFeeBrackets(profile.weightFeeBrackets ?? []);
    setVolumeFeeBrackets(profile.volumeFeeBrackets ?? []);
    setQuantityFeeBrackets(profile.quantityFeeBrackets ?? []);
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      storeName,
      description,
      contactPhone,
      pickupAddress,
      deliveryAvailable,
      pickupAvailable,
      estimatedDeliveryDays,
      districtFees,
      freeDeliveryMin: freeDeliveryMin ? parseFloat(freeDeliveryMin) : null,
      weightFeeBrackets,
      volumeFeeBrackets,
      quantityFeeBrackets,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/seller/dashboard')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px',
          padding: '4px 0', fontWeight: 500,
        }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="premium-card" style={{ padding: '28px', background: '#fff' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px' }}>
          Store Settings
        </h2>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label" htmlFor="storeName">Store Name</label>
            <input
              id="storeName"
              type="text"
              className="form-input"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical', minHeight: '60px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contactPhone">Contact Phone</label>
            <input
              id="contactPhone"
              type="text"
              className="form-input"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="pickupAddress">Pickup Address</label>
            <input
              id="pickupAddress"
              type="text"
              className="form-input"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Options</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={deliveryAvailable}
                  onChange={(e) => setDeliveryAvailable(e.target.checked)}
                />
                Offer Delivery
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={pickupAvailable}
                  onChange={(e) => setPickupAvailable(e.target.checked)}
                />
                Offer Pickup
              </label>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="estDays">Estimated Delivery Days</label>
            <select
              id="estDays"
              className="form-input"
              value={estimatedDeliveryDays}
              onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="1 day">1 day</option>
              <option value="1-2 days">1-2 days</option>
              <option value="2-3 days">2-3 days</option>
              <option value="3-5 days">3-5 days</option>
              <option value="5-7 days">5-7 days</option>
            </select>
          </div>

          {/* Delivery Settings */}
          <div style={{ marginTop: '28px', marginBottom: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🚚</span> Delivery Settings
            </h3>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Free Delivery Minimum (Rs.)</label>
              <input
                type="number" step="0.01" min="0" className="form-input"
                value={freeDeliveryMin}
                onChange={(e) => setFreeDeliveryMin(e.target.value)}
                placeholder="e.g. 25.00 (leave empty for no free delivery)"
              />
            </div>

            {deliveryAvailable && (
              <div style={{ marginTop: '16px' }}>
                <label className="form-label" style={{ marginBottom: '10px' }}>District Delivery Fees</label>
                <DistrictFeeTable districtFees={districtFees} onChange={setDistrictFees} />
              </div>
            )}

            <FeeBracketEditor
              title="Weight Brackets"
              unit="kg"
              brackets={weightFeeBrackets}
              onChange={setWeightFeeBrackets}
            />

            <FeeBracketEditor
              title="Volume Brackets"
              unit="m³"
              brackets={volumeFeeBrackets}
              onChange={setVolumeFeeBrackets}
            />

            <FeeBracketEditor
              title="Quantity Brackets"
              unit="units"
              brackets={quantityFeeBrackets}
              onChange={setQuantityFeeBrackets}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              padding: '10px 24px', borderRadius: '24px', fontSize: '0.85rem',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Save size={15} />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerSettings;
