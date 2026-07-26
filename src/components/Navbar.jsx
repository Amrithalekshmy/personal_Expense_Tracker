// Navbar.jsx — Fixed top navigation bar
//
// Shows: hamburger toggle | page title | search | notification bell | avatar
// The `left` CSS property mirrors the sidebar width so the bar
// never sits under the sidebar on desktop.
//
// Props:
//   onToggleSidebar — called when the hamburger button is clicked

import { useLocation, useNavigate } from 'react-router-dom';
import { MdMenu, MdNotificationsNone, MdSearch } from 'react-icons/md';

// Human-readable page titles for each route
const TITLE_MAP = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transactions',
  '/categories':   'Categories',
  '/budgets':      'Budgets',
  '/reports':      'Reports',
  '/profile':      'Profile',
  '/settings':     'Settings',
};

export default function Navbar({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const title        = TITLE_MAP[pathname] ?? 'ExpenseTrack';

  return (
    <header className="navbar">
      {/* Left side: hamburger + current page title */}
      <div className="navbar-left">
        <button
          className="navbar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MdMenu size={22} />
        </button>
        <span className="navbar-title">{title}</span>
      </div>

      {/* Right side: search bar, notifications, user avatar */}
      <div className="navbar-right">
        <div className="navbar-search">
          <MdSearch className="search-icon" size={17} />
          <input
            className="search-input"
            placeholder="Search…"
            aria-label="Search"
          />
        </div>

        <button className="navbar-icon-btn" aria-label="Notifications">
          <MdNotificationsNone size={21} />
          <span className="notif-dot" />
        </button>

        <button
          className="navbar-avatar"
          onClick={() => navigate('/profile')}
          aria-label="Go to profile"
          title="Profile"
        >
          AK
        </button>
      </div>

      <style>{`
        /* ---- Shell ---- */
        .navbar {
          position: fixed;
          top: 0;
          /* On desktop, sits to the right of the sidebar */
          left: var(--sidebar-width);
          right: 0;
          height: var(--navbar-height);
          background: #fff;
          border-bottom: 1.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          z-index: 200;
          transition: left var(--transition-slow);
          gap: 16px;
        }

        /* ---- Left group ---- */
        .navbar-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        /* Hamburger button */
        .navbar-toggle {
          background: none;
          color: var(--text-muted);
          padding: 7px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition), color var(--transition);
        }
        .navbar-toggle:hover {
          background: var(--bg);
          color: var(--primary);
        }

        .navbar-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-main);
        }

        /* ---- Right group ---- */
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Search box */
        .navbar-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          padding: 6px 16px;
          transition: border-color var(--transition), box-shadow var(--transition);
        }
        .navbar-search:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(26,127,90,0.1);
        }
        .search-icon  { color: var(--text-muted); flex-shrink: 0; }
        .search-input {
          border: none;
          background: none;
          outline: none;
          font-size: 14px;
          width: 150px;
          color: var(--text-main);
        }

        /* Notification bell */
        .navbar-icon-btn {
          position: relative;
          background: var(--bg);
          color: var(--text-muted);
          border: 1.5px solid var(--border);
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background var(--transition), color var(--transition), box-shadow var(--transition);
        }
        .navbar-icon-btn:hover {
          color: var(--primary);
          background: #e8f5ee;
          box-shadow: 0 2px 8px rgba(26,127,90,0.2);
        }

        /* Red dot indicator on the bell */
        .notif-dot {
          position: absolute;
          top: 7px;
          right: 7px;
          width: 7px;
          height: 7px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid #fff;
        }

        /* User avatar circle with initials */
        .navbar-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: box-shadow var(--transition), transform var(--transition);
        }
        .navbar-avatar:hover {
          box-shadow: 0 0 0 3px rgba(26,127,90,0.25);
          transform: scale(1.05);
        }

        /* ---- Mobile overrides ---- */
        @media (max-width: 768px) {
          /* On mobile the sidebar is off-screen, so navbar goes full width */
          .navbar       { left: 0; padding: 0 14px; }
          /* Hide search on mobile to save space */
          .navbar-search { display: none; }
        }
      `}</style>
    </header>
  );
}
