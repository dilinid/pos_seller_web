import { useState, useEffect } from 'react';
import { CreditCard, User, Calendar, Lock } from 'lucide-react';

interface CardDetailsFormProps {
  onValidChange: (valid: boolean) => void;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isExpiryValid(expiry: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = 2000 + parseInt(match[2], 10);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  return true;
}

const iconStyle: React.CSSProperties = {
  position: 'absolute', left: '14px', top: '50%',
  transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
};

export const CardDetailsForm: React.FC<CardDetailsFormProps> = ({ onValidChange }) => {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    name: name.trim().length === 0 ? 'Cardholder name is required' : '',
    number: number.replace(/\s/g, '').length !== 16 ? 'Enter a valid 16-digit card number' : '',
    expiry: !isExpiryValid(expiry) ? 'Enter a valid expiry date (MM/YY)' : '',
    cvv: !/^\d{3,4}$/.test(cvv) ? 'Enter a valid CVV' : '',
  };

  const isValid = !errors.name && !errors.number && !errors.expiry && !errors.cvv;

  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" htmlFor="card-name">Cardholder Name</label>
        <div style={{ position: 'relative' }}>
          <User size={16} color="var(--text-muted)" style={iconStyle} />
          <input
            id="card-name" type="text" className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched('name')}
            placeholder="Name on card"
            style={{ paddingLeft: '44px' }}
          />
        </div>
        {touched.name && errors.name && (
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>{errors.name}</div>
        )}
      </div>

      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label" htmlFor="card-number">Card Number</label>
        <div style={{ position: 'relative' }}>
          <CreditCard size={16} color="var(--text-muted)" style={iconStyle} />
          <input
            id="card-number" type="text" inputMode="numeric" className="form-input"
            value={number}
            onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            onBlur={() => markTouched('number')}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            style={{ paddingLeft: '44px' }}
          />
        </div>
        {touched.number && errors.number && (
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>{errors.number}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '14px' }}>
        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <label className="form-label" htmlFor="card-expiry">Expiry</label>
          <div style={{ position: 'relative' }}>
            <Calendar size={16} color="var(--text-muted)" style={iconStyle} />
            <input
              id="card-expiry" type="text" inputMode="numeric" className="form-input"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              onBlur={() => markTouched('expiry')}
              placeholder="MM/YY"
              maxLength={5}
              style={{ paddingLeft: '44px' }}
            />
          </div>
          {touched.expiry && errors.expiry && (
            <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>{errors.expiry}</div>
          )}
        </div>

        <div className="form-group" style={{ margin: 0, flex: 1 }}>
          <label className="form-label" htmlFor="card-cvv">CVV</label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} color="var(--text-muted)" style={iconStyle} />
            <input
              id="card-cvv" type="password" inputMode="numeric" className="form-input"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onBlur={() => markTouched('cvv')}
              placeholder="123"
              maxLength={4}
              style={{ paddingLeft: '44px' }}
            />
          </div>
          {touched.cvv && errors.cvv && (
            <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>{errors.cvv}</div>
          )}
        </div>
      </div>
    </div>
  );
};
