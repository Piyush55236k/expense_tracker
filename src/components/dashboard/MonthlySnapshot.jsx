import React from 'react';
import { Target } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

export default function MonthlySnapshot() {
  const { monthlySummary, settings } = useExpense();
  const budget = Number(settings.monthlyBudget) || 2000;

  const spent = monthlySummary.monthlyExpense;
  const spentPct = budget > 0 ? (spent / budget) * 100 : 0;
  const remaining = Math.max(0, budget - spent);

  const getProgressColor = () => {
    if (spentPct >= 100) return 'var(--color-expense)';
    if (spentPct >= (settings.budgetAlertThreshold || 85)) return 'var(--color-warning)';
    return 'var(--color-primary)';
  };

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} color="var(--color-primary-light)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            {monthName} Budget
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: getProgressColor() }}>
          {spentPct.toFixed(0)}% Used
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          background: 'var(--bg-input)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
          margin: '0.5rem 0 0.85rem 0'
        }}
      >
        <div
          style={{
            width: `${Math.min(100, spentPct)}%`,
            height: '100%',
            background: getProgressColor(),
            borderRadius: 'var(--radius-full)',
            transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        />
      </div>

      {/* Budget Summary Stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>Spent: </span>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
            {formatCurrency(spent, settings.currency, settings.currencySymbol)}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>Remaining: </span>
          <span style={{ fontWeight: 700, color: remaining > 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {formatCurrency(remaining, settings.currency, settings.currencySymbol)}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-dim)' }}>Cap: </span>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>
            {formatCurrency(budget, settings.currency, settings.currencySymbol)}
          </span>
        </div>
      </div>
    </div>
  );
}
