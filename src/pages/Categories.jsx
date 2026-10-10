// Categories.jsx — Manage the user's categories (CATEGORY table)
// Cards show icon, name, type and this month's total from GET /api/categories,
// plus progress against this month's budget if one is set on the Budgets page.

import { useState, useEffect, useCallback } from 'react';
import {
  MdFastfood, MdDirectionsCar, MdShoppingCart, MdFlashOn,
  MdMovieCreation, MdLocalHospital, MdSchool, MdAttachMoney,
  MdMoreHoriz, MdAdd,
} from 'react-icons/md';
import ActionButtons from '../components/ActionButtons';
import { api, fmt, colorFor } from '../api';

const ICON_MAP = {
  Food: <MdFastfood />, Transport: <MdDirectionsCar />, Shopping: <MdShoppingCart />,
  Utilities: <MdFlashOn />, Entertainment: <MdMovieCreation />, Healthcare: <MdLocalHospital />,
  Education: <MdSchool />, Salary: <MdAttachMoney />, Others: <MdMoreHoriz />,
};
const BLANK = { category_name: '', category_type: 'Expense' };

function CatModal({ cat, onSaved, onClose }) {
  const [form, setForm] = useState(cat
    ? { category_name: cat.category_name, category_type: cat.category_type }
    : BLANK);
  const [error, setError] = useState('');
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = async () => {
    setError('');
    try {
      if (cat) await api(`/categories/${cat.category_id}`, { method: 'PUT', body: form });
      else     await api('/categories', { method: 'POST', body: form });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{cat ? 'Edit Category' : 'Add Category'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            className="form-control" name="category_name" list="category-suggestions"
            placeholder="e.g. Rent" value={form.category_name} onChange={ch}
          />
          <datalist id="category-suggestions">
            {Object.keys(ICON_MAP).map(n => <option key={n} value={n} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-control" name="category_type" value={form.category_type} onChange={ch}>
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>{cat ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/categories').then(setCats).catch(err => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const handleSaved = () => {
    setModal(null);
    load();
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this category?')) return;
    setError('');
    try {
      await api(`/categories/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage your spending categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Add Category
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="cat-grid">
        {cats.map(c => {
          const color  = colorFor(c.category_name);
          const icon   = ICON_MAP[c.category_name] || <MdMoreHoriz />;
          const budget = c.budget_amount || 0;
          const pct    = budget > 0 ? Math.min(100, Math.round((c.spent / budget) * 100)) : 0;
          const over   = budget > 0 && c.spent > budget;
          return (
            <div className="cat-card" key={c.category_id}>
              <div className="cat-card-header">
                <span className="cat-card-icon" style={{ background: color + '20', color }}>
                  {icon}
                </span>
                <ActionButtons
                  onEdit={() => setModal(c)}
                  onDelete={() => handleDelete(c.category_id)}
                  size="sm"
                />
              </div>
              <div className="cat-card-name">
                {c.category_name}{' '}
                <span className={`badge badge-${c.category_type.toLowerCase()}`} style={{ fontSize: 10 }}>
                  {c.category_type}
                </span>
              </div>
              <div className="cat-card-spend">{fmt(c.spent)}</div>
              <div className="cat-card-label">
                {c.category_type === 'Income' ? 'received' : 'spent'} this month
              </div>
              {budget > 0 && (
                <>
                  <div className="progress-bar-wrap" style={{ marginTop: 12 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pct}%`, background: over ? 'var(--danger)' : color }}
                    />
                  </div>
                  <div className="cat-card-budget-row">
                    <span className={over ? 'text-expense' : 'text-muted'} style={{ fontSize: 12 }}>
                      {pct}% of {fmt(budget)}
                    </span>
                    {over && <span className="badge badge-expense" style={{ fontSize: 11 }}>Over Budget</span>}
                  </div>
                </>
              )}
              {budget === 0 && c.category_type === 'Expense' && (
                <div className="text-muted mt-8" style={{ fontSize: 12 }}>No budget set</div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <CatModal
          cat={modal === 'add' ? null : modal}
          onSaved={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        .cat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 18px;
        }
        .cat-card {
          background: #fff;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 20px;
          transition: box-shadow var(--transition), transform var(--transition);
        }
        .cat-card:hover { box-shadow: var(--shadow-hover); transform: translateY(-2px); }
        .cat-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .cat-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .cat-card-actions { display: flex; gap: 6px; }
        .cat-card-name  { font-size: 15px; font-weight: 700; color: var(--text-main); }
        .cat-card-spend { font-size: 22px; font-weight: 800; color: var(--text-main); margin-top: 4px; }
        .cat-card-label { font-size: 11px; color: var(--text-muted); }
        .cat-card-budget-row { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
      `}</style>
    </div>
  );
}
