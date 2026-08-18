import { useState } from 'react';
import { Megaphone, Plus, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { usePromotionStore } from '../stores/promotion.store';
import type { BannerPlacement } from '../types/promotion.type';
import type { Promotion } from '../types/promotion.type';

const PLACEMENT_OPTIONS: { value: BannerPlacement; label: string }[] = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'sidebar', label: 'Sidebar Banner' },
  { value: 'popup', label: 'Popup' },
];

const ICON_OPTIONS = ['🎉', '🔥', '⚡', '💥', '🏷️', '🥬', '☕', '🥐', '🍕', '🛒'];

const GRADIENT_OPTIONS = [
  { label: 'Green', value: 'linear-gradient(135deg, #166534, #22c55e)' },
  { label: 'Amber', value: 'linear-gradient(135deg, #92400e, #d97706)' },
  { label: 'Red', value: 'linear-gradient(135deg, #991b1b, #ef4444)' },
  { label: 'Blue', value: 'linear-gradient(135deg, #1e3a5f, #3b82f6)' },
  { label: 'Purple', value: 'linear-gradient(135deg, #4c1d95, #a855f7)' },
  { label: 'Teal', value: 'linear-gradient(135deg, #0f766e, #14b8a6)' },
];

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.FC<{ size?: number }> }> = {
  approved: { label: 'Active', color: '#16a34a', icon: CheckCircle },
  pending: { label: 'Pending', color: '#d97706', icon: Clock },
  rejected: { label: 'Rejected', color: '#dc2626', icon: AlertCircle },
  expired: { label: 'Expired', color: '#6b7280', icon: X },
};

const AdminPromotions: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { promotions, submitPromotion, cancelPromotion } = usePromotionStore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🎉');
  const [bgColor, setBgColor] = useState(GRADIENT_OPTIONS[0].value);
  const [placement, setPlacement] = useState<BannerPlacement>('hero');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const myPromotions = promotions.filter((p) => p.sellerId === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    submitPromotion({
      sellerId: user.id,
      sellerName: user.name || 'Store',
      title,
      description,
      icon,
      bgColor,
      placement,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    });
    setShowForm(false);
    setTitle('');
    setDescription('');
    setIcon('🎉');
    setBgColor(GRADIENT_OPTIONS[0].value);
    setPlacement('hero');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Megaphone size={22} color="var(--primary)" />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>My Promotions</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} />
          New Promotion
        </button>
      </div>

      {myPromotions.length === 0 && !showForm && (
        <div
          style={{
            padding: '40px', textAlign: 'center', background: 'var(--bg-primary)',
            borderRadius: '12px', border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)', fontSize: '0.88rem',
          }}
        >
          No promotions yet. Create your first one!
        </div>
      )}

      {myPromotions.map((promo: Promotion) => {
        const badge = STATUS_BADGE[promo.status] || STATUS_BADGE.pending;
        const BadgeIcon = badge.icon;
        return (
          <div
            key={promo.id}
            style={{
              background: 'var(--bg-primary)', borderRadius: '12px', padding: '18px 20px',
              display: 'flex', alignItems: 'center', gap: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: promo.bgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', flexShrink: 0,
              }}
            >
              {promo.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{promo.title}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {PLACEMENT_OPTIONS.find((o) => o.value === promo.placement)?.label || promo.placement}
                {' · '}
                {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}
              </div>
            </div>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                fontSize: '0.72rem', fontWeight: 600,
                color: badge.color, background: `${badge.color}12`,
                padding: '4px 10px', borderRadius: '20px',
              }}
            >
              <BadgeIcon size={12} />
              {badge.label}
            </div>
            {promo.status === 'approved' && (
              <button
                onClick={() => cancelPromotion(promo.id)}
                title="End promotion"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: '4px',
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        );
      })}

      {showForm && (
        <div
          style={{
            background: 'var(--bg-primary)', borderRadius: '12px', padding: '28px 24px',
            border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 20px' }}>New Promotion</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                Title *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Sale!"
                className="form-input"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                Description *
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Get 20% off on all items..."
                className="form-input"
                rows={2}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Icon
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    style={{
                      width: '36px', height: '36px', borderRadius: '8px', fontSize: '1.1rem',
                      border: icon === ic ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: icon === ic ? 'var(--primary-light)' : 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                Background
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {GRADIENT_OPTIONS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setBgColor(g.value)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', fontSize: '0.78rem',
                      border: bgColor === g.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: g.value, color: '#fff', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                Placement *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {PLACEMENT_OPTIONS.map((pl) => (
                  <button
                    key={pl.value}
                    type="button"
                    onClick={() => setPlacement(pl.value)}
                    style={{
                      padding: '8px 18px', borderRadius: '8px', fontSize: '0.82rem',
                      border: placement === pl.value ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: placement === pl.value ? 'var(--primary-light)' : 'transparent',
                      color: 'var(--text-primary)', cursor: 'pointer', fontWeight: placement === pl.value ? 600 : 400,
                    }}
                  >
                    {pl.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Submit Promotion
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPromotions;
