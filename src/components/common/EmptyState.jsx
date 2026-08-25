import React from 'react';
import { Plus } from 'lucide-react';
import CategoryIcon from './CategoryIcon';

export default function EmptyState({
  icon = 'Inbox',
  title = 'No Records Found',
  description = 'Start tracking your financial transactions to see real-time insights.',
  actionText = 'Add Transaction',
  onAction
}) {
  return (
    <div
      className="glass-card animate-fade-in"
      style={{
        padding: '3rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '1rem',
        margin: '1.5rem 0'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-xl)',
          background: 'var(--color-primary-glow)',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-primary-light)'
        }}
      >
        <CategoryIcon name={icon} size={28} color="var(--color-primary-light)" />
      </div>

      <div style={{ maxWidth: '360px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: '0.5rem' }}>
          <Plus size={18} />
          {actionText}
        </button>
      )}
    </div>
  );
}
