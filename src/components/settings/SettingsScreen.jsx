import React from 'react';
import { User, Moon, Sun, Sparkles } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { CURRENCY_OPTIONS } from '../../services/settings';
import CategoryManager from './CategoryManager';
import PaymentModeManager from './PaymentModeManager';
import BudgetConfig from './BudgetConfig';
import DataBackup from './DataBackup';

export default function SettingsScreen() {
  const { settings, updateSettings, setTheme } = useExpense();

  const handleCurrencyChange = (e) => {
    const selectedCode = e.target.value;
    const currMeta = CURRENCY_OPTIONS.find(c => c.code === selectedCode);
    if (currMeta) {
      updateSettings({
        currency: currMeta.code,
        currencySymbol: currMeta.symbol
      });
    }
  };

  const handleUserNameChange = (e) => {
    updateSettings({ userName: e.target.value });
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Preferences & Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Customize your experience, manage categories, accounts, currencies, and backups.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile & Currency Card */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <User size={18} color="var(--color-primary-light)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              General Preferences
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {/* User Name */}
            <div className="input-group">
              <label className="input-label">Your Name</label>
              <input
                type="text"
                value={settings.userName || ''}
                onChange={handleUserNameChange}
                className="form-input"
                placeholder="Alex"
              />
            </div>

            {/* Currency Selector */}
            <div className="input-group">
              <label className="input-label">Active Currency</label>
              <select
                value={settings.currency}
                onChange={handleCurrencyChange}
                className="form-input"
              >
                {CURRENCY_OPTIONS.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="input-group" style={{ marginTop: '1.25rem' }}>
            <label className="input-label">Visual Theme</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {/* Dark Glass */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(19, 27, 46, 0.9)',
                  border: settings.theme === 'dark' ? '2px solid var(--color-primary-light)' : '1px solid var(--border-card)',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: settings.theme === 'dark' ? '0 0 12px var(--color-primary-glow)' : 'none'
                }}
              >
                <Moon size={18} color="#818cf8" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Dark Glass</span>
              </button>

              {/* Midnight OLED */}
              <button
                type="button"
                onClick={() => setTheme('midnight')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#050508',
                  border: settings.theme === 'midnight' ? '2px solid var(--color-primary-light)' : '1px solid var(--border-card)',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: settings.theme === 'midnight' ? '0 0 12px var(--color-primary-glow)' : 'none'
                }}
              >
                <Sparkles size={18} color="#a855f7" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Midnight</span>
              </button>

              {/* Light Clean */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: settings.theme === 'light' ? '2px solid var(--color-primary-dark)' : '1px solid #cbd5e1',
                  color: '#0f172a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: settings.theme === 'light' ? '0 0 12px rgba(99, 102, 241, 0.2)' : 'none'
                }}
              >
                <Sun size={18} color="#f59e0b" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Light Clean</span>
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Budget Settings */}
        <BudgetConfig />

        {/* Categories Manager */}
        <CategoryManager />

        {/* Payment Modes Manager */}
        <PaymentModeManager />

        {/* Data Backup & Reset */}
        <DataBackup />
      </div>
    </div>
  );
}
