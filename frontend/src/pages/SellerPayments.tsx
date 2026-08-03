import { useEffect, useMemo, useState, useCallback } from 'react';
import { Wallet, Clock, TrendingUp, Search, DollarSign, Ban } from 'lucide-react';
import type { Order, SellerPayoutStatus } from '../types/marketplace.type';
import { useSellerStore } from '../stores/seller.store';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { SellerPaymentCard } from '../components/seller/SellerPaymentCard';

const PAYOUT_TABS: Array<{ key: SellerPayoutStatus | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'on_hold', label: 'On Hold' },
];

function getOrderPayoutStatus(order: Order, sellerId: string): SellerPayoutStatus {
  const items = order.items.filter((i) => i.sellerId === sellerId);
  if (items.length === 0) return 'pending';
  const statuses = items.map((i) => i.sellerPayoutStatus ?? 'pending');
  if (statuses.every((s) => s === 'paid')) return 'paid';
  if (statuses.some((s) => s === 'on_hold')) return 'on_hold';
  if (statuses.some((s) => s === 'paid') || statuses.some((s) => s === 'processing')) return 'processing';
  return 'pending';
}

const SellerPayments: React.FC = () => {
  const profile = useSellerStore((s) => s.profile);
  const orders = useMarketplaceStore((s) => s.orders);
  const seedSellerOrders = useMarketplaceStore((s) => s.seedSellerOrders);

  const [activeTab, setActiveTab] = useState<SellerPayoutStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const sellerId = profile.id;

  useEffect(() => {
    seedSellerOrders(sellerId);
  }, [seedSellerOrders, sellerId]);

  const sellerOrders = useMemo(() => {
    return orders.filter((o) => o.items.some((i) => i.sellerId === sellerId));
  }, [orders, sellerId]);

  const stats = useMemo(() => {
    const s = { paid: 0, pending: 0, processing: 0, on_hold: 0, total: 0, paidAmount: 0, pendingAmount: 0 };
    for (const order of sellerOrders) {
      const items = order.items.filter((i) => i.sellerId === sellerId);
      const amount = items.reduce((sum, i) => sum + i.price * i.quantity + i.deliveryFee, 0);
      const status = getOrderPayoutStatus(order, sellerId);
      s.total++;
      if (status === 'paid') { s.paid++; s.paidAmount += amount; }
      else if (status === 'pending') { s.pending++; s.pendingAmount += amount; }
      else if (status === 'processing') s.processing++;
      else if (status === 'on_hold') s.on_hold++;
    }
    return s;
  }, [sellerOrders, sellerId]);

  const filteredOrders = useMemo(() => {
    let result = sellerOrders;
    if (activeTab !== 'all') {
      result = result.filter((o) => getOrderPayoutStatus(o, sellerId) === activeTab);
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

  const handleCardClick = useCallback((orderId: string) => {
    console.log('Payment detail for:', orderId);
  }, []);

  return (
    <div>
      <div className="pos-page-header" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={20} color="var(--primary)" /> Payments
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
          Track your payout status for delivered orders
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{
          flex: '1', minWidth: '180px', padding: '14px 16px', background: '#fff',
          borderRadius: '10px', border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <DollarSign size={18} color="#16a34a" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Total Received
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16a34a', lineHeight: 1.3 }}>
                ${stats.paidAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          flex: '1', minWidth: '180px', padding: '14px 16px', background: '#fff',
          borderRadius: '10px', border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Clock size={18} color="#d97706" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Pending Payout
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#d97706', lineHeight: 1.3 }}>
                ${stats.pendingAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          flex: '1', minWidth: '180px', padding: '14px 16px', background: '#fff',
          borderRadius: '10px', border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <TrendingUp size={18} color="#2563eb" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Orders
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {stats.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '12px',
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none',
      }}>
        {PAYOUT_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 14px', borderRadius: '20px', border: 'none',
              fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap',
              cursor: 'pointer', transition: 'var(--transition-fast)',
              background: activeTab === tab.key ? 'var(--primary)' : 'var(--bg-tertiary)',
              color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '14px', padding: '8px 12px', borderRadius: '10px',
        background: '#fff', border: '1px solid var(--border-color)',
      }}>
        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search by order ID or buyer name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: 'none', outline: 'none', flex: 1, fontSize: '0.82rem',
            background: 'transparent', fontFamily: 'var(--font-sans)',
          }}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 12px',
          }}>
            {activeTab === 'paid' ? <DollarSign size={24} color="var(--text-muted)" />
              : activeTab === 'on_hold' ? <Ban size={24} color="var(--text-muted)" />
              : <Wallet size={24} color="var(--text-muted)" />}
          </div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            No payment records
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            {activeTab === 'all' ? 'Orders with payout information will appear here.' : `No orders with "${activeTab}" payout status.`}
          </p>
        </div>
      ) : (
        <div>
          {filteredOrders.map((order) => (
            <SellerPaymentCard
              key={order.id}
              order={order}
              sellerId={sellerId}
              onClick={() => handleCardClick(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerPayments;
