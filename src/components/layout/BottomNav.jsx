import React from 'react';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  PieChart,
  Settings
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function BottomNav() {
  const { activeTab, setActiveTab } = useExpense();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'expense', label: 'Expense', icon: ArrowDownCircle },
    { id: 'income', label: 'Income', icon: ArrowUpCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <nav className="bottom-nav-glass" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <div className="nav-icon-container">
              <Icon size={20} />
            </div>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
