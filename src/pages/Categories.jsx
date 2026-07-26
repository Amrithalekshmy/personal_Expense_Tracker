// Categories.jsx — Manage spending categories
// Cards show icon, name, monthly spend. Add/Edit/Delete supported locally.

import { useState } from 'react';
import {
  MdFastfood, MdDirectionsCar, MdShoppingCart, MdFlashOn,
  MdMovieCreation, MdLocalHospital, MdSchool, MdAttachMoney,
  MdMoreHoriz, MdAdd,
} from 'react-icons/md';
import ActionButtons from '../components/ActionButtons';

const ICON_MAP = {
  Food: <MdFastfood />, Transport: <MdDirectionsCar />, Shopping: <MdShoppingCart />,
  Utilities: <MdFlashOn />, Entertainment: <MdMovieCreation />, Healthcare: <MdLocalHospital />,
  Education: <MdSchool />, Salary: <MdAttachMoney />, Others: <MdMoreHoriz />,
};
const COLOR_MAP = {
  Food: '#e67e22', Transport: '#3498db', Shopping: '#9b59b6',
  Utilities: '#1abc9c', Entertainment: '#e74c3c', Healthcare: '#e91e63',
  Education: '#2196f3', Salary: '#4caf50', Others: '#9e9e9e',
};

const INITIAL_CATS = [
  { id: 1, name: 'Food',          spend: 3200, budget: 5000  },
  { id: 2, name: 'Transport',     spend: 1800, budget: 3000  },
  { id: 3, name: 'Shopping',      spend: 4500, budget: 6000  },
  { id: 4, name: 'Utilities',     spend: 1200, budget: 2000  },
  { id: 5, name: 'Entertainment', spend: 900,  budget: 1500  },
  { id: 6, name: 'Healthcare',    spend: 500,  budget: 2000  },
  { id: 7, name: 'Education',     spend: 2449, budget: 3000  },
  { id: 8, name: 'Salary',        spend: 0,    budget: 0     },
  { id: 9, name: 'Others',        spend: 350,  budget: 1000  },
];

const BLANK = { name: 'Food', budget: '' };
const fmt = n => `₹${n.toLocaleString('en-IN')}`;

function CatModal({ cat, onSave, onClose }) {
  const [form, setForm] = useState(cat ? { name: cat.name, budget: cat.budget } : BLANK);
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{cat ? 'Edit Category' : 'Add Category'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <select className="form-control" name="name" value={form.name} onChange={ch}>
            {Object.keys(ICON_MAP).map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Monthly Budget (₹)</label>
          <input className="form-control" name="budget" type="number" min="0" placeholder="0" value={form.budget} onChange={ch} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>{cat ? 'Save' : 'Add'}</button>
        </div>
      </div>
    </div>
  );
}

export default function Categories() {
  const [cats, setCats] = useState(INITIAL_CATS);
  const [modal, setModal] = useState(null);

  const handleSave = form => {
    if (modal === 'add') {
      setCats(prev => [...prev, { ...form, id: Date.now(), spend: 0, budget: Number(form.budget) }]);
    } else {
      setCats(prev => prev.map(c => c.id === modal.id ? { ...c, name: form.name, budget: Number(form.budget) } : c));
    }
    setModal(null);
  };

  const handleDelete = id => {
    if (window.confirm('Delete this category?')) setCats(prev => prev.filter(c => c.id !== id));
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

      <div className="cat-grid">
        {cats.map(c => {
          const color = COLOR_MAP[c.name] || '#888';
          const icon  = ICON_MAP[c.name]  || <MdMoreHoriz />;
          const pct   = c.budget > 0 ? Math.min(100, Math.round((c.spend / c.budget) * 100)) : 0;
          const over  = c.budget > 0 && c.spend > c.budget;
          return (
            <div className="cat-card" key={c.id}>
              <div className="cat-card-header">
                <span className="cat-card-icon" style={{ background: color + '20', color }}>
                  {icon}
                </span>
                <ActionButtons
                  onEdit={() => setModal(c)}
                  onDelete={() => handleDelete(c.id)}
                  size="sm"
                />
              </div>
              <div className="cat-card-name">{c.name}</div>
              <div className="cat-card-spend">{fmt(c.spend)}</div>
              <div className="cat-card-label">spent this month</div>
              {c.budget > 0 && (
                <>
                  <div className="progress-bar-wrap" style={{ marginTop: 12 }}>
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${pct}%`, background: over ? 'var(--danger)' : color }}
                    />
                  </div>
                  <div className="cat-card-budget-row">
                    <span className={over ? 'text-expense' : 'text-muted'} style={{ fontSize: 12 }}>
                      {pct}% of {fmt(c.budget)}
                    </span>
                    {over && <span className="badge badge-expense" style={{ fontSize: 11 }}>Over Budget</span>}
                  </div>
                </>
              )}
              {c.budget === 0 && (
                <div className="text-muted mt-8" style={{ fontSize: 12 }}>No budget set</div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <CatModal
          cat={modal === 'add' ? null : modal}
          onSave={handleSave}
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
