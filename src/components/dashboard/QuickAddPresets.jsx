import React, { useState } from 'react';
import { Zap, Plus, Settings2, X, Check } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';
import CategoryIcon from '../common/CategoryIcon';
import QuickPresetsModal from './QuickPresetsModal';

export default function QuickAddPresets() {
  const { settings, addTransaction } = useExpense();
  const presets = settings.quickAddPresets || [];

  // Manage Presets Modal
  const [isManageOpen, setIsManageOpen] = useState(false);

  // Quick Amount Adjust Popover
  const [activePreset, setActivePreset] = useState(null);
  const [customAmount, setCustomAmount] = useState('');

  const handleOpenAdjust = (preset, e) => {
    e.stopPropagation();
    setActivePreset(preset);
    setCustomAmount(String(preset.amount || ''));
  };

  const handleInstantQuickAdd = (preset, e) => {
    if (e) e.stopPropagation();
    addTransaction({
      type: preset.type || 'EXPENSE',
      amount: preset.amount,
      category: preset.category,
      paymentMode: preset.paymentMode || 'UPI / QR',
      date: new Date().toISOString().split('T')[0],
      notes: `Quick Add: ${preset.label}`
    });
  };

  const handleConfirmCustomAdd = (e) => {
    e.preventDefault();
    if (!activePreset) return;
    const finalAmount = Math.abs(Number(customAmount)) || activePreset.amount;

    addTransaction({
      type: activePreset.type || 'EXPENSE',
      amount: finalAmount,
      category: activePreset.category,
      paymentMode: activePreset.paymentMode || 'UPI / QR',
      date: new Date().toISOString().split('T')[0],
      notes: `Quick Add: ${activePreset.label}`
    });
    setActivePreset(null);
  };

  const addChipAmount = (delta) => {
    const current = Number(customAmount) || 0;
    setCustomAmount(String(Math.max(1, current + delta)));
  };

  const multiplyAmount = (factor) => {
    const current = Number(customAmount) || 0;
    setCustomAmount(String(Math.round(current * factor)));
  };

  if (presets.length === 0) return null;

  return (
    <>
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        {/* Card Header: Title + Edit Presets Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="var(--color-warning)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              1-Tap Quick Add
            </h3>
          </div>

          <button
            onClick={() => setIsManageOpen(true)}
            className="btn btn-ghost"
            style={{ fontSize: '0.75rem', padding: '3px 8px', gap: '4px', color: 'var(--text-muted)' }}
            title="Edit Quick Actions"
          >
            <Settings2 size={13} />
            <span>Edit Shortcuts</span>
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
            gap: '0.65rem'
          }}
        >
          {presets.map((preset, idx) => (
            <div
              key={idx}
              className="glass-card-interactive"
              onClick={(e) => handleOpenAdjust(preset, e)}
              style={{
                padding: '0.65rem 0.75rem',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                textAlign: 'left',
                position: 'relative'
              }}
              title="Click to adjust amount, or tap '+' for instant add"
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

              {/* 1-Tap Instant Add Button */}
              <button
                type="button"
                onClick={(e) => handleInstantQuickAdd(preset, e)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: 'var(--radius-xs)',
                  background: 'var(--bg-card)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-card)',
                  flexShrink: 0
                }}
                title="1-Tap Instant Log"
              >
                <Plus size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Amount Edit Dialog */}
      {activePreset && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(5px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setActivePreset(null)}
        >
          <div
            className="glass-card animate-scale-in"
            style={{
              maxWidth: '380px',
              width: '100%',
              padding: '1.5rem',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CategoryIcon name={activePreset.icon || 'Tag'} size={18} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Log {activePreset.label}
                </h3>
              </div>
              <button onClick={() => setActivePreset(null)} className="btn-icon" style={{ width: '28px', height: '28px' }}>
                <X size={15} />
              </button>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              {activePreset.category} • {activePreset.paymentMode || 'UPI / QR'}
            </p>

            <form onSubmit={handleConfirmCustomAdd}>
              <div className="input-group" style={{ marginBottom: '1rem' }}>
                <label className="input-label">Amount ({settings.currencySymbol})</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{ position: 'absolute', left: '12px', fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                    {settings.currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    autoFocus
                    required
                    value={customAmount}
                    onChange={e => setCustomAmount(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Quick Modifier Chips */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => addChipAmount(10)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => addChipAmount(20)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                >
                  +20
                </button>
                <button
                  type="button"
                  onClick={() => addChipAmount(50)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                >
                  +50
                </button>
                <button
                  type="button"
                  onClick={() => addChipAmount(100)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                >
                  +100
                </button>
                <button
                  type="button"
                  onClick={() => multiplyAmount(2)}
                  className="btn btn-ghost"
                  style={{ padding: '3px 8px', fontSize: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-card)' }}
                >
                  2x
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActivePreset(null)}
                  className="btn btn-outline"
                  style={{ flex: 1, padding: '0.55rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={activePreset.type === 'INCOME' ? 'btn btn-income' : 'btn btn-primary'}
                  style={{ flex: 2, padding: '0.55rem' }}
                >
                  <Check size={16} />
                  Record {formatCurrency(Number(customAmount) || activePreset.amount, settings.currency, settings.currencySymbol)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Presets Manager Modal */}
      <QuickPresetsModal isOpen={isManageOpen} onClose={() => setIsManageOpen(false)} />
    </>
  );
}
