import React, { useState } from 'react';
import { Plus, ArrowDownCircle, ArrowUpCircle, X } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function QuickAddFab() {
  const { openModal } = useExpense();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggle = () => setIsExpanded(prev => !prev);

  const handleAction = (mode) => {
    setIsExpanded(false);
    openModal(mode);
  };

  return (
    <>
      {/* Background Dim Backdrop when FAB menu is open */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 44
          }}
        />
      )}

      {/* Floating Action Menu Items */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(var(--bottom-nav-height) + 80px)',
            right: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'flex-end',
            zIndex: 46
          }}
          className="animate-scale-in"
        >
          {/* Income Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                background: 'var(--bg-card-solid)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Add Income
            </span>
            <button
              onClick={() => handleAction('ADD_INCOME')}
              className="btn-income"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}
              title="Add Income"
            >
              <ArrowUpCircle size={22} />
            </button>
          </div>

          {/* Expense Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                background: 'var(--bg-card-solid)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              Add Expense
            </span>
            <button
              onClick={() => handleAction('ADD_EXPENSE')}
              className="btn-expense"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}
              title="Add Expense"
            >
              <ArrowDownCircle size={22} />
            </button>
          </div>
        </div>
      )}

      {/* Main Floating Action Button */}
      <button
        className="fab-button"
        onClick={toggle}
        aria-label="Quick Action Menu"
        style={{
          transform: isExpanded ? 'rotate(45deg)' : 'none'
        }}
      >
        {isExpanded ? <X size={26} /> : <Plus size={26} />}
      </button>
    </>
  );
}
