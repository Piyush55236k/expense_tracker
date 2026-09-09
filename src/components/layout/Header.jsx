import React from 'react';
import { Moon, Sun, Sparkles, Plus, Cloud, RefreshCw, Undo2, FileSpreadsheet } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { getGreeting } from '../../utils/helpers';

export default function Header() {
  const {
    settings,
    setTheme,
    openModal,
    activeTab,
    supabaseStatus,
    googleSheetStatus,
    googleSheetSyncInfo,
    setActiveTab,
    undoStack,
    canUndo,
    undoLastAction
  } = useExpense();

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

  const isConnectedToAnyCloud = googleSheetStatus === 'connected' || supabaseStatus === 'connected';
  const isSyncingAny = googleSheetStatus === 'syncing' || supabaseStatus === 'syncing';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Universal Undo Button */}
        {canUndo && (
          <button
            onClick={undoLastAction}
            className="btn btn-outline animate-scale-in"
            style={{
              padding: '0.45rem 0.75rem',
              fontSize: '0.8rem',
              color: 'var(--color-primary-light)',
              borderColor: 'var(--color-primary-light)',
              background: 'var(--color-primary-glow)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={`Undo: ${undoStack[0]?.description || 'last action'} (Ctrl+Z)`}
            aria-label="Undo last action"
          >
            <Undo2 size={15} />
            <span>Undo</span>
            <span
              style={{
                fontSize: '0.7rem',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)',
                color: '#fff',
                marginLeft: '2px'
              }}
            >
              {undoStack.length}
            </span>
          </button>
        )}

        {/* Cloud / Google Sheet Sync Status Indicator */}
        <button
          onClick={() => setActiveTab('settings')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: 'var(--radius-full)',
            background: isConnectedToAnyCloud ? 'var(--color-income-subtle)' : 'var(--bg-card)',
            border: `1px solid ${isConnectedToAnyCloud ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-card)'}`,
            color: isConnectedToAnyCloud ? 'var(--color-income)' : 'var(--text-dim)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
          title={
            googleSheetStatus === 'connected'
              ? `Google Sheet Database: Active (Transactions & Settings in sync${googleSheetSyncInfo?.pendingCount ? ` - ${googleSheetSyncInfo.pendingCount} saving` : ''})`
              : supabaseStatus === 'connected'
              ? 'Supabase Cloud Sync: Active'
              : 'Multi-Device Sync: Click to setup Google Sheet / Cloud DB'
          }
        >
          {isSyncingAny || (googleSheetSyncInfo?.pendingCount > 0) ? (
            <>
              <RefreshCw size={12} className="animate-spin" />
              <span style={{ display: 'none' }} className="cloud-label-desktop">
                {googleSheetSyncInfo?.pendingCount ? `Saving (${googleSheetSyncInfo.pendingCount})...` : 'Syncing...'}
              </span>
            </>
          ) : googleSheetStatus === 'connected' ? (
            <>
              <FileSpreadsheet size={13} color="var(--color-income)" />
              <span style={{ display: 'none' }} className="cloud-label-desktop">Sheet DB Active</span>
            </>
          ) : supabaseStatus === 'connected' ? (
            <>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-income)' }} />
              <span style={{ display: 'none' }} className="cloud-label-desktop">Cloud Synced</span>
            </>
          ) : (
            <>
              <Cloud size={13} />
              <span style={{ display: 'none' }} className="cloud-label-desktop">Setup Sync</span>
            </>
          )}
        </button>

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
          .cloud-label-desktop { display: inline !important; }
        }
      `}</style>
    </header>
  );
}
