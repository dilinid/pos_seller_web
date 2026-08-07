import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, Banknote, Star, AlertCircle } from 'lucide-react';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { OrderStatusBadge } from '../components/marketplace/OrderStatusBadge';
import { ProductImage } from '../components/ui/ProductImage';
import { formatCurrency } from '../utils/currency';
import type { OrderStatus } from '../types/marketplace.type';
import { ORDER_STATUS_META, ORDER_STATUS_VALUES } from '../data/order-status';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  ...ORDER_STATUS_VALUES.map((value) => ({ label: ORDER_STATUS_META[value].label, value })),
];

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  card: <CreditCard size={12} />,
  cod: <Banknote size={12} />,
};

const PAYMENT_LABELS: Record<string, string> = {
  card: 'Credit / Debit Card',
  cod: 'Cash on Delivery',
};

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const orders = useMarketplaceStore((s) => s.orders);
  const ordersLoading = useMarketplaceStore((s) => s.ordersLoading);
  const ordersError = useMarketplaceStore((s) => s.ordersError);
  const loadOrders = useMarketplaceStore((s) => s.loadOrders);
  const searchQuery = useMarketplaceStore((s) => s.searchQuery);
  const setSearchQuery = useMarketplaceStore((s) => s.setSearchQuery);
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

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

            {ordersError && (
              <div style={{
                margin: '0 20px 16px', padding: '10px 14px', borderRadius: '10px',
                background: '#fef2f2', border: '1px solid #fecaca',
                display: 'flex', alignItems: 'center', gap: '8px',
                fontSize: '0.82rem', color: '#dc2626',
              }}>
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>Couldn&apos;t load your latest orders ({ordersError}).</span>
              </div>
            )}

            {orderCount === 0 && ordersLoading ? (
              <div className="ords-empty" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading your orders…
              </div>
            ) : orderCount === 0 ? (
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
                  const latestItemStatus = order.items.reduce((latest, item) => {
                    const currentIdx = ORDER_STATUS_VALUES.indexOf(item.status);
                    const latestIdx = ORDER_STATUS_VALUES.indexOf(latest);
                    return currentIdx < latestIdx ? item.status : latest;
                  }, order.items[0]?.status ?? 'pending');

                  const needsPickup = order.items.some((i) => i.deliveryMethod === 'pickup' && i.status === 'delivered');
                  const actionType = needsPickup ? 'pickup' : null;

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

                        {order.items.some((i) => i.status === 'delivered') && (
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
                            borderRadius: '10px', overflow: 'hidden',
                            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                          }}>
                            <ProductImage image={order.items[0]?.productImage} alt={order.items[0]?.productName ?? 'Order item'} fill />
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                              {order.items.length} item{order.items.length > 1 ? 's' : ''}
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
                          {formatCurrency(order.grandTotal)}
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
