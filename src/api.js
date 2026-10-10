// api.js — Small wrapper around fetch() for calling the Flask backend.
// Vite proxies /api to http://localhost:5000 (see vite.config.js).
// Throws an Error with the server's message when the request fails.

export async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// Shared helpers used across pages
export const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`;

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking'];

export const COLOR_MAP = {
  Food: '#e67e22', Transport: '#3498db', Shopping: '#9b59b6',
  Utilities: '#1abc9c', Entertainment: '#e74c3c', Healthcare: '#e91e63',
  Education: '#2196f3', Salary: '#4caf50', Others: '#9e9e9e',
};
// Colours for categories the user creates themselves
const EXTRA_COLORS = ['#795548', '#607d8b', '#ff9800', '#00bcd4', '#8bc34a', '#3f51b5'];
export const colorFor = name =>
  COLOR_MAP[name] || EXTRA_COLORS[[...name].reduce((s, ch) => s + ch.charCodeAt(0), 0) % EXTRA_COLORS.length];

// Local date as YYYY-MM-DD (toISOString would give the UTC date)
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const monthLabel = (d = new Date()) =>
  d.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
