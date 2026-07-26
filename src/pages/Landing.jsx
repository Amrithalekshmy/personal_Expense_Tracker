// Landing.jsx — Public marketing page
// Sections: Navbar, Hero, Features, CTA, Footer

import { useNavigate } from 'react-router-dom';
import {
  MdTrendingUp, MdPieChart, MdNotificationsActive,
  MdSecurity, MdDevices, MdAccountBalanceWallet,
} from 'react-icons/md';

const FEATURES = [
  { icon: <MdTrendingUp />,           title: 'Track Spending',      desc: 'Monitor every rupee across all categories in real time.' },
  { icon: <MdPieChart />,             title: 'Visual Reports',      desc: 'Beautiful charts that make your finances easy to understand.' },
  { icon: <MdAccountBalanceWallet />, title: 'Budget Control',      desc: 'Set monthly budgets and get alerts before you overspend.' },
  { icon: <MdNotificationsActive />,  title: 'Smart Alerts',        desc: 'Stay on top of bills and budget limits with timely reminders.' },
  { icon: <MdSecurity />,             title: 'Secure & Private',    desc: 'Your financial data stays yours — always encrypted.' },
  { icon: <MdDevices />,              title: 'Works Everywhere',    desc: 'Responsive on desktop, tablet, and mobile devices.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <nav className="land-nav">
        <div className="land-nav-brand">💰 ExpenseTrack</div>
        <div className="land-nav-links">
          <a href="#features">Features</a>
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn btn-primary" onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">✦ 100% Free • No Sign-up Credit Card</div>
        <h1 className="hero-title">
          Take Control of Your<br />
          <span className="hero-highlight">Personal Finances</span>
        </h1>
        <p className="hero-sub">
          Track income, expenses, and budgets — all in one clean, beautiful dashboard.
          Built for students, freelancers, and everyday people.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
            Start Tracking Free
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/dashboard')}>
            View Demo
          </button>
        </div>

        {/* Decorative stat pills */}
        <div className="hero-stats">
          <div className="hero-stat"><strong>₹1.2L+</strong> tracked</div>
          <div className="hero-stat"><strong>9</strong> categories</div>
          <div className="hero-stat"><strong>100%</strong> offline-ready</div>
        </div>
      </section>

      {/* ── Project Introduction ── */}
      <section className="intro-section">
        <div className="intro-inner">
          <div className="intro-text">
            <span className="intro-label">About the Project</span>
            <h2 className="intro-title">What is ExpenseTrack?</h2>
            <p className="intro-desc">
              <strong>ExpenseTrack</strong> is a Personal Expense Tracker built as a DBMS project.
              It helps individuals — especially students and freelancers — record their daily income
              and expenses, organise them into meaningful categories, set monthly budgets, and
              visualise their spending through clean, simple reports.
            </p>
            <p className="intro-desc">
              The application is designed to be the frontend layer of a full-stack system.
              The backend will be powered by <strong>Python (Flask/FastAPI)</strong> and
              a <strong>PostgreSQL</strong> relational database, demonstrating real-world
              DBMS concepts such as normalisation, relational schema design, SQL queries,
              and transaction management.
            </p>
            <div className="intro-pills">
              <span className="intro-pill">📁 PostgreSQL Database</span>
              <span className="intro-pill">🐍 Python Backend</span>
              <span className="intro-pill">⚛️ React Frontend</span>
              <span className="intro-pill">📊 Financial Reports</span>
            </div>
          </div>
          <div className="intro-cards">
            {[
              { label: 'Track',    desc: 'Record every income and expense with date, category, and payment method.' },
              { label: 'Budget',   desc: 'Set monthly limits per category and get alerts when you\'re close.' },
              { label: 'Analyse',  desc: 'View pie charts, bar graphs, and trend lines to understand your habits.' },
            ].map(({ label, desc }) => (
              <div className="intro-card" key={label}>
                <div className="intro-card-label">{label}</div>
                <div className="intro-card-desc">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <h2 className="section-title">Everything you need to manage money</h2>
        <p className="section-sub">Simple tools. Powerful insights. Zero complexity.</p>
        <div className="features-grid">
          {FEATURES.map(({ icon, title, desc }) => (
            <div className="feature-card" key={title}>
              <span className="feature-icon">{icon}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2>Ready to take control?</h2>
        <p>Join thousands managing their money smarter with ExpenseTrack.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
          Create Free Account →
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="land-footer">
        <span>© 2025 ExpenseTrack. Built as a DBMS Project.</span>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a onClick={() => navigate('/login')}>Login</a>
          <a onClick={() => navigate('/register')}>Register</a>
        </div>
      </footer>

      <style>{`
        .landing {
          min-height: 100vh;
          background: #f4f7f6;
        }

        /* Nav */
        .land-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 64px;
          background: #fff;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .land-nav-brand {
          font-size: 20px;
          font-weight: 800;
          color: var(--primary);
        }
        .land-nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        .land-nav-links a {
          color: var(--text-muted);
          transition: color var(--transition);
        }
        .land-nav-links a:hover { color: var(--primary); }

        /* Hero */
        .hero {
          text-align: center;
          padding: 96px 24px 72px;
          max-width: 700px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-block;
          background: #d6f0e6;
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 24px;
        }
        .hero-title {
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 800;
          line-height: 1.2;
          color: var(--text-main);
          margin-bottom: 20px;
        }
        .hero-highlight {
          color: var(--primary);
        }
        .hero-sub {
          font-size: 17px;
          color: var(--text-muted);
          max-width: 520px;
          margin: 0 auto 36px;
          line-height: 1.7;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }
        .btn-lg {
          padding: 13px 28px;
          font-size: 15px;
          border-radius: 10px;
        }
        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        .hero-stat {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 8px 20px;
          font-size: 14px;
          color: var(--text-muted);
        }
        .hero-stat strong { color: var(--primary); }

        /* Project Introduction */
        .intro-section {
          background: var(--bg);
          padding: 80px 64px;
        }
        .intro-inner {
          max-width: 1000px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: flex-start;
        }
        .intro-label {
          display: inline-block;
          background: #d6f0e6;
          color: var(--primary);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 5px 14px;
          border-radius: 20px;
          margin-bottom: 14px;
        }
        .intro-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 16px;
          line-height: 1.3;
        }
        .intro-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.8;
          margin-bottom: 14px;
        }
        .intro-desc strong { color: var(--text-main); }
        .intro-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 6px;
        }
        .intro-pill {
          background: #fff;
          border: 1.5px solid var(--border);
          border-radius: 20px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-main);
        }
        .intro-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .intro-card {
          background: #fff;
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          padding: 20px 22px;
          transition: box-shadow var(--transition), transform var(--transition);
        }
        .intro-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateX(4px);
        }
        .intro-card-label {
          font-size: 13px;
          font-weight: 800;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .intro-card-desc {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* Features */
        .features-section {
          background: #fff;
          padding: 80px 64px;
          text-align: center;
        }
        .section-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 8px;
        }
        .section-sub {
          color: var(--text-muted);
          margin-bottom: 48px;
          font-size: 15px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 900px;
          margin: 0 auto;
        }
        .feature-card {
          background: var(--bg);
          border-radius: var(--radius);
          padding: 28px 22px;
          text-align: left;
          border: 1.5px solid var(--border);
          transition: box-shadow var(--transition), transform var(--transition);
        }
        .feature-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-3px);
        }
        .feature-icon {
          font-size: 28px;
          color: var(--primary);
          margin-bottom: 14px;
          display: block;
        }
        .feature-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-main);
        }
        .feature-card p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.6;
        }

        /* CTA */
        .cta-section {
          background: linear-gradient(135deg, var(--primary-dark) 0%, var(--accent) 100%);
          color: #fff;
          text-align: center;
          padding: 80px 24px;
        }
        .cta-section h2 {
          font-size: 30px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .cta-section p {
          font-size: 16px;
          opacity: 0.85;
          margin-bottom: 32px;
        }
        .cta-section .btn-primary {
          background: #fff;
          color: var(--primary-dark);
        }
        .cta-section .btn-primary:hover {
          background: #e8f5ee;
        }

        /* Footer */
        .land-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 64px;
          font-size: 13px;
          color: var(--text-muted);
          border-top: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-links {
          display: flex;
          gap: 20px;
        }
        .footer-links a {
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition);
        }
        .footer-links a:hover { color: var(--primary); }

        @media (max-width: 768px) {
          .land-nav        { padding: 16px 20px; }
          .intro-section   { padding: 60px 20px; }
          .intro-inner     { grid-template-columns: 1fr; gap: 28px; }
          .features-section { padding: 60px 20px; }
          .features-grid   { grid-template-columns: 1fr; }
          .land-footer     { padding: 20px; }
        }
      `}</style>
    </div>
  );
}
