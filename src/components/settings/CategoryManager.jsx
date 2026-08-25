import React, { useState } from 'react';
import { Plus, Trash2, Tag, Check } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { hexToRgba } from '../../utils/helpers';
import CategoryIcon from '../common/CategoryIcon';

const AVAILABLE_ICONS = [
  'Utensils', 'ShoppingBag', 'Home', 'Car', 'Zap', 'Film', 'HeartPulse',
  'GraduationCap', 'Plane', 'Sparkles', 'TrendingUp', 'HelpCircle',
  'Coffee', 'Smartphone', 'Gift', 'Briefcase', 'Laptop', 'Shield', 'Music', 'Book'
];

const PRESET_COLORS = [
  '#f97316', '#ec4899', '#8b5cf6', '#3b82f6', '#eab308',
  '#a855f7', '#ef4444', '#06b6d4', '#14b8a6', '#d946ef', '#10b981', '#64748b'
];

export default function CategoryManager() {
  const { settings, updateSettings, openConfirmDialog } = useExpense();
  const [catType, setCatType] = useState('EXPENSE');
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [isAdding, setIsAdding] = useState(false);

  const categories = catType === 'EXPENSE' ? settings.expenseCategories : settings.incomeCategories;

  const handleAddCategory = (e) => {
    e.preventDefault();
    const name = newCatName.trim();
    if (!name) return;

    const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      alert('A category with this name already exists.');
      return;
    }

    const newCategory = {
      id: 'cat_' + Date.now().toString(36),
      name,
      icon: selectedIcon,
      color: selectedColor
    };

    if (catType === 'EXPENSE') {
      updateSettings({ expenseCategories: [...categories, newCategory] });
    } else {
      updateSettings({ incomeCategories: [...categories, newCategory] });
    }

    setNewCatName('');
    setIsAdding(false);
  };

  const handleDeleteCategory = (catToDelete) => {
    openConfirmDialog({
      title: 'Delete Category',
      message: `Are you sure you want to remove "${catToDelete.name}" from your categories? Existing transactions won't be deleted.`,
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: () => {
        if (catType === 'EXPENSE') {
          updateSettings({
            expenseCategories: categories.filter(c => c.id !== catToDelete.id && c.name !== catToDelete.name)
          });
        } else {
          updateSettings({
            incomeCategories: categories.filter(c => c.id !== catToDelete.id && c.name !== catToDelete.name)
          });
        }
      }
    });
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={18} color="var(--color-primary-light)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Category Manager
          </h3>
        </div>

        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '3px', borderRadius: 'var(--radius-md)' }}>
          <button
            className={`btn ${catType === 'EXPENSE' ? 'btn-expense' : 'btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => setCatType('EXPENSE')}
          >
            Expenses ({settings.expenseCategories?.length || 0})
          </button>
          <button
            className={`btn ${catType === 'INCOME' ? 'btn-income' : 'btn-ghost'}`}
            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
            onClick={() => setCatType('INCOME')}
          >
            Income ({settings.incomeCategories?.length || 0})
          </button>
        </div>
      </div>

      {/* Category Badges Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.65rem',
          marginBottom: '1.25rem'
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id || cat.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              background: hexToRgba(cat.color, 0.12),
              border: `1px solid ${hexToRgba(cat.color, 0.3)}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: 'var(--radius-xs)',
                  background: hexToRgba(cat.color, 0.25),
                  color: cat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CategoryIcon name={cat.icon} size={14} color={cat.color} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cat.name}
              </span>
            </div>

            <button
              onClick={() => handleDeleteCategory(cat)}
              className="btn-icon"
              style={{ width: '26px', height: '26px', border: 'none', background: 'transparent' }}
              title="Delete Category"
            >
              <Trash2 size={13} color="var(--text-dim)" />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Category Section */}
      {!isAdding ? (
        <button
          className="btn btn-outline"
          onClick={() => setIsAdding(true)}
          style={{ width: '100%', padding: '0.65rem' }}
        >
          <Plus size={16} />
          Add Custom Category
        </button>
      ) : (
        <form
          onSubmit={handleAddCategory}
          className="animate-scale-in"
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-card)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            New {catType === 'INCOME' ? 'Income' : 'Expense'} Category
          </div>

          <div className="input-group">
            <label className="input-label">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Pet Care, Gaming, Side Hustle..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="form-input"
              autoFocus
              required
            />
          </div>

          {/* Color Picker */}
          <div className="input-group">
            <label className="input-label">Badge Color</label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #ffffff' : 'none',
                    boxShadow: selectedColor === color ? `0 0 8px ${color}` : 'none',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Icon Picker */}
          <div className="input-group">
            <label className="input-label">Icon</label>
            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', maxHeight: '100px', overflowY: 'auto' }}>
              {AVAILABLE_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-xs)',
                    background: selectedIcon === icon ? 'var(--color-primary-glow)' : 'var(--bg-card)',
                    border: selectedIcon === icon ? '1px solid var(--color-primary-light)' : '1px solid var(--border-card)',
                    color: selectedIcon === icon ? 'var(--color-primary-light)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <CategoryIcon name={icon} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              Save Category
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
