import { useMarketplaceStore } from '../../stores/marketplace.store';

export const CategoryBar: React.FC = () => {
  const categories = useMarketplaceStore((s) => s.categories);
  const selectedSubCategory = useMarketplaceStore((s) => s.selectedSubCategory);
  const setSubCategory = useMarketplaceStore((s) => s.setSubCategory);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => setSubCategory(null)}
          style={{
            minHeight: '64px',
            padding: '8px 14px',
            borderRadius: '12px',
            border: '1.5px solid ' + (!selectedSubCategory ? 'var(--primary)' : 'transparent'),
            background: !selectedSubCategory ? 'var(--primary-light)' : 'var(--bg-tertiary)',
            color: !selectedSubCategory ? 'var(--primary)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.72rem',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'var(--transition-fast)',
            flexShrink: 0,
          }}
        >
          All
        </button>
        {categories.map((sub) => {
          const isActive = selectedSubCategory === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setSubCategory(sub.id)}
              style={{
                minWidth: '82px',
                padding: '8px 10px',
                borderRadius: '12px',
                border: `1.5px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                background: isActive ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexShrink: 0,
                transition: 'var(--transition-fast)',
              }}
            >
              <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{sub.icon}</span>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  textAlign: 'center',
                }}
              >
                {sub.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
