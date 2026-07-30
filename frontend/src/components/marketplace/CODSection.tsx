import { useMemo } from 'react';
import { Banknote, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import type { CODRequest } from '../../types/cod.type';
import type { UserProfile } from '../../types/profile.type';
import type { Order } from '../../types/marketplace.type';
import { checkCODEligibility } from '../../stores/cod.store';

interface CODSectionProps {
  user: UserProfile | null;
  orders: Order[];
  codState: CODRequest;
  onRequestCOD: () => void;
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export const CODSection: React.FC<CODSectionProps> = ({ user, orders, codState, onRequestCOD }) => {
  const { criteria, allMet } = useMemo(() => checkCODEligibility(user, orders), [user, orders]);

  const needsRequest = codState.status === 'not_requested' || codState.status === 'rejected';

  return (
    <div className="premium-card animate-fade-in" style={{ padding: '24px', background: '#fff', marginTop: '16px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: '#fef3c7', color: '#d97706',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Banknote size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Cash on Delivery
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Pay in cash when your order arrives
            </p>
          </div>
        </div>
        {codState.status === 'approved' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 12px', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 700,
            color: '#16a34a', background: '#dcfce7',
          }}>
            <CheckCircle size={12} />
            Enabled
          </span>
        )}
        {codState.status === 'pending' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '4px 12px', borderRadius: '20px',
            fontSize: '0.72rem', fontWeight: 700,
            color: '#d97706', background: '#fef3c7',
          }}>
            <Clock size={12} />
            Pending
          </span>
        )}
      </div>

      {codState.status === 'approved' && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          fontSize: '0.85rem', color: '#16a34a', lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>COD is enabled for your account</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
            You can select "Cash on Delivery" at checkout.
            {codState.approvedAt && <span> Approved {formatDate(codState.approvedAt)}.</span>}
          </div>
        </div>
      )}

      {codState.status === 'pending' && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: '#fffbeb', border: '1px solid #fde68a',
          fontSize: '0.85rem', color: '#92400e', lineHeight: 1.5,
        }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>Your request is under review</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>
            {codState.requestedAt && <>Requested {formatDate(codState.requestedAt)}.</>}
            {' '}We'll notify you once it's approved.
          </div>
        </div>
      )}

      {codState.status === 'rejected' && (
        <div style={{
          padding: '14px 16px', borderRadius: '12px',
          background: '#fef2f2', border: '1px solid #fecaca',
          fontSize: '0.85rem', color: '#dc2626', lineHeight: 1.5, marginBottom: '16px',
        }}>
          <div style={{ fontWeight: 600, marginBottom: '2px' }}>Request was not approved</div>
          {codState.rejectionReason && (
            <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>{codState.rejectionReason}</div>
          )}
          {codState.rejectedAt && (
            <div style={{ fontSize: '0.78rem', opacity: 0.8 }}>Rejected {formatDate(codState.rejectedAt)}</div>
          )}
        </div>
      )}

      {needsRequest && (
        <>
          <div style={{
            padding: '16px', borderRadius: '12px',
            background: 'var(--bg-secondary)', marginBottom: '16px',
          }}>
            <div style={{
              fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}>
              Eligibility Requirements
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criteria.map((c) => (
                <div
                  key={c.key}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: c.met ? '#f0fdf4' : '#fef2f2',
                  }}
                >
                  <span style={{
                    fontSize: '0.82rem', flexShrink: 0,
                    color: c.met ? '#16a34a' : '#dc2626',
                  }}>
                    {c.met ? '✅' : '❌'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.82rem', fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}>
                      {c.label}
                    </div>
                    {c.detail && (
                      <div style={{
                        fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px',
                      }}>
                        {c.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={onRequestCOD}
            disabled={!allMet}
            className="btn btn-primary"
            style={{
              padding: '10px 20px', borderRadius: '10px',
              fontSize: '0.82rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '6px',
              width: '100%', justifyContent: 'center',
              opacity: allMet ? 1 : 0.5,
              cursor: allMet ? 'pointer' : 'not-allowed',
            }}
          >
            {codState.status === 'rejected' ? 'Request Again' : 'Request Cash on Delivery'}
            <ArrowRight size={14} />
          </button>
        </>
      )}
    </div>
  );
};
