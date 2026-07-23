import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Clock, CreditCard, Banknote, Receipt, Star } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useAuthStore } from '../stores/auth.store';
import { OrderStatusBadge } from '../components/marketplace/OrderStatusBadge';
import type { OrderStatus } from '../types/marketplace.type';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  bank: <CreditCard size={12} />,
  card: <CreditCard size={12} />,
  cod: <Banknote size={12} />,
  payment_slip: <Receipt size={12} />,
};

const PAYMENT_LABELS: Record<string, string> = {
  bank: 'Bank Transfer',
  card: 'Credit / Debit Card',
  cod: 'Cash on Delivery',
  payment_slip: 'Payment Slip',
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const orders = useMarketplaceStore((s) => s.orders);
  const sellers = useMarketplaceStore((s) => s.sellers);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);
  const seedBuyerOrders = useMarketplaceStore((s) => s.seedBuyerOrders);
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (user?.name) seedBuyerOrders(user.name);
  }, [seedBuyerOrders, user?.name]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (activeTab !== 'all') {
      list = list.filter((o) => {
        const itemStatuses = o.items.map((i) => i.status);
        if (activeTab === 'cancelled') return itemStatuses.every((s) => s === 'cancelled');
        return itemStatuses.some((s) => s === activeTab);
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, activeTab]);

  const orderCount = filteredOrders.length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{ flex: 1, overflowX: 'hidden', padding: '0' }}>
          <div className="page-container" style={{ padding: '0' }}>
            <div className="ords-header">
              <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={22} color="var(--primary)" /> Your Orders
              </h1>

              <div style={{
                display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px',
                WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
              }}>
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    style={{
                      padding: '6px 14px', borderRadius: '20px', border: 'none',
                      fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
                      cursor: 'pointer', transition: 'var(--transition-fast)',
                      background: activeTab === tab.value ? 'var(--primary)' : 'var(--bg-tertiary)',
                      color: activeTab === tab.value ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {orderCount === 0 ? (
              <div className="ords-empty" style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <ShoppingBag size={28} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  No orders yet
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {activeTab === 'all' ? 'Start shopping to see your orders here.' : `No orders with "${activeTab}" status.`}
                </p>
                {activeTab === 'all' && (
                  <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary"
                    style={{ padding: '10px 24px', borderRadius: '24px', fontSize: '0.85rem' }}
                  >
                    Browse Marketplace
                  </button>
                )}
              </div>
            ) : (
              <div className="ords-card-list" style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredOrders.map((order) => {
                  const sellerIds = Array.from(new Set(order.items.map((i) => i.sellerId)));
                  const orderSellers = sellerIds
                    .map((id) => sellers.find((s) => s.id === id))
                    .filter(Boolean);

                  const latestItemStatus = order.items.reduce((latest, item) => {
                    const stepOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
                    const currentIdx = stepOrder.indexOf(item.status);
                    const latestIdx = stepOrder.indexOf(latest);
                    return currentIdx < latestIdx || latest === '' ? item.status : latest;
                  }, order.items[0]?.status ?? 'pending');

                  const needsPaymentSlip = order.paymentMethod === 'payment_slip' && order.paymentStatus === 'awaiting_receipt';
                  const needsPickup = order.items.some((i) => i.deliveryMethod === 'pickup' && i.status === 'delivered');
                  const actionType = needsPaymentSlip ? 'payment_slip' : needsPickup ? 'pickup' : null;

                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="premium-card-hover"
                      style={{
                        background: '#fff', borderRadius: '12px', padding: '0',
                        cursor: 'pointer', transition: 'var(--transition-fast)',
                        border: '1px solid var(--border-color)', overflow: 'hidden',
                      }}
                    >
                      <div className="ords-card-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {order.id}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </div>
                          </div>
                          <OrderStatusBadge status={latestItemStatus} />
                        </div>

                        {actionType === 'payment_slip' && (
                          <div style={{
                            padding: '8px 12px', borderRadius: '8px', marginBottom: '10px',
                            background: '#fffbeb', border: '1px solid #fde68a',
                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600,
                            color: '#92400e',
                          }}>
                            <span style={{ fontSize: '0.85rem' }}>📄</span>
                            Upload payment receipt
                          </div>
                        )}

                        {actionType === 'pickup' && (
                          <div style={{
                            padding: '8px 12px', borderRadius: '8px', marginBottom: '10px',
                            background: 'var(--primary-light)', border: '1px solid rgba(0,96,229,0.15)',
                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600,
                            color: 'var(--primary)',
                          }}>
                            <span style={{ fontSize: '0.85rem' }}>📍</span>
                            Ready for pickup
                          </div>
                        )}

                        {order.items.some((i) => i.status === 'delivered' || i.status === 'completed') && (
                          <div style={{
                            padding: '8px 12px', borderRadius: '8px', marginBottom: '10px',
                            background: '#f0fdf4', border: '1px solid #86efac',
                            display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600,
                            color: '#166534',
                          }}>
                            <Star size={14} fill="#166534" />
                            Write a Review
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="ords-thumb" style={{
                            borderRadius: '10px',
                            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                          }}>
                            {order.items[0]?.productImage || '📦'}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
                              {orderSellers.length > 0 && (
                                <> from <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                  {orderSellers.length <= 2
                                    ? orderSellers.map((s) => s!.name).join(', ')
                                    : `${orderSellers[0]!.name} +${orderSellers.length - 1} more`}
                                </span></>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="ords-card-footer" style={{
                        borderTop: '1px solid var(--border-color)',
                        background: '#fff',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: '0.75rem', color: 'var(--text-muted)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                          <span>·</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            {PAYMENT_ICONS[order.paymentMethod]}
                            {PAYMENT_LABELS[order.paymentMethod]}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          ${order.grandTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrdersPage;
