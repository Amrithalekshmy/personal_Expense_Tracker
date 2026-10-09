// Profile.jsx — User profile page
//
// Left panel : avatar, name, email, bio, quick stats
// Right panel: editable personal info form + change-password section
//
// All data is dummy. When PostgreSQL backend is ready, replace
// MOCK_USER with a GET /api/users/me response.

import { useState } from 'react';
import {
  MdEdit, MdSave, MdClose, MdLock,
  MdPerson, MdEmail, MdPhone, MdLocationOn, MdCameraAlt,
} from 'react-icons/md';

// ── Dummy user data ────────────────────────────────────────
const MOCK_USER = {
  name:     'Arjun Kumar',
  email:    'arjun.kumar@example.com',
  phone:    '+91 98765 43210',
  location: 'Bengaluru, India',
  joined:   'January 2025',
  bio:      'CS student | Freelance developer | Finance enthusiast',
};

export default function Profile() {
  const [user, setUser]         = useState(MOCK_USER);
  const [editing, setEditing]   = useState(false);
  const [form, setForm]         = useState(MOCK_USER);
  const [showPwd, setShowPwd]   = useState(false);
  const [pwd, setPwd]           = useState({ current: '', next: '', confirm: '' });

  const handleFieldChange    = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handlePasswordChange = e => setPwd(p => ({ ...p, [e.target.name]: e.target.value }));

  const saveProfile = () => {
    setUser(form);
    setEditing(false);
  };

  const cancelEdit = () => {
    setForm(user);   // discard changes
    setEditing(false);
  };

  // Fields shown in the Personal Information form
  const FIELDS = [
    { label: 'Full Name', name: 'name',     icon: <MdPerson />,    type: 'text'  },
    { label: 'Email',     name: 'email',    icon: <MdEmail />,     type: 'email' },
    { label: 'Phone',     name: 'phone',    icon: <MdPhone />,     type: 'tel'   },
    { label: 'Location',  name: 'location', icon: <MdLocationOn />,type: 'text'  },
  ];

  return (
    <div>
      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">View and update your personal information</p>
        </div>
      </div>

      <div className="profile-layout">

        {/* ── Left panel: avatar + summary ── */}
        <div className="card profile-sidebar">

          {/* Avatar with camera overlay */}
          <div className="avatar-wrap">
            <div className="avatar-circle">
              <span className="avatar-initials">AK</span>
              <div className="avatar-overlay">
                <MdCameraAlt size={20} />
              </div>
            </div>
          </div>

          <div className="profile-name">{user.name}</div>
          <div className="profile-email">{user.email}</div>
          <div className="profile-bio">{user.bio}</div>

          {/* Location + joined pills */}
          <div className="profile-meta">
            <span className="meta-pill">
              <MdLocationOn size={13} /> {user.location}
            </span>
            <span className="meta-pill">Joined {user.joined}</span>
          </div>

          {/* Quick stats row */}
          <div className="profile-stats">
            <div className="profile-stat">
              <strong>52</strong>
              <span>Transactions</span>
            </div>
            <div className="profile-stat">
              <strong>9</strong>
              <span>Categories</span>
            </div>
            <div className="profile-stat">
              <strong>₹2.8L</strong>
              <span>Tracked</span>
            </div>
          </div>
        </div>

        {/* ── Right panel: forms ── */}
        <div className="profile-right">

          {/* Personal information card */}
          <div className="card mb-24">
            <div className="flex-between mb-16">
              <h2 className="section-heading">Personal Information</h2>

              {!editing ? (
                <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>
                  <MdEdit size={14} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-8">
                  <button className="btn btn-outline btn-sm" onClick={cancelEdit}>
                    <MdClose size={14} /> Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={saveProfile}>
                    <MdSave size={14} /> Save
                  </button>
                </div>
              )}
            </div>

            {/* 2-column grid of input fields */}
            <div className="profile-fields">
              {FIELDS.map(({ label, name, icon, type }) => (
                <div className="form-group" key={name}>
                  <label className="form-label">{label}</label>
                  <div className="input-icon-wrap">
                    <span className="input-icon">{icon}</span>
                    <input
                      className={`form-control input-with-icon ${editing ? '' : 'field-readonly'}`}
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleFieldChange}
                      readOnly={!editing}
                    />
                  </div>
                </div>
              ))}

              {/* Bio spans full width */}
              <div className="form-group profile-bio-field">
                <label className="form-label">Bio</label>
                <textarea
                  className={`form-control ${editing ? '' : 'field-readonly'}`}
                  name="bio"
                  rows={2}
                  value={form.bio}
                  onChange={handleFieldChange}
                  readOnly={!editing}
                  style={{ resize: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Security / change password card */}
          <div className="card">
            <div className="flex-between mb-8">
              <h2 className="section-heading">Security</h2>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowPwd(p => !p)}
              >
                <MdLock size={14} /> {showPwd ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {!showPwd && (
              <p className="text-muted mt-8" style={{ fontSize: 13 }}>
                Password last changed 3 months ago. Use a strong, unique password.
              </p>
            )}

            {showPwd && (
              <div className="mt-16">
                {[
                  { label: 'Current Password', name: 'current' },
                  { label: 'New Password',      name: 'next'    },
                  { label: 'Confirm Password',  name: 'confirm' },
                ].map(({ label, name }) => (
                  <div className="form-group" key={name}>
                    <label className="form-label">{label}</label>
                    <input
                      className="form-control"
                      type="password"
                      name={name}
                      value={pwd[name]}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                    />
                  </div>
                ))}
                <button
                  className="btn btn-primary"
                  onClick={() => setShowPwd(false)}
                >
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Page-scoped styles ── */}
      <style>{`
        /* 2-column layout: narrow sidebar | wide form area */
        .profile-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 24px;
          align-items: flex-start;
        }

        /* ---- Left sidebar card ---- */
        .profile-sidebar {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }

        /* Avatar */
        .avatar-wrap {
          margin-bottom: 4px;
        }
        .avatar-circle {
          width: 92px;
          height: 92px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 4px 16px rgba(79,70,229,0.3);
          cursor: pointer;
          transition: box-shadow var(--transition);
          overflow: hidden;
        }
        .avatar-circle:hover .avatar-overlay { opacity: 1; }
        .avatar-circle:hover { box-shadow: 0 6px 20px rgba(79,70,229,0.45); }

        .avatar-initials {
          font-size: 28px;
          font-weight: 800;
        }

        /* Camera icon that appears on hover */
        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity var(--transition);
          border-radius: 50%;
        }

        /* Text below avatar */
        .profile-name  { font-size: 18px; font-weight: 800; }
        .profile-email { font-size: 13px; color: var(--text-muted); }
        .profile-bio   { font-size: 13px; color: var(--text-muted); font-style: italic; line-height: 1.5; }

        /* Location / joined pills */
        .profile-meta { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .meta-pill {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg);
          border-radius: 20px;
          padding: 5px 12px;
        }

        /* Quick stats */
        .profile-stats {
          display: flex;
          gap: 8px;
          width: 100%;
          border-top: 1px solid var(--border);
          padding-top: 14px;
          margin-top: 4px;
        }
        .profile-stat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .profile-stat strong { font-size: 15px; font-weight: 800; color: var(--primary); }
        .profile-stat span   { font-size: 11px; color: var(--text-muted); }

        /* ---- Right panel ---- */
        .profile-right { display: flex; flex-direction: column; }

        .section-heading {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-main);
        }

        /* 2-column form grid */
        .profile-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 16px;
        }
        /* Bio field spans both columns */
        .profile-bio-field { grid-column: 1 / -1; }

        /* Read-only field looks like plain text */
        .field-readonly {
          background: var(--bg) !important;
          cursor: default !important;
          border-color: transparent !important;
          color: var(--text-main);
        }
        .field-readonly:focus {
          box-shadow: none !important;
          border-color: transparent !important;
        }

        /* ---- Responsive ---- */
        @media (max-width: 900px) {
          .profile-layout { grid-template-columns: 1fr; }
          .profile-fields { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
