import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Upload, ClipboardList, Settings, Store, BarChart3, Wallet, Megaphone, ShoppingCart, PackageCheck,
} from 'lucide-react';
import { useSellerStore } from '../../stores/seller.store';
import { useAuthStore } from '../../stores/auth.store';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/seller/dashboard' },
  { icon: Upload, label: 'POS Sync', path: '/seller/pos-sync' },
  { icon: Package, label: 'Products', path: '/seller/products' },
  { icon: BarChart3, label: 'Stock', path: '/seller/stock' },
  { icon: Megaphone, label: 'Promotions', path: '/seller/promotions' },
  { icon: ClipboardList, label: 'Orders', path: '/seller/orders' },
  { icon: ShoppingCart, label: 'Pick Up List', path: '/seller/pickup-list' },
  { icon: PackageCheck, label: 'Packing List', path: '/seller/packing-list' },
  { icon: Wallet, label: 'Payments', path: '/seller/payments' },
  { icon: Settings, label: 'Settings', path: '/seller/settings' },
];

export const SellerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const profile = useSellerStore((s) =>
    user ? s.profiles.find((p) => p.userId === user.id && p.status === 'approved') : undefined,
  );

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="seller-sidebar">
      <div className="seller-sidebar-brand">
        <span className="seller-sidebar-logo">🏪</span>
        <div>
          <div className="seller-sidebar-title">Store Panel</div>
          <div className="seller-sidebar-subtitle">{profile?.storeName || user?.name}</div>
        </div>
      </div>

      <nav className="seller-sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`seller-sidebar-item${isActive(item.path) ? ' active' : ''}`}
          >
            <item.icon size={18} />
            <span className="seller-sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="seller-sidebar-footer">
        <button onClick={() => navigate('/')} className="seller-sidebar-item">
          <Store size={18} />
          <span className="seller-sidebar-label">Back to Store</span>
        </button>
      </div>
    </aside>
  );
};
