import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClipboardList, Search, Clock, CheckCircle, Truck, XCircle, Package, Store } from 'lucide-react';
import type { Order, OrderStatus } from '../types/marketplace.type';
import { useAuthStore } from '../stores/auth.store';
import { useSellerStore } from '../stores/seller.store';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { SellerOrderCard } from '../components/seller/SellerOrderCard';
import { SellerOrderDrawer } from '../components/seller/SellerOrderDrawer';

function getSellerStatus(order: Order, sellerId: string): OrderStatus {
  const items = order.items.filter((i) => i.sellerId === sellerId);
  if (items.length === 0) return 'pending';
  if (items.every((i) => i.status === 'cancelled')) return 'cancelled';
  if (items.every((i) => i.status === 'delivered' || i.status === 'completed')) return 'delivered';
  if (items.every((i) => i.status === 'shipped')) return 'shipped';
  if (items.every((i) => i.status === 'processing')) return 'processing';
  if (items.every((i) => i.status === 'confirmed')) return 'confirmed';
  if (items.some((i) => i.status === 'shipped')) return 'shipped';
  if (items.some((i) => i.status === 'processing')) return 'processing';
  if (items.some((i) => i.status === 'confirmed')) return 'confirmed';
  return 'pending';
}

const DELIVERY_TABS: Array<{ key: string; label: string; icon: typeof Clock }> = [
  { key: 'all', label: 'All', icon: ClipboardList },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const PICKUP_TABS: Array<{ key: string; label: string; icon: typeof Clock }> = [
  { key: 'all', label: 'All', icon: ClipboardList },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Ready', icon: Store },
  { key: 'delivered', label: 'Picked Up', icon: CheckCircle },
  { key: 'cancelled', label: 'Cancelled', icon: XCircle },
];

const SellerOrders: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const profile = useSellerStore((s) => s.profile);
  const orders = useMarketplaceStore((s) => s.orders);
  const seedSellerOrders = useMarketplaceStore((s) => s.seedSellerOrders);
  const sellerUpdateItemStatus = useMarketplaceStore((s) => s.sellerUpdateItemStatus);
  const sellerUpdateNote = useMarketplaceStore((s) => s.sellerUpdateNote);
  const allReviews = useMarketplaceStore((s) => s.allReviews);
  const reviewPeriods = useMarketplaceStore((s) => s.reviewPeriods);
  const startReviewPeriod = useMarketplaceStore((s) => s.startReviewPeriod);
  const submitReview = useMarketplaceStore((s) => s.submitReview);

  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const sellerId = profile.id;

  useEffect(() => {
    seedSellerOrders(sellerId);
  }, [seedSellerOrders, sellerId]);

  const statusTabs = method === 'pickup' ? PICKUP_TABS : DELIVERY_TABS;

  const sellerOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items.some((i) => i.sellerId === sellerId && i.deliveryMethod === method)
    );
  }, [orders, sellerId, method]);

  const filteredOrders = useMemo(() => {
    let result = sellerOrders;
    if (activeTab !== 'all') {
      result = result.filter((o) => getSellerStatus(o, sellerId) === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [sellerOrders, activeTab, searchQuery, sellerId]);

  const stats = useMemo(() => {
    const s = { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, total: sellerOrders.length };
    for (const o of sellerOrders) {
      const st = getSellerStatus(o, sellerId);
      if (st in s) s[st as keyof typeof s]++;
    }
    return s;
  }, [sellerOrders, sellerId]);

  const handleMethodChange = (m: 'delivery' | 'pickup') => {
    setMethod(m);
    setActiveTab('all');
  };

  const handleUpdateItemStatus = useCallback(
    (orderId: string, productId: string, status: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string }) => {
      sellerUpdateItemStatus(orderId, productId, status, tracking);
      if (status === 'delivered') {
        const order = orders.find((o) => o.id === orderId);
        if (order && !reviewPeriods.some((rp) => rp.orderId === orderId && rp.sellerId === sellerId)) {
          startReviewPeriod(orderId, sellerId, order.buyerName);
        }
      }
    },
    [sellerUpdateItemStatus, orders, reviewPeriods, sellerId, startReviewPeriod]
  );

  const handleUpdateNote = useCallback(
    (orderId: string, productId: string, note: string) => {
      sellerUpdateNote(orderId, productId, note);
    },
    [sellerUpdateNote]
  );

  const statCards = useMemo(() => {
    const isDelivery = method === 'delivery';
    return [
      { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fffbeb' },
      { label: 'Confirmed', value: stats.confirmed, color: '#3b82f6', bg: '#eff6ff' },
      { label: 'Processing', value: stats.processing, color: '#8b5cf6', bg: '#f5f3ff' },
      { label: isDelivery ? 'Shipped' : 'Ready', value: stats.shipped, color: '#06b6d4', bg: '#ecfeff' },
      { label: isDelivery ? 'Delivered' : 'Picked Up', value: stats.delivered ?? 0, color: '#10b981', bg: '#ecfdf5' },
      { label: 'Total', value: stats.total, color: 'var(--text-primary)', bg: '#f9fafb' },
    ];
  }, [stats, method]);

  return (
    <div>
      {selectedOrder && (
        <SellerOrderDrawer
          order={selectedOrder}
          sellerId={sellerId}
          onClose={() => setSelectedOrder(null)}
          onUpdateItemStatus={handleUpdateItemStatus}
          onUpdateNote={handleUpdateNote}
          allReviews={allReviews}
          reviewPeriods={reviewPeriods}
          sellerUserId={user?.id}
          sellerUserName={user?.name}
          onSubmitBuyerReview={submitReview}
        />
      )}

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px' }}>
          {method === 'delivery' ? 'Deliveries' : 'Pickups'}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          {method === 'delivery' ? 'Manage and track shipped orders' : 'Manage customer pickup orders'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => handleMethodChange('delivery')}
          className={`prod-tab${method === 'delivery' ? ' active' : ''}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.82rem', fontWeight: 600, padding: '8px 18px',
          }}
        >
          <Package size={15} />
          Deliveries
        </button>
        <button
          onClick={() => handleMethodChange('pickup')}
          className={`prod-tab${method === 'pickup' ? ' active' : ''}`}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.82rem', fontWeight: 600, padding: '8px 18px',
          }}
        >
          <Store size={15} />
          Pickups
        </button>
      </div>

      <div
        className="seller-stats-grid"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '10px', marginBottom: '20px',
        }}
      >
        {statCards.map((s) => (
          <div key={s.label} className="seller-stat-card" style={{ padding: '14px 16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="prod-tabs" style={{ flex: 1, minWidth: 0, overflowX: 'auto' }}>
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                className={`prod-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative', minWidth: '200px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search by order ID or buyer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '0.82rem' }}
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="ords-empty" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <ClipboardList size={40} style={{ opacity: 0.3, marginBottom: '12px', margin: '0 auto 12px', display: 'block' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>
            {searchQuery || activeTab !== 'all' ? 'No matching orders' : `No ${method === 'pickup' ? 'pickup' : 'delivery'} orders yet`}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '380px', margin: '0 auto' }}>
            {searchQuery || activeTab !== 'all'
              ? 'Try adjusting your search or filter.'
              : method === 'pickup'
                ? 'Customers who choose pickup will appear here.'
                : 'When customers place delivery orders, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="ords-card-list">
          {filteredOrders.map((order) => (
            <SellerOrderCard
              key={order.id}
              order={order}
              sellerId={sellerId}
              deliveryMethod={method}
              onClick={() => setSelectedOrder(order)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
