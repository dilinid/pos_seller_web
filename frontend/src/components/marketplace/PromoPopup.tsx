import { useEffect, useState, useMemo } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { usePromotionStore } from '../../stores/promotion.store';

const SESSION_KEY = 'promo_popup_dismissed';

export const PromoPopup: React.FC = () => {
  const getActive = usePromotionStore((s) => s.getActivePromotions);
  const promos = useMemo(() => getActive('popup'), [getActive]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (promos.length === 0) return;
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [promos]);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible]);

  if (promos.length === 0 || !visible) return null;

  const p = promos[0];

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '20px',
          maxWidth: '420px', width: '100%',
          padding: '36px 32px 28px',
          position: 'relative',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'var(--bg-secondary)', border: 'none', borderRadius: '50%',
            width: '32px', height: '32px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)',
          }}
        >
          <X size={16} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              width: '72px', height: '72px', borderRadius: '20px',
              background: p.bgColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              fontSize: '2.2rem',
            }}
          >
            {p.icon}
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            {p.title}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {p.description}
          </p>
        </div>

        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {p.sellerName}
        </div>

        <button
          className="btn btn-primary"
          style={{
            padding: '12px 28px', borderRadius: '12px', fontSize: '0.88rem', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', gap: '8px',
          }}
        >
          Shop Now <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
