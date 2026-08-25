import React from 'react';
import { ArrowRight, History } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import TransactionCard from '../transactions/TransactionCard';
import EmptyState from '../common/EmptyState';

export default function RecentTransactions() {
  const { transactions, setActiveTab, openModal } = useExpense();
  const recentList = transactions.slice(0, 6);

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--color-primary-light)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Recent Activity
          </h3>
        </div>
        {transactions.length > 0 && (
          <button
            className="btn btn-ghost"
            onClick={() => setActiveTab('history')}
            style={{ fontSize: '0.82rem', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {recentList.length === 0 ? (
        <EmptyState
          title="No Transactions Recorded"
          description="Log your first expense or income to track your cashflow."
          actionText="Add Expense"
          onAction={() => openModal('ADD_EXPENSE')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {recentList.map((tx) => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
}
