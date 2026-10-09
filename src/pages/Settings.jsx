// Settings.jsx — App preferences (UI only, no persistence)
// Covers theme toggle, currency, language, notification toggles.

import { useState } from 'react';
import { MdSave, MdPalette, MdLanguage, MdNotifications, MdAttachMoney } from 'react-icons/md';

const CURRENCIES = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)'];
const LANGUAGES  = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

export default function Settings() {
  const [settings, setSettings] = useState({
    theme:          'light',
    currency:       'INR (₹)',
    language:       'English',
    notifBudget:    true,
    notifWeekly:    true,
    notifMonthly:   false,
    notifReminders: true,
  });
  const [saved, setSaved] = useState(false);

  const ch  = e => setSettings(s => ({ ...s, [e.target.name]: e.target.value }));
  const tog = key => setSettings(s => ({ ...s, [key]: !s[key] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Customize your experience</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <MdSave size={17} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="settings-layout">

        {/* Appearance */}
        <div className="card settings-card">
          <div className="settings-section-header">
            <MdPalette size={20} className="settings-icon" />
            <span>Appearance</span>
          </div>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <div className="theme-toggle-row">
              {['light', 'dark'].map(t => (
                <button
                  key={t}
                  className={`theme-btn ${settings.theme === t ? 'active' : ''}`}
                  onClick={() => setSettings(s => ({ ...s, theme: t }))}
                >
                  {t === 'light' ? '☀️ Light' : '🌙 Dark'}
                </button>
              ))}
            </div>
            <p className="settings-hint">Dark mode is a UI toggle only in this version.</p>
          </div>
        </div>

        {/* Currency & Language */}
        <div className="card settings-card">
          <div className="settings-section-header">
            <MdAttachMoney size={20} className="settings-icon" />
            <span>Currency & Language</span>
          </div>
          <div className="form-group">
            <label className="form-label">Currency</label>
            <select className="form-control" name="currency" value={settings.currency} onChange={ch}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Language</label>
            <select className="form-control" name="language" value={settings.language} onChange={ch}>
              {LANGUAGES.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="card settings-card">
          <div className="settings-section-header">
            <MdNotifications size={20} className="settings-icon" />
            <span>Notifications</span>
          </div>
          {[
            { key: 'notifBudget',    label: 'Budget alerts',          desc: 'Alert when you\'re near your budget limit' },
            { key: 'notifWeekly',    label: 'Weekly summary',         desc: 'Get a weekly spending summary report' },
            { key: 'notifMonthly',   label: 'Monthly report',         desc: 'Receive a full monthly financial report' },
            { key: 'notifReminders', label: 'Bill reminders',         desc: 'Reminders for recurring bills and payments' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-label">{label}</div>
                <div className="toggle-desc">{desc}</div>
              </div>
              <button
                className={`toggle-switch ${settings[key] ? 'on' : ''}`}
                onClick={() => tog(key)}
                aria-label={label}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>

        {/* Language section */}
        <div className="card settings-card">
          <div className="settings-section-header">
            <MdLanguage size={20} className="settings-icon" />
            <span>Data & Privacy</span>
          </div>
          <div className="data-actions">
            <div className="data-row">
              <div>
                <div className="toggle-label">Export Data</div>
                <div className="toggle-desc">Download all your transactions as CSV</div>
              </div>
              <button className="btn btn-outline btn-sm">Export CSV</button>
            </div>
            <div className="data-row">
              <div>
                <div className="toggle-label">Clear Data</div>
                <div className="toggle-desc">Remove all transactions and reset the app</div>
              </div>
              <button className="btn btn-danger btn-sm">Clear All</button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: flex-start;
        }

        .settings-card { display: flex; flex-direction: column; gap: 16px; }

        .settings-section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 2px;
        }
        .settings-icon { color: var(--primary); }

        .settings-hint { font-size: 12px; color: var(--text-muted); margin-top: 6px; }

        /* Theme buttons */
        .theme-toggle-row { display: flex; gap: 10px; }
        .theme-btn {
          flex: 1; padding: 10px; border-radius: 10px; font-size: 14px; font-weight: 600;
          border: 2px solid var(--border); background: var(--bg); color: var(--text-muted);
          transition: all var(--transition);
        }
        .theme-btn.active {
          border-color: var(--primary); background: #e8f5ee; color: var(--primary);
        }

        /* Toggle switch */
        .toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 0; border-bottom: 1px solid var(--border);
          gap: 12px;
        }
        .toggle-row:last-child { border-bottom: none; }
        .toggle-info   { flex: 1; }
        .toggle-label  { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .toggle-desc   { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

        .toggle-switch {
          width: 44px; height: 24px; border-radius: 12px;
          background: var(--border); position: relative;
          transition: background var(--transition); flex-shrink: 0;
          border: none;
        }
        .toggle-switch.on { background: var(--primary); }
        .toggle-knob {
          position: absolute; width: 18px; height: 18px; border-radius: 50%;
          background: #fff; top: 3px; left: 3px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform var(--transition);
        }
        .toggle-switch.on .toggle-knob { transform: translateX(20px); }

        /* Data actions */
        .data-actions { display: flex; flex-direction: column; gap: 0; }
        .data-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 0; border-bottom: 1px solid var(--border); gap: 12px;
        }
        .data-row:last-child { border-bottom: none; }

        @media (max-width: 768px) {
          .settings-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
