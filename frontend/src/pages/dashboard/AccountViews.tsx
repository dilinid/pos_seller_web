import type { FC } from "react";
import { BadgePercent, CreditCard, Landmark, Loader2 } from "lucide-react";
import { formatCurrency } from "./dashboard.utils";
import type {
  FixedDeposit,
  LoanAccount,
  SharePortfolio,
  SavingAccount,
} from "../../contexts/BankContext";
import type { DashboardGuaranteedLoan } from "./dashboard.types";

interface SavingsAccountsViewProps {
  savings: SavingAccount[];
  totalSavings: number;
  loading: boolean;
  onSelectAccount: (accountNo: string) => void;
}

interface LoansViewProps {
  loans: LoanAccount[];
  loading: boolean;
  onSelectAccount: (accountNo: string) => void;
}

interface FixedDepositsViewProps {
  fixedDeposits: FixedDeposit[];
  loading: boolean;
  onSelectAccount: (accountNo: string) => void;
}

interface SharesViewProps {
  shares: SharePortfolio[];
  loading: boolean;
  onSelectAccount: (accountNo: string) => void;
}

interface GuaranteedLoansViewProps {
  loans: DashboardGuaranteedLoan[];
  loading: boolean;
}

const ViewCardTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <>
    <h3
      style={{
        fontSize: "1.25rem",
        marginBottom: "4px",
        fontFamily: "var(--font-display)",
      }}
    >
      {title}
    </h3>
    <p
      style={{
        color: "var(--text-secondary)",
        marginBottom: "24px",
        fontSize: "0.82rem",
      }}
    >
      {description}
    </p>
  </>
);

