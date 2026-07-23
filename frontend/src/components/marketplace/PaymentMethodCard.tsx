import type { ReactNode } from 'react';

interface PaymentMethodCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  icon, title, description, selected, onSelect, children,
}) => {
  return (
    <div
      onClick={onSelect}
      style={{
        border: selected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
        borderRadius: 'var(--border-radius-md)',
        padding: '20px',
        cursor: 'pointer',
        transition: 'var(--transition-smooth)',
        background: selected ? 'var(--primary-light)' : 'var(--bg-primary)',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: selected ? 'var(--primary)' : 'var(--bg-tertiary)',
          color: selected ? '#fff' : 'var(--text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'var(--transition-smooth)',
        }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px',
          }}>
            <span style={{
              width: '18px', height: '18px', borderRadius: '50%',
              border: selected ? '5px solid var(--primary)' : '2px solid var(--border-color)',
              transition: 'var(--transition-smooth)', flexShrink: 0,
            }} />
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{title}</h4>
          </div>
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5,
            marginLeft: '26px',
          }}>
            {description}
          </p>
        </div>
      </div>
      {selected && children && (
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
          {children}
        </div>
      )}
    </div>
  );
};
