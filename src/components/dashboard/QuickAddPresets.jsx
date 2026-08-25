import React from 'react';
import { Zap, Plus } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import CategoryIcon from '../common/CategoryIcon';

export default function QuickAddPresets() {
  const { settings, addTransaction } = useExpense();
  const presets = settings.quickAddPresets || [];

  const handleQuickAdd = (preset) => {
    addTransaction({
      type: preset.type || 'EXPENSE',
      amount: preset.amount,
      category: preset.category,
      paymentMode: preset.paymentMode || 'UPI / QR',
      date: new Date().toISOString().split('T')[0],
      notes: `Quick Add: ${preset.label}`
    });
  };

  if (presets.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
        <Zap size={16} color="var(--color-warning)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          1-Tap Quick Add
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.65rem'
        }}
      >
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            className="glass-card-interactive"
            onClick={() => handleQuickAdd(preset)}
            style={{
              padding: '0.65rem 0.75rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--color-primary-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-light)',
                  flexShrink: 0
                }}
              >
                <CategoryIcon name={preset.icon || 'Plus'} size={14} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {preset.label}
                </div>
                <div style={{ fontSize: '0.72rem', color: preset.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)', fontWeight: 700 }}>
                  {formatCurrency(preset.amount, settings.currency, settings.currencySymbol)}
                </div>
              </div>
            </div>
            <Plus size={14} color="var(--text-dim)" />
          </button>
        ))}
      </div>
    </div>
  );
}
