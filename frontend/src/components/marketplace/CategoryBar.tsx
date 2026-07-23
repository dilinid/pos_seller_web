import { useMemo } from 'react';
import { useMarketplaceStore } from '../../stores/marketplace.store';

export const CategoryBar: React.FC = () => {
  const categories = useMarketplaceStore((s) => s.categories);
  const selectedCategory = useMarketplaceStore((s) => s.selectedCategory);
  const selectedSubCategory = useMarketplaceStore((s) => s.selectedSubCategory);
  const setCategory = useMarketplaceStore((s) => s.setCategory);
  const setSubCategory = useMarketplaceStore((s) => s.setSubCategory);

  const subCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = categories.find((c) => c.id === selectedCategory);
    return cat?.subCategories ?? [];
  }, [categories, selectedCategory]);

  const activeCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '24px',
                background: isActive ? 'var(--primary)' : '#ffffff',
                border: '1px solid ' + (isActive ? 'transparent' : 'var(--border-color)'),
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                whiteSpace: 'nowrap',
                transition: 'var(--transition-fast)',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {selectedCategory && subCategories.length > 0 && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '0 0 8px 0',
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                whiteSpace: 'nowrap',
              }}
            >
              {activeCategory?.icon} {activeCategory?.name}
            </span>
            <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            <button
              onClick={() => setSubCategory(null)}
              style={{
                minHeight: '64px', padding: '8px 14px',
                borderRadius: '12px', border: 'none',
                background: !selectedSubCategory ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                border: '1.5px solid ' + (!selectedSubCategory ? 'var(--primary)' : 'transparent'),
                color: !selectedSubCategory ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer', fontWeight: 700, fontSize: '0.72rem',
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center',
                transition: 'var(--transition-fast)', flexShrink: 0,
              }}
            >
              All
            </button>
            {subCategories.map((sub) => {
              const isActive = selectedSubCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSubCategory(sub.id)}
                  style={{
                    minWidth: '82px', padding: '8px 10px',
                    borderRadius: '12px', border: 'none',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: '6px', flexShrink: 0,
                    background: isActive ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                    border: `1.5px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'var(--transition-fast)',
                  }}
                >
                  <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{sub.icon}</span>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 600, lineHeight: 1.2,
                    textAlign: 'center',
                  }}>
                    {sub.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
