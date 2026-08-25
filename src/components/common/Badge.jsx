import React from 'react';
import { hexToRgba } from '../../utils/helpers';
import CategoryIcon from './CategoryIcon';

export default function Badge({
  label,
  icon,
  color,
  variant = 'category', // 'category' | 'income' | 'expense' | 'neutral'
  size = 'md' // 'sm' | 'md'
}) {
  if (variant === 'income') {
    return (
      <span className="badge badge-income">
        {icon && <CategoryIcon name={icon} size={size === 'sm' ? 12 : 14} />}
        {label}
      </span>
    );
  }

  if (variant === 'expense') {
    return (
      <span className="badge badge-expense">
        {icon && <CategoryIcon name={icon} size={size === 'sm' ? 12 : 14} />}
        {label}
      </span>
    );
  }

  // Custom color category badge
  const bg = color ? hexToRgba(color, 0.15) : 'rgba(255, 255, 255, 0.08)';
  const border = color ? hexToRgba(color, 0.35) : 'var(--border-subtle)';
  const textColor = color || 'var(--text-muted)';

  return (
    <span
      className="badge"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color: textColor,
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        padding: size === 'sm' ? '2px 6px' : '3px 8px'
      }}
    >
      {icon && <CategoryIcon name={icon} size={size === 'sm' ? 12 : 14} color={textColor} />}
      {label}
    </span>
  );
}
