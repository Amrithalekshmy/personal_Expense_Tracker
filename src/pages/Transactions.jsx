// Transactions.jsx — Full CRUD transaction table
// Features: search, filter by type/category/date, add/edit/delete modal.
// Data comes from GET /api/transactions; filters are sent as query params and
// applied in the SQL WHERE clause on the backend.

import { useState, useEffect, useCallback } from 'react';
import { MdAdd, MdSearch, MdFilterList } from 'react-icons/md';
import ActionButtons from '../components/ActionButtons';
import { api, fmt, today, PAYMENT_METHODS } from '../api';

// ── Add/Edit Modal ─────────────────────────────────────────
// Shared with the Dashboard's Quick Add button.
export function TxnModal({ txn, categories, onSaved, onClose }) {
  const [form, setForm] = useState(() => txn
    ? {
        description: txn.description || '', amount: txn.amount, category_id: txn.category_id,
        transaction_type: txn.transaction_type, payment_method: txn.payment_method,
        transaction_date: txn.transaction_date,
      }
    : {
        description: '', amount: '', category_id: '', transaction_type: 'Expense',
        payment_method: 'UPI', transaction_date: today(),
      });
  const [error, setError] = useState('');
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // Only categories of the chosen type can be picked
  const options = categories.filter(c => c.category_type === form.transaction_type);
  const categoryId = options.some(c => c.category_id === Number(form.category_id))
    ? form.category_id
    : (options[0]?.category_id ?? '');

  const save = async () => {
    setError('');
    try {
      const payload = { ...form, category_id: categoryId };
      if (txn) await api(`/transactions/${txn.transaction_id}`, { method: 'PUT', body: payload });
      else     await api('/transactions', { method: 'POST', body: payload });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{txn ? 'Edit Transaction' : 'Add Transaction'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-control" name="description" placeholder="e.g. Zomato Order" value={form.description} onChange={ch} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input className="form-control" name="amount" type="number" min="0" step="0.01" placeholder="0" value={form.amount} onChange={ch} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-control" name="transaction_type" value={form.transaction_type} onChange={ch}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" name="category_id" value={categoryId} onChange={ch}>
              {options.length === 0 && <option value="">No {form.transaction_type} categories</option>}
              {options.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" name="payment_method" value={form.payment_method} onChange={ch}>
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-control" name="transaction_date" type="date" value={form.transaction_date} onChange={ch} />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save}>
            {txn ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | {txn object}
  const [error, setError] = useState('');

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (search)     params.set('search', search);
    if (catFilter)  params.set('category_id', catFilter);
    if (typeFilter) params.set('type', typeFilter);
    if (dateFilter) params.set('date', dateFilter);
    api(`/transactions?${params}`)
      .then(d => { setTxns(d.transactions); setTotal(d.total); })
      .catch(err => setError(err.message));
  }, [search, catFilter, typeFilter, dateFilter]);

  useEffect(load, [load]);

  useEffect(() => {
    api('/categories').then(setCategories).catch(err => setError(err.message));
  }, []);

  const handleSaved = () => {
    setModal(null);
    load();
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await api(`/transactions/${id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{total} transactions recorded</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('add')}>
          <MdAdd size={18} /> Add Transaction
        </button>
      </div>

      {error && <div className="form-error mb-24">{error}</div>}

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
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <select className="form-control filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <input
            className="form-control filter-select"
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setCatFilter(''); setTypeFilter(''); setDateFilter(''); }}
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
              {txns.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No transactions found.</td></tr>
              )}
              {txns.map(t => (
                <tr key={t.transaction_id}>
                  <td className="text-muted">{t.transaction_date}</td>
                  <td className="fw-700">{t.description}</td>
                  <td><span className="badge badge-primary">{t.category_name}</span></td>
                  <td className="text-muted">{t.payment_method}</td>
                  <td className={t.transaction_type === 'Income' ? 'text-income' : 'text-expense'}>
                    {t.transaction_type === 'Income' ? '+' : '-'}{fmt(t.amount)}
                  </td>
                  <td>
                    <span className={`badge badge-${t.transaction_type.toLowerCase()}`}>
                      {t.transaction_type}
                    </span>
                  </td>
                  <td>
                    <ActionButtons
                      onEdit={() => setModal(t)}
                      onDelete={() => handleDelete(t.transaction_id)}
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
          categories={categories}
          onSaved={handleSaved}
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
