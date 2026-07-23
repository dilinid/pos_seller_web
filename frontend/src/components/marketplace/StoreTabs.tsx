interface StoreTabsProps {
  active: 'products' | 'about';
  productCount: number;
  onChange: (tab: 'products' | 'about') => void;
}

export const StoreTabs: React.FC<StoreTabsProps> = ({ active, productCount, onChange }) => {
  const tabs: { key: 'products' | 'about'; label: string }[] = [
    { key: 'products', label: `Products (${productCount})` },
    { key: 'about', label: 'About' },
  ];

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '8px 20px',
            borderRadius: '24px',
            border: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
            background: active === tab.key ? 'var(--primary)' : 'transparent',
            color: active === tab.key ? '#fff' : 'var(--text-secondary)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
