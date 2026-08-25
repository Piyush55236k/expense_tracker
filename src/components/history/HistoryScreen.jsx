import React, { useState, useMemo } from 'react';
import { Trash2, CheckSquare, Square, FileSpreadsheet, Plus } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import HistoryFilters from './HistoryFilters';
import TransactionCard from '../transactions/TransactionCard';
import EmptyState from '../common/EmptyState';
import { formatCurrency } from '../../utils/formatters';

export default function HistoryScreen() {
  const {
    transactions,
    historyFilters,
    settings,
    openModal,
    openConfirmDialog,
    bulkDeleteTransactions,
    exportCSV
  } = useExpense();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Filter & Sort Pipeline
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // 1. Type filter
      if (historyFilters.type !== 'ALL' && tx.type !== historyFilters.type) {
        return false;
      }

      // 2. Category filter
      if (historyFilters.category !== 'ALL' && tx.category !== historyFilters.category) {
        return false;
      }

      // 3. Payment Mode filter
      if (historyFilters.paymentMode !== 'ALL' && tx.paymentMode !== historyFilters.paymentMode) {
        return false;
      }

      // 4. Search query (matches notes, category, paymentMode, amount, tags)
      if (historyFilters.searchQuery) {
        const query = historyFilters.searchQuery.toLowerCase();
        const matchNote = (tx.notes || '').toLowerCase().includes(query);
        const matchCategory = (tx.category || '').toLowerCase().includes(query);
        const matchPayment = (tx.paymentMode || '').toLowerCase().includes(query);
        const matchAmount = String(tx.amount).includes(query);
        const matchTags = Array.isArray(tx.tags) && tx.tags.some(t => t.toLowerCase().includes(query));

        if (!matchNote && !matchCategory && !matchPayment && !matchAmount && !matchTags) {
          return false;
        }
      }

      // 5. Date Range Filter
      if (historyFilters.dateRange !== 'ALL') {
        const txDate = new Date(tx.date || tx.createdAt);
        const now = new Date();

        if (historyFilters.dateRange === 'TODAY') {
          const todayStr = now.toISOString().split('T')[0];
          if (tx.date !== todayStr) return false;
        } else if (historyFilters.dateRange === 'THIS_WEEK') {
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (txDate < weekAgo) return false;
        } else if (historyFilters.dateRange === 'THIS_MONTH') {
          if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) {
            return false;
          }
        } else if (historyFilters.dateRange === 'CUSTOM') {
          if (historyFilters.startDate && tx.date < historyFilters.startDate) return false;
          if (historyFilters.endDate && tx.date > historyFilters.endDate) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      const amtA = Number(a.amount) || 0;
      const amtB = Number(b.amount) || 0;

      switch (historyFilters.sortBy) {
        case 'date_asc': return dateA - dateB;
        case 'amount_desc': return amtB - amtA;
        case 'amount_asc': return amtA - amtB;
        case 'date_desc':
        default:
          return dateB - dateA;
      }
    });
  }, [transactions, historyFilters]);

  // Compute stats on filtered dataset
  const filteredStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const tx of filteredTransactions) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') income += amt;
      else expense += amt;
    }
    return {
      count: filteredTransactions.length,
      income,
      expense,
      net: income - expense
    };
  }, [filteredTransactions]);

  // Bulk Selection Handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(t => t.id)));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    openConfirmDialog({
      title: 'Bulk Delete Transactions',
      message: `Are you sure you want to delete ${selectedIds.size} selected transactions? This cannot be undone.`,
      confirmText: 'Delete Selected',
      isDanger: true,
      onConfirm: () => {
        bulkDeleteTransactions(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsSelectMode(false);
      }
    });
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Transaction History
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Search, filter, edit and manage all logged transactions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            className="btn btn-outline"
            onClick={exportCSV}
            title="Download CSV file"
            style={{ padding: '0.5rem 0.85rem', fontSize: '0.82rem' }}
          >
            <FileSpreadsheet size={16} />
            <span style={{ display: 'none' }} className="btn-label-desktop">Export CSV</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => openModal('ADD_EXPENSE')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            Add Entry
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <HistoryFilters isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />

      {/* Filtered Stats Summary Bar */}
      <div
        className="glass-card"
        style={{
          padding: '0.85rem 1.25rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Showing: </span>
            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
              {filteredStats.count} {filteredStats.count === 1 ? 'record' : 'records'}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Total Expense: </span>
            <span style={{ fontWeight: 700, color: 'var(--color-expense)' }}>
              -{formatCurrency(filteredStats.expense, settings.currency, settings.currencySymbol)}
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-dim)' }}>Total Income: </span>
            <span style={{ fontWeight: 700, color: 'var(--color-income)' }}>
              +{formatCurrency(filteredStats.income, settings.currency, settings.currencySymbol)}
            </span>
          </div>
        </div>

        {/* Bulk Select Mode Toggle */}
        {filteredTransactions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setIsSelectMode(prev => !prev);
                setSelectedIds(new Set());
              }}
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '4px 8px' }}
            >
              {isSelectMode ? 'Cancel Selection' : 'Select Multiple'}
            </button>
          </div>
        )}
      </div>

      {/* Bulk Action Bar when items selected */}
      {isSelectMode && (
        <div
          className="glass-card animate-scale-in"
          style={{
            padding: '0.75rem 1.25rem',
            marginBottom: '1rem',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={toggleSelectAll}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}
            >
              {selectedIds.size === filteredTransactions.length ? <CheckSquare size={18} color="var(--color-primary)" /> : <Square size={18} />}
              Select All ({filteredTransactions.length})
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {selectedIds.size} selected
            </span>
          </div>

          {selectedIds.size > 0 && (
            <button
              className="btn btn-expense"
              onClick={handleBulkDelete}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
            >
              <Trash2 size={15} />
              Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>
      )}

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No Transactions Found"
          description="Try clearing search filters or add a new transaction."
          actionText="Add Transaction"
          onAction={() => openModal('ADD_EXPENSE')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {filteredTransactions.map((tx) => {
            const isSelected = selectedIds.has(tx.id);

            return (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {isSelectMode && (
                  <button
                    onClick={() => toggleSelectOne(tx.id)}
                    style={{ padding: '6px', color: isSelected ? 'var(--color-primary)' : 'var(--text-dim)' }}
                  >
                    {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <TransactionCard transaction={tx} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
