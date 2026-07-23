import { useState } from 'react';
import { Phone, Truck, Save } from 'lucide-react';

const CARRIERS = ['DHL', 'UPS', 'FedEx', 'USPS', 'SriLankan Post', 'Other'];

interface SellerTrackingFormProps {
  currentCarrier?: string;
  currentTracking?: string;
  currentPhone?: string;
  onApply: (carrier: string, trackingNumber: string, contactPhone?: string) => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem', fontWeight: 600, marginBottom: '4px', display: 'block',
  color: 'var(--text-secondary)',
};

const inputStyle: React.CSSProperties = {
  fontSize: '0.82rem', padding: '8px 10px', width: '100%', boxSizing: 'border-box',
};

export const SellerTrackingForm: React.FC<SellerTrackingFormProps> = ({
  currentCarrier, currentTracking, currentPhone, onApply,
}) => {
  const [carrier, setCarrier] = useState(currentCarrier ?? '');
  const [trackingNumber, setTrackingNumber] = useState(currentTracking ?? '');
  const [contactPhone, setContactPhone] = useState(currentPhone ?? '');
  const [saved, setSaved] = useState(false);

  const handleSubmit = () => {
    if (!carrier || !trackingNumber.trim()) return;
    onApply(carrier, trackingNumber.trim(), contactPhone.trim() || undefined);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" style={labelStyle}>Carrier</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="form-input"
              style={inputStyle}
            >
              <option value="">Select carrier</option>
              {CARRIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 2 }}>
            <label className="form-label" style={labelStyle}>Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="form-input"
              placeholder="e.g. 1Z999AA10123456784"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label className="form-label" style={labelStyle}>
            Contact Phone <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="form-input"
            placeholder="e.g. +94 77 123 4567"
            style={{ ...inputStyle, maxWidth: '300px' }}
          />
        </div>

        <button
          onClick={handleSubmit}
          className="btn btn-primary"
          disabled={!carrier || !trackingNumber.trim()}
          style={{
            padding: '9px 16px', fontSize: '0.82rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}
        >
          <Save size={14} />
          {saved ? 'Saved!' : 'Save Shipping Info'}
        </button>
      </div>

      {currentTracking && (
        <div style={{
          marginTop: '10px', padding: '8px 12px', background: '#f0fdf4',
          borderRadius: '8px', border: '1px solid #bbf7d0',
          fontSize: '0.78rem', color: '#16a34a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>
            <Truck size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            <strong>{currentCarrier}</strong>: {currentTracking}
            {currentPhone && (
              <span style={{ marginLeft: '12px' }}>
                <Phone size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                {currentPhone}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
