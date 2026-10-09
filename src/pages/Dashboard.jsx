// Dashboard.jsx
// All data here is mock/dummy. When PostgreSQL backend is ready, replace the
// constants below with fetch() calls to your Python API endpoints.
//
// Suggested PostgreSQL tables this page will draw from:
//   users(user_id, name, email, ...)
//   transactions(txn_id, user_id, description, amount, type, category_id, payment_method, date)
//   categories(category_id, name, icon, color)
//   budgets(budget_id, user_id, category_id, monthly_limit, month, year)

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAccountBalance, MdTrendingUp, MdTrendingDown,
  MdWallet, MdAdd, MdFastfood, MdDirectionsCar,
  MdShoppingCart, MdFlashOn, MdMovieCreation,
  MdArrowForward,
} from 'react-icons/md';
import Card from '../components/Card';

// ── Dummy data (replace with API response later) ───────────
const SUMMARY = {
  balance:       11800,
  income:        28000,
  expense:       16200,
  budget:        20000,
  budgetSpent:   16200,
};

const RECENT_TXN = [
  { id: 1, desc: 'Zomato Order',        category: 'Food',        amount: 320,   date: '2025-07-24', type: 'expense', method: 'UPI'         },
  { id: 2, desc: 'Freelance Payment',   category: 'Salary',      amount: 15000, date: '2025-07-23', type: 'income',  method: 'Net Banking' },
  { id: 3, desc: 'Metro Card Recharge', category: 'Transport',   amount: 500,   date: '2025-07-22', type: 'expense', method: 'UPI'         },
  { id: 4, desc: 'Amazon Purchase',     category: 'Shopping',    amount: 1250,  date: '2025-07-21', type: 'expense', method: 'Credit Card' },
  { id: 5, desc: 'Electricity Bill',    category: 'Utilities',   amount: 740,   date: '2025-07-20', type: 'expense', method: 'Net Banking' },
];

const CATEGORY_SPEND = [
  { name: 'Food',          icon: <MdFastfood />,     spent: 3200, color: '#e67e22' },
  { name: 'Transport',     icon: <MdDirectionsCar />, spent: 1800, color: '#3498db' },
  { name: 'Shopping',      icon: <MdShoppingCart />,  spent: 4500, color: '#9b59b6' },
  { name: 'Utilities',     icon: <MdFlashOn />,       spent: 1200, color: '#1abc9c' },
  { name: 'Entertainment', icon: <MdMovieCreation />, spent: 900,  color: '#e74c3c' },
];

// 6-month trend for the SVG line chart
const MONTHLY = [
  { month: 'Feb', income: 20000, expense: 10200 },
  { month: 'Mar', income: 22000, expense: 11400 },
  { month: 'Apr', income: 24000, expense: 13500 },
  { month: 'May', income: 21000, expense: 12000 },
  { month: 'Jun', income: 26000, expense: 14800 },
  { month: 'Jul', income: 28000, expense: 16200 },
];

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

// ── SVG Line Chart (no library) ────────────────────────────
function LineChart({ data }) {
  const W = 480, H = 140, PX = 32, PY = 16;
  const innerW = W - PX * 2;
  const innerH = H - PY * 2;
  const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]));

  const x = i => PX + (i / (data.length - 1)) * innerW;
  const y = v => PY + (1 - v / maxVal) * innerH;

  const linePath = arr =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');

  const areaPath = (arr, baseline) =>
    `${linePath(arr)} L${x(arr.length - 1)},${baseline} L${x(0)},${baseline} Z`;

  const incomeVals  = data.map(d => d.income);
  const expenseVals = data.map(d => d.expense);
  const baseline    = y(0);

  return (
    <div className="chart-container">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 140 }}>
        <defs>
          <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#27ae60" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#27ae60" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#e74c3c" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#e74c3c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map(f => (
          <line
            key={f}
            x1={PX} y1={y(maxVal * f)}
            x2={W - PX} y2={y(maxVal * f)}
            stroke="#e8f0ec" strokeWidth="1"
          />
        ))}

        {/* Area fills */}
        <path d={areaPath(incomeVals,  baseline)} fill="url(#incomeGrad)" />
        <path d={areaPath(expenseVals, baseline)} fill="url(#expenseGrad)" />

        {/* Lines */}
        <path d={linePath(incomeVals)}  fill="none" stroke="#27ae60" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath(expenseVals)} fill="none" stroke="#e74c3c" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

        {/* Data points */}
        {data.map((d, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(d.income)}  r="4" fill="#fff" stroke="#27ae60" strokeWidth="2" />
            <circle cx={x(i)} cy={y(d.expense)} r="4" fill="#fff" stroke="#e74c3c" strokeWidth="2" />
          </g>
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={x(i)} y={H - 2}
            textAnchor="middle"
            fontSize="10"
            fill="#6b8c7e"
            fontWeight="600"
          >
            {d.month}
          </text>
        ))}
      </svg>

      <div className="chart-legend-row">
        <span className="chart-legend-item">
          <span className="legend-line" style={{ background: '#27ae60' }} /> Income
        </span>
        <span className="chart-legend-item">
          <span className="legend-line" style={{ background: '#e74c3c' }} /> Expense
        </span>
      </div>
    </div>
  );
}

