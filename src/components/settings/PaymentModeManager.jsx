import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import CategoryIcon from '../common/CategoryIcon';

export default function PaymentModeManager() {
  const { settings, updateSettings, openConfirmDialog } = useExpense();
  const [newModeName, setNewModeName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const paymentModes = settings.paymentModes || [];

  const handleAddMode = (e) => {
    e.preventDefault();
    const name = newModeName.trim();
    if (!name) return;

    const exists = paymentModes.some(m => m.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert('This payment method already exists.');
      return;
    }

    const newMode = {
      id: 'pm_' + Date.now().toString(36),
      name,
      icon: 'CreditCard',
      color: '#3b82f6'
    };

    updateSettings({ paymentModes: [...paymentModes, newMode] });
    setNewModeName('');
    setIsAdding(false);
  };

  const handleDeleteMode = (modeToDelete) => {
    openConfirmDialog({
      title: 'Delete Payment Method',
      message: `Are you sure you want to remove "${modeToDelete.name}"? Existing transactions won't be modified.`,
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: () => {
        updateSettings({
          paymentModes: paymentModes.filter(m => m.id !== modeToDelete.id && m.name !== modeToDelete.name)
        });
      }
    });
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <CreditCard size={18} color="var(--color-primary-light)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Payment Methods & Accounts
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem', marginBottom: '1.25rem' }}>
        {paymentModes.map((mode) => (
          <div
            key={mode.id || mode.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CategoryIcon name={mode.icon || 'CreditCard'} size={15} color="var(--color-primary-light)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {mode.name}
              </span>
            </div>

            <button
              onClick={() => handleDeleteMode(mode)}
              className="btn-icon"
              style={{ width: '24px', height: '24px', border: 'none', background: 'transparent' }}
              title="Delete Payment Mode"
            >
              <Trash2 size={13} color="var(--text-dim)" />
            </button>
          </div>
        ))}
      </div>

      {!isAdding ? (
        <button
          className="btn btn-outline"
          onClick={() => setIsAdding(true)}
          style={{ width: '100%', padding: '0.65rem' }}
        >
          <Plus size={16} />
          Add Payment Method
        </button>
      ) : (
        <form onSubmit={handleAddMode} className="animate-scale-in" style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="e.g. Apple Pay, Revolut, Cash 2..."
            value={newModeName}
            onChange={(e) => setNewModeName(e.target.value)}
            className="form-input"
            autoFocus
            required
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1rem' }}>
            <Check size={16} />
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
