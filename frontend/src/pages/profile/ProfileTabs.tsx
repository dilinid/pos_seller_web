import { User, CreditCard } from 'lucide-react';
import type { ProfileTab } from './profile.types';

interface ProfileTabsProps {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const TABS: { key: ProfileTab; label: string; icon: React.ReactNode }[] = [
  { key: 'personal', label: 'Personal Information', icon: <User size={16} /> },
  { key: 'payments', label: 'Payment Accounts', icon: <CreditCard size={16} /> },
];

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div style={{
      display: 'flex', gap: '4px',
      background: 'var(--bg-secondary)',
      padding: '4px', borderRadius: '14px',
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '10px 16px', borderRadius: '11px',
              border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
              fontSize: '0.85rem', fontWeight: isActive ? 700 : 500,
              background: isActive ? '#fff' : 'transparent',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
              transition: 'var(--transition-fast)',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