// ── CSS Donut / Pie chart via conic-gradient ───────────────
function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.spent, 0);
  let deg = 0;
  const stops = data.map(d => {
    const slice = (d.spent / total) * 360;
    const from  = deg;
    deg += slice;
    return `${d.color} ${from.toFixed(1)}deg ${deg.toFixed(1)}deg`;
  });

  return (
    <div className="donut-wrap">
      <div
        className="donut-ring"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      >
        <div className="donut-hole">
          <div className="donut-total">{fmt(total)}</div>
          <div className="donut-label">Total Spent</div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map(d => (
          <div key={d.name} className="donut-legend-row">
            <span className="donut-dot" style={{ background: d.color }} />
            <span className="donut-name">{d.name}</span>
            <span className="donut-val">{fmt(d.spent)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Quick Add Modal ────────────────────────────────────────
function QuickAddModal({ onClose }) {
  const [form, setForm] = useState({
    desc: '', amount: '', category: 'Food', type: 'expense', method: 'UPI', date: '',
  });
  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = () => {
    // TODO: POST to /api/transactions when backend is ready
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Quick Add Transaction</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-control" name="desc" placeholder="e.g. Zomato Order" value={form.desc} onChange={ch} />
        </div>

        <div className="modal-row">
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

        <div className="modal-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" name="category" value={form.category} onChange={ch}>
              {['Food','Transport','Shopping','Utilities','Entertainment','Healthcare','Education','Salary','Others'].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select className="form-control" name="method" value={form.method} onChange={ch}>
              {['Cash','UPI','Credit Card','Debit Card','Net Banking'].map(m => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-control" name="date" type="date" value={form.date} onChange={ch} />
        </div>

        <div className="modal-footer-btns">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd}>
            <MdAdd size={16} /> Add Transaction
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { balance, income, expense, budget, budgetSpent } = SUMMARY;
  const budgetRemaining = budget - budgetSpent;
  const budgetPct       = Math.round((budgetSpent / budget) * 100);

  return (
    <div className="dashboard">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Good morning, Arjun 👋</h1>
          <p className="page-subtitle">Financial summary for July 2025</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd size={18} /> Quick Add
        </button>
      </div>

      {/* ── Top summary cards ── */}
      <div className="db-cards mb-24">
        <Card
          title="Total Balance"
          value={fmt(balance)}
          subtitle="As of today"
          icon={<MdAccountBalance />}
          color="var(--primary)"
          trend="8.4%"
          trendUp
        />
        <Card
          title="Monthly Income"
          value={fmt(income)}
          subtitle="July 2025"
          icon={<MdTrendingUp />}
          color="var(--income-color)"
          trend="12%"
          trendUp
        />
        <Card
          title="Monthly Expense"
          value={fmt(expense)}
          subtitle="July 2025"
          icon={<MdTrendingDown />}
          color="var(--expense-color)"
          trend="4.2%"
          trendUp={false}
        />
        <Card
          title="Remaining Budget"
          value={fmt(budgetRemaining)}
          subtitle={`${budgetPct}% of ${fmt(budget)} used`}
          icon={<MdWallet />}
          color="var(--accent)"
        />
      </div>

      {/* ── Budget progress bar ── */}
      <div className="card mb-24 budget-strip">
        <div className="budget-strip-top">
          <span className="budget-strip-label">Monthly Budget Progress</span>
          <span className="budget-strip-pct" style={{ color: budgetPct > 80 ? 'var(--danger)' : 'var(--primary)' }}>
            {budgetPct}% used
          </span>
        </div>
        <div className="progress-bar-wrap" style={{ height: 12, borderRadius: 8 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${budgetPct}%`,
              background: budgetPct > 80
                ? 'var(--danger)'
                : budgetPct > 60
                  ? 'var(--warning)'
                  : 'var(--primary)',
              borderRadius: 8,
            }}
          />
        </div>
        <div className="budget-strip-row">
          <span className="text-muted" style={{ fontSize: 12 }}>Spent: <strong className="text-expense">{fmt(budgetSpent)}</strong></span>
          <span className="text-muted" style={{ fontSize: 12 }}>Remaining: <strong style={{ color: 'var(--primary)' }}>{fmt(budgetRemaining)}</strong></span>
          <span className="text-muted" style={{ fontSize: 12 }}>Limit: <strong>{fmt(budget)}</strong></span>
        </div>
      </div>

      {/* ── Charts row ── */}
      <div className="db-charts mb-24">
        {/* SVG Line chart */}
        <div className="card">
          <div className="chart-header">
            <div className="chart-title">Income vs Expense Trend</div>
            <span className="chart-period">Last 6 months</span>
          </div>
          <LineChart data={MONTHLY} />
        </div>

        {/* Donut chart */}
        <div className="card">
          <div className="chart-header">
            <div className="chart-title">Spending by Category</div>
            <span className="chart-period">July 2025</span>
          </div>
          <DonutChart data={CATEGORY_SPEND} />
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="card">
        <div className="section-row">
          <div className="chart-title">Recent Transactions</div>
          <button className="btn btn-outline btn-sm view-all-btn" onClick={() => navigate('/transactions')}>
            View All <MdArrowForward size={14} />
          </button>
        </div>

        <div className="table-wrap mt-16">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_TXN.map(t => (
                <tr key={t.id}>
                  <td className="text-muted" style={{ fontSize: 13 }}>{t.date}</td>
                  <td className="fw-700">{t.desc}</td>
                  <td>
                    <span className="badge badge-primary">{t.category}</span>
                  </td>
                  <td className="text-muted" style={{ fontSize: 13 }}>{t.method}</td>
                  <td className={t.type === 'income' ? 'text-income' : 'text-expense'}>
                    {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                  </td>
                  <td>
                    <span className={`badge badge-${t.type}`}>
                      {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <QuickAddModal onClose={() => setShowModal(false)} />}

      {/* ── Page-scoped styles ── */}
      <style>{`
        .dashboard { display: flex; flex-direction: column; }

        /* 4-col card grid */
        .db-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        /* Budget strip */
        .budget-strip { display: flex; flex-direction: column; gap: 10px; }
        .budget-strip-top {
          display: flex; justify-content: space-between; align-items: center;
        }
        .budget-strip-label { font-size: 13px; font-weight: 600; color: var(--text-muted); }
        .budget-strip-pct   { font-size: 13px; font-weight: 700; }
        .budget-strip-row   {
          display: flex; justify-content: space-between;
          flex-wrap: wrap; gap: 8px;
        }

        /* Charts 2-col */
        .db-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        /* Chart card internals */
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }
        .chart-title  { font-size: 14px; font-weight: 700; color: var(--text-main); }
        .chart-period { font-size: 12px; color: var(--text-muted); }

        /* SVG line chart */
        .chart-container { display: flex; flex-direction: column; gap: 10px; }
        .chart-legend-row {
          display: flex; gap: 16px;
          font-size: 12px; color: var(--text-muted); align-items: center;
          justify-content: flex-end;
        }
        .chart-legend-item { display: flex; align-items: center; gap: 6px; }
        .legend-line {
          width: 20px; height: 3px; border-radius: 2px; display: inline-block;
        }

        /* Donut chart */
        .donut-wrap  {
          display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
        }
        .donut-ring  {
          width: 150px; height: 150px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .donut-hole  {
          width: 96px; height: 96px; border-radius: 50%; background: #fff;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 2px;
        }
        .donut-total { font-size: 12px; font-weight: 800; color: var(--text-main); }
        .donut-label { font-size: 10px; color: var(--text-muted); }
        .donut-legend { display: flex; flex-direction: column; gap: 9px; flex: 1; min-width: 120px; }
        .donut-legend-row {
          display: flex; align-items: center; gap: 8px; font-size: 12px;
        }
        .donut-dot  { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .donut-name { flex: 1; color: var(--text-muted); }
        .donut-val  { font-weight: 700; color: var(--text-main); font-size: 12px; }

        /* Section row (title + action) */
        .section-row {
          display: flex; justify-content: space-between; align-items: center;
        }
        .view-all-btn { display: flex; align-items: center; gap: 4px; }

        /* Modal helpers */
        .modal-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .modal-footer-btns {
          display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .db-cards { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .db-cards   { grid-template-columns: 1fr; }
          .db-charts  { grid-template-columns: 1fr; }
          .modal-row  { grid-template-columns: 1fr; }
          .donut-wrap { justify-content: center; }
          .budget-strip-row { flex-direction: column; gap: 4px; }
        }
      `}</style>
    </div>
  );
}
