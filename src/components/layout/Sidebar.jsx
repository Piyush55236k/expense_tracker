import React from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  PieChart,
  Settings,
  WalletCards,
  Plus
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../utils/formatters';

export default function Sidebar() {
  const { activeTab, setActiveTab, openModal, balanceStats, settings } = useExpense();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expense', label: 'Add Expense', icon: ArrowDownCircle, color: 'var(--color-expense)' },
    { id: 'income', label: 'Add Income', icon: ArrowUpCircle, color: 'var(--color-income)' },
    { id: 'history', label: 'History & Logs', icon: History },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="sidebar-glass" aria-label="Main Navigation">
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px var(--color-primary-glow)'
          }}
        >
          <WalletCards size={22} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Expensio
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 500 }}>
            Personal Finance
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '1.25rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={19} color={isActive ? '#ffffff' : (item.color || 'currentColor')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mini Sidebar Balance Widget */}
      <div
        className="glass-card"
        style={{
          padding: '1rem',
          marginTop: 'auto',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>
          Net Balance
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px 0' }}>
          {formatCurrency(balanceStats.netBalance, settings.currency, settings.currencySymbol)}
        </div>
        <button
          className="btn btn-primary"
          onClick={() => openModal('ADD_EXPENSE')}
          style={{ width: '100%', padding: '0.45rem', fontSize: '0.82rem' }}
        >
          <Plus size={15} />
          Quick Add
        </button>
      </div>
    </aside>
  );
}
