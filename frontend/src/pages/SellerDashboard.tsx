import { useNavigate } from 'react-router-dom';
import { Package, ClipboardList, DollarSign, Star, PlusCircle, User, BarChart3 } from 'lucide-react';
import { useSellerStore } from '../stores/seller.store';
import { formatCurrency } from '../utils/currency';

const SellerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const profile = useSellerStore((s) => s.profile);

  const STATS = [
    { icon: Package, value: profile.productCount, label: 'Products', color: 'var(--primary)', bg: 'var(--primary-light)' },
    { icon: ClipboardList, value: 0, label: 'Orders', color: 'var(--accent)', bg: 'var(--accent-light)' },
    { icon: DollarSign, value: formatCurrency(0), label: 'Revenue', color: 'var(--warning)', bg: '#fffbeb' },
    { icon: Star, value: profile.rating, label: 'Rating', color: '#f59e0b', bg: '#fffbeb' },
  ];

  const QUICK_ACTIONS = [
    { icon: PlusCircle, label: 'Add Product', onClick: () => navigate('/seller/products/add') },
    { icon: ClipboardList, label: 'View Orders', onClick: () => navigate('/seller/orders') },
    { icon: User, label: 'Edit Profile', onClick: () => navigate('/seller/settings') },
    { icon: BarChart3, label: 'View Reports', onClick: () => {} },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '4px' }}>
          Store Overview
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {profile.description || 'Welcome to your seller dashboard.'}
        </p>
      </div>

      <div className="seller-stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className="seller-stat-card">
            <div className="seller-stat-icon" style={{ background: stat.bg, color: stat.color }}>
              <stat.icon size={20} />
            </div>
            <div className="seller-stat-info">
              <span className="seller-stat-value">{stat.value}</span>
              <span className="seller-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
        Quick Actions
      </h3>
      <div className="seller-actions-grid">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="seller-action-card"
          >
            <action.icon size={18} color="var(--primary)" />
            {action.label}
          </button>
        ))}
      </div>

      <div style={{
        background: '#fff', border: '1px solid var(--border-color)',
        borderRadius: '12px', padding: '20px',
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>
          Recent Orders
        </h3>
        <div style={{
          padding: '24px', textAlign: 'center', color: 'var(--text-muted)',
          fontSize: '0.85rem',
        }}>
          <ClipboardList size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
          <p style={{ margin: '0 0 12px' }}>Manage and fulfill customer orders</p>
          <button
            onClick={() => navigate('/seller/orders')}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.82rem', fontWeight: 600 }}
          >
            Go to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
