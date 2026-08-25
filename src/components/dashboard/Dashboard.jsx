import React from 'react';
import BalanceCard from './BalanceCard';
import TodayOverview from './TodayOverview';
import MonthlySnapshot from './MonthlySnapshot';
import QuickAddPresets from './QuickAddPresets';
import RecentTransactions from './RecentTransactions';
import DonutChart from '../charts/DonutChart';
import { useExpense } from '../../context/ExpenseContext';

export default function Dashboard() {
  const { expenseCategoriesBreakdown } = useExpense();

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
        {/* Top Grid: Hero Balance + Today & Monthly Snapshot */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <BalanceCard />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TodayOverview />
            <MonthlySnapshot />
          </div>
        </div>

        {/* Quick Add 1-Tap Presets */}
        <QuickAddPresets />

        {/* Donut Chart Preview & Recent Transactions Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Donut Chart Card */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', width: '100%', marginBottom: '1rem' }}>
              Spending Breakdown
            </h3>
            <DonutChart data={expenseCategoriesBreakdown} size={210} strokeWidth={28} />
          </div>

          {/* Recent Activity List */}
          <div>
            <RecentTransactions />
          </div>
        </div>
      </div>
    </div>
  );
}
