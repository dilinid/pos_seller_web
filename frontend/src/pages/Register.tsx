import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Lock, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useSignup } from '../hooks/useSignup';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const {
    name, setName,
    email, setEmail,
    phone, setPhone,
    address, setAddress,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPassword, setShowPassword,
    error,
    loading,
    handleSubmit,
  } = useSignup();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
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
        maxWidth: '460px',
        padding: '36px',
        background: '#ffffff',
        textAlign: 'center'
      }}>
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
            <UserPlus size={26} />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            color: 'var(--text-primary)',
            marginBottom: '4px'
          }}>Create Your Account</h2>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>Join to start shopping fresh carts</p>
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

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
                required
                maxLength={60}
              />
              <User size={16} color="var(--text-muted)" style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
                required
                maxLength={40}
              />
              <Mail size={16} color="var(--text-muted)" style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number (optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
                maxLength={30}
              />
              <Phone size={16} color="var(--text-muted)" style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="address">Address (optional)</label>
            <div style={{ position: 'relative' }}>
              <input
                id="address"
                type="text"
                className="form-input"
                placeholder="Street, city"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
                maxLength={40}
              />
              <MapPin size={16} color="var(--text-muted)" style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
                required
                maxLength={500}
              />
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0
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

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{ paddingLeft: '44px' }}
                required
                maxLength={500}
              />
              <Lock size={16} color="var(--text-muted)" style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px 20px', borderRadius: '24px' }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign In
          </span>
        </p>
      </div>
    </div>
  </div>
  );
};

export default Register;
