// Reports.jsx — Financial analytics page
// Pure CSS charts (no external chart library needed).
// Shows: summary cards, pie chart (category), bar chart (income vs expense), trend line.

import Card from '../components/Card';
import { MdTrendingUp, MdTrendingDown, MdSwapVert, MdReceiptLong } from 'react-icons/md';

// ── Mock data ──────────────────────────────────────────────
const CATEGORY_DATA = [
  { name: 'Food',          value: 3200, color: '#e67e22' },
  { name: 'Transport',     value: 1800, color: '#3498db' },
  { name: 'Shopping',      value: 4500, color: '#9b59b6' },
  { name: 'Utilities',     value: 1200, color: '#1abc9c' },
  { name: 'Entertainment', value: 900,  color: '#e74c3c' },
  { name: 'Healthcare',    value: 500,  color: '#e91e63' },
  { name: 'Education',     value: 2449, color: '#2196f3' },
];

const MONTHLY_DATA = [
  { month: 'Feb', income: 20000, expense: 10200 },
  { month: 'Mar', income: 22000, expense: 11400 },
  { month: 'Apr', income: 24000, expense: 13500 },
  { month: 'May', income: 21000, expense: 12000 },
  { month: 'Jun', income: 26000, expense: 14800 },
  { month: 'Jul', income: 28000, expense: 16200 },
];

const fmt = n => `₹${n.toLocaleString('en-IN')}`;

