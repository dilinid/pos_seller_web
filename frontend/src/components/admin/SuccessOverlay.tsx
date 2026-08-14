import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessOverlayProps {
  visible: boolean;
  title?: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

export const SuccessOverlay: React.FC<SuccessOverlayProps> = ({
  visible,
  title = 'Success!',
  message,
  duration = 2000,
  onClose,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration, onClose]);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        animation: 'fadeIn 0.2s ease-out',
        textAlign: 'center',
        padding: '48px 32px 40px',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: '#f0fdf4', color: '#16a34a',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CheckCircle size={36} />
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: '#1e293b' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
          {message}
        </p>
      </div>
    </div>
  );
};
