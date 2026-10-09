// ActionButtons.jsx — Reusable Edit + Delete button pair
// Used on Transactions table rows and Category cards.
// Props:
//   onEdit   — called when edit icon clicked
//   onDelete — called when delete icon clicked
//   size     — 'sm' (28px, for cards) | 'md' (32px, for table rows, default)

import { MdEdit, MdDelete } from 'react-icons/md';

export default function ActionButtons({ onEdit, onDelete, size = 'md' }) {
  return (
    <div className="action-btns">
      <button
        className={`action-btn edit action-btn-${size}`}
        onClick={onEdit}
        aria-label="Edit"
      >
        <MdEdit size={size === 'sm' ? 14 : 16} />
      </button>
      <button
        className={`action-btn del action-btn-${size}`}
        onClick={onDelete}
        aria-label="Delete"
      >
        <MdDelete size={size === 'sm' ? 14 : 16} />
      </button>

      <style>{`
        .action-btns { display: flex; gap: 6px; }

        .action-btn {
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          transition: background var(--transition), color var(--transition), transform var(--transition);
        }
        .action-btn:active { transform: scale(0.9); }

        /* Sizes */
        .action-btn-md { width: 32px; height: 32px; }
        .action-btn-sm { width: 28px; height: 28px; border-radius: 6px; }

        /* Colors */
        .action-btn.edit { background: #e8f5ee; color: var(--primary); }
        .action-btn.edit:hover { background: var(--primary); color: #fff; }
        .action-btn.del  { background: #fde8e8; color: var(--danger); }
        .action-btn.del:hover  { background: var(--danger); color: #fff; }
      `}</style>
    </div>
  );
}
