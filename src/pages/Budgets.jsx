// Budgets.jsx — Monthly budget management (BUDGET table)
// One budget per category per month/year. Cards show the limit, the amount
// spent that month (SUM of Expense transactions, computed in SQL) and what's left.

import { useState, useEffect, useCallback } from 'react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { api, fmt, colorFor } from '../api';

function BudgetModal({ item, categories, month, year, onSaved, onClose }) {
  const [form, setForm] = useState(item
    ? { category_id: item.category_id, budget_amount: item.budget_amount }
    : { category_id: categories[0]?.category_id ?? '', budget_amount: '' });
  const [error, setError] = useState('');
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    setError('');
    try {
      if (item) await api(`/budgets/${item.budget_id}`, { method: 'PUT', body: form });
      else      await api('/budgets', { method: 'POST', body: { ...form, month, year } });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{item ? 'Edit Budget' : 'Set Budget'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-control" name="category_id" value={form.category_id} onChange={ch}>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Budget (₹)</label>
          <input
            className="form-control" name="budget_amount" type="number" min="0" step="0.01"
            placeholder="e.g. 5000" value={form.budget_amount} onChange={ch}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>
            {item ? 'Save Changes' : 'Set Budget'}
          </button>
        </div>
      </div>
    </div>
  );
}

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [period, setPeriod] = useState(thisMonth); // "YYYY-MM"
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');

  const [year, month] = period.split('-').map(Number);

  const load = useCallback(() => {
    api(`/budgets?month=${month}&year=${year}`).then(setBudgets).catch(err => setError(err.message));
  }, [month, year]);

  useEffect(load, [load]);

  useEffect(() => {
    api('/categories')
      .then(cats => setCategories(cats.filter(c => c.category_type === 'Expense')))
      .catch(err => setError(err.message));
  }, []);

  const handleSaved = () => {
    setModal(null);
    load();
  };

  const handleDelete = async id => {
    if (!window.confirm('Remove this budget?')) return;
    try {
      await api(`/budgets/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Summary stats
  const totalBudget = budgets.reduce((s, b) => s + b.budget_amount, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget  = budgets.filter(b => b.spent > b.budget_amount).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set and track your monthly spending limits</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            className="form-control" type="month" style={{ width: 'auto' }}
            value={period} onChange={e => e.target.value && setPeriod(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setModal('add')}>
            <MdAdd size={18} /> Set Budget
          </button>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      {/* Summary row */}
      <div className="grid-3 mb-24">
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title">Total Budget</div>
          <div className="card-value">{fmt(totalBudget)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title">Total Spent</div>
          <div className="card-value text-expense">{fmt(totalSpent)}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title">Over Budget</div>
          <div className="card-value" style={{ color: overBudget > 0 ? 'var(--danger)' : 'var(--income-color)' }}>
            {overBudget} {overBudget === 1 ? 'category' : 'categories'}
          </div>
        </div>
      </div>

      {/* Budget cards */}
      <div className="budget-grid">
        {budgets.length === 0 && (
          <p className="text-muted">No budgets set for this month. Click “Set Budget” to add one.</p>
        )}
        {budgets.map(b => {
          const pct     = Math.min(100, Math.round((b.spent / b.budget_amount) * 100));
          const rem     = b.budget_amount - b.spent;
          const over    = b.spent > b.budget_amount;
          const color   = colorFor(b.category_name);
          const barColor = over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : color;

          return (
            <div className="budget-card" key={b.budget_id}>
              <div className="budget-card-top">
                <div>
                  <div className="budget-cat" style={{ color }}>{b.category_name}</div>
                  <div className="budget-label">Monthly Limit</div>
                </div>
                <div className="budget-amount">{fmt(b.budget_amount)}</div>
              </div>

              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
              <div className="budget-stats">
                <div>
                  <div className="budget-stat-val text-expense">{fmt(b.spent)}</div>
                  <div className="budget-stat-label">Spent</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div className="budget-stat-val" style={{ color: barColor }}>{pct}%</div>
                  <div className="budget-stat-label">Used</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`budget-stat-val ${over ? 'text-expense' : 'text-income'}`}>
                    {over ? '-' : ''}{fmt(Math.abs(rem))}
                  </div>
                  <div className="budget-stat-label">{over ? 'Over' : 'Remaining'}</div>
                </div>
              </div>

              {over && (
                <div className="budget-over-banner">
                  ⚠ Over budget by {fmt(b.spent - b.budget_amount)}
                </div>
              )}

              <div className="budget-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setModal(b)}>
                  <MdEdit size={14} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.budget_id)}>
                  <MdDelete size={14} /> Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <BudgetModal
          item={modal === 'add' ? null : modal}
          categories={categories}
          month={month}
          year={year}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        .budget-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .budget-card {
          background: #fff;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: box-shadow var(--transition);
        }
        .budget-card:hover { box-shadow: var(--shadow-hover); }

        .budget-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .budget-cat   { font-size: 16px; font-weight: 700; }
        .budget-label { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
        .budget-amount { font-size: 20px; font-weight: 800; color: var(--text-main); }

        .budget-stats {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
        }
        .budget-stat-val   { font-size: 15px; font-weight: 700; }
        .budget-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

        .budget-over-banner {
          background: #fff3f3;
          color: var(--danger);
          font-size: 13px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #fcd5d5;
        }

        .budget-actions { display: flex; gap: 8px; }
      `}</style>
    </div>
  );
}
