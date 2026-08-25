import React from 'react';
import { Moon, Sun, Sparkles, Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { getGreeting } from '../../utils/helpers';

export default function Header() {
  const { settings, setTheme, openModal, activeTab } = useExpense();
  const greeting = getGreeting();

  const toggleTheme = () => {
    if (settings.theme === 'dark') setTheme('midnight');
    else if (settings.theme === 'midnight') setTheme('light');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    if (settings.theme === 'light') return <Sun size={18} />;
    if (settings.theme === 'midnight') return <Sparkles size={18} />;
    return <Moon size={18} />;
  };

  const getThemeLabel = () => {
    if (settings.theme === 'light') return 'Light';
    if (settings.theme === 'midnight') return 'Midnight OLED';
    return 'Dark Glass';
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'expense': return 'Add Expense';
      case 'income': return 'Add Income';
      case 'history': return 'Transaction History';
      case 'analytics': return 'Analytics & Insights';
      case 'settings': return 'Preferences & Settings';
      default: return `${greeting}, ${settings.userName || 'Alex'}`;
    }
  };

  return (
    <header className="header-glass">
      {/* Left: Page Title / Greeting */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
          {getPageTitle()}
        </h1>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Right: Quick Action Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Currency Pill */}
        <div
          className="badge badge-neutral"
          style={{ padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, display: 'none' }}
          id="desktop-currency-badge"
        >
          {settings.currencySymbol} {settings.currency}
        </div>

        {/* Theme Switcher Button */}
        <button
          className="btn-icon"
          onClick={toggleTheme}
          title={`Switch Theme (Current: ${getThemeLabel()})`}
          aria-label="Toggle visual theme"
        >
          {getThemeIcon()}
        </button>

        {/* Quick Add Expense Modal Trigger */}
        <button
          className="btn btn-primary"
          onClick={() => openModal('ADD_EXPENSE')}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} />
          <span style={{ display: 'none' }} className="btn-label-desktop">New Entry</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #desktop-currency-badge { display: inline-flex !important; }
          .btn-label-desktop { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
