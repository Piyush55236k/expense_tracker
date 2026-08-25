import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Copy, Calendar } from 'lucide-react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { hexToRgba } from '../../utils/helpers';
import CategoryIcon from '../common/CategoryIcon';
import Badge from '../common/Badge';

export default function TransactionCard({ transaction, onEdit }) {
  const { settings, removeTransaction, addTransaction, openModal, openConfirmDialog } = useExpense();
  const [showMenu, setShowMenu] = useState(false);

  const isIncome = transaction.type === 'INCOME';
  const categoryList = isIncome ? settings.incomeCategories : settings.expenseCategories;
  const categoryMeta = categoryList?.find(c => c.name === transaction.category) || {
    color: isIncome ? '#10b981' : '#f43f5e',
    icon: isIncome ? 'ArrowUpCircle' : 'Tag'
  };

  const paymentMeta = settings.paymentModes?.find(p => p.name === transaction.paymentMode) || {
    icon: 'CreditCard'
  };

  const handleDuplicate = () => {
    setShowMenu(false);
    addTransaction({
      ...transaction,
      id: undefined,
      notes: transaction.notes ? `${transaction.notes} (Copy)` : 'Copy',
      createdAt: new Date().toISOString()
    });
  };

  const handleDelete = () => {
    setShowMenu(false);
    openConfirmDialog({
      title: 'Delete Transaction',
      message: `Are you sure you want to delete this ${transaction.category} transaction of ${settings.currencySymbol}${Number(transaction.amount).toFixed(2)}?`,
      confirmText: 'Delete',
      isDanger: true,
      onConfirm: () => removeTransaction(transaction.id)
    });
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(transaction);
    } else {
      openModal('EDIT', transaction);
    }
  };

  return (
    <div className="transaction-card" style={{ position: 'relative' }}>
      {/* Left: Category Icon Box & Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0, flex: 1 }}>
        <div
          className="category-icon-box"
          style={{
            background: hexToRgba(categoryMeta.color, 0.16),
            border: `1px solid ${hexToRgba(categoryMeta.color, 0.35)}`,
            color: categoryMeta.color
          }}
        >
          <CategoryIcon name={categoryMeta.icon} size={20} color={categoryMeta.color} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
              {transaction.category}
            </span>
            <Badge label={transaction.paymentMode} icon={paymentMeta.icon} size="sm" variant="neutral" />
          </div>

          {transaction.notes && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {transaction.notes}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Calendar size={12} />
              {formatDate(transaction.date || transaction.createdAt, 'relative')}
            </span>
            {transaction.time && <span>• {transaction.time}</span>}
          </div>
        </div>
      </div>

      {/* Right: Amount Tag & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div className={`amount-tag ${isIncome ? 'amount-income' : 'amount-expense'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, settings.currency, settings.currencySymbol)}
          </div>
        </div>

        {/* Action Menu Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(prev => !prev);
            }}
            aria-label="Transaction options"
          >
            <MoreVertical size={16} />
          </button>

          {/* Context Dropdown Menu */}
          {showMenu && (
            <>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
                style={{ position: 'fixed', inset: 0, zIndex: 55 }}
              />
              <div
                className="glass-card animate-scale-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '36px',
                  zIndex: 60,
                  width: '150px',
                  padding: '4px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-card)',
                  boxShadow: 'var(--shadow-lg)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="nav-item"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
                  onClick={handleEdit}
                >
                  <Edit2 size={14} />
                  <span>Edit</span>
                </button>
                <button
                  className="nav-item"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%' }}
                  onClick={handleDuplicate}
                >
                  <Copy size={14} />
                  <span>Duplicate</span>
                </button>
                <button
                  className="nav-item"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', width: '100%', color: 'var(--color-expense)' }}
                  onClick={handleDelete}
                >
                  <Trash2 size={14} color="var(--color-expense)" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
