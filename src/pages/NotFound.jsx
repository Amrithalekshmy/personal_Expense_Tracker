// NotFound.jsx — 404 error page
//
// Shown when the user navigates to a route that doesn't exist.
// Two buttons: go home or go back to the previous page.

import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      {/* Floating money emoji */}
      <div className="notfound-emoji">💸</div>

      {/* Big 404 number */}
      <h1 className="notfound-code">404</h1>

      <h2 className="notfound-title">Page not found</h2>

      <p className="notfound-sub">
        Looks like this page spent all its budget and disappeared.
        <br />Let's get you back on track.
      </p>

      <div className="notfound-actions">
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>

      <style>{`
        .notfound {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 24px;
          background: var(--bg);
          gap: 0;
        }

        /* Emoji bounces up and down using the 'float' keyframe from App.css */
        .notfound-emoji {
          font-size: 72px;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        /* Giant "404" text */
        .notfound-code {
          font-size: clamp(72px, 12vw, 120px);
          font-weight: 900;
          color: var(--primary);
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -2px;
        }

        .notfound-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-main);
          margin-bottom: 14px;
        }

        .notfound-sub {
          font-size: 15px;
          color: var(--text-muted);
          max-width: 380px;
          line-height: 1.7;
          margin-bottom: 36px;
        }

        .notfound-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Hover lift for the buttons on this page */
        .notfound-actions .btn {
          min-width: 140px;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}
