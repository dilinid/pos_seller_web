import { useState, useRef, useEffect } from 'react';

const EMOJIS = [
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓',
  '🫐', '🍒', '🍑', '🥭', '🥑', '🥦', '🥬', '🥕',
  '🧅', '🥔', '🍠', '🥜', '🌽', '🥚', '🧀', '🥛',
  '🍞', '🥖', '🥐', '🧇', '🥞', '🧈', '🍳', '🥓',
  '🍗', '🥩', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣',
  '🥗', '🍿', '🧂', '🍪', '🍩', '🍰', '🧁', '🍫',
  '🍬', '🍭', '☕', '🧃', '🥤', '🧊', '🎒', '👕',
  '👖', '👟', '🧢', '👜', '🔧', '🔨', '🪚', '🪴',
  '📦', '📋', '🧴', '🪥', '🧹', '🪣', '💡', '🔌',
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="form-input"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', fontSize: '1.2rem', padding: '10px 14px',
        }}
      >
        <span>{value || '📦'}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 400 }}>
          {value ? 'Change' : 'Select image'}
        </span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 50,
          marginTop: '4px', padding: '10px',
          background: '#fff', border: '1px solid var(--border-color)',
          borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)',
          gap: '4px', maxWidth: '360px',
        }}>
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => { onChange(emoji); setOpen(false); }}
              style={{
                width: '32px', height: '32px', border: 'none',
                background: value === emoji ? 'var(--primary-light)' : 'transparent',
                borderRadius: '6px', cursor: 'pointer', fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { if (value !== emoji) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={(e) => { if (value !== emoji) e.currentTarget.style.background = 'transparent'; }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
