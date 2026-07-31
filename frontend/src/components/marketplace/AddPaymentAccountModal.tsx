import { useState, useMemo, useEffect } from 'react';
import { X, Search, ArrowLeft, Building2, Wallet, Shield } from 'lucide-react';
import { MOCK_CREDIT_UNIONS } from '../../data/mock-payment-accounts';
import { usePaymentAccountStore } from '../../stores/payment-account.store';
import { useAuthStore } from '../../stores/auth.store';
import { OtpInput } from '../ui/OtpInput';
import type { CreditUnionWithAccounts, CreditUnionAccount } from '../../types/payment-account.type';

interface AddPaymentAccountModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = 'select-cu' | 'select-account' | 'confirm' | 'verify-otp';

const TYPE_LABELS: Record<string, string> = {
  savings: 'Savings',
  chequing: 'Chequing',
  shares: 'Shares',
  fd: 'Term Deposit',
};

function maskAccountNumber(num: string): string {
  if (num.length <= 4) return num;
  return `****${num.slice(-4)}`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(amount);
}

export const AddPaymentAccountModal: React.FC<AddPaymentAccountModalProps> = ({ open, onClose }) => {
  const [step, setStep] = useState<Step>('select-cu');
  const [search, setSearch] = useState('');
  const [selectedCu, setSelectedCu] = useState<CreditUnionWithAccounts | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<CreditUnionAccount | null>(null);
  const [nickname, setNickname] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resendKey, setResendKey] = useState(0);

  const addPaymentAccount = usePaymentAccountStore((s) => s.addPaymentAccount);
  const user = useAuthStore((s) => s.user);

  const filteredCUs = useMemo(
    () => MOCK_CREDIT_UNIONS.filter((cu) => cu.name.toLowerCase().includes(search.toLowerCase())),
    [search],
  );

  const handleBack = () => {
    if (step === 'select-account') {
      setStep('select-cu');
      setSelectedAccount(null);
    } else if (step === 'confirm') {
      setStep('select-account');
    } else if (step === 'verify-otp') {
      setStep('confirm');
      setOtpDigits(Array(6).fill(''));
      setOtpError('');
    }
  };

  const handleClose = () => {
    setStep('select-cu');
    setSearch('');
    setSelectedCu(null);
    setSelectedAccount(null);
    setNickname('');
    setOtpDigits(Array(6).fill(''));
    setOtpError('');
    setResendTimer(0);
    setResendKey(0);
    onClose();
  };

  const handleSelectCu = (cu: CreditUnionWithAccounts) => {
    setSelectedCu(cu);
    setStep('select-account');
  };

  const handleSelectAccount = (acc: CreditUnionAccount) => {
    setSelectedAccount(acc);
    setStep('confirm');
  };

  const handleConfirm = () => {
    if (!selectedCu || !selectedAccount) return;
    setStep('verify-otp');
    setResendTimer(30);
  };

  const handleOtpChange = (digits: string[]) => {
    setOtpDigits(digits);
    setOtpError('');
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setOtpError('Please enter the complete 6-digit code');
      return;
    }
    if (!selectedCu || !selectedAccount) return;
    const result = addPaymentAccount({
      creditUnionId: selectedCu.id,
      creditUnionName: selectedCu.name,
      creditUnionLogo: selectedCu.logo,
      creditUnionColor: selectedCu.color,
      accountNumber: selectedAccount.accountNumber,
      accountName: selectedAccount.accountName,
      accountType: selectedAccount.type,
      balance: selectedAccount.balance,
      currency: selectedAccount.currency,
      nickname: nickname.trim() || undefined,
      isActive: true,
    });
    if (result.success) {
      handleClose();
    }
  };

  const handleResendOtp = () => {
    setResendTimer(30);
    setOtpDigits(Array(6).fill(''));
    setOtpError('');
    setResendKey((k) => k + 1);
  };

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  if (!open) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px',
          width: '100%', maxWidth: '480px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
          animation: 'fadeIn 0.2s ease-out',
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {step !== 'select-cu' && (
              <button
                onClick={handleBack}
                style={{
                  background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer',
                  width: '34px', height: '34px', borderRadius: '10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'var(--transition-fast)',
                }}
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              {step === 'select-cu' && 'Link a Credit Union'}
              {step === 'select-account' && 'Select Account'}
              {step === 'confirm' && 'Confirm & Link'}
              {step === 'verify-otp' && 'Verify OTP'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          padding: '16px 24px 0',
        }}>
          {(['select-cu', 'select-account', 'confirm', 'verify-otp'] as Step[]).map((s, i) => (
            <div key={s} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700,
                background: step === s ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: step === s ? '#fff' : 'var(--text-muted)',
                transition: 'var(--transition-fast)',
              }}>
                {i + 1}
              </div>
              {i < 3 && (
                <div style={{
                  width: '24px', height: '2px', borderRadius: '1px',
                  background: step === s || (i === 2 && step === 'verify-otp') ? 'var(--primary)' : 'var(--bg-tertiary)',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{
          padding: '24px', overflowY: 'auto', flex: 1,
        }}>
          {/* Step 1: Select Credit Union */}
          {step === 'select-cu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-muted)" style={{
                  position: 'absolute', left: '14px', top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
                <input
                  type="text"
                  placeholder="Search credit unions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: '12px',
                    border: '1px solid var(--border-color)', fontSize: '0.88rem',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>
              {filteredCUs.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '32px 16px',
                  fontSize: '0.85rem', color: 'var(--text-muted)',
                }}>
                  No credit unions found matching "{search}"
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {filteredCUs.map((cu) => (
                    <button
                      key={cu.id}
                      onClick={() => handleSelectCu(cu)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 16px', borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        background: '#fff',
                        cursor: 'pointer', width: '100%', textAlign: 'left',
                        transition: 'var(--transition-fast)',
                        fontFamily: 'var(--font-sans)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = cu.color;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${cu.color}15`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: `${cu.color}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.4rem', flexShrink: 0,
                      }}>
                        {cu.logo}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {cu.name}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {cu.description}
                        </div>
                      </div>
                      <ChevronRightIcon color="var(--text-muted)" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Account */}
          {step === 'select-account' && selectedCu && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', background: 'var(--bg-secondary)',
                borderRadius: '12px', marginBottom: '4px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: `${selectedCu.color}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>
                  {selectedCu.logo}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{selectedCu.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {selectedCu.accounts.length} linked account{selectedCu.accounts.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              {selectedCu.accounts.map((acc) => (
                <button
                  key={acc.accountNumber}
                  onClick={() => handleSelectAccount(acc)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '14px 16px', borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    background: '#fff', cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'var(--transition-fast)',
                    fontFamily: 'var(--font-sans)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '10px',
                    background: 'var(--primary-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, color: 'var(--primary)',
                  }}>
                    <Wallet size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {acc.accountName}
                      </span>
                      <span style={{
                        fontSize: '0.65rem', fontWeight: 600, padding: '2px 8px',
                        borderRadius: '20px',
                        background: TYPE_LABELS[acc.type] === 'Savings' ? '#eef2ff' : TYPE_LABELS[acc.type] === 'Chequing' ? '#f0fdf4' : TYPE_LABELS[acc.type] === 'Term Deposit' ? '#fef2f2' : '#f5f3ff',
                        color: TYPE_LABELS[acc.type] === 'Savings' ? '#4f46e5' : TYPE_LABELS[acc.type] === 'Chequing' ? '#16a34a' : TYPE_LABELS[acc.type] === 'Term Deposit' ? '#dc2626' : '#7c3aed',
                        whiteSpace: 'nowrap',
                      }}>
                        {TYPE_LABELS[acc.type]}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                      {maskAccountNumber(acc.accountNumber)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatCurrency(acc.balance)}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {acc.currency}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 4: Verify OTP */}
          {step === 'verify-otp' && selectedCu && selectedAccount && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'var(--primary-light)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <Shield size={32} />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Verification Code
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  A 6-digit code has been sent to{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {user?.phone
                      ? `+94 ${user.phone.slice(0, 2)}*****${user.phone.slice(-2)}`
                      : 'your registered phone'}
                  </strong>
                </div>
              </div>

              <OtpInput
                key={resendKey}
                digits={otpDigits}
                onChange={handleOtpChange}
                error={!!otpError}
              />

              {otpError && (
                <div style={{
                  fontSize: '0.78rem', color: '#dc2626', fontWeight: 500,
                  marginTop: '-16px',
                }}>
                  {otpError}
                </div>
              )}

              <button
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
                style={{
                  background: 'none', border: 'none', cursor: resendTimer > 0 ? 'default' : 'pointer',
                  fontSize: '0.82rem', fontWeight: 600,
                  color: resendTimer > 0 ? 'var(--text-muted)' : 'var(--primary)',
                  fontFamily: 'var(--font-sans)',
                  padding: '4px 8px',
                }}
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
              </button>

              <button
                onClick={handleVerifyOtp}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px',
                  fontSize: '0.9rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Shield size={18} />
                Verify & Link Account
              </button>
            </div>
          )}
          {step === 'confirm' && selectedCu && selectedAccount && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                padding: '20px', borderRadius: '16px',
                background: 'var(--bg-secondary)',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  marginBottom: '16px', paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: `${selectedCu.color}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}>
                    {selectedCu.logo}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {selectedCu.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Credit Union
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Account
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {selectedAccount.accountName}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Account Number
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, fontFamily: 'monospace' }}>
                      {maskAccountNumber(selectedAccount.accountNumber)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Type
                    </div>
                    <div>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '2px 10px',
                        borderRadius: '20px',
                        background: selectedAccount.type === 'savings' ? '#eef2ff' : selectedAccount.type === 'chequing' ? '#f0fdf4' : selectedAccount.type === 'fd' ? '#fef2f2' : '#f5f3ff',
                        color: selectedAccount.type === 'savings' ? '#4f46e5' : selectedAccount.type === 'chequing' ? '#16a34a' : selectedAccount.type === 'fd' ? '#dc2626' : '#7c3aed',
                      }}>
                        {TYPE_LABELS[selectedAccount.type]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Balance
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                      {formatCurrency(selectedAccount.balance)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{
                  fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)',
                  display: 'block', marginBottom: '6px',
                }}>
                  Nickname <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., My Savings, Salary Account"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '12px',
                    border: '1px solid var(--border-color)', fontSize: '0.88rem',
                    outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>

              <button
                onClick={handleConfirm}
                className="btn btn-primary"
                style={{
                  padding: '14px', borderRadius: '14px',
                  fontSize: '0.9rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                <Building2 size={18} />
                Link Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
