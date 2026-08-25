/**
 * ExpenseContext - Global State & Action Hub
 * Connects LocalStorage, Settings, Analytics, and Real-Time Supabase Cloud Sync.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  readTransactions,
  writeTransactions,
  insertTransaction,
  updateTransaction,
  deleteTransaction,
  deleteMultipleTransactions,
  clearAllTransactions,
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
import {
  isSupabaseConfigured,
  fetchSupabaseTransactions,
  insertSupabaseTransaction,
  updateSupabaseTransaction,
  deleteSupabaseTransaction,
  deleteMultipleSupabaseTransactions,
  syncAllLocalToSupabase,
  subscribeToSupabaseRealtime,
  testSupabaseConnection
} from '../services/supabase';
import { exportTransactionsToCSV } from '../utils/csv';
import { downloadFile } from '../utils/helpers';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  // 1. Core State
  const [settings, setSettingsState] = useState(() => loadSettingsFromStorage());
  const [transactions, setTransactions] = useState(() => readTransactions());
  const [supabaseStatus, setSupabaseStatus] = useState('disconnected'); // 'connected' | 'disconnected' | 'syncing' | 'error'

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

  // 5. Supabase Sync Methods
  const syncWithSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setSupabaseStatus('disconnected');
      return;
    }

    try {
      setSupabaseStatus('syncing');
      const remoteRecords = await fetchSupabaseTransactions();
      if (remoteRecords) {
        writeTransactions(remoteRecords);
        setTransactions(remoteRecords);
        setSupabaseStatus('connected');
      }
    } catch (err) {
      console.error('Supabase sync error:', err);
      setSupabaseStatus('error');
    }
  }, []);

  const pushLocalToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      setSupabaseStatus('syncing');
      const local = readTransactions();
      await syncAllLocalToSupabase(local);
      await syncWithSupabase();
      showToast({ type: 'success', title: 'Uploaded to Cloud', message: 'Local records synced to Supabase database.' });
    } catch (err) {
      console.error('Error pushing local data to Supabase:', err);
      showToast({ type: 'error', title: 'Upload Failed', message: err.message || 'Could not upload to Supabase.' });
    }
  }, [showToast, syncWithSupabase]);

  // Initial Supabase Boot & Realtime Subscription
  useEffect(() => {
    let unsubscribe = () => {};

    const initSupabase = async () => {
      if (isSupabaseConfigured()) {
        const testRes = await testSupabaseConnection();
        if (testRes.success) {
          setSupabaseStatus('connected');
          syncWithSupabase();

          // Subscribe to live multi-device real-time updates!
          unsubscribe = subscribeToSupabaseRealtime(
            // On Insert from other device
            (newTx) => {
              setTransactions(prev => {
                const filtered = prev.filter(t => t.id !== newTx.id);
                const updated = [newTx, ...filtered].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
                writeTransactions(updated);
                return updated;
              });
            },
            // On Update from other device
            (updatedTx) => {
              setTransactions(prev => {
                const updated = prev.map(t => (t.id === updatedTx.id ? updatedTx : t));
                writeTransactions(updated);
                return updated;
              });
            },
            // On Delete from other device
            (deletedId) => {
              setTransactions(prev => {
                const updated = prev.filter(t => t.id !== deletedId);
                writeTransactions(updated);
                return updated;
              });
            }
          );
        } else {
          setSupabaseStatus('error');
        }
      } else {
        setSupabaseStatus('disconnected');
      }
    };

    initSupabase();

    return () => {
      unsubscribe();
    };
  }, [syncWithSupabase]);

  // 6. Transaction CRUD Operations (Offline LocalStorage + Real-time Supabase)
  const addTransaction = useCallback((txData, options = {}) => {
    try {
      const created = insertTransaction(txData);
      setTransactions(readTransactions());

      // Sync to Supabase in background if configured
      if (isSupabaseConfigured()) {
        insertSupabaseTransaction(created).catch(err => {
          console.warn('Supabase remote insert delayed:', err);
        });
      }

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

        // Sync update to Supabase
        if (isSupabaseConfigured()) {
          updateSupabaseTransaction(updated).catch(err => {
            console.warn('Supabase remote update delayed:', err);
          });
        }

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

        // Sync delete to Supabase
        if (isSupabaseConfigured()) {
          deleteSupabaseTransaction(id).catch(err => {
            console.warn('Supabase remote delete delayed:', err);
          });
        }

        showToast({
          type: 'warning',
          title: 'Transaction Deleted',
          message: `${deleted.category} (${settings.currencySymbol}${Number(deleted.amount).toFixed(2)}) removed.`,
          actionText: 'Undo',
          onAction: () => {
            insertTransaction(deleted);
            setTransactions(readTransactions());
            if (isSupabaseConfigured()) {
              insertSupabaseTransaction(deleted);
            }
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

    if (isSupabaseConfigured()) {
      deleteMultipleSupabaseTransactions(ids).catch(err => {
        console.warn('Supabase remote bulk delete delayed:', err);
      });
    }

    showToast({
      type: 'warning',
      title: 'Bulk Delete',
      message: `${count} transactions removed.`
    });
  }, [showToast]);

  // 7. Settings & Theme Operations
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

      if (isSupabaseConfigured()) {
        syncAllLocalToSupabase(readTransactions());
      }

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

  const wipeAllData = useCallback(() => {
    clearAllTransactions();
    setTransactions([]);
    showToast({
      type: 'info',
      title: 'Data Cleared',
      message: 'All local transaction history has been cleared.'
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
    supabaseStatus,

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

    // Supabase Sync
    syncWithSupabase,
    pushLocalToSupabase,

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
