import { useEffect, useState, useMemo, useCallback } from 'react';
import { ClipboardList, Search, Clock, CheckCircle, Truck, XCircle, Package, Store, RotateCcw } from 'lucide-react';
import type { Order, OrderStatus } from '../types/marketplace.type';
import { useAuthStore } from '../stores/auth.store';
import { useStoreStore } from '../stores/store.store';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { AdminOrderCard } from '../components/admin/AdminOrderCard';
import { AdminOrderDrawer } from '../components/admin/AdminOrderDrawer';
import { ORDER_STATUS_META } from '../data/order-status';

function getStoreOrderStatus(order: Order): OrderStatus {
  const items = order.items;
  if (items.length === 0) return 'pending';
  if (items.every((i) => i.status === 'refunded')) return 'refunded';
  if (items.every((i) => i.status === 'returned')) return 'returned';
  if (items.every((i) => i.status === 'cancelled')) return 'cancelled';
  if (items.every((i) => i.status === 'delivered')) return 'delivered';
  if (items.every((i) => i.status === 'shipped')) return 'shipped';
  if (items.every((i) => i.status === 'packing')) return 'packing';
  if (items.every((i) => i.status === 'picking')) return 'picking';
  if (items.some((i) => i.status === 'shipped')) return 'shipped';
  if (items.some((i) => i.status === 'packing')) return 'packing';
  if (items.some((i) => i.status === 'picking')) return 'picking';
  return 'pending';
}

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  pending: Clock,
  picking: Clock,
  packing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  returned: RotateCcw,
  refunded: CheckCircle,
  cancelled: XCircle,
};

