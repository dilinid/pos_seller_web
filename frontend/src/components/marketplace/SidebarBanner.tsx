import { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { usePromotionStore } from '../../stores/promotion.store';

export const SidebarBanner: React.FC = () => {
  const getActive = usePromotionStore((s) => s.getActivePromotions);
  const promos = useMemo(() => getActive('sidebar'), [getActive]);

  if (promos.length === 0) return null;

  const p = promos[0];

  return (
    <div
      style={{
        marginTop: 'auto',
        background: p.bgColor,
        borderRadius: '12px',
        padding: '12px 14px',
        color: '#fff',
        cursor: 'pointer',
        transition: 'var(--transition-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, flex: 1 }}>{p.title}</span>
      </div>
      <div style={{ fontSize: '0.7rem', opacity: 0.85, lineHeight: 1.4, marginBottom: '6px' }}>
        {p.description}
      </div>
      <div
        style={{
          fontSize: '0.68rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px',
          opacity: 0.9,
        }}
      >
        Learn More <ArrowRight size={11} />
      </div>
    </div>
  );
};
