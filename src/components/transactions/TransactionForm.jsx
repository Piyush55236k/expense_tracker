import React, { useState } from 'react';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Check
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { hexToRgba } from '../../utils/helpers';
import CategoryIcon from '../common/CategoryIcon';

export default function TransactionForm({
  initialData = null,
  initialType = 'EXPENSE',
  onSuccess,
  onCancel,
  isModal = false
}) {
  const { settings, addTransaction, editTransaction } = useExpense();

  const isEditing = Boolean(initialData && initialData.id);

  // Form State
  const [type, setType] = useState(initialData?.type || initialType);
  const [amount, setAmount] = useState(initialData ? String(initialData.amount) : '');
  
  const defaultCategories = (initialData?.type || initialType) === 'INCOME' ? settings.incomeCategories : settings.expenseCategories;
  const [category, setCategory] = useState(initialData?.category || defaultCategories[0]?.name || '');
  
  const [paymentMode, setPaymentMode] = useState(initialData?.paymentMode || 'UPI / QR');
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(
    initialData?.time ||
      new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
  );
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(initialData?.tags || []);
  const [isRecurring, setIsRecurring] = useState(Boolean(initialData?.isRecurring));
  const [error, setError] = useState('');

  const categories = type === 'INCOME' ? settings.incomeCategories : settings.expenseCategories;

  // When switching type, update category
  const handleTypeChange = (newType) => {
    setType(newType);
    const targetCats = newType === 'INCOME' ? settings.incomeCategories : settings.expenseCategories;
    if (targetCats.length > 0) {
      setCategory(targetCats[0].name);
    }
  };

  // Amount preset helper
  const addPresetAmount = (presetVal) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + presetVal));
  };

  // Tag helper
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(',', '');
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    const payload = {
      ...(initialData || {}),
      type,
      amount: numericAmount,
      category,
      paymentMode,
      date,
      time,
      notes: notes.trim(),
      tags,
      isRecurring
    };

    let result;
    if (isEditing) {
      result = editTransaction(payload);
    } else {
      result = addTransaction(payload, { celebrate: type === 'INCOME' || numericAmount > 500 });
    }

    if (result) {
      if (!isEditing) {
        setAmount('');
        setNotes('');
        setTags([]);
      }
      if (onSuccess) onSuccess(result);
    }
  };

  const presetList = type === 'INCOME' ? [50, 100, 500, 1000, 2500] : [5, 10, 25, 50, 100];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Error Alert */}
      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--color-expense-subtle)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: 'var(--color-expense)',
            fontSize: '0.85rem',
            fontWeight: 500
          }}
        >
          {error}
        </div>
      )}

      {/* Type Toggle Pills (Expense vs Income) */}
      {!isEditing && (
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-input)',
            padding: '4px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-card)',
            gap: '4px'
          }}
        >
          <button
            type="button"
            className={`btn ${type === 'EXPENSE' ? 'btn-expense' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
            onClick={() => handleTypeChange('EXPENSE')}
          >
            <ArrowDownCircle size={18} />
            Expense
          </button>
          <button
            type="button"
            className={`btn ${type === 'INCOME' ? 'btn-income' : 'btn-ghost'}`}
            style={{ flex: 1, padding: '0.55rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}
            onClick={() => handleTypeChange('INCOME')}
          >
            <ArrowUpCircle size={18} />
            Income
          </button>
        </div>
      )}

      {/* Large Amount Input Container */}
      <div>
        <div className="amount-display-container">
          <span className="amount-currency-symbol">{settings.currencySymbol}</span>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="amount-huge-input"
            autoFocus={!isModal}
            required
          />
        </div>

        {/* Quick Amount Preset Chips */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {presetList.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => addPresetAmount(preset)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                transition: 'all var(--transition-fast)'
              }}
            >
              +{settings.currencySymbol}{preset}
            </button>
          ))}
        </div>
      </div>

      {/* Category Grid Selector */}
      <div className="input-group">
        <label className="input-label">Select Category</label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
            gap: '0.5rem',
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '2px'
          }}
        >
          {categories.map((cat) => {
            const isSelected = category === cat.name;
            return (
              <button
                key={cat.id || cat.name}
                type="button"
                onClick={() => setCategory(cat.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? hexToRgba(cat.color || '#6366f1', 0.22) : 'var(--bg-input)',
                  border: isSelected ? `2px solid ${cat.color || '#6366f1'}` : '1px solid var(--border-card)',
                  color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  textAlign: 'left',
                  transition: 'all var(--transition-fast)',
                  boxShadow: isSelected ? `0 2px 10px ${hexToRgba(cat.color, 0.3)}` : 'none'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-xs)',
                    background: hexToRgba(cat.color || '#6366f1', 0.2),
                    color: cat.color || 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <CategoryIcon name={cat.icon} size={15} color={cat.color} />
                </div>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Payment Mode Selector */}
      <div className="input-group">
        <label className="input-label">Payment Mode / Account</label>
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
          {settings.paymentModes?.map((mode) => {
            const isSelected = paymentMode === mode.name;
            return (
              <button
                key={mode.id || mode.name}
                type="button"
                onClick={() => setPaymentMode(mode.name)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: isSelected ? 'var(--color-primary-glow)' : 'var(--bg-input)',
                  border: isSelected ? '1px solid var(--color-primary-light)' : '1px solid var(--border-card)',
                  color: isSelected ? 'var(--color-primary-light)' : 'var(--text-muted)',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 600 : 500,
                  whiteSpace: 'nowrap'
                }}
              >
                <CategoryIcon name={mode.icon} size={14} />
                {mode.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date & Time Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="input-group">
          <label className="input-label">Date</label>
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Time</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Notes / Description */}
      <div className="input-group">
        <label className="input-label">Notes & Description</label>
        <textarea
          rows={2}
          placeholder="e.g. Grocery items, dinner with friends, invoice #102..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-input"
          style={{ resize: 'vertical' }}
        />
      </div>

      {/* Tags Input */}
      <div className="input-group">
        <label className="input-label">Tags (Type and press Enter)</label>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '6px 8px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-md)'
          }}
        >
          {tags.map((t) => (
            <span
              key={t}
              className="badge badge-neutral"
              style={{ padding: '2px 8px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              #{t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1 }}
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder={tags.length === 0 ? 'e.g. travel, food' : ''}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              flex: 1,
              minWidth: '80px',
              padding: '2px'
            }}
          />
        </div>
      </div>

      {/* Recurring Checkbox */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <input
          type="checkbox"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          style={{ width: '16px', height: '16px', accentColor: 'var(--color-primary)' }}
        />
        <span>Mark as recurring transaction (Monthly / Weekly)</span>
      </label>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`btn ${type === 'INCOME' ? 'btn-income' : 'btn-expense'}`}
          style={{ flex: onCancel ? undefined : 1 }}
        >
          <Check size={18} />
          {isEditing ? 'Save Changes' : `Record ${type === 'INCOME' ? 'Income' : 'Expense'}`}
        </button>
      </div>
    </form>
  );
}
