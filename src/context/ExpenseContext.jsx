/**
 * ExpenseContext - Global State & Action Hub
 * Connects LocalStorage, Settings, Analytics, Real-Time Supabase Cloud Sync,
 * Zero-Login Google Spreadsheet DB Sync, and Universal Undo System.
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
import {
  isGoogleSheetConfigured,
  fetchGoogleSheetTransactions,
  insertGoogleSheetTransaction,
  updateGoogleSheetTransaction,
  deleteGoogleSheetTransaction,
  deleteMultipleGoogleSheetTransactions,
  syncAllLocalToGoogleSheet
} from '../services/googleSheets';
import { exportTransactionsToCSV } from '../utils/csv';
import { downloadFile } from '../utils/helpers';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  // 1. Core State
  const [settings, setSettingsState] = useState(() => loadSettingsFromStorage());
  const [transactions, setTransactions] = useState(() => readTransactions());
  const [supabaseStatus, setSupabaseStatus] = useState('disconnected'); // 'connected' | 'disconnected' | 'syncing' | 'error'
  const [googleSheetStatus, setGoogleSheetStatus] = useState('disconnected'); // 'connected' | 'disconnected' | 'syncing' | 'error'

  // 2. Universal Undo Stack
  // Stores history of reversible actions: { id, type: 'ADD'|'DELETE'|'EDIT'|'BULK_DELETE', transaction, previous, transactions, description }
  const [undoStack, setUndoStack] = useState([]);

  // 3. UI Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  // 4. Modals & Dialogs
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

  // 5. History Filter State
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

  // 6. Universal Undo Handler
  const undoLastAction = useCallback(() => {
    setUndoStack(prev => {
      if (prev.length === 0) return prev;
      const [lastAction, ...remaining] = prev;

      try {
        if (lastAction.type === 'ADD') {
          deleteTransaction(lastAction.transaction.id);
          setTransactions(readTransactions());
          if (isSupabaseConfigured()) deleteSupabaseTransaction(lastAction.transaction.id);
          if (isGoogleSheetConfigured()) deleteGoogleSheetTransaction(lastAction.transaction.id);
          showToast({
            type: 'info',
            title: 'Undone',
            message: `Removed added ${lastAction.transaction.category} (${settings.currencySymbol}${Number(lastAction.transaction.amount).toFixed(2)})`
          });
        } else if (lastAction.type === 'DELETE') {
          insertTransaction(lastAction.transaction);
          setTransactions(readTransactions());
          if (isSupabaseConfigured()) insertSupabaseTransaction(lastAction.transaction);
          if (isGoogleSheetConfigured()) insertGoogleSheetTransaction(lastAction.transaction);
          showToast({
            type: 'info',
            title: 'Restored',
            message: `Restored ${lastAction.transaction.category} (${settings.currencySymbol}${Number(lastAction.transaction.amount).toFixed(2)})`
          });
        } else if (lastAction.type === 'EDIT') {
          updateTransaction(lastAction.previous);
          setTransactions(readTransactions());
          if (isSupabaseConfigured()) updateSupabaseTransaction(lastAction.previous);
          if (isGoogleSheetConfigured()) updateGoogleSheetTransaction(lastAction.previous);
          showToast({
            type: 'info',
            title: 'Changes Reverted',
            message: `Reverted transaction back to original values.`
          });
        } else if (lastAction.type === 'BULK_DELETE') {
          (lastAction.transactions || []).forEach(t => insertTransaction(t));
          const restored = readTransactions();
          setTransactions(restored);
          if (isSupabaseConfigured()) syncAllLocalToSupabase(restored);
          if (isGoogleSheetConfigured()) syncAllLocalToGoogleSheet(restored);
          showToast({
            type: 'info',
            title: 'Restored',
            message: `${(lastAction.transactions || []).length} transactions restored.`
          });
        }
      } catch (err) {
        console.error('Error undoing action:', err);
        showToast({ type: 'error', title: 'Undo Failed', message: 'Could not revert previous action.' });
      }

      return remaining;
    });
  }, [settings.currencySymbol, showToast]);

  // Keyboard shortcut for Undo (Ctrl+Z / Cmd+Z)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const activeEl = document.activeElement;
        const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
        if (!isInput && undoStack.length > 0) {
          e.preventDefault();
          undoLastAction();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoLastAction, undoStack.length]);

  // 7. Google Sheets Sync Methods
  const syncWithGoogleSheet = useCallback(async () => {
    if (!isGoogleSheetConfigured()) {
      setGoogleSheetStatus('disconnected');
      return;
    }

    try {
      setGoogleSheetStatus('syncing');
      const remoteRecords = await fetchGoogleSheetTransactions();
      if (remoteRecords && Array.isArray(remoteRecords)) {
        if (remoteRecords.length > 0) {
          writeTransactions(remoteRecords);
          setTransactions(remoteRecords);
        }
        setGoogleSheetStatus('connected');
      }
    } catch (err) {
      console.error('Google Sheet sync error:', err);
      setGoogleSheetStatus('error');
    }
  }, []);

  const pushLocalToGoogleSheet = useCallback(async () => {
    if (!isGoogleSheetConfigured()) return;
    try {
      setGoogleSheetStatus('syncing');
      const local = readTransactions();
      await syncAllLocalToGoogleSheet(local);
      await syncWithGoogleSheet();
      showToast({ type: 'success', title: 'Google Sheet Updated', message: `${local.length} transactions saved to Spreadsheet.` });
    } catch (err) {
      console.error('Error pushing local data to Google Sheet:', err);
      showToast({ type: 'error', title: 'Upload Failed', message: err.message || 'Could not upload to Google Sheet.' });
    }
  }, [showToast, syncWithGoogleSheet]);

  // Auto-sync Google Sheet on window focus
  useEffect(() => {
    const handleWindowFocus = () => {
      if (isGoogleSheetConfigured()) {
        syncWithGoogleSheet();
      }
    };
    window.addEventListener('focus', handleWindowFocus);
    return () => window.removeEventListener('focus', handleWindowFocus);
  }, [syncWithGoogleSheet]);

  // Initial Google Sheet Boot
  useEffect(() => {
    if (isGoogleSheetConfigured()) {
      const timer = setTimeout(() => {
        syncWithGoogleSheet();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [syncWithGoogleSheet]);

  // 8. Supabase Sync Methods
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

          unsubscribe = subscribeToSupabaseRealtime(
            (newTx) => {
              setTransactions(prev => {
                const filtered = prev.filter(t => t.id !== newTx.id);
                const updated = [newTx, ...filtered].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
                writeTransactions(updated);
                return updated;
              });
            },
            (updatedTx) => {
              setTransactions(prev => {
                const updated = prev.map(t => (t.id === updatedTx.id ? updatedTx : t));
                writeTransactions(updated);
                return updated;
              });
            },
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

  // 9. Transaction CRUD Operations
  const addTransaction = useCallback((txData, options = {}) => {
    try {
      const created = insertTransaction(txData);
      setTransactions(readTransactions());

      // Push to Undo Stack
      setUndoStack(prev => [{
        id: 'action_' + Date.now(),
        type: 'ADD',
        transaction: created,
        description: `Added ${created.type === 'INCOME' ? 'Income' : 'Expense'} ${settings.currencySymbol}${Number(created.amount).toFixed(2)}`
      }, ...prev.slice(0, 19)]);

      // Background Sync to Cloud DBs
      if (isGoogleSheetConfigured()) {
        insertGoogleSheetTransaction(created);
      }
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
        message: `${settings.currencySymbol}${Number(created.amount).toFixed(2)} in ${created.category}`,
        actionText: 'Undo',
        onAction: undoLastAction,
        duration: 5500
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
  }, [settings.currencySymbol, showToast, undoLastAction]);

  const editTransaction = useCallback((txData) => {
    try {
      const currentList = readTransactions();
      const originalTx = currentList.find(t => t.id === txData.id);
      const updated = updateTransaction(txData);

      if (updated) {
        setTransactions(readTransactions());

        // Push to Undo Stack
        if (originalTx) {
          setUndoStack(prev => [{
            id: 'action_' + Date.now(),
            type: 'EDIT',
            previous: originalTx,
            updated,
            description: `Updated ${updated.category}`
          }, ...prev.slice(0, 19)]);
        }

        // Background Sync
        if (isGoogleSheetConfigured()) {
          updateGoogleSheetTransaction(updated);
        }
        if (isSupabaseConfigured()) {
          updateSupabaseTransaction(updated).catch(err => {
            console.warn('Supabase remote update delayed:', err);
          });
        }

        showToast({
          type: 'success',
          title: 'Transaction Updated',
          message: `${settings.currencySymbol}${Number(updated.amount).toFixed(2)} updated successfully.`,
          actionText: 'Undo',
          onAction: undoLastAction,
          duration: 5500
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
  }, [settings.currencySymbol, showToast, undoLastAction]);

  const removeTransaction = useCallback((id) => {
    try {
      const deleted = deleteTransaction(id);

      if (deleted) {
        setTransactions(readTransactions());

        // Push to Undo Stack
        setUndoStack(prev => [{
          id: 'action_' + Date.now(),
          type: 'DELETE',
          transaction: deleted,
          description: `Deleted ${deleted.category} (${settings.currencySymbol}${Number(deleted.amount).toFixed(2)})`
        }, ...prev.slice(0, 19)]);

        // Background Sync
        if (isGoogleSheetConfigured()) {
          deleteGoogleSheetTransaction(id);
        }
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
          onAction: undoLastAction,
          duration: 6500
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
  }, [settings.currencySymbol, showToast, undoLastAction]);

  const bulkDeleteTransactions = useCallback((ids) => {
    if (!ids || ids.length === 0) return;
    const currentList = readTransactions();
    const itemsToDelete = currentList.filter(t => ids.includes(t.id));
    const count = deleteMultipleTransactions(ids);
    setTransactions(readTransactions());

    // Push to Undo Stack
    setUndoStack(prev => [{
      id: 'action_' + Date.now(),
      type: 'BULK_DELETE',
      transactions: itemsToDelete,
      description: `Bulk deleted ${count} items`
    }, ...prev.slice(0, 19)]);

    // Background Sync
    if (isGoogleSheetConfigured()) {
      deleteMultipleGoogleSheetTransactions(ids);
    }
    if (isSupabaseConfigured()) {
      deleteMultipleSupabaseTransactions(ids).catch(err => {
        console.warn('Supabase remote bulk delete delayed:', err);
      });
    }

    showToast({
      type: 'warning',
      title: 'Bulk Delete',
      message: `${count} transactions removed.`,
      actionText: 'Undo',
      onAction: undoLastAction,
      duration: 6500
    });
  }, [showToast, undoLastAction]);

  // 10. Settings & Theme Operations
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
      const updatedTxs = readTransactions();
      setTransactions(updatedTxs);

      if (isGoogleSheetConfigured()) {
        syncAllLocalToGoogleSheet(updatedTxs);
      }
      if (isSupabaseConfigured()) {
        syncAllLocalToSupabase(updatedTxs);
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
    setUndoStack([]);
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
    googleSheetStatus,

    // Undo System
    undoStack,
    canUndo: undoStack.length > 0,
    undoLastAction,

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

    // Cloud DB Sync (Google Sheets & Supabase)
    syncWithGoogleSheet,
    pushLocalToGoogleSheet,
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
