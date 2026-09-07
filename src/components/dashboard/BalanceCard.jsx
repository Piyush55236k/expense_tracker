import React, { useState } from 'react';
import { Eye, EyeOff, ArrowDownRight, ArrowUpRight, Plus, Sparkles, HelpCircle, X } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

export default function BalanceCard() {
  const { balanceStats, settings, openModal } = useExpense();
  const [showBalance, setShowBalance] = useState(!settings.hideBalanceOnOpen);
  const [showSavingsInfo, setShowSavingsInfo] = useState(false);

  const netSavings = Math.max(0, balanceStats.totalIncome - balanceStats.totalExpense);

  return (
    <>
      <div className="hero-balance-card animate-scale-in">
        {/* Card Header: Title and Hide/Reveal Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
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

          {/* Savings Rate Badge with Info Trigger */}
          <button
            onClick={() => setShowSavingsInfo(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
            title="Click to see how Savings % is calculated"
          >
            <Sparkles size={12} color="#fbbf24" />
            <span>Savings Rate: {formatPercentage(balanceStats.savingsRate, 0)}</span>
            <HelpCircle size={12} style={{ opacity: 0.8 }} />
          </button>
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

      {/* Savings Calculation Info Modal */}
      {showSavingsInfo && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShowSavingsInfo(false)}
        >
          <div
            className="glass-card animate-scale-in"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '1.5rem',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#fbbf24" />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Savings Rate Calculation
                </h3>
              </div>
              <button
                onClick={() => setShowSavingsInfo(false)}
                className="btn-icon"
                style={{ width: '30px', height: '30px' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Savings Rate shows the percentage of your total income that you kept rather than spent:
            </p>

            {/* Formula Box */}
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                color: 'var(--color-primary-light)',
                textAlign: 'center',
                marginBottom: '1rem',
                fontWeight: 600
              }}
            >
              Savings % = ((Total Income - Total Expenses) / Total Income) × 100
            </div>

            {/* Live Values Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Income:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-income)' }}>
                  +{formatCurrency(balanceStats.totalIncome, settings.currency, settings.currencySymbol)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Total Expenses:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-expense)' }}>
                  -{formatCurrency(balanceStats.totalExpense, settings.currency, settings.currencySymbol)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Net Savings:</span>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {formatCurrency(netSavings, settings.currency, settings.currencySymbol)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>Resulting Savings Rate:</span>
                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>
                  {formatPercentage(balanceStats.savingsRate)}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowSavingsInfo(false)}
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.6rem' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
