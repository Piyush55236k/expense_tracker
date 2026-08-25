import React from 'react';
import { Award } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { hexToRgba } from '../../utils/helpers';
import CategoryIcon from '../common/CategoryIcon';

export default function CategoryRanking() {
  const { expenseCategoriesBreakdown, settings } = useExpense();

  if (expenseCategoriesBreakdown.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        No category spending recorded yet.
      </div>
    );
  }

  const maxTotal = expenseCategoriesBreakdown[0]?.total || 1;

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--color-primary-light)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Category Rankings
          </h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          Ranked by spending
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {expenseCategoriesBreakdown.map((cat, idx) => {
          const widthPct = (cat.total / maxTotal) * 100;

          return (
            <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {/* Category Info Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', width: '16px' }}>
                    #{idx + 1}
                  </span>
                  <div
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: 'var(--radius-xs)',
                      background: hexToRgba(cat.color, 0.2),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color
                    }}
                  >
                    <CategoryIcon name={cat.icon} size={14} color={cat.color} />
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {cat.category}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    ({cat.count} tx)
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatCurrency(cat.total, settings.currency, settings.currencySymbol)}
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: cat.color, minWidth: '40px', textAlign: 'right' }}>
                    {formatPercentage(cat.percentage)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'var(--bg-input)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    background: cat.color || 'var(--color-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 400ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
