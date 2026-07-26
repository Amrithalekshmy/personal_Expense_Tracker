// Budgets.jsx — Monthly budget management
// Cards show category, budget limit, amount spent, remaining with a progress bar.
// Budget can be set/edited via modal.

import { useState } from 'react';
import { MdAdd, MdEdit, MdDelete } from 'react-icons/md';

const CATEGORIES = ['Food','Transport','Shopping','Utilities','Entertainment','Healthcare','Education','Salary','Others'];
const COLOR_MAP = {
  Food: '#e67e22', Transport: '#3498db', Shopping: '#9b59b6',
  Utilities: '#1abc9c', Entertainment: '#e74c3c', Healthcare: '#e91e63',
  Education: '#2196f3', Salary: '#4caf50', Others: '#9e9e9e',
};

const INITIAL_BUDGETS = [
  { id: 1, category: 'Food',          budget: 5000, spent: 3200 },
  { id: 2, category: 'Transport',     budget: 3000, spent: 1800 },
  { id: 3, category: 'Shopping',      budget: 6000, spent: 4500 },
  { id: 4, category: 'Utilities',     budget: 2000, spent: 1200 },
  { id: 5, category: 'Entertainment', budget: 1500, spent: 900  },
  { id: 6, category: 'Healthcare',    budget: 2000, spent: 500  },
  { id: 7, category: 'Education',     budget: 3000, spent: 2449 },
];

const fmt = n => `₹${n.toLocaleString('en-IN')}`;
const BLANK = { category: 'Food', budget: '' };

function BudgetModal({ item, onSave, onClose }) {
  const [form, setForm] = useState(item ? { category: item.category, budget: item.budget } : BLANK);
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{item ? 'Edit Budget' : 'Set Budget'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-control" name="category" value={form.category} onChange={ch}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Budget (₹)</label>
          <input
            className="form-control" name="budget" type="number" min="0"
            placeholder="e.g. 5000" value={form.budget} onChange={ch}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            {item ? 'Save Changes' : 'Set Budget'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Budgets() {
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [modal, setModal] = useState(null);

  const handleSave = form => {
    if (modal === 'add') {
      setBudgets(prev => [...prev, { id: Date.now(), category: form.category, budget: Number(form.budget), spent: 0 }]);
    } else {
      setBudgets(prev => prev.map(b => b.id === modal.id ? { ...b, category: form.category, budget: Number(form.budget) } : b));
    }
    setModal(null);
  };

  const handleDelete = id => {
    if (window.confirm('Remove this budget?')) setBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Summary stats
  const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
  const totalSpent  = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget  = budgets.filter(b => b.spent > b.budget).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets</h1>
          <p className="page-subtitle">Set and track your monthly spending limits</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Set Budget
        </button>
      </div>

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
        {budgets.map(b => {
          const pct     = Math.min(100, Math.round((b.spent / b.budget) * 100));
          const rem     = b.budget - b.spent;
          const over    = b.spent > b.budget;
          const color   = COLOR_MAP[b.category] || '#888';
          const barColor = over ? 'var(--danger)' : pct > 80 ? 'var(--warning)' : color;

          return (
            <div className="budget-card" key={b.id}>
              <div className="budget-card-top">
                <div>
                  <div className="budget-cat" style={{ color }}>{b.category}</div>
                  <div className="budget-label">Monthly Limit</div>
                </div>
                <div className="budget-amount">{fmt(b.budget)}</div>
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
                  ⚠ Over budget by {fmt(b.spent - b.budget)}
                </div>
              )}

              <div className="budget-actions">
                <button className="btn btn-outline btn-sm" onClick={() => setModal(b)}>
                  <MdEdit size={14} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)}>
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
          onSave={handleSave}
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