// ── Pie chart using conic-gradient ─────────────────────────
function PieChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumPct = 0;
  const stops = data.map(d => {
    const pct = (d.value / total) * 100;
    const from = cumPct;
    cumPct += pct;
    return `${d.color} ${from.toFixed(1)}% ${cumPct.toFixed(1)}%`;
  });

  return (
    <div className="pie-wrap">
      <div
        className="pie-circle"
        style={{ background: `conic-gradient(${stops.join(', ')})` }}
      >
        <div className="pie-center">
          <div className="pie-total">{fmt(total)}</div>
          <div className="pie-total-label">Total Expense</div>
        </div>
      </div>
      <div className="pie-legend">
        {data.map(d => (
          <div key={d.name} className="pie-legend-item">
            <span className="pie-dot" style={{ background: d.color }} />
            <span className="pie-legend-name">{d.name}</span>
            <span className="pie-legend-val">{fmt(d.value)}</span>
            <span className="pie-legend-pct">({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Grouped bar chart ──────────────────────────────────────
function BarChart({ data }) {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense]));
  return (
    <div className="bar-chart-wrap">
      <div className="bar-chart">
        {data.map(d => (
          <div key={d.month} className="bar-group">
            <div className="bar-col-pair">
              <div className="bar-col-wrap">
                <div
                  className="bar-col income-col"
                  style={{ height: `${(d.income / max) * 140}px` }}
                  title={`Income: ${fmt(d.income)}`}
                />
              </div>
              <div className="bar-col-wrap">
                <div
                  className="bar-col expense-col"
                  style={{ height: `${(d.expense / max) * 140}px` }}
                  title={`Expense: ${fmt(d.expense)}`}
                />
              </div>
            </div>
            <div className="bar-month-label">{d.month}</div>
          </div>
        ))}
      </div>
      <div className="bar-legend-row">
        <span><span className="legend-swatch" style={{ background: 'var(--income-color)' }} /> Income</span>
        <span><span className="legend-swatch" style={{ background: 'var(--expense-color)' }} /> Expense</span>
      </div>
    </div>
  );
}

// ── Trend line (SVG sparkline) ─────────────────────────────
function TrendLine({ data }) {
  const W = 500, H = 120, PAD = 20;
  const maxE = Math.max(...data.map(d => d.expense));
  const pts = data.map((d, i) => {
    const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const y = PAD + ((maxE - d.expense) / maxE) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const area = `${pts[0].split(',')[0]},${H} ${polyline} ${pts[pts.length - 1].split(',')[0]},${H}`;

  return (
    <div className="trend-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
        <defs>
          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#trendGrad)" />
        <polyline points={polyline} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((pt, i) => {
          const [x, y] = pt.split(',');
          return <circle key={i} cx={x} cy={y} r="4" fill="var(--primary)" />;
        })}
      </svg>
      <div className="trend-labels">
        {data.map(d => <span key={d.month}>{d.month}</span>)}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────
export default function Reports() {
  const totalExpense = CATEGORY_DATA.reduce((s, d) => s + d.value, 0);
  const highest      = CATEGORY_DATA.reduce((a, b) => a.value > b.value ? a : b);
  const lowest       = CATEGORY_DATA.reduce((a, b) => a.value < b.value ? a : b);
  const totalTxn     = 23;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">July 2025 — Financial Overview</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4 mb-24">
        <Card title="Highest Spending"   value={highest.name}    subtitle={fmt(highest.value)}  icon={<MdTrendingUp />}    color="#e67e22" />
        <Card title="Lowest Spending"    value={lowest.name}     subtitle={fmt(lowest.value)}   icon={<MdTrendingDown />}  color="var(--accent)" />
        <Card title="Total Expenses"     value={fmt(totalExpense)} subtitle="across all categories" icon={<MdReceiptLong />} color="var(--primary)" />
        <Card title="Total Transactions" value={totalTxn}        subtitle="this month"          icon={<MdSwapVert />}      color="#9b59b6" />
      </div>

      {/* Charts row 1 */}
      <div className="grid-2 mb-24">
        <div className="card">
          <div className="card-title mb-16">Spending by Category</div>
          <PieChart data={CATEGORY_DATA} />
        </div>
        <div className="card">
          <div className="card-title mb-16">Income vs Expense (Monthly)</div>
          <BarChart data={MONTHLY_DATA} />
        </div>
      </div>

      {/* Trend chart */}
      <div className="card">
        <div className="card-title mb-16">Expense Trend (6 months)</div>
        <TrendLine data={MONTHLY_DATA} />
      </div>

      <style>{`
        /* Pie chart */
        .pie-wrap   { display: flex; align-items: flex-start; gap: 28px; flex-wrap: wrap; }
        .pie-circle {
          width: 180px; height: 180px; border-radius: 50%;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .pie-center {
          width: 110px; height: 110px; border-radius: 50%;
          background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .pie-total       { font-size: 14px; font-weight: 800; color: var(--text-main); }
        .pie-total-label { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
        .pie-legend { display: flex; flex-direction: column; gap: 10px; flex: 1; min-width: 160px; }
        .pie-legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .pie-dot         { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .pie-legend-name { flex: 1; color: var(--text-main); }
        .pie-legend-val  { font-weight: 600; color: var(--text-main); }
        .pie-legend-pct  { color: var(--text-muted); font-size: 12px; }

        /* Bar chart */
        .bar-chart-wrap { display: flex; flex-direction: column; gap: 10px; }
        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 160px;
        }
        .bar-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          height: 100%;
          gap: 0;
        }
        .bar-col-pair {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          flex: 1;
          width: 100%;
          justify-content: center;
        }
        .bar-col-wrap { display: flex; align-items: flex-end; }
        .bar-col {
          width: 14px;
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: height 0.4s ease;
        }
        .income-col  { background: var(--income-color); opacity: 0.85; }
        .expense-col { background: var(--expense-color); opacity: 0.85; }
        .bar-month-label {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
          padding-top: 6px;
          text-align: center;
          width: 100%;
        }
        .bar-legend-row {
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          font-size: 12px;
          color: var(--text-muted);
          align-items: center;
        }
        .legend-swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 4px; }

        /* Trend */
        .trend-wrap { display: flex; flex-direction: column; gap: 6px; }
        .trend-labels {
          display: flex; justify-content: space-between;
          font-size: 11px; color: var(--text-muted); font-weight: 600;
          padding: 0 4px;
        }
      `}</style>
    </div>
  );
}
