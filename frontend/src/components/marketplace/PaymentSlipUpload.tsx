import { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import type { PaymentStatus } from '../../types/marketplace.type';

interface PaymentSlipUploadProps {
  orderId: string;
  currentStatus: PaymentStatus;
  onUpload: (file: File) => void;
}

export const PaymentSlipUpload: React.FC<PaymentSlipUploadProps> = ({ orderId, currentStatus, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const isAwaiting = currentStatus === 'awaiting_receipt' || currentStatus === 'pending';
  const alreadyUploaded = currentStatus === 'awaiting_receipt';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    onUpload(selectedFile);
    setUploaded(true);
  };

  if (uploaded) {
    return (
      <div style={{
        padding: '10px', borderRadius: '8px', background: '#f0fdf4',
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600,
        color: '#16a34a',
      }}>
        <CheckCircle size={16} />
        Receipt uploaded successfully!
      </div>
    );
  }

  if (!isAwaiting) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        Payment Receipt
        {alreadyUploaded && (
          <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 500, marginLeft: '4px' }}>
            (awaiting confirmation)
          </span>
        )}
      </div>

      {!selectedFile ? (
        <button
          onClick={() => document.getElementById(`slip-upload-${orderId}`)?.click()}
          className="btn btn-secondary"
          style={{
            width: '100%', padding: '8px 14px', borderRadius: '10px',
            fontSize: '0.8rem', gap: '6px',
            border: '1px dashed var(--border-color)',
            background: 'var(--bg-secondary)',
          }}
        >
          <Upload size={14} />
          Choose Receipt
        </button>
      ) : (
        <div style={{
          padding: '10px', borderRadius: '8px', background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <FileText size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleUpload}
          className="btn btn-primary"
          style={{
            width: '100%', padding: '8px 14px', borderRadius: '10px',
            fontSize: '0.8rem', gap: '5px',
          }}
        >
          <Upload size={13} /> Upload Receipt
        </button>
      )}

      <input
        id={`slip-upload-${orderId}`}
        type="file"
        accept="image/*,.pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};
