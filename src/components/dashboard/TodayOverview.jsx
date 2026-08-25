import React from 'react';
import { Clock } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

export default function TodayOverview() {
  const { todayStats, settings } = useExpense();

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="var(--color-primary-light)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Today's Activity
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)' }}>
          {todayStats.todayCount} {todayStats.todayCount === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem' }}>
        {/* Income Today */}
        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 0.5rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Income
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-income)',
              marginTop: '2px'
            }}
          >
            +{formatCurrency(todayStats.todayIncome, settings.currency, settings.currencySymbol)}
          </div>
        </div>

        {/* Expense Today */}
        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 0.5rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Expense
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--color-expense)',
              marginTop: '2px'
            }}
          >
            -{formatCurrency(todayStats.todayExpense, settings.currency, settings.currencySymbol)}
          </div>
        </div>

        {/* Net Today */}
        <div
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 0.5rem',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Net
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              fontWeight: 700,
              color: todayStats.todayNet >= 0 ? 'var(--color-income)' : 'var(--color-expense)',
              marginTop: '2px'
            }}
          >
            {todayStats.todayNet >= 0 ? '+' : ''}
            {formatCurrency(todayStats.todayNet, settings.currency, settings.currencySymbol)}
          </div>
        </div>
      </div>
    </div>
  );
}
