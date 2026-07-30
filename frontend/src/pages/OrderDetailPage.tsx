import { useMemo, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, MapPin, CreditCard } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useAuthStore } from '../stores/auth.store';
import { PaymentStatusBadge } from '../components/marketplace/OrderStatusBadge';
import { OrderSellerGroup } from '../components/marketplace/OrderSellerGroup';
import { PaymentSlipUpload } from '../components/marketplace/PaymentSlipUpload';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import type { UserReview, OrderItem } from '../types/marketplace.type';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const orders = useMarketplaceStore((s) => s.orders);
  const sellers = useMarketplaceStore((s) => s.sellers);
  const allReviews = useMarketplaceStore((s) => s.allReviews);
  const reviewPeriods = useMarketplaceStore((s) => s.reviewPeriods);
  const submitReview = useMarketplaceStore((s) => s.submitReview);
  const startReviewPeriod = useMarketplaceStore((s) => s.startReviewPeriod);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);
  const user = useAuthStore((s) => s.user);

  const userId = user?.id ?? 'unknown';
  const userName = user?.name ?? 'You';

  const order = useMemo(() => orders.find((o) => o.id === orderId), [orders, orderId]);

  const orderReviews = useMemo(
    () => allReviews.filter((r) => r.orderId === orderId),
    [allReviews, orderId],
  );

  const reviewMap = useMemo(
    () => new Map(orderReviews.map((r) => [r.targetId, r])),
    [orderReviews],
  );

  const sellerGroups = useMemo(() => {
    if (!order) return [];
    const map = new Map<string, OrderItem[]>();
    for (const item of order.items) {
      const existing = map.get(item.sellerId);
      if (existing) existing.push(item);
      else map.set(item.sellerId, [item]);
    }
    return Array.from(map.entries()).map(([sellerId, items]) => ({
      sellerId,
      items,
      seller: sellers.find((s) => s.id === sellerId)!,
    }));
  }, [order, sellers]);

  useEffect(() => {
    if (!order) return;
    const DELIVERED_STATUSES = new Set(['delivered', 'completed']);
    for (const { sellerId, items } of sellerGroups) {
      const allDelivered = items.every((i) => DELIVERED_STATUSES.has(i.status));
      const alreadyStarted = reviewPeriods.some(
        (rp) => rp.orderId === order.id && rp.sellerId === sellerId
      );
      if (allDelivered && !alreadyStarted) {
        startReviewPeriod(order.id, sellerId, userId);
      }
    }
  }, [order, sellerGroups, reviewPeriods, startReviewPeriod, userId]);

  const handleReviewSubmit = (review: UserReview) => {
    submitReview(review);
  };

  const handleSellerReviewSubmit = (review: UserReview) => {
    submitReview(review);
  };

  const handleStartReviewPeriod = (sellerId: string) => {
    if (order) {
      startReviewPeriod(order.id, sellerId, userId);
    }
  };

  const handleSlipUpload = (file: File) => {
    console.log(`[PaymentSlipUpload] Order ${orderId}:`, file.name);
  };

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🔍</div>
            <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>Order not found</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              The order you're looking for doesn't exist.
            </p>
            <Link to="/orders" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem' }}>
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const itemTotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryTotal = order.items.reduce((s, i) => s + i.deliveryFee, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{ flex: 1, overflowX: 'hidden', padding: '0' }}>
          <div className="page-container" style={{ padding: '0' }}>
            <div className="od-header">
              <button
                onClick={() => navigate('/orders')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px',
                  padding: '4px 0', fontWeight: 500,
                }}
              >
                <ArrowLeft size={16} /> Back to Orders
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <h1 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingBag size={20} color="var(--primary)" /> {order.id}
                  </h1>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </div>

            {order.paymentMethod === 'payment_slip' && order.paymentStatus === 'awaiting_receipt' && (
              <div className="od-banner" style={{ marginBottom: '16px' }}>
                <div style={{
                  padding: '12px 16px', borderRadius: '10px',
                  background: '#fffbeb', border: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', gap: '10px',
                  fontSize: '0.82rem', color: '#92400e', fontWeight: 500,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>📄</span>
                  <div>
                    <strong>Payment receipt required</strong> — Upload your payment receipt to complete this order.
                  </div>
                </div>
              </div>
            )}

            <div className="od-grid">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sellerGroups.map(({ sellerId, items, seller }) => (
                  seller ? (
                    <OrderSellerGroup
                      key={sellerId}
                      seller={seller}
                      items={items}
                      orderId={order.id}
                      existingReviews={reviewMap}
                      onReviewSubmit={handleReviewSubmit}
                      reviewPeriod={reviewPeriods.find((rp) => rp.orderId === order.id && rp.sellerId === sellerId)}
                      userId={userId}
                      userName={userName}
                      onSellerReviewSubmit={handleSellerReviewSubmit}
                      onStartReviewPeriod={handleStartReviewPeriod}
                    />
                  ) : null
                ))}
              </div>

              <div className="od-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="premium-card" style={{ padding: '16px', background: '#fff' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Delivery Address</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <MapPin size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div style={{ lineHeight: 1.5 }}>
                      {order.deliveryAddress || 'No address provided'}
                      {order.deliveryDistrict && <div style={{ fontWeight: 600, marginTop: '2px' }}>{order.deliveryDistrict}</div>}
                    </div>
                  </div>
                </div>

                <div className="premium-card" style={{ padding: '16px', background: '#fff' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Payment</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <CreditCard size={15} />
                    <span>
                      {order.paymentMethod === 'bank' ? 'Bank Transfer'
                        : order.paymentMethod === 'card' ? 'Credit / Debit Card'
                        : order.paymentMethod === 'cod' ? 'Cash on Delivery'
                        : 'Payment Slip'}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px' }}>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </div>
                </div>

                <div className="premium-card" style={{ padding: '16px', background: '#fff' }}>
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Order Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Item total</span>
                      <span style={{ fontWeight: 600 }}>${itemTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Delivery total</span>
                      <span style={{ fontWeight: 600 }}>${deliveryTotal.toFixed(2)}</span>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700 }}>Total</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1rem' }}>
                        ${order.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {order.orderNotes && (
                  <div className="premium-card" style={{ padding: '16px', background: '#fff' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Order Notes</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>{order.orderNotes}</p>
                  </div>
                )}

                {order.paymentMethod === 'payment_slip' && (
                  <div className="premium-card" style={{ padding: '16px', background: '#fff' }}>
                    <PaymentSlipUpload
                      orderId={order.id}
                      currentStatus={order.paymentStatus}
                      onUpload={handleSlipUpload}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrderDetailPage;
