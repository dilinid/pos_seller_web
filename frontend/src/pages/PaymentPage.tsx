import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, Banknote, CheckCircle2, Building2,
  Wallet, Landmark, Shield, X,
} from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useAuthStore } from '../stores/auth.store';
import { useSellerStore } from '../stores/seller.store';
import { usePaymentAccountStore } from '../stores/payment-account.store';
import { useCODStore } from '../stores/cod.store';
import { calculateDeliveryFee } from '../utils/delivery.utils';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { PaymentMethodCard } from '../components/marketplace/PaymentMethodCard';
import { OtpInput } from '../components/ui/OtpInput';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();

  const cart = useMarketplaceStore((s) => s.cart);
  const directBuyItem = useMarketplaceStore((s) => s.directBuyItem);
  const profile = useSellerStore((s) => s.profile);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);
  const deliveryDistrict = useMarketplaceStore((s) => s.deliveryDistrict);
  const deliveryMethod = useMarketplaceStore((s) => s.deliveryMethod);
  const deliveryAddress = useMarketplaceStore((s) => s.deliveryAddress);
  const paymentMethod = useMarketplaceStore((s) => s.paymentMethod);
  const selectedAccountId = useMarketplaceStore((s) => s.selectedAccountId);
  const setPaymentMethod = useMarketplaceStore((s) => s.setPaymentMethod);
  const setSelectedAccountId = useMarketplaceStore((s) => s.setSelectedAccountId);
  const removeCheckedItems = useMarketplaceStore((s) => s.removeCheckedItems);
  const setDirectBuyItem = useMarketplaceStore((s) => s.setDirectBuyItem);
  const addOrder = useMarketplaceStore((s) => s.addOrder);
  const orderNotes = useMarketplaceStore((s) => s.orderNotes);
  const resetCheckout = useMarketplaceStore((s) => s.resetCheckout);

  const codApproved = useCODStore((s) => s.request.status === 'approved');

  const [orderPlaced, setOrderPlaced] = useState(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendKey, setResendKey] = useState(0);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  const checkedItems = useMemo(() => {
    if (directBuyItem)
      return [{ product: directBuyItem.product, quantity: directBuyItem.quantity, checked: true as const }];
    return cart.filter((item) => item.checked);
  }, [cart, directBuyItem]);

  useEffect(() => {
    if (checkedItems.length === 0 && !orderPlaced) {
      navigate('/', { replace: true });
    }
  }, [checkedItems.length, navigate, orderPlaced]);

  const paymentAccounts = usePaymentAccountStore((s) => s.paymentAccounts);

  const deliveryOrPickupMethod = deliveryMethod ?? (profile.deliveryAvailable ? 'delivery' : 'pickup');

  const orderSummary = useMemo(() => {
    const subtotal = checkedItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const fee = calculateDeliveryFee(
      profile,
      deliveryOrPickupMethod === 'delivery' ? deliveryDistrict : null,
      checkedItems.map((i) => ({ productId: i.product.id, quantity: i.quantity, weight: i.product.weight, volume: i.product.volume })),
      subtotal,
    );
    return { subtotal, fee, total: subtotal + fee };
  }, [checkedItems, profile, deliveryOrPickupMethod, deliveryDistrict]);

  const grandTotal = orderSummary.total;
  const allItemsCount = useMemo(() => checkedItems.reduce((s, i) => s + i.quantity, 0), [checkedItems]);

  const selectedAccount = paymentAccounts.find((a) => a.id === selectedAccountId);

  const accountStatuses = useMemo(() =>
    paymentAccounts.map(acc => ({
      ...acc,
      sufficient: acc.balance >= grandTotal,
    })),
  [paymentAccounts, grandTotal]);

  const firstAffordable = useMemo(() =>
    accountStatuses.find((a) => a.sufficient),
  [accountStatuses]);

  useEffect(() => {
    if (accountStatuses.length > 0 && !selectedAccountId) {
      const target = firstAffordable || accountStatuses[0];
      setSelectedAccountId(target.id);
    }
  }, [accountStatuses, firstAffordable, selectedAccountId, setSelectedAccountId]);

  const selectedAccountSufficient = selectedAccount
    ? selectedAccount.balance >= grandTotal
    : false;

  function maskAccountNumber(num: string): string {
    if (num.length <= 4) return num;
    return `****${num.slice(-4)}`;
  }

  const handlePlaceOrder = () => {
    if (paymentMethod === 'bank' && !selectedAccountSufficient) return;
    if (paymentMethod === 'bank') {
      setShowOtpModal(true);
      return;
    }
    executePayment();
  };

  const handleOtpChange = (digits: string[]) => {
    setOtpDigits(digits);
    setOtpError('');
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    setShowOtpModal(false);
    setOtpDigits(Array(6).fill(''));
    executePayment();
  };

  const handleResendOtp = () => {
    setResendTimer(30);
    setOtpDigits(Array(6).fill(''));
    setOtpError('');
    setResendKey((k) => k + 1);
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const executePayment = () => {
    const user = useAuthStore.getState().user;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderId = `ORD-${dateStr}-${rand}`;

    const items = checkedItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.image,
      price: item.product.price,
      mrp: item.product.mrp,
      quantity: item.quantity,
      unit: item.product.unit,
      sellerId: profile.id,
      sellerName: profile.storeName || 'Our Store',
      deliveryMethod: deliveryOrPickupMethod,
      deliveryFee: orderSummary.fee,
      status: paymentMethod === 'payment_slip' ? 'pending' as const : 'confirmed' as const,
    }));

    const paymentStatus = paymentMethod === 'bank' || paymentMethod === 'card' ? 'paid' as const
      : paymentMethod === 'cod' ? 'pending' as const
      : 'awaiting_receipt' as const;

    addOrder({
      id: orderId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      items,
      buyerName: user?.name ?? 'Unknown',
      buyerEmail: user?.email,
      buyerPhone: user?.phone,
      deliveryAddress,
      deliveryDistrict,
      orderNotes,
      paymentMethod,
      paymentStatus,
      grandTotal,
      estimatedDelivery: '3-5 business days',
    });

    removeCheckedItems();
    setDirectBuyItem(null);
    setOrderPlaced(true);
    redirectTimer.current = setTimeout(() => {
      resetCheckout();
      navigate('/', { replace: true });
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center', animation: 'fadeInUp 0.5s ease-out', maxWidth: '480px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🎉</div>
            <CheckCircle2 size={48} color="var(--accent)" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>Order Placed!</h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '8px' }}>
              {paymentMethod === 'bank' && `We've debited ${selectedAccount?.accountName || 'your account'} for $${grandTotal.toFixed(2)}.`}
              {paymentMethod === 'card' && 'Your payment has been processed successfully.'}
              {paymentMethod === 'cod' && 'Pay when you receive your order. No upfront payment needed.'}
              {paymentMethod === 'payment_slip' && 'Upload your payment receipt in your orders section to complete payment.'}
            </p>
            <Link to="/orders" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', marginTop: '4px',
            }}>
              View Your Orders →
            </Link>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '8px' }}>Redirecting to marketplace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{ flex: 1, overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Wallet size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Payment Method</h2>
            </div>

            <div className="product-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Quick Order Recap */}
                <div className="premium-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0,
                  }}>
                    📦
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{allItemsCount} {allItemsCount === 1 ? 'item' : 'items'} from {profile.storeName || 'Our Store'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Deliver to: {deliveryAddress ? deliveryAddress.split(',')[0] : 'Address set in checkout'}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ${grandTotal.toFixed(2)}
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <PaymentMethodCard
                    icon={<Landmark size={20} />}
                    title="Account"
                    description={`Pay directly from your linked account.`}
                    selected={paymentMethod === 'bank'}
                    onSelect={() => setPaymentMethod('bank')}
                  >
                    {accountStatuses.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {accountStatuses.map((acc) => (
                          <div
                            key={acc.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (acc.sufficient) setSelectedAccountId(acc.id);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              cursor: acc.sufficient ? 'pointer' : 'not-allowed',
                              padding: '10px 12px', borderRadius: '10px',
                              background: selectedAccountId === acc.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                              border: selectedAccountId === acc.id ? '1px solid var(--primary)' : '1px solid transparent',
                              opacity: acc.sufficient ? 1 : 0.5,
                              transition: 'var(--transition-fast)',
                            }}
                          >
                            <span style={{
                              width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                              border: selectedAccountId === acc.id ? '4px solid var(--primary)' : '2px solid var(--border-color)',
                              transition: 'var(--transition-fast)',
                              opacity: acc.sufficient ? 1 : 0.4,
                            }} />
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '8px',
                              background: `${acc.creditUnionColor}18`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', flexShrink: 0,
                            }}>
                              {acc.creditUnionLogo}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: acc.sufficient ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {acc.nickname || acc.accountName}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {acc.creditUnionName} · {maskAccountNumber(acc.accountNumber)}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                {acc.sufficient ? (
                                  <span style={{ color: '#16a34a' }}>Funds Available ✓</span>
                                ) : (
                                  <span style={{ color: '#dc2626' }}>Insufficient Funds</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {selectedAccount && !selectedAccountSufficient && (
                          <div style={{
                            padding: '10px 12px', borderRadius: '8px', background: '#fef2f2',
                            fontSize: '0.82rem', color: '#dc2626', fontWeight: 500, textAlign: 'center',
                            border: '1px solid #fecaca',
                          }}>
                            Insufficient funds — select another payment method or adjust your order
                          </div>
                        )}
                        {selectedAccount && selectedAccountSufficient && (
                          <div style={{
                            padding: '10px 12px', borderRadius: '8px', background: 'var(--accent-light)',
                            fontSize: '0.82rem', color: 'var(--accent)', fontWeight: 600, textAlign: 'center',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          }}>
                            <Building2 size={14} />
                            {selectedAccount.creditUnionName} — ${grandTotal.toFixed(2)} will be debited
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center',
                        padding: '16px 8px', lineHeight: 1.5,
                      }}>
                        No payment accounts linked yet.{' '}
                        <Link to="/profile" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                          Add one in your profile
                        </Link>
                      </div>
                    )}
                  </PaymentMethodCard>

                  {codApproved && (
                    <PaymentMethodCard
                      icon={<Banknote size={20} />}
                      title="Cash on Delivery"
                      description="Pay in cash when your order arrives. No additional fees. Available for delivery orders."
                      selected={paymentMethod === 'cod'}
                      onSelect={() => setPaymentMethod('cod')}
                    />
                  )}

                  <PaymentMethodCard
                    icon={<CreditCard size={20} />}
                    title="Credit / Debit Card"
                    description="Pay securely with your credit or debit card. Your card will be processed immediately."
                    selected={paymentMethod === 'card'}
                    onSelect={() => setPaymentMethod('card')}
                  >
                    <div style={{
                      padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)',
                      fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5,
                    }}>
                      <strong style={{ color: 'var(--text-primary)' }}>How it works:</strong><br />
                      1. Place your order<br />
                      2. You will be redirected to a secure payment page<br />
                      3. Enter your card details to complete the transaction<br />
                      4. Your order will be processed immediately
                    </div>
                  </PaymentMethodCard>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ position: 'sticky', top: '90px' }}>
                <div className="premium-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '18px' }}>Order Summary</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      paddingBottom: '10px',
                      borderBottom: '1px solid var(--border-color)',
                    }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {profile.storeName || 'Our Store'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        <span>Subtotal</span>
                        <span>${orderSummary.subtotal.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: orderSummary.fee === 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: orderSummary.fee === 0 ? 600 : 400 }}>
                        <span>Delivery</span>
                        <span>{orderSummary.fee === 0 ? 'Free' : `$${orderSummary.fee.toFixed(2)}`}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                        <span>Total</span>
                        <span>${orderSummary.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--primary)',
                  }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Grand Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Payment Method Summary */}
                  <div style={{
                    marginTop: '16px', padding: '12px', borderRadius: '10px',
                    background: 'var(--bg-secondary)', fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    {paymentMethod === 'bank' && <CreditCard size={16} color="var(--primary)" />}
                    {paymentMethod === 'card' && <CreditCard size={16} color="var(--primary)" />}
                    {paymentMethod === 'cod' && <Banknote size={16} color="var(--primary)" />}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Paying via <strong style={{ color: 'var(--text-primary)' }}>
                        {paymentMethod === 'bank' ? (selectedAccount?.accountName || 'Account') :
                         paymentMethod === 'card' ? 'Credit / Debit Card' :
                         paymentMethod === 'cod' ? 'Cash on Delivery' :
                         'Payment Slip'}
                      </strong>
                    </span>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    className="btn btn-primary"
                    style={{
                      width: '100%', borderRadius: '24px', padding: '14px',
                      marginTop: '18px', fontSize: '1rem',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    Pay Now — ${grandTotal.toFixed(2)}
                  </button>

                  <p style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    textAlign: 'center', marginTop: '10px', lineHeight: 1.4,
                  }}>
                    {paymentMethod === 'bank' && 'The amount will be debited from your selected account.'}
                    {paymentMethod === 'card' && 'Your card will be charged securely.'}
                    {paymentMethod === 'cod' && 'Pay when you receive your order.'}
                    {paymentMethod === 'payment_slip' && 'Upload your receipt after placing the order.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          </main>

          {/* OTP Verification Modal */}
          {showOtpModal && (
            <div
              onClick={() => { setShowOtpModal(false); setOtpError(''); }}
              style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px',
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: '#fff', borderRadius: '20px',
                  width: '100%', maxWidth: '400px',
                  boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                  animation: 'fadeIn 0.2s ease-out',
                  textAlign: 'center',
                  padding: '40px 32px 32px',
                }}
              >
                <button
                  onClick={() => { setShowOtpModal(false); setOtpError(''); }}
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px',
                  }}
                >
                  <X size={20} />
                </button>

                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: '#eef2ff', color: '#4f46e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Shield size={32} />
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px', color: '#1e293b' }}>
                  Authentication Required
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 24px', lineHeight: 1.5 }}>
                  Enter the 6-digit code sent to your registered mobile number
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <OtpInput
                    key={resendKey}
                    digits={otpDigits}
                    onChange={handleOtpChange}
                    error={!!otpError}
                  />
                </div>

                {otpError && (
                  <p style={{ fontSize: '0.78rem', color: '#dc2626', margin: '0 0 16px' }}>{otpError}</p>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={otpDigits.join('').length !== 6}
                  className="btn btn-primary"
                  style={{
                    width: '100%', padding: '13px', borderRadius: '12px',
                    fontSize: '0.9rem', fontWeight: 700,
                  }}
                >
                  <Shield size={18} />
                  Verify & Pay — ${grandTotal.toFixed(2)}
                </button>

                <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#64748b' }}>
                  {resendTimer > 0 ? (
                    <span>Resend code in <strong>{resendTimer}s</strong></span>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem',
                        fontFamily: 'var(--font-sans)',
                      }}
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <div style={{
                  marginTop: '20px', paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '0.7rem', color: '#94a3b8',
                }}>
                  Protected by 3D Secure • Secured by your bank
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PaymentPage;
