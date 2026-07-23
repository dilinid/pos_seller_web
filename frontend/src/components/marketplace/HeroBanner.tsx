import { useState, useMemo } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { usePromotionStore } from '../../stores/promotion.store';

export const HeroBanner: React.FC = () => {
  const getActive = usePromotionStore((s) => s.getActivePromotions);
  const promos = useMemo(() => getActive('hero'), [getActive]);
  const [dismissed, setDismissed] = useState(false);

  if (promos.length === 0 || dismissed) return null;

  const p = promos[0];

  return (
    <div
      style={{
        background: p.bgColor,
        borderRadius: '16px',
        padding: '20px 24px',
        position: 'relative',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      <span style={{ fontSize: '2rem', lineHeight: 1 }}>{p.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '2px' }}>
          {p.title}
        </div>
        <div style={{ fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.4 }}>
          {p.description}
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>
          {p.sellerName}
        </div>
      </div>
      <button
        className="btn"
        style={{
          padding: '8px 18px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600,
          background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
          flexShrink: 0, cursor: 'pointer',
        }}
      >
        Shop Now <ArrowRight size={14} />
      </button>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: 'absolute', top: '8px', right: '8px',
          background: 'rgba(0,0,0,0.15)', border: 'none', borderRadius: '50%',
          width: '24px', height: '24px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', cursor: 'pointer', color: '#fff',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};
