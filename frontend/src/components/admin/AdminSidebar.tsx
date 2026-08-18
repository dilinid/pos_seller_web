import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Upload, ClipboardList, Settings, Store, BarChart3, Wallet, Megaphone, ShoppingCart, PackageCheck,
} from 'lucide-react';
import { useStoreStore } from '../../stores/store.store';
import { useAuthStore } from '../../stores/auth.store';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: Upload, label: 'POS Sync', path: '/admin/pos-sync' },
  { icon: Package, label: 'Products', path: '/admin/products' },
  { icon: BarChart3, label: 'Stock', path: '/admin/stock' },
  { icon: Megaphone, label: 'Promotions', path: '/admin/promotions' },
  { icon: ClipboardList, label: 'Orders', path: '/admin/orders' },
  { icon: ShoppingCart, label: 'Pick Up List', path: '/admin/pickup-list' },
  { icon: PackageCheck, label: 'Packing List', path: '/admin/packing-list' },
  { icon: Wallet, label: 'Payments', path: '/admin/payments' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const profile = useStoreStore((s) => s.profile);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-logo">🏪</span>
        <div>
          <div className="admin-sidebar-title">Store Panel</div>
          <div className="admin-sidebar-subtitle">{profile.storeName || user?.name}</div>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`admin-sidebar-item${isActive(item.path) ? ' active' : ''}`}
          >
            <item.icon size={18} />
            <span className="admin-sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button onClick={() => navigate('/')} className="admin-sidebar-item">
          <Store size={18} />
          <span className="admin-sidebar-label">Back to Store</span>
        </button>
      </div>
    </aside>
  );
};
