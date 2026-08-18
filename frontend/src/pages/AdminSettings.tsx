import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Lock } from 'lucide-react';
import { useStoreStore } from '../stores/store.store';
import { DistrictFeeTable } from '../components/admin/DistrictFeeTable';
import { FeeBracketEditor } from '../components/admin/FeeBracketEditor';
import type { FeeBracket } from '../types/store.type';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const profile = useStoreStore((s) => s.profile);
  const updateProfile = useStoreStore((s) => s.updateProfile);

  const [description, setDescription] = useState('');
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
    setDescription(profile.description);
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
      description,
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
        onClick={() => navigate('/admin/dashboard')}
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

        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px',
          }}>
            <Lock size={12} /> Managed in POS setup — read-only here
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            padding: '14px 16px', borderRadius: '10px', background: 'var(--bg-secondary)',
          }}>
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt={profile.storeName}
                style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
              />
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700 }}>{profile.storeName || '—'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{profile.pickupAddress || '—'}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{profile.contactPhone || '—'}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave}>
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

export default AdminSettings;
