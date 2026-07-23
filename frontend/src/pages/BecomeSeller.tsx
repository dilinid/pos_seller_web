import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { useSellerStore } from '../stores/seller.store';
import { useAuthStore } from '../stores/auth.store';
import Navbar from '../components/Navbar';

const BecomeSeller: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const submitApplication = useSellerStore((s) => s.submitApplication);
  const isSeller = useSellerStore((s) => user ? s.isSeller(user.id) : false);
  const hasPending = useSellerStore((s) => user ? s.hasPendingApplication(user.id) : false);

  const [storeName, setStoreName] = useState(user?.name || '');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState(user?.phone || '');
  const [pickupAddress, setPickupAddress] = useState(user?.address || '');
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [estimatedDeliveryDays, setEstimatedDeliveryDays] = useState('1-2 days');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isSeller) navigate('/seller/dashboard', { replace: true });
  }, [isSeller, navigate]);

  if (hasPending) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div className="premium-card" style={{ maxWidth: '440px', padding: '36px', background: '#fff', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏳</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '8px' }}>
              Application Under Review
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Your seller application is being reviewed. You'll be notified once it's approved.
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.85rem' }}>
              Back to Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('Your profile is still loading. Please wait a moment and try again.');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    try {
      await submitApplication(user.id, user.email || '', {
        storeName,
        description,
        contactPhone,
        contactEmail: user.email || '',
        pickupAddress,
        deliveryAvailable,
        pickupAvailable,
        estimatedDeliveryDays,
        payoutMethod,
      });
      setApproved(true);
      setTimeout(() => navigate('/seller/dashboard', { replace: true }), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (approved) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
          <div className="premium-card" style={{ maxWidth: '440px', padding: '36px', background: '#fff', textAlign: 'center' }}>
            <CheckCircle size={48} color="var(--accent)" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', marginBottom: '8px' }}>
              You're Now a Seller!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '32px 24px 60px' }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px',
              padding: '4px 0', fontWeight: 500,
            }}
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div className="premium-card" style={{ padding: '32px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                background: '#1e293b', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff',
              }}>
                <Store size={22} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>
                  Become a Seller
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Set up your store and start selling
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="storeName">Store Name</label>
                <input
                  id="storeName"
                  type="text"
                  className="form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">Store Description</label>
                <textarea
                  id="description"
                  className="form-input"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={submitting}
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
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="payoutMethod">
                  Payout Method
                </label>
                <select
                  id="payoutMethod"
                  className="form-input"
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  disabled={submitting}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select how you'd like to receive payments</option>
                  <option value="direct_deposit">Direct Deposit / Bank Transfer</option>
                  <option value="check">Paper Check</option>
                </select>
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
                  disabled={submitting}
                  placeholder="Physical address for customer pickup"
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
                      disabled={submitting}
                    />
                    Offer Delivery
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={pickupAvailable}
                      onChange={(e) => setPickupAvailable(e.target.checked)}
                      disabled={submitting}
                    />
                    Offer Pickup
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '28px' }}>
                <label className="form-label" htmlFor="estDays">Estimated Delivery Days</label>
                <select
                  id="estDays"
                  className="form-input"
                  value={estimatedDeliveryDays}
                  onChange={(e) => setEstimatedDeliveryDays(e.target.value)}
                  disabled={submitting}
                  style={{ cursor: 'pointer' }}
                >
                  <option value="1 day">1 day</option>
                  <option value="1-2 days">1-2 days</option>
                  <option value="2-3 days">2-3 days</option>
                  <option value="3-5 days">3-5 days</option>
                  <option value="5-7 days">5-7 days</option>
                </select>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 14px', borderRadius: '8px',
                  background: '#fef2f2', color: '#dc2626',
                  fontSize: '0.82rem', marginBottom: '16px',
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ width: '100%', padding: '12px 20px', borderRadius: '24px' }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;
