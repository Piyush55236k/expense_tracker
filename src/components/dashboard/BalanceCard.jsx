import React, { useState } from 'react';
import { Eye, EyeOff, ArrowDownRight, ArrowUpRight, Plus, Sparkles } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export default function BalanceCard() {
  const { balanceStats, settings, openModal } = useExpense();
  const [showBalance, setShowBalance] = useState(!settings.hideBalanceOnOpen);

  return (
    <div className="hero-balance-card animate-scale-in">
      {/* Card Header: Title and Hide/Reveal Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="balance-title">
          <span>Total Net Balance</span>
          <button
            onClick={() => setShowBalance(prev => !prev)}
            style={{ color: 'rgba(255, 255, 255, 0.75)', display: 'flex', alignItems: 'center' }}
            aria-label={showBalance ? 'Hide balance' : 'Show balance'}
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {balanceStats.savingsRate > 0 && (
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Sparkles size={12} color="#fbbf24" />
            <span>Savings Rate: {formatPercentage(balanceStats.savingsRate, 0)}</span>
          </div>
        )}
      </div>

      {/* Main Balance Display */}
      <div className="balance-huge">
        {showBalance ? (
          formatCurrency(balanceStats.netBalance, settings.currency, settings.currencySymbol)
        ) : (
          <span style={{ letterSpacing: '4px' }}>••••••••</span>
        )}
      </div>

      {/* Income & Expense Breakdown Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
        {/* Total Income */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}
          >
            <ArrowUpRight size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
              Total Income
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              {showBalance ? formatCurrency(balanceStats.totalIncome, settings.currency, settings.currencySymbol) : '••••'}
            </div>
          </div>
        </div>

        {/* Total Expense */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185'
            }}
          >
            <ArrowDownRight size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>
              Total Expenses
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
              {showBalance ? formatCurrency(balanceStats.totalExpense, settings.currency, settings.currencySymbol) : '••••'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts inside Hero Card */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
        <button
          className="btn btn-expense"
          onClick={() => openModal('ADD_EXPENSE')}
          style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          Expense
        </button>
        <button
          className="btn btn-income"
          onClick={() => openModal('ADD_INCOME')}
          style={{ flex: 1, padding: '0.55rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          Income
        </button>
      </div>
    </div>
  );
}
