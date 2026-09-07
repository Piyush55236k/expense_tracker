import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, RotateCcw, Check } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { QUICK_ADD_PRESETS } from '../../services/settings';
import { formatCurrency } from '../../utils/formatters';
import CategoryIcon from '../common/CategoryIcon';

export default function QuickPresetsModal({ isOpen, onClose }) {
  const { settings, updateSettings, showToast } = useExpense();
  const presets = settings.quickAddPresets || QUICK_ADD_PRESETS;

  const [editingIndex, setEditingIndex] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Form State for Adding/Editing
  const [formData, setFormData] = useState({
    label: '',
    amount: 50,
    category: 'Food & Dining',
    type: 'EXPENSE',
    paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)',
    icon: 'Coffee'
  });

  if (!isOpen) return null;

  const handleStartEdit = (preset, idx) => {
    setIsAddingNew(false);
    setEditingIndex(idx);
    setFormData({
      label: preset.label || '',
      amount: preset.amount || 0,
      category: preset.category || 'Food & Dining',
      type: preset.type || 'EXPENSE',
      paymentMode: preset.paymentMode || 'UPI / QR (GPay/PhonePe/Paytm)',
      icon: preset.icon || 'Tag'
    });
  };

  const handleStartAdd = () => {
    setEditingIndex(null);
    setIsAddingNew(true);
    setFormData({
      label: '',
      amount: 100,
      category: 'Food & Dining',
      type: 'EXPENSE',
      paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)',
      icon: 'Tag'
    });
  };

  const handleSaveForm = (e) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      showToast({ type: 'error', title: 'Invalid Name', message: 'Please enter a preset label.' });
      return;
    }
    const cleanAmount = Math.abs(Number(formData.amount)) || 10;
    const cleanItem = {
      ...formData,
      amount: cleanAmount
    };

    let updatedList;
    if (isAddingNew) {
      updatedList = [...presets, cleanItem];
    } else if (editingIndex !== null) {
      updatedList = presets.map((p, i) => (i === editingIndex ? cleanItem : p));
    } else {
      return;
    }

    updateSettings({ quickAddPresets: updatedList });
    setEditingIndex(null);
    setIsAddingNew(false);
    showToast({
      type: 'success',
      title: isAddingNew ? 'Quick Action Added' : 'Quick Action Updated',
      message: `${cleanItem.label} (${settings.currencySymbol}${cleanItem.amount}) saved.`
    });
  };

  const handleDelete = (idx) => {
    const target = presets[idx];
    const updated = presets.filter((_, i) => i !== idx);
    updateSettings({ quickAddPresets: updated });
    if (editingIndex === idx) setEditingIndex(null);
    showToast({
      type: 'info',
      title: 'Preset Removed',
      message: `${target.label} was removed.`
    });
  };

  const handleResetDefaults = () => {
    updateSettings({ quickAddPresets: QUICK_ADD_PRESETS });
    setEditingIndex(null);
    setIsAddingNew(false);
    showToast({
      type: 'success',
      title: 'Reset Completed',
      message: 'Quick actions restored to defaults.'
    });
  };

  const categories = formData.type === 'INCOME' ? settings.incomeCategories : settings.expenseCategories;

  return (
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
      onClick={onClose}
    >
      <div
        className="glass-card animate-scale-in"
        style={{
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Customize Quick Actions
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Add, edit, or adjust your 1-tap shortcut presets.
            </p>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '32px', height: '32px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body Container */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* Add / Edit Form */}
          {(isAddingNew || editingIndex !== null) ? (
            <form onSubmit={handleSaveForm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  {isAddingNew ? 'Create New Shortcut' : `Edit: ${formData.label || 'Shortcut'}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingIndex(null);
                  }}
                  className="btn btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '2px 8px' }}
                >
                  Cancel
                </button>
              </div>

              {/* Type Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  className={`btn ${formData.type === 'EXPENSE' ? 'btn-expense' : 'btn-ghost'}`}
                  style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'EXPENSE', category: settings.expenseCategories[0]?.name || 'Food & Dining' }))}
                >
                  Expense Shortcut
                </button>
                <button
                  type="button"
                  className={`btn ${formData.type === 'INCOME' ? 'btn-income' : 'btn-ghost'}`}
                  style={{ padding: '0.45rem', fontSize: '0.82rem' }}
                  onClick={() => setFormData(prev => ({ ...prev, type: 'INCOME', category: settings.incomeCategories[0]?.name || 'Salary' }))}
                >
                  Income Shortcut
                </button>
              </div>

              {/* Preset Label & Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Shortcut Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chai, Petrol, Metro"
                    value={formData.label}
                    onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Default Amount</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Category & Payment Mode */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="form-input"
                  >
                    {categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Payment Mode</label>
                  <select
                    value={formData.paymentMode}
                    onChange={e => setFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                    className="form-input"
                  >
                    {(settings.paymentModes || []).map(p => (
                      <option key={p.id || p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Check size={16} />
                  Save Shortcut
                </button>
              </div>
            </form>
          ) : (
            /* Presets List */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Current Shortcuts ({presets.length})
                </span>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="btn btn-outline"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', gap: '4px' }}
                >
                  <Plus size={14} />
                  Add Shortcut
                </button>
              </div>

              {presets.map((preset, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-md)',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--color-primary-glow)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary-light)',
                        flexShrink: 0
                      }}
                    >
                      <CategoryIcon name={preset.icon || 'Tag'} size={15} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                        {preset.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {preset.category} • {preset.paymentMode}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: preset.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)' }}>
                      {formatCurrency(preset.amount, settings.currency, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={() => handleStartEdit(preset, idx)}
                      className="btn-icon"
                      style={{ width: '28px', height: '28px' }}
                      title="Edit Shortcut"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="btn-icon"
                      style={{ width: '28px', height: '28px', color: 'var(--color-expense)' }}
                      title="Delete Shortcut"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-card)'
          }}
        >
          <button
            onClick={handleResetDefaults}
            className="btn btn-ghost"
            style={{ fontSize: '0.78rem', padding: '4px 8px', gap: '4px' }}
          >
            <RotateCcw size={13} />
            Reset to Defaults
          </button>
          <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
