import { Plus, X } from 'lucide-react';

interface SpecEntry {
  key: string;
  value: string;
}

interface SpecEditorProps {
  specifications: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
  disabled?: boolean;
}

export const SpecEditor: React.FC<SpecEditorProps> = ({ specifications, onChange, disabled }) => {
  const entries: SpecEntry[] = Object.entries(specifications).map(([key, value]) => ({ key, value }));

  const addSpec = () => {
    onChange({ ...specifications, '': '' });
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const next = { ...specifications };
    const oldKey = entries[index]?.key;

    if (field === 'key') {
      const oldVal = next[oldKey];
      delete next[oldKey];
      if (val) next[val] = oldVal ?? '';
    } else {
      if (oldKey) next[oldKey] = val;
    }

    onChange(next);
  };

  const removeSpec = (index: number) => {
    const next = { ...specifications };
    delete next[entries[index].key];
    onChange(next);
  };

  if (disabled) {
    return (
      <div className="prod-spec-grid">
        {entries.filter((e) => e.key).map((entry) => (
          <div key={entry.key} className="prod-spec-row">
            <span className="prod-spec-key">{entry.key}</span>
            <span className="prod-spec-value">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {entries.map((entry, i) => (
        <div key={i} className="prod-spec-row" style={{ marginBottom: '8px' }}>
          <input
            type="text"
            value={entry.key}
            onChange={(e) => updateSpec(i, 'key', e.target.value)}
            className="form-input"
            placeholder="e.g. Weight"
            style={{ padding: '8px 10px', fontSize: '0.82rem', flex: 1 }}
          />
          <input
            type="text"
            value={entry.value}
            onChange={(e) => updateSpec(i, 'value', e.target.value)}
            className="form-input"
            placeholder="e.g. 1 kg"
            style={{ padding: '8px 10px', fontSize: '0.82rem', flex: 1 }}
          />
          <button
            type="button"
            onClick={() => removeSpec(i)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '4px', display: 'flex',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={addSpec} className="prod-add-row-btn">
        <Plus size={14} /> Add Specification
      </button>
    </div>
  );
};
