/**
 * ExpenseContext - Global State & Action Hub
 * Connects Database, Settings, Analytics, and UI layers seamlessly.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  readTransactions,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMultipleTransactions,
  clearAllTransactions,
  seedInitialDemoData,
  createBackupPayload,
  restoreBackupPayload
} from '../services/database';
import {
  loadSettingsFromStorage,
  saveSettingsToStorage
} from '../services/settings';
import {
  calculateBalance,
  getTodayStats,
  getMonthlySummary,
  getCategoryBreakdown,
  getPaymentModeBreakdown,
  getWeeklySpending,
  getMonthlyTrend,
  getLargestExpense,
  getDailyAverage,
  generateSmartInsights
} from '../services/analytics';
import { exportTransactionsToCSV } from '../utils/csv';
import { downloadFile } from '../utils/helpers';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  // 1. Core State
  const [settings, setSettingsState] = useState(() => loadSettingsFromStorage());
  const [transactions, setTransactions] = useState(() => readTransactions());

  // 2. UI Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  // 3. Modals & Dialogs
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'ADD_EXPENSE', // 'ADD_EXPENSE' | 'ADD_INCOME' | 'EDIT'
    data: null
  });

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isDanger: false,
    onConfirm: () => {}
  });

  // 4. History Filter State
  const [historyFilters, setHistoryFilters] = useState({
    searchQuery: '',
    type: 'ALL', // 'ALL' | 'EXPENSE' | 'INCOME'
    category: 'ALL',
    paymentMode: 'ALL',
    dateRange: 'ALL', // 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM'
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    sortBy: 'date_desc' // 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'
  });

  // Apply Theme to DOM element
  useEffect(() => {
    const theme = settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [settings.theme]);

  // Toast Helper
  const showToast = useCallback(({ type = 'info', title, message, actionText, onAction, duration = 4500 }) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5);
    const newToast = { id, type, title, message, actionText, onAction, duration };
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Transaction CRUD Operations
  const addTransaction = useCallback((txData, options = {}) => {
    try {
      const created = insertTransaction(txData);
      setTransactions(readTransactions());

      if (options.celebrate || created.type === 'INCOME') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 }
        });
      }

      showToast({
        type: 'success',
        title: `${created.type === 'INCOME' ? 'Income' : 'Expense'} Recorded`,
        message: `${settings.currencySymbol}${Number(created.amount).toFixed(2)} in ${created.category}`
      });

      return created;
    } catch (e) {
      console.error('Failed to add transaction:', e);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not record transaction.'
      });
      return null;
    }
  }, [settings.currencySymbol, showToast]);

  const editTransaction = useCallback((txData) => {
    try {
      const updated = updateTransaction(txData);
      if (updated) {
        setTransactions(readTransactions());
        showToast({
          type: 'success',
          title: 'Transaction Updated',
          message: `${settings.currencySymbol}${Number(updated.amount).toFixed(2)} updated successfully.`
        });
        return updated;
      }
    } catch (e) {
      console.error('Failed to update transaction:', e);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not save changes.'
      });
    }
    return null;
  }, [settings.currencySymbol, showToast]);

  const removeTransaction = useCallback((id) => {
    try {
      const deleted = deleteTransaction(id);
      if (deleted) {
        setTransactions(readTransactions());

        showToast({
          type: 'warning',
          title: 'Transaction Deleted',
          message: `${deleted.category} (${settings.currencySymbol}${Number(deleted.amount).toFixed(2)}) removed.`,
          actionText: 'Undo',
          onAction: () => {
            insertTransaction(deleted);
            setTransactions(readTransactions());
            showToast({
              type: 'info',
              title: 'Restored',
              message: 'Transaction successfully restored.'
            });
          },
          duration: 6000
        });
      }
    } catch (e) {
      console.error('Failed to delete transaction:', e);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Could not delete transaction.'
      });
    }
  }, [settings.currencySymbol, showToast]);

  const bulkDeleteTransactions = useCallback((ids) => {
    if (!ids || ids.length === 0) return;
    const count = deleteMultipleTransactions(ids);
    setTransactions(readTransactions());
    showToast({
      type: 'warning',
      title: 'Bulk Delete',
      message: `${count} transactions removed.`
    });
  }, [showToast]);

  // Settings & Theme Operations
  const updateSettings = useCallback((newPartialSettings) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newPartialSettings };
      saveSettingsToStorage(updated);
      return updated;
    });
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Preferences have been updated.'
    });
  }, [showToast]);

  const setTheme = useCallback((themeName) => {
    updateSettings({ theme: themeName });
  }, [updateSettings]);

  // Modal Handlers
  const openModal = useCallback((mode = 'ADD_EXPENSE', data = null) => {
    setModalState({ isOpen: true, mode, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Confirm Dialog Handlers
  const openConfirmDialog = useCallback(({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, onConfirm }) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, []);

  const closeConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Backup, Export & Import
  const exportCSV = useCallback(() => {
    const csv = exportTransactionsToCSV(transactions, settings.currencySymbol);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(csv, `Expense_Tracker_Export_${dateStr}.csv`, 'text/csv;charset=utf-8;');
    showToast({
      type: 'success',
      title: 'CSV Exported',
      message: `${transactions.length} records exported to CSV.`
    });
  }, [transactions, settings.currencySymbol, showToast]);

  const exportJSONBackup = useCallback(() => {
    const payload = createBackupPayload(settings);
    const jsonStr = JSON.stringify(payload, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    downloadFile(jsonStr, `Expense_Tracker_Backup_${dateStr}.json`, 'application/json');
    showToast({
      type: 'success',
      title: 'Backup Created',
      message: 'Full backup file downloaded successfully.'
    });
  }, [settings, showToast]);

  const importJSONBackup = useCallback((jsonContent, mode = 'replace') => {
    try {
      const payload = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      restoreBackupPayload(payload, mode);
      if (payload.settings) {
        setSettingsState(payload.settings);
        saveSettingsToStorage(payload.settings);
      }
      setTransactions(readTransactions());
      showToast({
        type: 'success',
        title: 'Data Imported',
        message: `Successfully imported backup with ${payload.transactions?.length || 0} records.`
      });
    } catch (e) {
      console.error('Import error:', e);
      showToast({
        type: 'error',
        title: 'Import Failed',
        message: e.message || 'Invalid backup file structure.'
      });
    }
  }, [showToast]);

  const loadDemo = useCallback(() => {
    const seeded = seedInitialDemoData();
    setTransactions(seeded);
    showToast({
      type: 'info',
      title: 'Demo Data Loaded',
      message: 'Sample expenses and income have been generated.'
    });
  }, [showToast]);

  const wipeAllData = useCallback(() => {
    clearAllTransactions();
    setTransactions([]);
    showToast({
      type: 'info',
      title: 'Data Cleared',
      message: 'All transaction history has been cleared.'
    });
  }, [showToast]);

  // Computed Analytics Cached with useMemo
  const balanceStats = useMemo(() => calculateBalance(transactions), [transactions]);
  const todayStats = useMemo(() => getTodayStats(transactions), [transactions]);
  const monthlySummary = useMemo(() => getMonthlySummary(transactions), [transactions]);
  const expenseCategoriesBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'EXPENSE', settings.expenseCategories), [transactions, settings.expenseCategories]);
  const incomeCategoriesBreakdown = useMemo(() => getCategoryBreakdown(transactions, 'INCOME', settings.incomeCategories), [transactions, settings.incomeCategories]);
  const paymentModesBreakdown = useMemo(() => getPaymentModeBreakdown(transactions, 'EXPENSE', settings.paymentModes), [transactions, settings.paymentModes]);
  const weeklySpending = useMemo(() => getWeeklySpending(transactions), [transactions]);
  const monthlyTrend = useMemo(() => getMonthlyTrend(transactions, 6), [transactions]);
  const largestExpense = useMemo(() => getLargestExpense(transactions), [transactions]);
  const dailyAverage = useMemo(() => getDailyAverage(transactions, 30), [transactions]);
  const smartInsights = useMemo(() => generateSmartInsights(transactions, settings), [transactions, settings]);

  const value = {
    // State
    transactions,
    settings,
    activeTab,
    toasts,
    modalState,
    confirmDialog,
    historyFilters,

    // Setters
    setActiveTab,
    setHistoryFilters,

    // Modals & Toast actions
    showToast,
    dismissToast,
    openModal,
    closeModal,
    openConfirmDialog,
    closeConfirmDialog,

    // CRUD
    addTransaction,
    editTransaction,
    removeTransaction,
    bulkDeleteTransactions,

    // Settings
    updateSettings,
    setTheme,

    // Backup & Data
    exportCSV,
    exportJSONBackup,
    importJSONBackup,
    loadDemo,
    wipeAllData,

    // Computed Analytics
    balanceStats,
    todayStats,
    monthlySummary,
    expenseCategoriesBreakdown,
    incomeCategoriesBreakdown,
    paymentModesBreakdown,
    weeklySpending,
    monthlyTrend,
    largestExpense,
    dailyAverage,
    smartInsights
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpense() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
}
