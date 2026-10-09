// Sidebar.jsx — Fixed left navigation panel
//
// Desktop: always visible, toggles between full-width (labels + icons)
//          and collapsed (icons only).
// Mobile:  slides in as a drawer over the content.
//          A dark backdrop is shown behind it; clicking it closes the sidebar.
//
// Props:
//   open    — boolean, whether sidebar is expanded
//   onClose — called when backdrop is clicked on mobile

import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdReceipt, MdCategory, MdAccountBalanceWallet,
  MdBarChart, MdPerson, MdSettings, MdLogout,
} from 'react-icons/md';

// Navigation links — add or remove entries here to change the menu
const NAV_ITEMS = [
  { to: '/dashboard',    icon: <MdDashboard />,            label: 'Dashboard'    },
  { to: '/transactions', icon: <MdReceipt />,              label: 'Transactions' },
  { to: '/categories',   icon: <MdCategory />,             label: 'Categories'   },
  { to: '/budgets',      icon: <MdAccountBalanceWallet />, label: 'Budgets'      },
  { to: '/reports',      icon: <MdBarChart />,             label: 'Reports'      },
  { to: '/profile',      icon: <MdPerson />,               label: 'Profile'      },
  { to: '/settings',     icon: <MdSettings />,             label: 'Settings'     },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => navigate('/');

  return (
    <>
      {/* ── Mobile backdrop — dark overlay behind the sidebar ── */}
      {open && (
        <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />
      )}

      {/* ── Sidebar panel ── */}
      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>

        {/* Brand / Logo */}
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">💰</span>
          {open && <span className="sidebar-brand-name">ExpenseTrack</span>}
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
              onClick={() => {
                // On mobile, close sidebar after navigation
                if (window.innerWidth < 768) onClose();
              }}
            >
              <span className="sidebar-icon">{icon}</span>
              {open && <span className="sidebar-label">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout button at the bottom */}
        <div className="sidebar-footer">
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <span className="sidebar-icon"><MdLogout /></span>
            {open && <span className="sidebar-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── All sidebar-specific styles ── */}
      <style>{`
        /* ---- Sidebar shell ---- */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: var(--sidebar-collapsed-width);   /* collapsed = icons only */
          background: var(--sidebar-bg);
          display: flex;
          flex-direction: column;
          z-index: 300;
          overflow: hidden;
          transition: width var(--transition-slow);
        }

        /* Expanded state (desktop open, or mobile drawer open) */
        .sidebar.sidebar-open {
          width: var(--sidebar-width);
        }

        /* ---- Brand row ---- */
        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          white-space: nowrap;
          min-height: var(--navbar-height);
        }
        .sidebar-brand-icon { font-size: 22px; flex-shrink: 0; }
        .sidebar-brand-name {
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: 0.01em;
          animation: fadeIn 0.2s ease;
        }

        /* ---- Nav area ---- */
        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow-y: auto;
          overflow-x: hidden;
        }
        /* Hide scrollbar but keep scroll behaviour */
        .sidebar-nav::-webkit-scrollbar { display: none; }

        /* ---- Individual link ---- */
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border-radius: 10px;
          color: var(--sidebar-text);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          transition:
            background var(--transition),
            color     var(--transition),
            transform var(--transition);
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .sidebar-link:hover {
          background: rgba(255,255,255,0.09);
          color: #fff;
          transform: translateX(3px);
        }
        .sidebar-link.active {
          background: var(--primary);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(79,70,229,0.4);
        }
        .sidebar-icon {
          font-size: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }
        .sidebar-label {
          animation: fadeIn 0.15s ease;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ---- Footer (logout) ---- */
        .sidebar-footer {
          padding: 8px 8px 20px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .sidebar-logout { color: #e89090; }
        .sidebar-logout:hover {
          background: rgba(224,82,82,0.15) !important;
          color: #ff7f7f !important;
          transform: translateX(3px);
        }

        /* ---- Mobile backdrop (dark overlay) ---- */
        .sidebar-backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 299;
          animation: fadeIn 0.2s ease;
        }

        /* ---- Mobile overrides ---- */
        @media (max-width: 768px) {
          /* Sidebar is always full width on mobile, just translated off-screen */
          .sidebar {
            width: var(--sidebar-width) !important;
            transform: translateX(-100%);
            transition: transform var(--transition-slow);
          }
          .sidebar.sidebar-open {
            transform: translateX(0);
          }

          /* Show the backdrop on mobile when sidebar is open */
          .sidebar-backdrop {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
