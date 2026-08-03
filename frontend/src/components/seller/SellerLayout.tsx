import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { SellerSidebar } from './SellerSidebar';
import { useSellerStore } from '../../stores/seller.store';
import { useAuthStore } from '../../stores/auth.store';

export const SellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useSellerStore((s) => s.profile);

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <div className="seller-layout">
      <SellerSidebar />
      <div className="seller-main">
        <header className="seller-header">
          <h1 className="seller-header-title">
            Welcome, {profile.storeName || user?.name}
          </h1>
          <div className="seller-header-right">
            <button
              onClick={handleSignOut}
              className="btn btn-secondary"
              style={{
                padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <LogOut size={14} /> Exit Store Panel
            </button>
          </div>
        </header>
        <main className="seller-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