const DELIVERY_TABS: Array<{ key: string; label: string; icon: typeof Clock }> = [
  { key: 'all', label: 'All', icon: ClipboardList },
  ...(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((key) => ({
    key, label: ORDER_STATUS_META[key].label, icon: STATUS_ICONS[key],
  })),
];

const PICKUP_TABS: Array<{ key: string; label: string; icon: typeof Clock }> = DELIVERY_TABS.map((tab) => {
  if (tab.key === 'shipped') return { ...tab, label: 'Ready', icon: Store };
  if (tab.key === 'delivered') return { ...tab, label: 'Picked Up' };
  return tab;
});

const AdminOrders: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const profile = useStoreStore((s) => s.profile);
  const fetchedOrders = useMarketplaceStore((s) => s.orders);
  const returnOrders = useMarketplaceStore((s) => s.returnOrders);
  // Return orders are fetched separately (see marketplace.store.ts) — merge
  // them in here rather than into `orders` itself, which loadAdminOrders replaces wholesale.
  const orders = useMemo(() => [...returnOrders, ...fetchedOrders], [fetchedOrders, returnOrders]);
  const loadAdminOrders = useMarketplaceStore((s) => s.loadAdminOrders);
  const loadAdminReturnOrders = useMarketplaceStore((s) => s.loadAdminReturnOrders);
  const refundOrder = useMarketplaceStore((s) => s.refundOrder);
  const adminUpdateItemStatus = useMarketplaceStore((s) => s.adminUpdateItemStatus);
  const adminUpdateNote = useMarketplaceStore((s) => s.adminUpdateNote);
  const allReviews = useMarketplaceStore((s) => s.allReviews);
  const reviewPeriods = useMarketplaceStore((s) => s.reviewPeriods);
  const startReviewPeriod = useMarketplaceStore((s) => s.startReviewPeriod);
  const submitReview = useMarketplaceStore((s) => s.submitReview);

  const [method, setMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  // Re-derived from `orders` on every render (rather than snapshotting the
  // clicked Order object) so the drawer reflects a refund immediately.
  const selectedOrder = useMemo(
    () => (selectedOrderId ? orders.find((o) => o.id === selectedOrderId) ?? null : null),
    [orders, selectedOrderId]
  );

  // Still needed for ReviewPeriod bookkeeping (see marketplace.store.ts) — every
  // review period belongs to this one store, tracked by its profile id.
  const storeId = profile.id;

  useEffect(() => {
    loadAdminOrders();
    loadAdminReturnOrders();
  }, [loadAdminOrders, loadAdminReturnOrders]);

  const handleRefund = useCallback(
    async (rtnOrdNo: string) => {
      await refundOrder(rtnOrdNo);
    },
    [refundOrder]
  );

  const statusTabs = method === 'pickup' ? PICKUP_TABS : DELIVERY_TABS;

  const storeOrders = useMemo(() => {
    return orders.filter((o) => o.items.some((i) => i.deliveryMethod === method));
  }, [orders, method]);

  const filteredOrders = useMemo(() => {
    let result = storeOrders;
    if (activeTab !== 'all') {
      result = result.filter((o) => getStoreOrderStatus(o) === activeTab);
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
  }, [storeOrders, activeTab, searchQuery]);

  const stats = useMemo(() => {
    const s = { pending: 0, picking: 0, packing: 0, shipped: 0, delivered: 0, returned: 0, refunded: 0, total: storeOrders.length };
    for (const o of storeOrders) {
      const st = getStoreOrderStatus(o);
      if (st in s) s[st as keyof typeof s]++;
    }
    return s;
  }, [storeOrders]);

  const handleMethodChange = (m: 'delivery' | 'pickup') => {
    setMethod(m);
    setActiveTab('all');
  };

  const handleUpdateItemStatus = useCallback(
    (orderId: string, productId: string, status: OrderStatus, tracking?: { carrier?: string; trackingNumber?: string }) => {
      adminUpdateItemStatus(orderId, productId, status, tracking);
      if (status === 'delivered') {
        const order = orders.find((o) => o.id === orderId);
        if (order && !reviewPeriods.some((rp) => rp.orderId === orderId && rp.sellerId === storeId)) {
          startReviewPeriod(orderId, storeId, order.buyerName);
        }
      }
    },
    [adminUpdateItemStatus, orders, reviewPeriods, storeId, startReviewPeriod]
  );

  const handleUpdateNote = useCallback(
    (orderId: string, productId: string, note: string) => {
      adminUpdateNote(orderId, productId, note);
    },
    [adminUpdateNote]
  );

  const statCards = useMemo(() => {
    const isDelivery = method === 'delivery';
    return [
      { label: 'Pending', value: stats.pending, color: '#f59e0b', bg: '#fffbeb' },
      { label: 'Picking', value: stats.picking, color: '#3b82f6', bg: '#eff6ff' },
      { label: 'Packing', value: stats.packing, color: '#8b5cf6', bg: '#f5f3ff' },
      { label: isDelivery ? 'Shipped' : 'Ready', value: stats.shipped, color: '#06b6d4', bg: '#ecfeff' },
      { label: isDelivery ? 'Delivered' : 'Picked Up', value: stats.delivered ?? 0, color: '#10b981', bg: '#ecfdf5' },
      { label: 'Returned', value: stats.returned ?? 0, color: '#d97706', bg: '#fffbeb' },
      { label: 'Refunded', value: stats.refunded ?? 0, color: '#16a34a', bg: '#dcfce7' },
      { label: 'Total', value: stats.total, color: 'var(--text-primary)', bg: '#f9fafb' },
    ];
  }, [stats, method]);

  return (
    <div>
      {selectedOrder && (
        <AdminOrderDrawer
          order={selectedOrder}
          storeId={storeId}
          onClose={() => setSelectedOrderId(null)}
          onUpdateItemStatus={handleUpdateItemStatus}
          onUpdateNote={handleUpdateNote}
          allReviews={allReviews}
          reviewPeriods={reviewPeriods}
          adminUserId={user?.id}
          adminUserName={user?.name}
          onSubmitBuyerReview={submitReview}
          onRefund={handleRefund}
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
        className="admin-stats-grid"
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '10px', marginBottom: '20px',
        }}
      >
        {statCards.map((s) => (
          <div key={s.label} className="admin-stat-card" style={{ padding: '14px 16px' }}>
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
            <AdminOrderCard
              key={order.id}
              order={order}
              deliveryMethod={method}
              onClick={() => setSelectedOrderId(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
