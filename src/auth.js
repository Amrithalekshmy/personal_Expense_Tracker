// auth.js — Shares the logged-in user (from GET /api/auth/me) with every page.
import { createContext, useContext } from 'react';

export const UserContext = createContext({ user: null, setUser: () => {} });
export const useUser = () => useContext(UserContext);

export const initials = name =>
  (name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
