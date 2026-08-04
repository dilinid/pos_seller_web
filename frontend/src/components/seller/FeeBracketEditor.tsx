import type { FeeBracket } from '../../types/seller.type';
import { formatCurrency } from '../../utils/currency';

interface FeeBracketEditorProps {
  title: string;
  unit: string;
  brackets: FeeBracket[];
  onChange: (brackets: FeeBracket[]) => void;
  disabled?: boolean;
}

function generateId(): string {
  return `bracket_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export const FeeBracketEditor: React.FC<FeeBracketEditorProps> = ({
  title, unit, brackets, onChange, disabled,
}) => {
  const safe = brackets ?? [];

  const update = (index: number, field: keyof FeeBracket, value: string | number | null) => {
    const next = safe.map((b, i) =>
      i === index ? { ...b, [field]: value } as FeeBracket : b
    );
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(safe.filter((_, i) => i !== index));
  };

  const add = () => {
    const last = safe[safe.length - 1];
    const from = last ? (last.toValue ?? last.fromValue + 1) : 0;
    onChange([
      ...safe,
      { id: generateId(), label: '', fromValue: from, toValue: null, fee: 0 },
    ]);
  };

  return (
    <div className="prod-section-card" style={{ marginTop: '12px' }}>
      <div className="prod-section-title">
        <span style={{ fontSize: '0.9rem' }}>{title}</span>
      </div>
      {safe.length === 0 && !disabled && (
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
          No brackets configured. Add one below.
        </p>
      )}
      {safe.length > 0 && (
        <div className="prod-district-table" style={{ marginBottom: '10px' }}>
          <div className="prod-district-header">
            <span>Label</span>
            <span>From ({unit})</span>
            <span>To ({unit})</span>
            <span>Fee (Rs.)</span>
            {!disabled && <span></span>}
          </div>
          {safe.map((b, i) => (
            <div key={b.id} className="prod-district-row" style={{ display: 'grid', gridTemplateColumns: !disabled ? '1fr 80px 80px 80px 32px' : '1fr 80px 80px 80px', gap: '6px', alignItems: 'center' }}>
              {disabled ? (
                <span className="prod-district-name">{b.label || '—'}</span>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  value={b.label}
                  onChange={(e) => update(i, 'label', e.target.value)}
                  placeholder="e.g. 0-1 kg"
                  style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                />
              )}
              {disabled ? (
                <span className="prod-district-fee">{b.fromValue}</span>
              ) : (
                <input
                  type="number" step="0.01" min="0"
                  className="form-input"
                  value={b.fromValue}
                  onChange={(e) => update(i, 'fromValue', parseFloat(e.target.value) || 0)}
                  style={{ padding: '6px 8px', fontSize: '0.82rem', width: '100%' }}
                />
              )}
              {disabled ? (
                <span className="prod-district-fee">{b.toValue != null ? b.toValue : '∞'}</span>
              ) : (
                <input
                  type="number" step="0.01" min="0"
                  className="form-input"
                  value={b.toValue ?? ''}
                  onChange={(e) => update(i, 'toValue', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="∞"
                  style={{ padding: '6px 8px', fontSize: '0.82rem', width: '100%' }}
                />
              )}
              {disabled ? (
                <span className="prod-district-fee">{formatCurrency(b.fee)}</span>
              ) : (
                <input
                  type="number" step="0.01" min="0"
                  className="form-input"
                  value={b.fee}
                  onChange={(e) => update(i, 'fee', parseFloat(e.target.value) || 0)}
                  style={{ padding: '6px 8px', fontSize: '0.82rem', width: '100%' }}
                />
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  style={{
                    background: '#fee2e2', border: 'none', borderRadius: '6px',
                    cursor: 'pointer', width: '28px', height: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#dc2626', fontSize: '14px', padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {!disabled && (
        <button
          type="button"
          onClick={add}
          style={{
            background: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)',
            borderRadius: '8px', padding: '8px 16px', cursor: 'pointer',
            fontSize: '0.82rem', color: 'var(--text-secondary)', width: '100%',
          }}
        >
          + Add Bracket
        </button>
      )}
    </div>
  );
};
