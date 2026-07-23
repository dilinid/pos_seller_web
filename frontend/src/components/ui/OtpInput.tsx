import { useRef, useEffect, useCallback } from 'react';

interface OtpInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  error?: boolean;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ digits, onChange, error, disabled }) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = useCallback((index: number, value: string) => {
    const digit = value.slice(-1);
    if (!/^\d$/.test(digit) && value !== '') return;

    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      onChange(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [digits, onChange]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (digits[index]) {
        newDigits[index] = '';
        onChange(newDigits);
      } else if (index > 0) {
        newDigits[index - 1] = '';
        onChange(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
  }, [digits, onChange]);

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleDigitChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          style={{
            width: '44px', height: '52px', textAlign: 'center',
            fontSize: '1.3rem', fontWeight: 700, fontFamily: 'monospace',
            border: error ? '2px solid #dc2626' : '2px solid var(--border-color)',
            borderRadius: '12px', outline: 'none',
            color: 'var(--text-primary)', background: '#fff',
            transition: 'var(--transition-fast)',
          }}
        />
      ))}
    </div>
  );
};
