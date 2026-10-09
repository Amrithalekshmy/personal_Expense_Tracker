// Transactions.jsx — Full CRUD transaction table
// Features: search, filter by type/category/date, add/edit/delete modal.
// All state is local (mock). Replace with API calls later.

import { useState, useMemo } from 'react';
import { MdAdd, MdSearch, MdFilterList } from 'react-icons/md';
import ActionButtons from '../components/ActionButtons';

const CATEGORIES = ['All','Food','Transport','Shopping','Utilities','Entertainment','Healthcare','Education','Salary','Others'];
const PAYMENT_METHODS = ['Cash','UPI','Credit Card','Debit Card','Net Banking'];

const INITIAL_TXN = [
  { id: 1,  desc: 'Zomato Order',          category: 'Food',          method: 'UPI',         amount: 320,   type: 'expense', date: '2025-07-24' },
  { id: 2,  desc: 'Freelance Payment',      category: 'Salary',        method: 'Net Banking',  amount: 15000, type: 'income',  date: '2025-07-23' },
  { id: 3,  desc: 'Metro Card Recharge',    category: 'Transport',     method: 'UPI',          amount: 500,   type: 'expense', date: '2025-07-22' },
  { id: 4,  desc: 'Amazon Purchase',        category: 'Shopping',      method: 'Credit Card',  amount: 1250,  type: 'expense', date: '2025-07-21' },
  { id: 5,  desc: 'Electricity Bill',       category: 'Utilities',     method: 'Net Banking',  amount: 740,   type: 'expense', date: '2025-07-20' },
  { id: 6,  desc: 'Netflix Subscription',   category: 'Entertainment', method: 'Credit Card',  amount: 649,   type: 'expense', date: '2025-07-19' },
  { id: 7,  desc: 'Doctor Visit',           category: 'Healthcare',    method: 'Cash',         amount: 500,   type: 'expense', date: '2025-07-18' },
  { id: 8,  desc: 'Online Course',          category: 'Education',     method: 'Debit Card',   amount: 1999,  type: 'expense', date: '2025-07-17' },
  { id: 9,  desc: 'Part-time Income',       category: 'Salary',        method: 'UPI',          amount: 8000,  type: 'income',  date: '2025-07-15' },
  { id: 10, desc: 'Grocery Shopping',       category: 'Food',          method: 'Cash',         amount: 1100,  type: 'expense', date: '2025-07-14' },
  { id: 11, desc: 'Gym Membership',         category: 'Healthcare',    method: 'Credit Card',  amount: 999,   type: 'expense', date: '2025-07-12' },
  { id: 12, desc: 'Book Purchase',          category: 'Education',     method: 'UPI',          amount: 450,   type: 'expense', date: '2025-07-10' },
];

const BLANK_FORM = { desc: '', amount: '', category: 'Food', method: 'UPI', type: 'expense', date: '' };

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

// ── Add/Edit Modal ─────────────────────────────────────────
function TxnModal({ txn, onSave, onClose }) {
  const [form, setForm] = useState(txn || BLANK_FORM);
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{txn ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-control" name="desc" placeholder="e.g. Zomato Order" value={form.desc} onChange={ch} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input className="form-control" name="amount" type="number" min="0" placeholder="0" value={form.amount} onChange={ch} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" name="type" value={form.type} onChange={ch}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" name="category" value={form.category} onChange={ch}>
              {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" name="method" value={form.method} onChange={ch}>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-control" name="date" type="date" value={form.date} onChange={ch} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>
            {txn ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function Transactions() {
  const [txns, setTxns] = useState(INITIAL_TXN);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | {txn object}

  // Filtered + searched list
  const filtered = useMemo(() => txns.filter(t => {
    if (search     && !t.desc.toLowerCase().includes(search.toLowerCase())) return false;
    if (catFilter  !== 'All'  && t.category !== catFilter) return false;
    if (typeFilter !== 'all'  && t.type     !== typeFilter) return false;
    if (dateFilter && t.date !== dateFilter) return false;
    return true;
  }), [txns, search, catFilter, typeFilter, dateFilter]);

  const handleSave = form => {
    if (modal === 'add') {
      setTxns(prev => [{ ...form, id: Date.now(), amount: Number(form.amount) }, ...prev]);
    } else {
      setTxns(prev => prev.map(t => t.id === modal.id ? { ...modal, ...form, amount: Number(form.amount) } : t));
    }
    setModal(null);
  };

  const handleDelete = id => {
    if (window.confirm('Delete this transaction?')) {
      setTxns(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{txns.length} transactions recorded</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <div className="txn-filters">
          <div className="filter-search">
            <MdSearch className="filter-search-icon" size={17} />
            <input
              className="filter-input"
              placeholder="Search transactions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="form-control filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-control filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            className="form-control filter-select"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setCatFilter('All'); setTypeFilter('all'); setDateFilter(''); }}
          >
            <MdFilterList size={15} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No transactions found.</td></tr>
              )}
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="text-muted">{t.date}</td>
                  <td className="fw-700">{t.desc}</td>
                  <td><span className="badge badge-primary">{t.category}</span></td>
                  <td className="text-muted">{t.method}</td>
                  <td className={t.type === 'income' ? 'text-income' : 'text-expense'}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td>
                    <span className={`badge badge-${t.type}`}>
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      onEdit={() => setModal(t)}
                      onDelete={() => handleDelete(t.id)}
                      size="md"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <TxnModal
          txn={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <style>{`
        .txn-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .filter-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }
        .filter-search-icon {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .filter-input {
          width: 100%;
          padding: 9px 14px 9px 34px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          outline: none;
          transition: border-color var(--transition);
          font-family: var(--font);
        }
        .filter-input:focus { border-color: var(--primary); }
        .filter-select { width: auto; min-width: 130px; }

      `}</style>
    </div>
  );
}
