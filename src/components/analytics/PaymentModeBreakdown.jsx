import React from 'react';
import { CreditCard } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import CategoryIcon from '../common/CategoryIcon';

export default function PaymentModeBreakdown() {
  const { paymentModesBreakdown, settings } = useExpense();

  if (paymentModesBreakdown.length === 0) {
    return null;
  }

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <CreditCard size={18} color="var(--color-primary-light)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Payment Method Usage
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        {paymentModesBreakdown.map((item) => (
          <div
            key={item.mode}
            style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-light)'
                }}
              >
                <CategoryIcon name={item.icon || 'CreditCard'} size={16} />
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.mode}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatCurrency(item.total, settings.currency, settings.currencySymbol)}
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>
                {formatPercentage(item.percentage, 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
