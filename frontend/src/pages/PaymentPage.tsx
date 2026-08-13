import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Banknote, CheckCircle2, Wallet, AlertCircle } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useAuthStore } from '../stores/auth.store';
import { useSellerStore } from '../stores/seller.store';
import { useCODStore } from '../stores/cod.store';
import { calculateDeliveryFee } from '../utils/delivery.utils';
import { formatCurrency } from '../utils/currency';
import { placeOrder } from '../apis/marketplace.api';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { CardDetailsForm } from '../components/marketplace/CardDetailsForm';
import { PaymentMethodCard } from '../components/marketplace/PaymentMethodCard';

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
  const setPaymentMethod = useMarketplaceStore((s) => s.setPaymentMethod);
  const removeCheckedItems = useMarketplaceStore((s) => s.removeCheckedItems);
  const setDirectBuyItem = useMarketplaceStore((s) => s.setDirectBuyItem);
  const addOrder = useMarketplaceStore((s) => s.addOrder);
  const orderNotes = useMarketplaceStore((s) => s.orderNotes);
  const resetCheckout = useMarketplaceStore((s) => s.resetCheckout);
  const selectedLocation = useMarketplaceStore((s) => s.selectedLocation);

  const codApproved = useCODStore((s) => s.request.status === 'approved');

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cardValid, setCardValid] = useState(false);

  useEffect(() => {
    if (paymentMethod === 'cod' && !codApproved) {
      setPaymentMethod('card');
    }
  }, [paymentMethod, codApproved, setPaymentMethod]);

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

  const handlePlaceOrder = () => {
    if (paymentMethod === 'card' && !cardValid) return;
    void executePayment();
  };

  const executePayment = async () => {
    if (placingOrder) return;
    if (!selectedLocation) {
      setPlaceOrderError('No store location available. Please try again.');
      return;
    }
    setPlacingOrder(true);
    setPlaceOrderError(null);

    let placed;
    try {
      placed = await placeOrder({
        items: checkedItems.map((item) => ({
          itemCode: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        deliveryMethod: deliveryOrPickupMethod,
        deliveryAddress: deliveryOrPickupMethod === 'delivery' ? deliveryAddress : undefined,
        deliveryFee: orderSummary.fee,
        paymentMethod,
        locationCode: selectedLocation.code,
      });
    } catch (err: any) {
      setPlacingOrder(false);
      setPlaceOrderError(err?.response?.data?.detail ?? err?.message ?? 'Failed to place order. Please try again.');
      return;
    }

    const user = useAuthStore.getState().user;
    // Use the real backend order number so this optimistic entry reconciles with
    // the row `loadOrders`/`loadOrder` will fetch from the server afterwards.
    const orderId = placed.ordNo;

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
      status: 'pending' as const,
    }));

    addOrder({
      id: orderId,
      createdAt: placed.createdAt,
      updatedAt: placed.createdAt,
      items,
      buyerName: user?.name ?? 'Unknown',
      buyerEmail: user?.email,
      buyerPhone: user?.phone,
      deliveryAddress,
      deliveryDistrict,
      orderNotes,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' as const : 'paid' as const,
      grandTotal,
      estimatedDelivery: '3-5 business days',
    });

    removeCheckedItems();
    setDirectBuyItem(null);
    setPlacingOrder(false);
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
              {paymentMethod === 'cod'
                ? 'Pay when you receive your order. No upfront payment needed.'
                : 'Your payment has been processed successfully.'}
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
                    {formatCurrency(grandTotal)}
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <PaymentMethodCard
                    icon={<CreditCard size={20} />}
                    title="Credit / Debit Card"
                    description="Pay securely with your credit or debit card. Your card will be processed immediately."
                    selected={paymentMethod === 'card'}
                    onSelect={() => setPaymentMethod('card')}
                  >
                    <CardDetailsForm onValidChange={setCardValid} />
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
                        <span>{formatCurrency(orderSummary.subtotal)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: orderSummary.fee === 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: orderSummary.fee === 0 ? 600 : 400 }}>
                        <span>Delivery</span>
                        <span>{orderSummary.fee === 0 ? 'Free' : formatCurrency(orderSummary.fee)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                        <span>Total</span>
                        <span>{formatCurrency(orderSummary.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--primary)',
                  }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Grand Total</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>

                  {/* Payment Method Summary */}
                  <div style={{
                    marginTop: '16px', padding: '12px', borderRadius: '10px',
                    background: 'var(--bg-secondary)', fontSize: '0.82rem',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    {paymentMethod === 'cod' ? <Banknote size={16} color="var(--primary)" /> : <CreditCard size={16} color="var(--primary)" />}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Paying via <strong style={{ color: 'var(--text-primary)' }}>
                        {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card'}
                      </strong>
                    </span>
                  </div>

                  {placeOrderError && (
                    <div style={{
                      marginTop: '14px', padding: '10px 12px', borderRadius: '10px',
                      background: '#fef2f2', border: '1px solid #fecaca',
                      display: 'flex', alignItems: 'flex-start', gap: '8px',
                      fontSize: '0.8rem', color: '#dc2626',
                    }}>
                      <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                      <span>{placeOrderError}</span>
                    </div>
                  )}

                  <button
                    onClick={handlePlaceOrder}
                    disabled={(paymentMethod === 'card' && !cardValid) || placingOrder || !selectedLocation}
                    className="btn btn-primary"
                    style={{
                      width: '100%', borderRadius: '24px', padding: '14px',
                      marginTop: '18px', fontSize: '1rem',
                      opacity: (paymentMethod === 'card' && !cardValid) || placingOrder || !selectedLocation ? 0.5 : 1,
                      cursor: (paymentMethod === 'card' && !cardValid) || placingOrder || !selectedLocation ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    {placingOrder ? 'Placing Order…' : `Pay Now — ${formatCurrency(grandTotal)}`}
                  </button>

                  <p style={{
                    fontSize: '0.72rem', color: 'var(--text-muted)',
                    textAlign: 'center', marginTop: '10px', lineHeight: 1.4,
                  }}>
                    {paymentMethod === 'cod' ? 'Pay when you receive your order.' : 'Your card will be charged securely.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentPage;
