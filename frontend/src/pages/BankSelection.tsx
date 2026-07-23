import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Handshake, Landmark, Loader2 } from "lucide-react";
import Navbar from "../components/Navbar";
import SidebarMenu from "../components/SidebarMenu";
import { useDashboard } from "../hooks/useDashboard";
import type { Bank } from "../types/bank.type";
import type { CreditUnion } from "../types/credit-union.type";

const BankSelection: React.FC = () => {
  const {
    creditUnions,
    loading,
    setSelectedCreditUnion,
    getCreditUnions,
  } = useDashboard();
  const navigate = useNavigate();
  const [activeNotification, setActiveNotification] = React.useState<
    string | null
  >(null);

  const handleBankClick = (bankId: number) => {
    const selected = creditUnions.find((b) => b.id === bankId);
    if (!selected) {
      setActiveNotification("Bank not found");
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setActiveNotification(null);
      }, 5000);
      return;
    }
    setSelectedCreditUnion(selected);
    setTimeout(() => {
      navigate(`/dashboard/${bankId}`);
    }, 650);
  };

  useEffect(() => {
    if (creditUnions.length === 0) {
      getCreditUnions();
    }
  }, [creditUnions.length, getCreditUnions ]);

  function convertCreditUnionToBank(creditUnion: CreditUnion): Bank {
    return {
      id: creditUnion.id,
      name: creditUnion.nameLn1,
      code: creditUnion.nameLn1
        .toUpperCase()
        .split(" ")
        .map((word) => word[0])
        .join(""),
      color: "linear-gradient(135deg, #f59e0b 0%, #78350f 100%)",
      logo: creditUnion.logo || "🏦",
      accentColor: "#f59e0b",
      desc:
        creditUnion.description ||
        "Apex International Banking - Premier retail & commercial solutions.",
      category: "credit-union",
    };
  }

  const renderBankCard = (bank: Bank) => {
    const isCreditUnion = bank.category === "credit-union";
    return (
      <div
        key={bank.id}
        onClick={() => handleBankClick(bank.id)}
        className="premium-card animate-fade-in"
        style={{
          padding: "24px",
          textAlign: "left",
          cursor: isCreditUnion ? "pointer" : "not-allowed",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "16px",
          minHeight: "186px",
          background: "#ffffff",
          border: "1px solid var(--border-color)",
          opacity: isCreditUnion ? 1 : 0.75,
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "4px",
            height: "100%",
            background: isCreditUnion ? bank.accentColor : "#cbd5e1",
          }}
        />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "14px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "10px",
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src={bank.logo}
                alt={`${bank.name} logo`}
                style={{
                  width: "70%",
                  height: "70%",
                  objectFit: "contain",
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div style={{ minWidth: 0 }}>
              <h3
                style={{
                  fontSize: "1.05rem",
                  fontFamily: "var(--font-display)",
                  color: "var(--text-primary)",
                  margin: 0,
                  lineHeight: 1.2,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {bank.name}
              </h3>
              <span
                style={{
                  fontSize: "0.74rem",
                  color: "var(--text-secondary)",
                  display: "block",
                  marginTop: "4px",
                }}
              >
                {isCreditUnion ? "Credit union" : "Pending integration"}
              </span>
            </div>
          </div>

          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: isCreditUnion ? "var(--primary)" : "var(--text-secondary)",
              padding: "4px 9px",
              borderRadius: "12px",
              background: isCreditUnion ? "var(--primary-light)" : "#eef2f7",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {bank.code}
          </span>
        </div>

        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "0.84rem",
            lineHeight: 1.5,
            margin: 0,
            minHeight: "40px",
          }}
        >
          {bank.desc}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            paddingTop: "14px",
            marginTop: "auto",
            borderTop: "1px solid var(--border-color)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
            }}
          >
            {isCreditUnion ? "Open account" : "Integration pending"}
          </span>
          {isCreditUnion ? (
            <ArrowRight size={14} color="var(--text-muted)" />
          ) : (
            <span
              style={{ fontSize: "0.72rem", fontWeight: 500, color: "#64748b" }}
            >
              Coming soon
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Unified Top Bar Navigation */}
      <Navbar />

      {/* Active Notification Banner */}
      {activeNotification && (
        <div
          style={{
            position: "fixed",
            top: "90px",
            right: "24px",
            background: "var(--primary-dark, #1e1b4b)",
            color: "#ffffff",
            padding: "16px 24px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            zIndex: 1000,
            maxWidth: "450px",
            textAlign: "left",
            borderLeft: "4px solid #f59e0b",
            animation: "slide-in 0.3s ease-out",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: "0.88rem",
                fontWeight: 600,
                color: "#f3f4f6",
              }}
            >
              Access Restricted
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "#d1d5db",
                marginTop: "2px",
                lineHeight: 1.3,
              }}
            >
              {activeNotification}
            </p>
          </div>
          <button
            onClick={() => setActiveNotification(null)}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "1rem",
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Page Layout Wrapper */}
      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          position: "relative",
        }}
      >
        {/* Left Directory Sidebar Menu (Desktop only) */}
        <SidebarMenu />

        {/* Main Container */}
        <main
          style={{
            flex: 1,
            padding: "48px 24px",
            zIndex: 1,
            textAlign: "center",
            overflowX: "hidden",
          }}
        >
          {loading ? (
            <div
              style={{
                height: "350px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              <Loader2
                size={44}
                className="animate-spin"
                color="var(--primary)"
                style={{ animation: "spin 1s linear infinite" }}
              />
              <h4
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--text-secondary)",
                }}
              >
                Verifying credentials with core systems...
              </h4>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  marginBottom: "22px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Landmark size={24} color="var(--primary)" strokeWidth={2} />
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    fontFamily: "var(--font-sans)",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Connected accounts
                </span>
                <div style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(2rem, 4vw, 2.7rem)",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      margin: 0,
                      lineHeight: 1.05,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Accounts
                  </h1>
                </div>
              </div>
              <div
                style={{
                  maxWidth: "840px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "40px",
                }}
              >
                {/* Category 1: Credit Unions */}
                <div style={{ textAlign: "left" }}>
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                      marginTop: "16px",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Handshake size={14} color="var(--accent)" />
                    Credit Unions
                  </h2>
                  <div className="grid-2" style={{ gap: "24px" }}>
                    {creditUnions.map((cu) =>
                      renderBankCard(convertCreditUnionToBank(cu)),
                    )}
                  </div>
                </div>

                {/* Category 2: Banks */}
                {/* <div style={{ textAlign: 'left' }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  🏦 Banks
                </h2>
                <div className="grid-2" style={{ gap: '24px' }}>
                  {regularBanks.map(renderBankCard)}
                </div>
              </div> */}

                {/* Category 3: Credit/Debit Cards */}
                {/* <div style={{ textAlign: 'left' }}>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  💳 Credit/Debit Cards
                </h2>
                <div className="grid-2" style={{ gap: '24px' }}>
                  {creditCards.map(renderBankCard)}
                </div>
              </div> */}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BankSelection;
