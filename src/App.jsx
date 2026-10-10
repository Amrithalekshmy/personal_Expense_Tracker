// App.jsx — Root component
// Defines all routes and decides whether to render the sidebar/navbar layout
// or a plain layout (for Landing, Login, Register, 404).
// Shell pages need a logged-in user; without one they redirect to /login.

import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api';
import { UserContext } from './auth';

import Navbar    from './components/Navbar';
import Sidebar   from './components/Sidebar';

import Landing      from './pages/Landing';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Categories   from './pages/Categories';
import Budgets      from './pages/Budgets';
import Reports      from './pages/Reports';
import Profile      from './pages/Profile';
import Settings     from './pages/Settings';
import NotFound     from './pages/NotFound';

// Pages that use the sidebar + navbar shell
const SHELL_PAGES = [
  '/dashboard', '/transactions', '/categories',
  '/budgets', '/reports', '/profile', '/settings',
];

export default function App() {
  const { pathname } = useLocation();
  // Default: open on desktop, closed on mobile
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  // undefined = still checking the session, null = not logged in
  const [user, setUser] = useState(undefined);

  const useShell = SHELL_PAGES.some(p => pathname.startsWith(p));

  useEffect(() => {
    // Re-check on every entry into the shell (e.g. right after logging in)
    if (!useShell) { setUser(undefined); return; }
    api('/auth/me').then(setUser).catch(() => setUser(null));
  }, [useShell]);

  if (!useShell) {
    // Public pages — no sidebar/navbar
    return (
      <Routes>
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<NotFound />} />
      </Routes>
    );
  }

  if (user === null) return <Navigate to="/login" replace />;
  if (user === undefined) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`main-content${sidebarOpen ? '' : ' sidebar-collapsed'}`}>
        <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
        <div className="page-container">
          <Routes>
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories"   element={<Categories />} />
            <Route path="/budgets"      element={<Budgets />} />
            <Route path="/reports"      element={<Reports />} />
            <Route path="/profile"      element={<Profile />} />
            <Route path="/settings"     element={<Settings />} />
            <Route path="*"             element={<NotFound />} />
          </Routes>
        </div>
      </div>
    </div>
    </UserContext.Provider>
  );
}
