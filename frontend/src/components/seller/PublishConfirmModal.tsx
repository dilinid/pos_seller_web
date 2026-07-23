import { useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import type { PushItem } from '../../types/push-item.type';

interface PublishConfirmModalProps {
  item: PushItem;
  onConfirm: () => void;
  onCancel: () => void;
}

export const PublishConfirmModal: React.FC<PublishConfirmModalProps> = ({ item, onConfirm, onCancel }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.15s ease-out',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#fffbeb', color: '#d97706',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Publish to Marketplace?
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                This item will be visible to all customers
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '4px',
              borderRadius: '6px', display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{
          margin: '16px 24px', padding: '14px 16px',
          background: '#f8fafc', borderRadius: '10px',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ fontSize: '2rem' }}>{item.image}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.unit}</div>
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px',
            fontSize: '0.82rem',
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Price</span>
              <div style={{ fontWeight: 600 }}>${item.price.toFixed(2)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>MRP</span>
              <div style={{ fontWeight: 600 }}>{item.mrp != null ? `$${item.mrp.toFixed(2)}` : '—'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Quantity</span>
              <div style={{ fontWeight: 600 }}>{item.quantity}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Reorder</span>
              <div style={{ fontWeight: 600 }}>{item.reorderLevel != null ? item.reorderLevel : '—'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 24px 20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border-color)',
              background: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: 'var(--primary)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              color: '#fff',
            }}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};
