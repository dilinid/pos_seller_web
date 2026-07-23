import React from "react";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  AtSign,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useRegister } from "../hooks/useRegister";
import { Link } from "react-router-dom";

const Register: React.FC = () => {
  const {
    formData,
    loading,
    ssoLoading,
    error,
    success,
    showPassword,
    handleChanges,
    handleSubmit,
    setShowPassword,
  } = useRegister();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Unified Top Bar Navigation */}
      <Navbar />

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div
          className="premium-card animate-fade-in"
          style={{
            width: "100%",
            maxWidth: "460px",
            padding: "36px",
            background: "#ffffff",
            textAlign: "center",
          }}
        >
          {/* Branding header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "var(--accent-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                color: "var(--accent)",
              }}
            >
              <UserPlus size={26} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.6rem",
                color: "var(--text-primary)",
                marginBottom: "4px",
              }}
            >
              Join Member Network
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "0.85rem",
              }}
            >
              Unified access to fresh shopping & retail banking
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.15)",
                borderRadius: "8px",
                padding: "12px",
                color: "var(--danger)",
                fontSize: "0.85rem",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {success ? (
            <div
              style={{
                background: "var(--accent-light)",
                border: "1px solid rgba(16, 185, 129, 0.2)",
                borderRadius: "8px",
                padding: "20px 12px",
                color: "var(--accent)",
                fontSize: "0.95rem",
                marginBottom: "20px",
                fontWeight: 600,
              }}
            >
              🎉 Account enrolled successfully!
              <br />
              <span
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-secondary)",
                  fontWeight: "normal",
                }}
              >
                Transitioning to secure sign in...
              </span>
            </div>
          ) : (
            <>
              {/* GOOGLE SIGN UP SSO */}
              {/* <button
              type="button"
              className="btn-google"
              onClick={handleGoogleRegister}
              disabled={loading || ssoLoading}
            >
              {ssoLoading ? (
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <span style={{ fontSize: '1.1rem', marginRight: '4px' }}>🔑</span>
              )}
              Sign up with Google
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              margin: '18px 0',
              color: 'var(--text-muted)',
              fontSize: '0.75rem'
            }}>
              <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Or Register Form</span>
              <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div> */}

              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Legal Name
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="name"
                      type="text"
                      className="form-input"
                      placeholder="John Doe"
                      value={formData.fullname}
                      onChange={(e) =>
                        handleChanges("fullname", e.target.value)
                      }
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px" }}
                      required
                    />
                    <User
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label" htmlFor="username">
                    Username
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="username"
                      type="text"
                      className="form-input"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={(e) =>
                        handleChanges("username", e.target.value)
                      }
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px" }}
                    />
                    <AtSign
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* NIC */}
                <div className="form-group">
                  <label className="form-label" htmlFor="nic">
                    NIC Number
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="nic"
                      type="text"
                      className="form-input"
                      placeholder="Enter NIC number"
                      value={formData.nic}
                      onChange={(e) => handleChanges("nic", e.target.value)}
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px" }}
                    />
                    <CreditCard
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                  <label className="form-label" htmlFor="dateOfBirth">
                    Date of Birth
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="dateOfBirth"
                      type="date"
                      className="form-input"
                      value={formData.dob}
                      onChange={(e) => handleChanges("dob", e.target.value)}
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px" }}
                    />
                    <CalendarDays
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Phone contact (mandatory) */}
                <div className="form-group">
                  <label className="form-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="phone"
                      type="tel"
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        handleChanges("phoneNumber", e.target.value)
                      }
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px" }}
                      required
                    />
                    <Phone
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="email"
                      type="email"
                      className="form-input"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleChanges("email", e.target.value)}
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px" }}
                    />
                    <Mail
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Security Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        handleChanges("password", e.target.value)
                      }
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px", paddingRight: "44px" }}
                      required
                    />
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={16} color="var(--text-muted)" />
                      ) : (
                        <Eye size={16} color="var(--text-muted)" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: "28px" }}>
                  <label className="form-label" htmlFor="password">
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder="••••••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleChanges("confirmPassword", e.target.value)
                      }
                      disabled={loading || ssoLoading}
                      style={{ paddingLeft: "44px", paddingRight: "44px" }}
                      required
                    />
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      {showPassword ? (
                        <EyeOff size={16} color="var(--text-muted)" />
                      ) : (
                        <Eye size={16} color="var(--text-muted)" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || ssoLoading}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    borderRadius: "24px",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                      Enrolling...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>
            </>
          )}

          <div
            style={{
              marginTop: "24px",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
            }}
          >
            Already enrolled?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Secure Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
