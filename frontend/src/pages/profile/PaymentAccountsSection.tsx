import { CreditCard, Plus, Building2, Trash2 } from 'lucide-react';
import type { PaymentAccount } from '../../types/payment-account.type';

interface PaymentAccountsSectionProps {
  accounts: PaymentAccount[];
  onRemove: (id: string) => void;
  onAdd: () => void;
}

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return `****${num.slice(-4)}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);
}

const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  savings: 'Savings',
  chequing: 'Chequing',
  shares: 'Shares',
  fd: 'Term Deposit',
};

export const PaymentAccountsSection: React.FC<PaymentAccountsSectionProps> = ({ accounts, onRemove, onAdd }) => {
  return (
    <div className="premium-card animate-fade-in" style={{ padding: '24px', background: '#fff' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CreditCard size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
              Linked Payment Accounts
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
              Credit union accounts used for checkout payments
            </p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="btn btn-primary"
          style={{
            padding: '8px 16px', borderRadius: '10px',
            fontSize: '0.78rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <Plus size={14} />
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '32px 16px',
          background: 'var(--bg-secondary)', borderRadius: '12px',
        }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px', color: 'var(--text-muted)',
          }}>
            <Building2 size={22} />
          </div>
          <p style={{
            fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)',
            margin: '0 0 4px',
          }}>
            No payment accounts linked yet
          </p>
          <p style={{
            fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5,
          }}>
            Link a credit union account to use it as a payment method during checkout.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {accounts.map((acc) => (
            <div
              key={acc.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: '12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: `${acc.creditUnionColor}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', flexShrink: 0,
              }}>
                {acc.creditUnionLogo}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {acc.nickname || acc.accountName}
                  </span>
                  <span style={{
                    fontSize: '0.62rem', fontWeight: 600, padding: '2px 8px',
                    borderRadius: '20px', background: 'var(--primary-light)',
                    color: 'var(--primary)', whiteSpace: 'nowrap',
                  }}>
                    {ACCOUNT_TYPE_LABEL[acc.accountType] || acc.accountType}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {acc.creditUnionName} · {maskAccountNumber(acc.accountNumber)}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatCurrency(acc.balance)}
                </div>
              </div>
              <button
                onClick={() => onRemove(acc.id)}
                title="Remove account"
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'none', border: '1px solid var(--border-color)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0,
                  transition: 'var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fecaca';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
