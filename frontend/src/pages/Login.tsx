import React from 'react';
import { Phone, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const { handleSubmit, loading, error, userName, setUserName, password, setPassword, showPassword, setShowPassword } = useAuth();
  

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Unified Top Bar Navigation */}
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
      
      <div className="premium-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '36px',
        background: '#ffffff',
        textAlign: 'center'
      }}>
        {/* Portal Branding */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            color: 'var(--primary)'
          }}>
            <LogIn size={26} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>Secure Sign In</h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>Access fresh carts and connected finance accounts</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '8px',
            padding: '12px',
            color: 'var(--danger)',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {/* GOOGLE SIGN IN SSO */}
        {/* <button
          type="button"
          className="btn-google"
          onClick={handleGoogleLogin}
          disabled={loading || ssoLoading}
        >
          {ssoLoading ? (
            <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <span style={{ fontSize: '1.1rem', marginRight: '4px' }}>🔑</span>
          )}
          Continue with Google
        </button> */}
{/* 
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
          color: 'var(--text-muted)',
          fontSize: '0.78rem'
        }}>
          <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Or email/phone</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div> */}

        <form onSubmit={handleSubmit}>
          {/* Phone or Email field */}
          <div className="form-group">
            <label className="form-label" htmlFor="phoneOrEmail">Username</label>
            <div style={{ position: 'relative' }}>
              <input
                id="username"
                type="text"
                className="form-input"
                placeholder="Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
                required
              />
              <Phone size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="password">Security Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                required
              />
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
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

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px 20px', borderRadius: '24px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Authenticating...
              </>
            ) : (
              'Sign In Securely'
            )}
          </button>
        </form>

        {/* Redirect */}
        <div style={{
          marginTop: '24px',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)'
        }}>
          New to the portal?{' '}
          <Link to="/register" style={{
            color: 'var(--primary)',
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  </div>
);
};

export default Login;
