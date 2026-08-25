import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useExpense } from '../../context/ExpenseContext';

export default function BarChart({ data = [], height = 180 }) {
  const { settings } = useExpense();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        No weekly data available.
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => Number(d.expense) || 0), 50);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: `${height}px`, gap: '8px', padding: '10px 0 0 0' }}>
        {data.map((item, idx) => {
          const heightPct = Math.max(8, ((item.expense || 0) / maxVal) * 100);
          const isHovered = hoveredIdx === idx;
          const isToday = item.isToday;

          return (
            <div
              key={item.date || idx}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                height: '100%',
                justifyContent: 'flex-end',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on hover */}
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: isHovered || isToday ? 'var(--text-main)' : 'transparent',
                  height: '18px',
                  transition: 'color 150ms ease'
                }}
              >
                {formatCurrency(item.expense || 0, settings.currency, settings.currencySymbol)}
              </div>

              {/* Bar Fill */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '32px',
                  height: `${heightPct}%`,
                  borderRadius: 'var(--radius-xs)',
                  background: isToday
                    ? 'linear-gradient(180deg, var(--color-primary), var(--color-primary-dark))'
                    : isHovered
                    ? 'var(--color-primary-light)'
                    : 'var(--bg-card-hover)',
                  border: isToday ? '1px solid var(--color-primary-light)' : '1px solid var(--border-subtle)',
                  boxShadow: isToday ? '0 4px 12px var(--color-primary-glow)' : 'none',
                  transition: 'height 300ms cubic-bezier(0.16, 1, 0.3, 1), background 150ms ease'
                }}
              />

              {/* Day Label */}
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? 'var(--color-primary-light)' : 'var(--text-muted)'
                }}
              >
                {item.dayLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
