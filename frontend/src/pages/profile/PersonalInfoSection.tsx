import { User, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import Select from '../../components/Select';
import type { District, DsDivision, GnDivision } from '../../types/profile.type';

interface PersonalInfoSectionProps {
  name: string;
  phone: string;
  email: string;
  address: string;
  gender: string;
  districtId: string;
  dsDivisionId: string;
  gnDivisionId: string;
  userDistrict?: { id: string | number } | null;
  userDsDivision?: { id: string | number } | null;
  userGnDivision?: { id: string | number } | null;
  districts: District[];
  dsDivisions: DsDivision[];
  gnDivisions: GnDivision[];
  loading: boolean;
  saveLoading: boolean;
  saveSuccess: boolean;
  onChange: (field: string, value: unknown) => void;
  onSave: (e: React.FormEvent) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  name, phone, email, address, gender,
  districtId, dsDivisionId, gnDivisionId,
  userDistrict, userDsDivision, userGnDivision,
  districts, dsDivisions, gnDivisions,
  loading, saveLoading, saveSuccess,
  onChange, onSave,
}) => {
  return (
    <div className="premium-card animate-fade-in" style={{ padding: '28px', background: '#fff' }}>
      <form onSubmit={onSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

        {/* Contact Information */}
        <div>
          <h4 style={{
            fontSize: '0.82rem', fontWeight: 700, margin: '0 0 14px',
            color: 'var(--text-secondary)', textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Contact Information
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="name">Full Legal Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--text-muted)" style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
                }} />
                <input
                  id="name" type="text" className="form-input"
                  value={name}
                  onChange={(e) => onChange('name', e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  required disabled
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="phone">Active Phone Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} color="var(--text-muted)" style={{
                    position: 'absolute', left: '14px', top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
                  }} />
                  <input
                    id="phone" type="tel" className="form-input"
                    value={phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    style={{ paddingLeft: '44px' }}
                    required disabled
                  />
                </div>
              </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
                }} />
                <input
                  id="email" type="email" className="form-input"
                  value={email}
                  onChange={(e) => onChange('email', e.target.value)}
                  style={{ paddingLeft: '44px' }}
                  disabled
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="gender">Gender</label>
              <Select
                id="gender"
                value={gender}
                disabled={loading || saveLoading}
                onChange={(e) => onChange('gender', e.target.value)}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="address">Delivery / Billing Address</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} color="var(--text-muted)" style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1,
                }} />
                <input
                  id="address" type="text" className="form-input"
                  value={address || ''}
                  onChange={(e) => onChange('address', e.target.value)}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div>
          <h4 style={{
            fontSize: '0.82rem', fontWeight: 700, margin: '0 0 14px',
            color: 'var(--text-secondary)', textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            Location Details
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="district">District</label>
            <Select
              id="district"
              value={districtId}
              disabled={!!userDistrict || loading || saveLoading}
              onChange={(e) => onChange('district', districts.find((d) => String(d.id) === String(e.target.value)))}
              options={[
                { value: '', label: 'Select District' },
                ...districts.map((d) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="divisionalSecretariat">
              Divisional Secretariat
              {!districtId && (
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                  {' '}(Select District First)
                </span>
              )}
            </label>
            <Select
              id="divisionalSecretariat"
              value={dsDivisionId}
              onChange={(e) => onChange('dsDivision', dsDivisions.find((d) => String(d.id) === String(e.target.value)))}
              disabled={!districtId || !!userDsDivision || loading || saveLoading}
              options={[
                { value: '', label: 'Select Divisional Secretariat' },
                ...dsDivisions.map((d) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="gramaNiladhari">
              Grama Niladhari Division
              {!dsDivisionId && (
                <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>
                  {' '}(Select Divisional Secretariat First)
                </span>
              )}
            </label>
            <Select
              id="gramaNiladhari"
              value={gnDivisionId}
              onChange={(e) => onChange('gnDivision', gnDivisions.find((d) => String(d.id) === String(e.target.value)))}
              disabled={!dsDivisionId || !!userGnDivision || loading || saveLoading}
              options={[
                { value: '', label: 'Select Grama Niladhari Division' },
                ...gnDivisions.map((d) => ({ value: String(d.id), label: d.name })),
              ]}
            />
          </div>
          </div>
        </div>

        {saveSuccess && (
          <div style={{
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: '0.85rem', padding: '10px 14px', borderRadius: '8px',
            textAlign: 'center', fontWeight: 600,
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            Profile registry updated successfully!
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saveLoading || loading}
          style={{
            padding: '12px 20px', borderRadius: '24px', width: '100%', fontSize: '0.9rem',
          }}
        >
          {saveLoading || loading ? (
            <>
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              {loading ? 'Loading...' : 'Saving Changes...'}
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};
