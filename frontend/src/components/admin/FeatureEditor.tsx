import { Plus, X } from 'lucide-react';

interface FeatureEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
  disabled?: boolean;
}

export const FeatureEditor: React.FC<FeatureEditorProps> = ({ features, onChange, disabled }) => {
  const addFeature = () => onChange([...features, '']);

  const updateFeature = (index: number, value: string) => {
    const next = [...features];
    next[index] = value;
    onChange(next);
  };

  const removeFeature = (index: number) => {
    onChange(features.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {disabled ? (
              <span className="prod-feature-pill">{f}</span>
            ) : (
              <>
                <input
                  type="text"
                  value={f}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className="form-input"
                  placeholder="e.g. Organic"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', width: '120px' }}
                />
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: '4px', display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <button type="button" onClick={addFeature} className="prod-add-row-btn">
          <Plus size={14} /> Add Feature
        </button>
      )}
    </div>
  );
};
