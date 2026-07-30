import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMarketplaceStore } from "../stores/marketplace.store";
import {
  Menu,
  ShoppingCart,
  LogOut,
  Search,
  Loader2,
  HelpCircle,
  Package,
  Layers,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSellerStore } from "../stores/seller.store";

interface NavbarProps {
  onCartToggle?: () => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onCartToggle,
  searchQuery = "",
  setSearchQuery,
}) => {
  const { userSession, loading, user, logout } = useAuth();
  const isAuthenticated = !!userSession;
  const isSeller = useSellerStore((s) => (user ? s.isSeller(user.id) : false));
  const hasPending = useSellerStore((s) => (user ? s.hasPendingApplication(user.id) : false));
  const cart = useMarketplaceStore((s) => s.cart);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navigate = useNavigate();
  const location = useLocation();

  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);

  const isShoppingPage = location.pathname === "/";

  return (
    <>
      <style>{`
        @keyframes navbar-loader-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      <nav className="navbar-container">
        {/* LEFT SIDE: MAIN MENU & BRAND LOGO */}
        <div className="navbar-left">
          {/* MAIN MENU DROPDOWN */}
          <div
            className="navbar-menu-button-wrapper"
            style={{ position: "relative" }}
          >
            <button
              onClick={() => setIsMainMenuOpen(!isMainMenuOpen)}
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
                padding: "10px 14px",
                borderRadius: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.88rem",
                transition: "var(--transition-fast)",
              }}
            >
              <Menu size={16} />
            </button>

            {isMainMenuOpen && (
              <div
                className="premium-card animate-fade-in"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  width: "240px",
                  background: "#ffffff",
                  padding: "8px",
                  zIndex: 1100,
                  textAlign: "left",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                }}
              >
                <div
                  style={{
                    padding: "6px 12px 10px 12px",
                    borderBottom: "1px solid var(--border-color)",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 700,
                    }}
                  >
                    Store Directory
                  </span>
                </div>

                <div
                  onClick={() => {
                    setIsMainMenuOpen(false);
                    navigate("/");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    fontSize: "0.88rem",
                    transition: "var(--transition-fast)",
                    marginTop: "4px",
                  }}
                >
                  <Layers size={16} color="var(--text-secondary)" />
                  <span>Departments</span>
                </div>

                {/* Your Orders */}
                <div
                  onClick={() => {
                    setIsMainMenuOpen(false);
                    if (isAuthenticated) {
                      navigate("/orders");
                    } else {
                      localStorage.setItem("auth_redirect", "/orders");
                      navigate("/login");
                    }
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    fontSize: "0.88rem",
                    transition: "var(--transition-fast)",
                  }}
                >
                  <Package size={16} color="var(--text-secondary)" />
                  <span>Your Orders</span>
                </div>

                {/* Help center */}
                <div
                  onClick={() => {
                    setIsMainMenuOpen(false);
                    alert("Help center portal.");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    color: "var(--text-primary)",
                    fontWeight: 500,
                    fontSize: "0.88rem",
                    transition: "var(--transition-fast)",
                  }}
                >
                  <HelpCircle size={16} color="var(--text-secondary)" />
                  <span>Help Center</span>
                </div>
              </div>
            )}
          </div>

          {/* MemberCart Brand Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "1.25rem",
                boxShadow: "0 4px 10px rgba(0, 96, 229, 0.2)",
              }}
            >
              🛒
            </div>
            <div className="navbar-brand-text">
              <h1
                style={{
                  fontSize: "1.2rem",
                  fontFamily: "var(--font-display)",
                  color: "var(--primary)",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                MemberCart
              </h1>
              <span
                style={{
                  fontSize: "0.62rem",
                  color: "var(--text-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 700,
                }}
              >
                Instacart Edition
              </span>
            </div>
          </div>
        </div>

        {/* CENTER: SEARCH INPUT BAR (ONLY FULLY INTERACTIVE ON SHOPPING PAGE, OR REDIRECTS TO /) */}
        <div className="navbar-search-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="Search fresh groceries, organic dairy..."
            value={searchQuery}
            onChange={(e) => {
              if (setSearchQuery) {
                setSearchQuery(e.target.value);
              } else {
                navigate("/");
              }
            }}
            onClick={() => {
              if (!isShoppingPage) {
                navigate("/");
              }
            }}
            style={{
              paddingLeft: "40px",
              paddingRight: "16px",
              borderRadius: "24px",
              background: "var(--bg-secondary)",
              border: "1px solid transparent",
              height: "40px",
              fontSize: "0.9rem",
            }}
          />
          <Search
            size={16}
            color="var(--text-secondary)"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* RIGHT SIDE: BANK SHORTCUT, CART DRAWER, AND MEMBER SIGN-IN */}
        <div className="navbar-right-actions">
          {/* CART DRAWER TOGGLE (Only active/visible on catalog/shopping checkout view) */}
          {onCartToggle && (
            <button
              onClick={onCartToggle}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                padding: "6px",
                color: "var(--text-primary)",
              }}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "var(--primary)",
                    color: "#ffffff",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0, 96, 229, 0.4)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          <span
            style={{
              width: "1px",
              height: "24px",
              background: "var(--border-color)",
            }}
          />

          {/* AUTH ACTIONS */}
          {loading ? (
            <div
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                height: "36px",
                minWidth: "164px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background:
                  "linear-gradient(135deg, var(--bg-secondary), rgba(255,255,255,0.96))",
                border: "1px solid var(--border-color)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.04)",
                color: "var(--text-secondary)",
                fontSize: "0.82rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
              }}
              aria-live="polite"
              aria-label="Checking account status"
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "navbar-loader-spin 0.9s linear infinite",
                  transformOrigin: "50% 50%",
                }}
              >
                <Loader2 size={16} color="var(--primary)" />
              </span>
              <span>Checking account...</span>
            </div>
          ) : isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {isSeller ? (
                <button
                  onClick={() => navigate('/seller/dashboard')}
                  style={{
                    background: 'var(--primary-light)', border: 'none', cursor: 'pointer',
                    color: 'var(--primary)', fontWeight: 600,
                    fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px',
                    fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
                    lineHeight: 1.4,
                  }}
                  title="Go to seller dashboard"
                >
                  My Store
                </button>
              ) : hasPending ? (
                <span style={{
                  fontSize: '0.75rem', color: '#d97706', fontWeight: 600,
                  background: '#fef3c7', padding: '4px 12px', borderRadius: '20px',
                  whiteSpace: 'nowrap', lineHeight: 1.4,
                }}>
                  ⏳ Pending Review
                </span>
              ) : null}
              <div
                onClick={() => navigate("/profile")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
                title="Open Profile Settings"
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    border: "1px solid var(--primary-glow)",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    justifyContent: "center",
                    color: "var(--primary)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  {user?.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profilePicture}`}
                      alt="profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    user?.name?.charAt(0) || "U"
                  )}
                </div>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
                title="Sign Out Portal"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-secondary"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  borderRadius: "20px",
                  height: "36px",
                }}
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn btn-primary"
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  borderRadius: "20px",
                  height: "36px",
                }}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
