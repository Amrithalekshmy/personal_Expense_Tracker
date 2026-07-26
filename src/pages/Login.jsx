// Login.jsx — Public login page with email + password form
// No real auth — clicking login routes to /dashboard

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    // Mock login — navigate directly to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">💰 ExpenseTrack</div>
        <h2 className="auth-tagline">Your money,<br />under control.</h2>
        <p className="auth-desc">
          Track every rupee, set budgets, and understand your spending habits with beautiful reports.
        </p>
        <div className="auth-features">
          {['Free to use', 'No credit card', 'Instant access'].map(f => (
            <span key={f} className="auth-feature-pill">✓ {f}</span>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div className="input-icon-wrap">
                <MdEmail className="input-icon" />
                <input
                  className="form-control input-with-icon"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <MdLock className="input-icon" />
                <input
                  className="form-control input-with-icon"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowPass(s => !s)}
                  tabIndex={-1}
                >
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="auth-row">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary auth-submit">
              Sign In
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>

      <AuthStyles />
    </div>
  );
}

// Shared auth styles component used by Login and Register
export function AuthStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh;
        display: flex;
      }

      /* Left decorative panel */
      .auth-left {
        flex: 1;
        background: linear-gradient(150deg, var(--primary-dark) 0%, var(--accent) 100%);
        color: #fff;
        padding: 60px 56px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 20px;
      }
      .auth-brand {
        font-size: 22px;
        font-weight: 800;
        margin-bottom: 20px;
      }
      .auth-tagline {
        font-size: clamp(28px, 3vw, 42px);
        font-weight: 800;
        line-height: 1.2;
      }
      .auth-desc {
        font-size: 15px;
        opacity: 0.82;
        line-height: 1.7;
        max-width: 360px;
      }
      .auth-features {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .auth-feature-pill {
        display: inline-block;
        background: rgba(255,255,255,0.15);
        border-radius: 20px;
        padding: 6px 16px;
        font-size: 13px;
        font-weight: 600;
        max-width: max-content;
      }

      /* Right form panel */
      .auth-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 32px;
        background: var(--bg);
      }
      .auth-card {
        background: #fff;
        border-radius: 18px;
        box-shadow: var(--shadow);
        padding: 44px 40px;
        width: 100%;
        max-width: 420px;
      }
      .auth-title {
        font-size: 24px;
        font-weight: 800;
        margin-bottom: 6px;
      }
      .auth-sub {
        color: var(--text-muted);
        font-size: 14px;
        margin-bottom: 28px;
      }

      /* Form helpers */
      .auth-form { display: flex; flex-direction: column; }

      .input-icon-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .input-icon {
        position: absolute;
        left: 12px;
        color: var(--text-muted);
        font-size: 18px;
      }
      .input-with-icon {
        padding-left: 38px !important;
      }
      .input-eye {
        position: absolute;
        right: 10px;
        background: none;
        color: var(--text-muted);
        font-size: 18px;
        display: flex;
        padding: 4px;
        border-radius: 4px;
      }
      .input-eye:hover { color: var(--primary); }

      .auth-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
        font-size: 13px;
      }
      .remember-me {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--text-muted);
        cursor: pointer;
      }
      .forgot-link {
        color: var(--primary);
        font-weight: 600;
        transition: color var(--transition);
      }
      .forgot-link:hover { color: var(--primary-dark); }

      .auth-submit {
        width: 100%;
        justify-content: center;
        padding: 12px;
        font-size: 15px;
        border-radius: 10px;
        margin-bottom: 20px;
      }
      .auth-switch {
        text-align: center;
        font-size: 13px;
        color: var(--text-muted);
      }
      .auth-switch a {
        color: var(--primary);
        font-weight: 600;
      }

      @media (max-width: 768px) {
        .auth-left { display: none; }
        .auth-right { padding: 24px 16px; }
        .auth-card  { padding: 32px 24px; }
      }
    `}</style>
  );
}
