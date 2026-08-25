import React from 'react';
import {
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';

export default function HistoryFilters({ isDrawerOpen, setIsDrawerOpen }) {
  const { historyFilters, setHistoryFilters, settings } = useExpense();

  const handleTextSearch = (e) => {
    setHistoryFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleTypeSelect = (typeVal) => {
    setHistoryFilters(prev => ({ ...prev, type: typeVal }));
  };

  const resetFilters = () => {
    setHistoryFilters({
      searchQuery: '',
      type: 'ALL',
      category: 'ALL',
      paymentMode: 'ALL',
      dateRange: 'ALL',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      sortBy: 'date_desc'
    });
  };

  const hasActiveFilters =
    historyFilters.searchQuery ||
    historyFilters.type !== 'ALL' ||
    historyFilters.category !== 'ALL' ||
    historyFilters.paymentMode !== 'ALL' ||
    historyFilters.dateRange !== 'ALL' ||
    historyFilters.minAmount ||
    historyFilters.maxAmount ||
    historyFilters.sortBy !== 'date_desc';

  const allCategories = [
    ...(settings.expenseCategories || []),
    ...(settings.incomeCategories || [])
  ];
  const uniqueCategories = Array.from(new Set(allCategories.map(c => c.name)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
      {/* Top Search & Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={18}
            color="var(--text-dim)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search by notes, category, amount, tags..."
            value={historyFilters.searchQuery}
            onChange={handleTextSearch}
            className="form-input"
            style={{ paddingLeft: '38px', borderRadius: 'var(--radius-lg)' }}
          />
          {historyFilters.searchQuery && (
            <button
              onClick={() => setHistoryFilters(prev => ({ ...prev, searchQuery: '' }))}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-dim)'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle Button */}
        <button
          className={`btn ${isDrawerOpen || hasActiveFilters ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setIsDrawerOpen(prev => !prev)}
          style={{ padding: '0.65rem 1rem', borderRadius: 'var(--radius-lg)' }}
          title="Toggle advanced filters"
        >
          <SlidersHorizontal size={17} />
          <span style={{ display: 'none' }} className="btn-label-desktop">Filters</span>
          {hasActiveFilters && (
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ffffff'
              }}
            />
          )}
        </button>
      </div>

      {/* Quick Type Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'ALL', label: 'All Transactions' },
            { id: 'EXPENSE', label: 'Expenses Only' },
            { id: 'INCOME', label: 'Income Only' }
          ].map((tab) => {
            const isSelected = historyFilters.type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTypeSelect(tab.id)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected
                    ? tab.id === 'INCOME'
                      ? 'var(--color-income)'
                      : tab.id === 'EXPENSE'
                      ? 'var(--color-expense)'
                      : 'var(--color-primary)'
                    : 'var(--bg-input)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  border: isSelected ? 'none' : '1px solid var(--border-card)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="btn-ghost"
            style={{ fontSize: '0.78rem', color: 'var(--color-expense)', padding: '4px 8px' }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      {isDrawerOpen && (
        <div
          className="glass-card animate-scale-in"
          style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* Category Dropdown */}
            <div className="input-group">
              <label className="input-label">Category</label>
              <select
                className="form-input"
                value={historyFilters.category}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <option value="ALL">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Payment Mode Dropdown */}
            <div className="input-group">
              <label className="input-label">Payment Mode</label>
              <select
                className="form-input"
                value={historyFilters.paymentMode}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, paymentMode: e.target.value }))}
              >
                <option value="ALL">All Payment Modes</option>
                {settings.paymentModes?.map(mode => (
                  <option key={mode.id || mode.name} value={mode.name}>{mode.name}</option>
                ))}
              </select>
            </div>

            {/* Date Range Preset */}
            <div className="input-group">
              <label className="input-label">Date Range</label>
              <select
                className="form-input"
                value={historyFilters.dateRange}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="THIS_WEEK">This Week</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="CUSTOM">Custom Date Range</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="input-group">
              <label className="input-label">Sort By</label>
              <select
                className="form-input"
                value={historyFilters.sortBy}
                onChange={(e) => setHistoryFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              >
                <option value="date_desc">Date: Newest First</option>
                <option value="date_asc">Date: Oldest First</option>
                <option value="amount_desc">Amount: Highest First</option>
                <option value="amount_asc">Amount: Lowest First</option>
              </select>
            </div>
          </div>

          {/* Custom Date Pickers if selected */}
          {historyFilters.dateRange === 'CUSTOM' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
              <div className="input-group">
                <label className="input-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={historyFilters.startDate}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="input-group">
                <label className="input-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={historyFilters.endDate}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
