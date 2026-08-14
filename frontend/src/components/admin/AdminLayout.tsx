import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { useStoreStore } from '../../stores/store.store';
import { useAuthStore } from '../../stores/auth.store';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useStoreStore((s) => s.profile);

  const handleSignOut = () => {
    navigate('/');
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header-title">
            Welcome, {profile.storeName || user?.name}
          </h1>
          <div className="admin-header-right">
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
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
