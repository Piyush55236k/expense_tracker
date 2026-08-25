import React, { useState } from 'react';
import { Target, Check } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function BudgetConfig() {
  const { settings, updateSettings } = useExpense();
  const [budget, setBudget] = useState(String(settings.monthlyBudget || ''));
  const [threshold, setThreshold] = useState(String(settings.budgetAlertThreshold || '85'));
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(budget) || 0;
    const thresh = parseInt(threshold, 10) || 85;
    updateSettings({
      monthlyBudget: val,
      budgetAlertThreshold: thresh
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Target size={18} color="var(--color-primary-light)" />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Monthly Budget Target
        </h3>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="input-group">
          <label className="input-label">Monthly Spending Cap ({settings.currencySymbol})</label>
          <input
            type="number"
            step="any"
            min="0"
            placeholder="2500"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="form-input"
            required
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Used to calculate your monthly snapshot gauge and budget utilization percentage.
          </span>
        </div>

        <div className="input-group">
          <label className="input-label">Alert Warning Threshold (% of budget)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              style={{ flex: 1, accentColor: 'var(--color-primary)' }}
            />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', minWidth: '45px' }}>
              {threshold}%
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary">
            <Check size={16} />
            {isSaved ? 'Budget Saved!' : 'Save Budget'}
          </button>
        </div>
      </form>
    </div>
  );
}
