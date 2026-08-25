import React, { useState } from 'react';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useExpense } from '../../context/ExpenseContext';

export default function DonutChart({ data = [], size = 240, strokeWidth = 32 }) {
  const { settings } = useExpense();
  const [hoveredSlice, setHoveredSlice] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
        No spending data for this period.
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate slices with cumulative percentages
  const slices = [];
  let currentCumulative = 0;
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const percent = total > 0 ? item.total / total : 0;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * currentCumulative;
    currentCumulative += percent;

    slices.push({
      ...item,
      strokeDasharray,
      strokeDashoffset,
      index: i
    });
  }

  const activeItem = hoveredSlice !== null ? data[hoveredSlice] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {/* Background Ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--border-subtle)"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredSlice === slice.index;
            return (
              <circle
                key={slice.category || slice.mode || slice.index}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={slice.color || '#6366f1'}
                strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: 'stroke-width 200ms ease, opacity 200ms ease',
                  cursor: 'pointer',
                  opacity: hoveredSlice === null || isHovered ? 1 : 0.45
                }}
                onMouseEnter={() => setHoveredSlice(slice.index)}
                onMouseLeave={() => setHoveredSlice(null)}
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            textAlign: 'center',
            padding: '10px'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {activeItem ? activeItem.category || activeItem.mode : 'Total Spent'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginTop: '2px'
            }}
          >
            {formatCurrency(activeItem ? activeItem.total : total, settings.currency, settings.currencySymbol)}
          </span>
          {activeItem && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: activeItem.color || 'var(--color-primary-light)' }}>
              {formatPercentage(activeItem.percentage)}
            </span>
          )}
        </div>
      </div>

      {/* Legend Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '0.5rem 1rem',
          width: '100%'
        }}
      >
        {data.slice(0, 6).map((item, idx) => (
          <div
            key={item.category || item.mode || idx}
            onMouseEnter={() => setHoveredSlice(idx)}
            onMouseLeave={() => setHoveredSlice(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)',
              background: hoveredSlice === idx ? 'var(--bg-card-hover)' : 'transparent',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: item.color || '#6366f1',
                  flexShrink: 0
                }}
              />
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {item.category || item.mode}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-dim)', flexShrink: 0 }}>
              {formatPercentage(item.percentage, 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
