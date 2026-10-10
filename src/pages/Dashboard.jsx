// Dashboard.jsx
// Everything here comes from GET /api/dashboard, which runs aggregate SQL
// queries (SUM / GROUP BY) over the user's transactions and budgets for the
// current month.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAccountBalance, MdTrendingUp, MdTrendingDown,
  MdWallet, MdAdd, MdArrowForward,
} from 'react-icons/md';
import Card from '../components/Card';
import { TxnModal } from './Transactions';
import { api, fmt, colorFor, monthLabel } from '../api';


// ── SVG Line Chart (no library) ────────────────────────────
function LineChart({ data }) {
  const W = 480, H = 140, PX = 32, PY = 16;
  const innerW = W - PX * 2;
  const innerH = H - PY * 2;
  const maxVal = Math.max(1, ...data.flatMap(d => [d.income, d.expense]));

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
  if (total === 0) return <p className="text-muted" style={{ fontSize: 13 }}>No expenses this month yet.</p>;
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

// ── Main Dashboard ─────────────────────────────────────────
// Percentage change between the last two months of the trend, e.g. "12%"
function change(monthly, key) {
  const [prev, curr] = monthly.slice(-2).map(m => m[key]);
  if (!prev) return undefined;
  return `${Math.abs(Math.round(((curr - prev) / prev) * 100))}%`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/dashboard').then(setData).catch(err => setError(err.message));
  }, []);

  useEffect(load, [load]);

  useEffect(() => {
    api('/categories').then(setCategories).catch(err => setError(err.message));
  }, []);

  if (error) return <div className="form-error">{error}</div>;
  if (!data) return null;

  const { balance, income, expense, budget, budget_spent: budgetSpent } = data.summary;
  const budgetRemaining = budget - budgetSpent;
  const budgetPct       = budget > 0 ? Math.round((budgetSpent / budget) * 100) : 0;
  const month           = monthLabel();
  const categorySpend   = data.category_spend.map(c => ({ ...c, color: colorFor(c.name) }));
  const last2           = data.monthly.slice(-2);

  return (
    <div className="dashboard">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {data.name.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Financial summary for {month}</p>
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
        />
        <Card
          title="Monthly Income"
          value={fmt(income)}
          subtitle={month}
          icon={<MdTrendingUp />}
          color="var(--income-color)"
          trend={change(data.monthly, 'income')}
          trendUp={last2[1]?.income >= last2[0]?.income}
        />
        <Card
          title="Monthly Expense"
          value={fmt(expense)}
          subtitle={month}
          icon={<MdTrendingDown />}
          color="var(--expense-color)"
          trend={change(data.monthly, 'expense')}
          trendUp={last2[1]?.expense >= last2[0]?.expense}
        />
        <Card
          title="Remaining Budget"
          value={fmt(budgetRemaining)}
          subtitle={budget > 0 ? `${budgetPct}% of ${fmt(budget)} used` : 'No budgets set this month'}
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
              width: `${Math.min(100, budgetPct)}%`,
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
          <LineChart data={data.monthly} />
        </div>

        {/* Donut chart */}
        <div className="card">
          <div className="chart-header">
            <div className="chart-title">Spending by Category</div>
            <span className="chart-period">{month}</span>
          </div>
          <DonutChart data={categorySpend} />
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
              {data.recent.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No transactions yet. Use Quick Add to record one.</td></tr>
              )}
              {data.recent.map(t => (
                <tr key={t.transaction_id}>
                  <td className="text-muted" style={{ fontSize: 13 }}>{t.transaction_date}</td>
                  <td className="fw-700">{t.description}</td>
                  <td>
                    <span className="badge badge-primary">{t.category_name}</span>
                  </td>
                  <td className="text-muted" style={{ fontSize: 13 }}>{t.payment_method}</td>
                  <td className={t.transaction_type === 'Income' ? 'text-income' : 'text-expense'}>
                    {t.transaction_type === 'Income' ? '+' : '−'}{fmt(t.amount)}
                  </td>
                  <td>
                    <span className={`badge badge-${t.transaction_type.toLowerCase()}`}>
                      {t.transaction_type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <TxnModal
          categories={categories}
          onSaved={() => { setShowModal(false); load(); }}
          onClose={() => setShowModal(false)}
        />
      )}

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
