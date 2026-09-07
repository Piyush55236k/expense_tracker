import React from 'react';
import { Target, TrendingUp, Sparkles } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

export default function MonthlySnapshot() {
  const { monthlySummary, todayStats, settings } = useExpense();
  const baseBudget = Number(settings.monthlyBudget) || 25000;
  const spent = monthlySummary.monthlyExpense;

  // Additional Budget from Income added today
  const additionalBudgetToday = todayStats.todayIncome || 0;
  const totalAdjustedBudget = baseBudget + additionalBudgetToday;

  // Percentage calculations
  const baseSpentPct = baseBudget > 0 ? (spent / baseBudget) * 100 : 0;

  // Remaining Calculations
  const totalRemaining = Math.max(0, totalAdjustedBudget - spent);

  // Buffer used from additional budget if base budget exceeded
  const extraBufferUsed = spent > baseBudget ? Math.min(additionalBudgetToday, spent - baseBudget) : 0;
  const extraBufferPct = additionalBudgetToday > 0 ? (extraBufferUsed / additionalBudgetToday) * 100 : 0;

  const getBaseProgressColor = () => {
    if (baseSpentPct >= 100) return 'var(--color-expense)';
    if (baseSpentPct >= (settings.budgetAlertThreshold || 85)) return 'var(--color-warning)';
    return 'var(--color-primary)';
  };

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={18} color="var(--color-primary-light)" />
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {monthName} Budget Overview
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Base monthly budget & daily income headroom
            </span>
          </div>
        </div>

        {additionalBudgetToday > 0 ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--color-income)',
              fontSize: '0.72rem',
              fontWeight: 700
            }}
          >
            <Sparkles size={12} />
            <span>+{formatCurrency(additionalBudgetToday, settings.currency, settings.currencySymbol)} Today</span>
          </div>
        ) : (
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: getBaseProgressColor() }}>
            {baseSpentPct.toFixed(0)}% Base Used
          </span>
        )}
      </div>

      {/* BAR 1: Base Monthly Budget Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
            1. Base Monthly Budget Limit
          </span>
          <span style={{ fontWeight: 700, color: getBaseProgressColor() }}>
            {formatCurrency(spent, settings.currency, settings.currencySymbol)} / {formatCurrency(baseBudget, settings.currency, settings.currencySymbol)} ({baseSpentPct.toFixed(0)}%)
          </span>
        </div>

        <div
          style={{
            width: '100%',
            height: '9px',
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div
            style={{
              width: `${Math.min(100, baseSpentPct)}%`,
              height: '100%',
              background: getBaseProgressColor(),
              borderRadius: 'var(--radius-full)',
              transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </div>

      {/* BAR 2: Additional Budget from Today's Income (Treated Separately) */}
      <div
        style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          background: additionalBudgetToday > 0 ? 'rgba(16, 185, 129, 0.06)' : 'var(--bg-input)',
          border: `1px solid ${additionalBudgetToday > 0 ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-subtle)'}`
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={13} color={additionalBudgetToday > 0 ? 'var(--color-income)' : 'var(--text-dim)'} />
            <span style={{ fontWeight: 600, color: additionalBudgetToday > 0 ? 'var(--color-income)' : 'var(--text-dim)' }}>
              2. Additional Budget (Income Added Today)
            </span>
          </div>

          <span style={{ fontWeight: 700, color: additionalBudgetToday > 0 ? 'var(--color-income)' : 'var(--text-dim)' }}>
            {additionalBudgetToday > 0 ? `+${formatCurrency(additionalBudgetToday, settings.currency, settings.currencySymbol)} added` : 'No income added today'}
          </span>
        </div>

        {/* Progress Bar for Additional Budget Buffer */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            marginTop: '4px'
          }}
        >
          {additionalBudgetToday > 0 ? (
            <div
              style={{
                width: extraBufferUsed > 0 ? `${Math.min(100, extraBufferPct)}%` : '100%',
                height: '100%',
                background: extraBufferUsed > 0
                  ? 'linear-gradient(90deg, #10b981, #f59e0b)'
                  : 'linear-gradient(90deg, #10b981, #06b6d4)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 400ms ease'
              }}
            />
          ) : (
            <div style={{ width: '0%', height: '100%' }} />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '4px' }}>
          <span>
            {additionalBudgetToday > 0
              ? (extraBufferUsed > 0 ? `${formatCurrency(extraBufferUsed, settings.currency, settings.currencySymbol)} buffer utilized` : 'Full additional buffer intact')
              : 'Add income today to expand your monthly spending limit'}
          </span>
          {additionalBudgetToday > 0 && (
            <span style={{ color: 'var(--color-income)', fontWeight: 600 }}>
              Available: +{formatCurrency(additionalBudgetToday - extraBufferUsed, settings.currency, settings.currencySymbol)}
            </span>
          )}
        </div>
      </div>

      {/* Comprehensive Budget Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '0.65rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8rem'
        }}
      >
        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Base Budget</div>
          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
            {formatCurrency(baseBudget, settings.currency, settings.currencySymbol)}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Today's Income</div>
          <div style={{ fontWeight: 700, color: additionalBudgetToday > 0 ? 'var(--color-income)' : 'var(--text-muted)', fontSize: '0.92rem' }}>
            {additionalBudgetToday > 0 ? `+${formatCurrency(additionalBudgetToday, settings.currency, settings.currencySymbol)}` : '₹0'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Effective Total</div>
          <div style={{ fontWeight: 700, color: 'var(--color-primary-light)', fontSize: '0.92rem' }}>
            {formatCurrency(totalAdjustedBudget, settings.currency, settings.currencySymbol)}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Total Spent</div>
          <div style={{ fontWeight: 700, color: spent > baseBudget ? 'var(--color-warning)' : 'var(--text-main)', fontSize: '0.92rem' }}>
            {formatCurrency(spent, settings.currency, settings.currencySymbol)}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.72rem' }}>Remaining</div>
          <div style={{ fontWeight: 800, color: totalRemaining > 0 ? 'var(--color-income)' : 'var(--color-expense)', fontSize: '0.95rem' }}>
            {formatCurrency(totalRemaining, settings.currency, settings.currencySymbol)}
          </div>
        </div>
      </div>
    </div>
  );
}
