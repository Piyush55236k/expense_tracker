import React from 'react';
import { History } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import TransactionForm from './TransactionForm';

export default function IncomeScreen() {
  const { setActiveTab } = useExpense();

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '640px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Record Income
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Track revenue from salary, investments, freelance, and other sources.
          </p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => setActiveTab('history')}
          style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
        >
          <History size={16} />
          View History
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <TransactionForm
          initialType="INCOME"
          onSuccess={() => setActiveTab('history')}
        />
      </div>
    </div>
  );
}
