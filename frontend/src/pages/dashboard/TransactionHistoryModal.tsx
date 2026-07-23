import type { RefObject, UIEvent } from "react";
import { Loader2 } from "lucide-react";
import type {
  DashboardSelectedAccount,
  DashboardTransaction,
} from "./dashboard.types";
import { formatCurrency } from "./dashboard.utils";

interface TransactionHistoryModalProps {
  account: DashboardSelectedAccount | null;
  transactionFeed: DashboardTransaction[];
  hasMoreTransactions: boolean;
  loadingMoreTransactions: boolean;
  onClose: () => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  transactionScrollRef: RefObject<HTMLDivElement | null>;
}

const TransactionHistoryModal = ({
  account,
  transactionFeed,
  hasMoreTransactions,
  loadingMoreTransactions,
  onClose,
  onScroll,
  transactionScrollRef,
}: TransactionHistoryModalProps) => {
  if (!account) {
    return null;
  }

  const renderChargeDetail = (
    label: string,
    amount: number,
    tone: "primary" | "warning",
  ) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "0.72rem",
        lineHeight: 1.2,
        marginTop: "4px",
      }}
    >
      <span style={{ color: "var(--text-muted)" }}>{label}:</span>
      <span
        style={{
          fontWeight: 600,
          color: tone === "primary" ? "var(--text-primary)" : "var(--text-primary)",
        }}
      >
        {formatCurrency(amount)}
      </span>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(17, 24, 39, 0.4)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        padding: "20px",
      }}
    >
      <div
        className="premium-card animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Transaction history"
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
          overflow: "hidden",
          border: "none",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)",
            padding: "24px",
            color: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <span
              style={{
                fontSize: "0.72rem",
                letterSpacing: "0.05em",
                opacity: 0.8,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Account Ledger Sync
            </span>
            <h3
              style={{
                fontSize: "1.2rem",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                margin: "4px 0",
                color: "#ffffff",
              }}
            >
              {account.type}
            </h3>
            <span
              style={{
                fontSize: "0.78rem",
                fontFamily: "var(--font-display)",
                opacity: 0.9,
              }}
            >
              {account.accNo}
            </span>
          </div>

          <div style={{ textAlign: "right" }}>
            <span
              style={{
                fontSize: "0.72rem",
                opacity: 0.8,
                display: "block",
                fontWeight: 600,
              }}
            >
              Active Balance
            </span>
            <span
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
              }}
            >
              {account.balanceText}
            </span>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
              Recent Transaction History
            </h4>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: "10px",
                background: "var(--primary-light)",
                color: "var(--primary)",
              }}
            >
              {transactionFeed.length} total logs
            </span>
          </div>

          <div
            ref={transactionScrollRef}
            className="drawer-scroll"
            onScroll={onScroll}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minHeight: "280px",
              maxHeight: "380px",
              paddingRight: "6px",
              overscrollBehavior: "contain",
            }}
          >
            {!loadingMoreTransactions && transactionFeed.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 0",
                  color: "var(--text-secondary)",
                }}
              >
                No transactions recorded for this account.
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    flex: 1,
                  }}
                >
                  {transactionFeed.map((tx) => (
                    <div
                      key={tx.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        borderRadius: "8px",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-color)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div style={{ textAlign: "left" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-primary)",
                            display: "block",
                          }}
                        >
                          {tx.desc}
                        </span>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {tx.date}
                        </span>

                        {((tx.interest ?? tx.intrest ?? 0) > 0 ||
                          (tx.otherCharges ?? 0) > 0) && (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "2px",
                              marginTop: "6px",
                            }}
                          >
                            {(tx.interest ?? tx.intrest ?? 0) > 0
                              ? renderChargeDetail(
                                  "Interest",
                                  tx.interest ?? tx.intrest ?? 0,
                                  "primary",
                                )
                              : null}
                            {(tx.otherCharges ?? 0) > 0
                              ? renderChargeDetail(
                                  "Other charges",
                                  tx.otherCharges ?? 0,
                                  "warning",
                                )
                              : null}
                          </div>
                        )}
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            color:
                              tx.amount === 0
                                ? "var(--text-secondary)"
                                : tx.type === "Credit"
                                  ? "var(--accent)"
                                  : "var(--danger)",
                            display: "block",
                          }}
                        >
                          {tx.amount === 0
                            ? "--"
                            : tx.type === "Credit"
                              ? `+${formatCurrency(tx.amount)}`
                              : `-${formatCurrency(tx.amount)}`}
                        </span>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            color: "var(--text-secondary)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            display: "inline-block",
                            marginTop: "2px",
                          }}
                        >
                          {formatCurrency(tx.balance)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {loadingMoreTransactions ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                      padding: "8px 0 2px",
                    }}
                  >
                    <Loader2 size={14} className="animate-spin" />
                    Loading transactions...
                  </div>
                ) : null}

                {!hasMoreTransactions && transactionFeed.length > 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "0.76rem",
                      color: "var(--text-muted)",
                      paddingTop: "4px",
                    }}
                  >
                    End of recent history
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-secondary)",
            padding: "16px 24px",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{
              padding: "8px 20px",
              fontSize: "0.85rem",
              borderRadius: "20px",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryModal;
