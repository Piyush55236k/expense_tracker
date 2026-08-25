import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useExpense } from '../../context/ExpenseContext';

export default function AreaTrendChart({ data = [], height = 220 }) {
  const { settings } = useExpense();
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        No trend data available.
      </div>
    );
  }

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const maxVal = Math.max(
    ...data.map(d => Math.max(Number(d.income) || 0, Number(d.expense) || 0, 100)),
    100
  );

  const getX = (idx) => {
    if (data.length <= 1) return width / 2;
    return paddingX + (idx / (data.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val) => {
    return height - paddingY - (val / maxVal) * (height - paddingY * 2);
  };

  // Generate SVG path points
  const expensePoints = data.map((d, i) => `${getX(i)},${getY(d.expense)}`).join(' ');
  const incomePoints = data.map((d, i) => `${getX(i)},${getY(d.income)}`).join(' ');

  const expenseAreaPath = `M ${getX(0)},${height - paddingY} L ${expensePoints.replace(/ /g, ' L ')} L ${getX(data.length - 1)},${height - paddingY} Z`;
  const incomeAreaPath = `M ${getX(0)},${height - paddingY} L ${incomePoints.replace(/ /g, ' L ')} L ${getX(data.length - 1)},${height - paddingY} Z`;

  const activeData = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Chart Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: 'var(--color-expense)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Expenses</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', borderRadius: '2px', backgroundColor: 'var(--color-income)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Income</span>
          </div>
        </div>

        {activeData && (
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
            {activeData.monthLabel || activeData.dayLabel}:{' '}
            <span style={{ color: 'var(--color-income)' }}>
              +{formatCurrency(activeData.income, settings.currency, settings.currencySymbol)}
            </span>{' '}
            /{' '}
            <span style={{ color: 'var(--color-expense)' }}>
              -{formatCurrency(activeData.expense, settings.currency, settings.currencySymbol)}
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-expense)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-expense)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-income)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-income)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = paddingY + pct * (height - paddingY * 2);
          return (
            <line
              key={i}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border-subtle)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Income Area & Line */}
        <path d={incomeAreaPath} fill="url(#incomeGradient)" />
        <polyline
          fill="none"
          stroke="var(--color-income)"
          strokeWidth="2.5"
          points={incomePoints}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Expense Area & Line */}
        <path d={expenseAreaPath} fill="url(#expenseGradient)" />
        <polyline
          fill="none"
          stroke="var(--color-expense)"
          strokeWidth="2.5"
          points={expensePoints}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data Points & X Axis Labels */}
        {data.map((d, i) => {
          const x = getX(i);
          const yExpense = getY(d.expense);
          const yIncome = getY(d.income);
          const isHovered = hoveredIdx === i;

          return (
            <g key={i}>
              {/* Vertical guideline on hover */}
              {isHovered && (
                <line
                  x1={x}
                  y1={paddingY}
                  x2={x}
                  y2={height - paddingY}
                  stroke="var(--border-card-hover)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Income Point */}
              <circle
                cx={x}
                cy={yIncome}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="var(--color-income)"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* Expense Point */}
              <circle
                cx={x}
                cy={yExpense}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke="var(--color-expense)"
                strokeWidth="2.5"
                style={{ cursor: 'pointer', transition: 'r 150ms ease' }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* X Axis Label */}
              <text
                x={x}
                y={height - 8}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill={isHovered ? 'var(--text-main)' : 'var(--text-dim)'}
              >
                {d.shortLabel || d.dayLabel || d.monthLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
