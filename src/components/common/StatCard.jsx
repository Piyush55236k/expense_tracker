import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function StatCard({
  title,
  value,
  subtitle,
  icon = 'Wallet',
  iconColor = 'var(--color-primary)',
  trend = null, // { value: '+12%', isPositive: true }
  variant = 'default', // 'default' | 'income' | 'expense' | 'primary'
  onClick
}) {
  const getGlowBg = () => {
    if (variant === 'income') return 'var(--color-income-subtle)';
    if (variant === 'expense') return 'var(--color-expense-subtle)';
    if (variant === 'primary') return 'var(--color-primary-glow)';
    return 'rgba(255, 255, 255, 0.05)';
  };

  return (
    <div
      className={`glass-card ${onClick ? 'glass-card-interactive' : ''}`}
      onClick={onClick}
      style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {value}
          </span>
        </div>

        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            background: getGlowBg(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
            flexShrink: 0
          }}
        >
          <CategoryIcon name={icon} size={20} color={iconColor} />
        </div>
      </div>

      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 600,
                color: trend.isPositive ? 'var(--color-income)' : 'var(--color-expense)'
              }}
            >
              {trend.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