export const SavingsAccountsView: FC<SavingsAccountsViewProps> = ({
  savings,
  totalSavings,
  loading,
  onSelectAccount,
}) => {
  return (
    <div
      className="premium-card animate-fade-in"
      style={{ padding: "32px", minHeight: "380px", background: "#ffffff" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div style={{ textAlign: "left" }}>
          <ViewCardTitle
            title="Checking & Savings Ledgers"
            description="Cooperative high-yield accounts synced cleanly."
          />
        </div>
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--primary)",
            padding: "6px 14px",
            borderRadius: "16px",
            background: "var(--primary-light)",
          }}
        >
          Total Savings: {formatCurrency(totalSavings)}
        </span>
      </div>

      {loading && savings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      ) : savings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          No active savings linked with this bank.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {savings.map((saving) => (
            <button
              key={saving.accNo}
              type="button"
              onClick={() =>
                onSelectAccount(saving.accNo)
              }
              className="premium-card"
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
              }}
              title="Click to view transaction history"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <CreditCard size={18} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {saving.type}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {saving.accNo}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "40px", textAlign: "right" }}>
                {/* <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>Yield</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {saving.interestRate}%
                </span>
              </div> */}
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      display: "block",
                    }}
                  >
                    Balance
                  </span>
                  <span
                    style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {formatCurrency(saving.balance)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const LoansView: FC<LoansViewProps> = ({ loans, loading, onSelectAccount }) => {
  const loanStatus = [
    { id: 1, name: "Disbursed", color: "var(--primary-blue)" },
    { id: 2, name: "Pending", color: "var(--primary-orange)" },
    { id: 3, name: "Approved", color: "var(--primary-green)" },
    { id: 4, name: "Rejected", color: "var(--primary-red)" },
    { id: 0, name: "Closed", color: "var(--primary-gray)" },
  ];

  return (
    <div
      className="premium-card animate-fade-in"
      style={{ padding: "32px", minHeight: "380px", background: "#ffffff" }}
    >
      <ViewCardTitle
        title="Connected Loan Placements"
        description="Vehicle, home, or agricultural cooperative capital liabilities."
      />

      {loading && loans.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      ) : loans.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          Zero active loans or liabilities linked with this bank.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {loans.map((loan) => {
            const paidPercent =
              loan.capital > 0
                ? Math.max(
                    0,
                    Math.min(
                      100,
                      Math.round(
                        ((loan.capital - loan.balance) / loan.capital) * 100,
                      ),
                    ),
                  )
                : 0;

            return (
              <button
                key={loan.loanNo}
                type="button"
                onClick={() =>
                  onSelectAccount(loan.loanNo)
                }
                className="premium-card"
                style={{
                  padding: "24px",
                  background: "var(--bg-secondary)",
                  cursor: "pointer",
                  border: "1px solid var(--border-color)",
                  textAlign: "left",
                }}
                title="Click to view payment installment history"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <h4 style={{ fontSize: "1rem", fontWeight: 600 }}>
                      {loan.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {loan.loanNo}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: loanStatus.find((s) => s.id === loan.status)
                        ?.color,
                    }}
                  >
                    {loanStatus.find((s) => s.id === loan.status)?.name}
                  </span>
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      Paid: {formatCurrency(loan.capital - loan.balance)}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      Remaining: {formatCurrency(loan.balance)}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#e5e7eb",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${paidPercent}%`,
                        height: "100%",
                        background: "var(--primary)",
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>

                <div
                  className="grid-3"
                  style={{
                    background: "#ffffff",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    gap: "10px",
                  }}
                >
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Balance
                    </span>
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--primary)",
                      }}
                    >
                      {formatCurrency(loan.balance)}
                    </span>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Installment
                    </span>
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                      }}
                    >
                      {formatCurrency(loan.installment || 0)}
                    </span>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Interest
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {formatCurrency(loan.interest || 0)}
                    </span>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Fees
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {formatCurrency(loan.fee || 0)}
                    </span>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Past Due
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {formatCurrency(loan.pastDue || 0)}
                    </span>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Past Due Days
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {loan.pastDueDays || 0}
                    </span>
                  </div>

                  <div style={{ textAlign: "left" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Total Arrears
                    </span>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      {formatCurrency(loan.totalArrears || 0)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const FixedDepositsView: FC<FixedDepositsViewProps> = ({
  fixedDeposits,
  onSelectAccount,
  loading,
}) => {
  return (
    <div
      className="premium-card animate-fade-in"
      style={{ padding: "32px", minHeight: "380px", background: "#ffffff" }}
    >
      <ViewCardTitle
        title="Active Term Placements (FD)"
        description="Guaranteed high-yield maturity placement certificates."
      />

      {loading && fixedDeposits.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      ) : fixedDeposits.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          No active Fixed Deposits linked with this bank.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {fixedDeposits.map((fd) => (
            <button
              key={fd.fdNo}
              type="button"
              onClick={() =>
                onSelectAccount(fd.fdNo)
              }
              className="premium-card"
              style={{
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "var(--bg-secondary)",
                cursor: "pointer",
                border: "1px solid var(--border-color)",
                textAlign: "left",
                width: "100%",
              }}
              title="Click to view term deposit transactions"
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "14px" }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    background: "var(--accent-light)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--accent)",
                    border: "1px solid rgba(16,185,129,0.1)",
                  }}
                >
                  <Landmark size={18} />
                </div>
                <div style={{ textAlign: "left" }}>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                    {fd.name}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {fd.fdNo}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "32px", textAlign: "right" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      display: "block",
                    }}
                  >
                    Balance
                  </span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>
                    {formatCurrency(fd.balance)}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      display: "block",
                    }}
                  >
                    Interest Rate
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--accent)",
                    }}
                  >
                    {fd.interestRate}%
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      display: "block",
                    }}
                  >
                    Open Date
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {fd.openDate}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      display: "block",
                    }}
                  >
                    Renew Date
                  </span>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                    {fd.renewDate}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const SharesView: FC<SharesViewProps> = ({
  shares,
  loading,
  onSelectAccount,
}) => {
  return (
    <div
      className="premium-card animate-fade-in"
      style={{ padding: "32px", minHeight: "380px", background: "#ffffff" }}
    >
      <ViewCardTitle
        title="Cooperative Equity Shares"
        description="Corporate holding shares registered under your membership."
      />

      {loading && shares.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      ) : shares.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          No shares registered under this bank system.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {shares.map((share) => (
            <button
              key={share.shareNo}
              type="button"
              onClick={() =>
                onSelectAccount(share.shareNo)
              }
              className="premium-card"
              style={{
                padding: "20px",
                background: "var(--bg-secondary)",
                cursor: "pointer",
                border: "1px solid var(--border-color)",
                textAlign: "left",
                width: "100%",
              }}
              title="Click to view share transactions"
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "14px" }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      background: "#ffffff",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--warning)",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    <BadgePercent size={20} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                      {share.name}
                    </h4>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {share.shareNo}
                    </span>
                  </div>
                </div>

                <div
                  style={{ display: "flex", gap: "28px", textAlign: "right" }}
                >
                  {/* <div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Avg Cost
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {formatCurrency(share.averageCost)}
                    </span>
                  </div> */}

                  {/* <div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Current Price
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {formatCurrency(share.currentPrice)}
                    </span>
                  </div> */}

                  <div>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        color: "var(--text-muted)",
                        display: "block",
                      }}
                    >
                      Balance
                    </span>
                    <span
                      style={{
                        fontSize: "1rem",
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      {formatCurrency(share.balance)}
                    </span>
                  </div>

                  {/* <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "3px 8px",
                        borderRadius: "10px",
                        background:
                          share.changePercent > 0
                            ? "var(--accent-light)"
                            : "rgba(239,68,68,0.08)",
                        color:
                          share.changePercent > 0
                            ? "var(--accent)"
                            : "var(--danger)",
                        fontWeight: 700,
                      }}
                    >
                      {share.changePercent > 0 ? "+" : ""}
                      {share.changePercent}%
                    </span>
                  </div> */}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const GuaranteedLoansView: FC<GuaranteedLoansViewProps> = ({
  loans,
  loading,
}) => {
  return (
    <div
      className="premium-card animate-fade-in"
      style={{ padding: "32px", minHeight: "380px", background: "#ffffff" }}
    >
      <ViewCardTitle
        title="Guaranteed Loans"
        description="Loans where you are acting as guarantor or co-signer for another member."
      />

      {loading && loans.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          <Loader2 size={28} className="animate-spin" color="var(--primary)" />
        </div>
      ) : loans.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 0",
            color: "var(--text-secondary)",
          }}
        >
          No guaranteed obligations found for this account.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {loans.map((loan) => (
            <div
              key={loan.loanNo}
              className="premium-card"
              style={{
                padding: "20px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "16px",
                  marginBottom: "14px",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "4px",
                    }}
                  >
                    {loan.name}
                  </h4>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {loan.loanNo}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: "999px",
                    background: "rgba(15,23,42,0.08)",
                    color: "var(--text-primary)",
                  }}
                >
                  Guaranteed
                </span>
              </div>

              <div style={{ textAlign: "left", marginBottom: "14px" }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    display: "block",
                  }}
                >
                  Borrower
                </span>
                <span style={{ fontSize: "0.95rem", fontWeight: 700 }}>
                  {loan.borrower}
                </span>
              </div>

              <div
                className="grid-3"
                style={{
                  background: "#ffffff",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  gap: "10px",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Balance
                  </span>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: "var(--primary)",
                    }}
                  >
                    {formatCurrency(loan.balance || 0)}
                  </span>
                </div>
                <div style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Past Due
                  </span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                    {formatCurrency(loan.pastDue || 0)}
                  </span>
                </div>
                
                <div style={{ textAlign: "left" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Past Due Days
                  </span>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                    {loan.pastDueDays || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
