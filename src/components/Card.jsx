// Card.jsx — Reusable stat card used on Dashboard and Reports
// Props: title, value, subtitle, icon, color (CSS color string), trend ("+12%" etc.)

export default function Card({ title, value, subtitle, icon, color = 'var(--primary)', trend, trendUp }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <span className="stat-card-icon" style={{ background: color + '18', color }}>
          {icon}
        </span>
      </div>
      <div className="stat-card-value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-card-footer">
          {subtitle && <span className="stat-subtitle">{subtitle}</span>}
          {trend && (
            <span className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
              {trendUp ? '▲' : '▼'} {trend}
            </span>
          )}
        </div>
      )}

      <style>{`
        .stat-card {
          background: #fff;
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: box-shadow var(--transition), transform var(--transition);
        }
        .stat-card:hover {
          box-shadow: var(--shadow-hover);
          transform: translateY(-2px);
        }

        .stat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-card-title {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-muted);
        }

        .stat-card-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .stat-card-value {
          font-size: 26px;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.2;
        }

        .stat-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }

        .stat-subtitle {
          font-size: 12px;
          color: var(--text-muted);
        }

        .stat-trend {
          font-size: 12px;
          font-weight: 700;
          border-radius: 20px;
          padding: 2px 8px;
        }
        .stat-trend.up   { background: #d4f5e2; color: var(--income-color); }
        .stat-trend.down { background: #fde8e8; color: var(--expense-color); }
      `}</style>
    </div>
  );
}
