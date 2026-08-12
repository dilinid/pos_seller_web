import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layers, Package, HelpCircle, Info } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { SidebarBanner } from './marketplace/SidebarBanner';

const SidebarMenu: React.FC = () => {
  const isAuthenticated  = !!useAuthStore((state) => state.userSession);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="desktop-sidebar" style={{
      width: '240px',
      background: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: 'calc(100vh - 70px)',
      position: 'sticky',
      top: '70px',
      alignSelf: 'flex-start',
      textAlign: 'left'
    }}>
      {/* <div style={{ padding: '0 12px 10px 12px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
          Store Directory
        </span>
      </div> */}

      {/* Departments (Shopping Home) */}
      <div 
        onClick={() => navigate('/')}
        style={{
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: isActive('/') ? 'var(--primary)' : 'var(--text-primary)',
          fontWeight: isActive('/') ? 700 : 500,
          fontSize: '0.88rem',
          background: isActive('/') ? 'var(--primary-light)' : 'transparent',
          transition: 'var(--transition-fast)'
        }}
        title="Browse grocery departments"
      >
        <Layers size={18} color={isActive('/') ? 'var(--primary)' : 'var(--text-secondary)'} />
        <span>Departments</span>
      </div>

      {/* Your Orders */}
      <div 
        onClick={() => {
          if (isAuthenticated) {
            navigate('/orders');
          } else {
            localStorage.setItem('auth_redirect', '/orders');
            navigate('/login');
          }
        }}
        style={{
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: location.pathname.startsWith('/orders') ? 'var(--primary)' : 'var(--text-primary)',
          fontWeight: location.pathname.startsWith('/orders') ? 700 : 500,
          fontSize: '0.88rem',
          background: location.pathname.startsWith('/orders') ? 'var(--primary-light)' : 'transparent',
          transition: 'var(--transition-fast)'
        }}
        title="View your orders"
      >
        <Package size={18} color={location.pathname.startsWith('/orders') ? 'var(--primary)' : 'var(--text-secondary)'} />
        <span>Your Orders</span>
      </div>
      
      {/* About Us */}
      <div
        onClick={() => navigate('/about')}
        style={{
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: isActive('/about') ? 'var(--primary)' : 'var(--text-primary)',
          fontWeight: isActive('/about') ? 700 : 500,
          fontSize: '0.88rem',
          background: isActive('/about') ? 'var(--primary-light)' : 'transparent',
          transition: 'var(--transition-fast)'
        }}
        title="Learn more about us"
      >
        <Info size={18} color={isActive('/about') ? 'var(--primary)' : 'var(--text-secondary)'} />
        <span>About Us</span>
      </div>

      {/* Help Center */}
      <div
        onClick={() => alert("Help Center Portal - Under maintenance.")}
        style={{
          padding: '12px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--text-primary)',
          fontWeight: 500,
          fontSize: '0.88rem',
          transition: 'var(--transition-fast)'
        }}
        title="Open help center"
      >
        <HelpCircle size={18} color="var(--text-secondary)" />
        <span>Help Center</span>
      </div>

      <SidebarBanner />
    </aside>
  );
};

export default SidebarMenu;
