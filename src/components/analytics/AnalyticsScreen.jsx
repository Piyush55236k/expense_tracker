import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import StatCard from '../common/StatCard';
import DonutChart from '../charts/DonutChart';
import AreaTrendChart from '../charts/AreaTrendChart';
import BarChart from '../charts/BarChart';
import CategoryRanking from './CategoryRanking';
import PaymentModeBreakdown from './PaymentModeBreakdown';
import SmartInsights from './SmartInsights';

export default function AnalyticsScreen() {
  const {
    balanceStats,
    expenseCategoriesBreakdown,
    incomeCategoriesBreakdown,
    weeklySpending,
    monthlyTrend,
    largestExpense,
    dailyAverage,
    settings
  } = useExpense();

  const [activeChartTab, setActiveChartTab] = useState('EXPENSE');

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Financial Analytics
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Deep insights into your spending habits, cashflow trends, and budget health.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          title="Net Balance"
          value={formatCurrency(balanceStats.netBalance, settings.currency, settings.currencySymbol)}
          subtitle={`${balanceStats.transactionCount} total records`}
          icon="Wallet"
          iconColor="var(--color-primary-light)"
          variant="primary"
        />
        <StatCard
          title="Savings Rate"
          value={formatPercentage(balanceStats.savingsRate)}
          subtitle={balanceStats.savingsRate >= 20 ? 'Target achieved (>20%)' : 'Aim for 20%+'}
          icon="Sparkles"
          iconColor="#10b981"
          variant="income"
        />
        <StatCard
          title="Daily Average"
          value={formatCurrency(dailyAverage, settings.currency, settings.currencySymbol)}
          subtitle="Spent per active day"
          icon="Calendar"
          iconColor="#3b82f6"
        />
        <StatCard
          title="Largest Expense"
          value={largestExpense ? formatCurrency(largestExpense.amount, settings.currency, settings.currencySymbol) : '$0.00'}
          subtitle={largestExpense ? `${largestExpense.category}` : 'None'}
          icon="ArrowDownCircle"
          iconColor="#f43f5e"
          variant="expense"
        />
      </div>

      {/* Smart AI / Financial Insights */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SmartInsights />
      </div>

      {/* Monthly Trend Area Chart & Weekly Bar Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Trend Area Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={18} color="var(--color-primary-light)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Monthly Trend (Income vs Expense)
            </h3>
          </div>
          <AreaTrendChart data={monthlyTrend} height={200} />
        </div>

        {/* Weekly Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BarChart3 size={18} color="var(--color-primary-light)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Weekly Spending (Last 7 Days)
            </h3>
          </div>
          <BarChart data={weeklySpending} height={180} />
        </div>
      </div>

      {/* Category Donut & Rankings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Donut Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={18} color="var(--color-primary-light)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeChartTab === 'EXPENSE' ? 'Expense Categories' : 'Income Sources'}
              </h3>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className={`btn ${activeChartTab === 'EXPENSE' ? 'btn-expense' : 'btn-ghost'}`}
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                onClick={() => setActiveChartTab('EXPENSE')}
              >
                Expense
              </button>
              <button
                className={`btn ${activeChartTab === 'INCOME' ? 'btn-income' : 'btn-ghost'}`}
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                onClick={() => setActiveChartTab('INCOME')}
              >
                Income
              </button>
            </div>
          </div>

          <DonutChart
            data={activeChartTab === 'EXPENSE' ? expenseCategoriesBreakdown : incomeCategoriesBreakdown}
            size={220}
            strokeWidth={30}
          />
        </div>

        {/* Category Rankings */}
        <CategoryRanking />
      </div>

      {/* Payment Modes */}
      <PaymentModeBreakdown />
    </div>
  );
}
