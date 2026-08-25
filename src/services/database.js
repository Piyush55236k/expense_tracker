/**
 * Database Service - Client-side Storage Engine (LocalStorage)
 * Provides robust CRUD operations, querying, batch actions, and import/export.
 */

import { generateId } from '../utils/helpers';

const TRANSACTIONS_STORAGE_KEY = 'personal_expense_tracker_transactions';

/**
 * Fetch all transactions from local storage
 * @returns {Array} List of transactions sorted newest first
 */
export function readTransactions() {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) return [];
    const transactions = JSON.parse(raw);
    if (!Array.isArray(transactions)) return [];
    
    // Sort descending by date / createdAt
    return transactions.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  } catch (e) {
    console.error('Error reading transactions from storage:', e);
    return [];
  }
}

/**
 * Save array of transactions to local storage
 * @param {Array} transactions 
 */
export function writeTransactions(transactions) {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch (e) {
    console.error('Error writing transactions to storage:', e);
    return false;
  }
}

/**
 * Insert a single transaction locally
 * @param {Object} txData 
 * @returns {Object} inserted transaction with generated ID and timestamps
 */
export function insertTransaction(txData) {
  const transactions = readTransactions();
  const newTx = {
    id: txData.id || generateId(),
    type: txData.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: Math.abs(Number(txData.amount) || 0),
    category: txData.category || 'Other / Misc',
    paymentMode: txData.paymentMode || 'Cash',
    date: txData.date || new Date().toISOString().split('T')[0],
    time: txData.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    notes: txData.notes ? txData.notes.trim() : '',
    tags: Array.isArray(txData.tags) ? txData.tags : (txData.tags ? [txData.tags] : []),
    receiptUrl: txData.receiptUrl || null,
    isRecurring: Boolean(txData.isRecurring),
    createdAt: txData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  transactions.unshift(newTx);
  writeTransactions(transactions);
  return newTx;
}

/**
 * Update an existing transaction locally
 * @param {Object} txData 
 * @returns {Object|null} updated transaction
 */
export function updateTransaction(txData) {
  if (!txData || !txData.id) return null;
  const transactions = readTransactions();
  const index = transactions.findIndex(t => t.id === txData.id);
  if (index === -1) return null;

  const updatedTx = {
    ...transactions[index],
    ...txData,
    amount: Math.abs(Number(txData.amount) || 0),
    updatedAt: new Date().toISOString()
  };

  transactions[index] = updatedTx;
  writeTransactions(transactions);
  return updatedTx;
}

/**
 * Delete a transaction by ID locally
 * @param {string} id 
 * @returns {Object|null} deleted transaction (useful for undo)
 */
export function deleteTransaction(id) {
  const transactions = readTransactions();
  const target = transactions.find(t => t.id === id);
  if (!target) return null;

  const filtered = transactions.filter(t => t.id !== id);
  writeTransactions(filtered);
  return target;
}

/**
 * Delete multiple transactions by IDs locally
 * @param {Array<string>} ids 
 * @returns {number} count of deleted items
 */
export function deleteMultipleTransactions(ids) {
  if (!Array.isArray(ids) || ids.length === 0) return 0;
  const set = new Set(ids);
  const transactions = readTransactions();
  const initialCount = transactions.length;
  const filtered = transactions.filter(t => !set.has(t.id));
  writeTransactions(filtered);
  return initialCount - filtered.length;
}

/**
 * Clear all transaction records from storage
 */
export function clearAllTransactions() {
  localStorage.removeItem(TRANSACTIONS_STORAGE_KEY);
  return true;
}

/**
 * Generate full backup JSON object
 */
export function createBackupPayload(settings) {
  const transactions = readTransactions();
  return {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    appName: 'Personal Expense Tracker',
    transactions,
    settings
  };
}

/**
 * Import backup payload into storage
 */
export function restoreBackupPayload(payload, mode = 'replace') {
  if (!payload || !Array.isArray(payload.transactions)) {
    throw new Error('Invalid backup file format.');
  }

  if (mode === 'replace') {
    writeTransactions(payload.transactions);
  } else {
    // Merge mode: avoid duplicate IDs
    const existing = readTransactions();
    const existingIds = new Set(existing.map(t => t.id));
    const toAdd = payload.transactions.filter(t => !existingIds.has(t.id));
    writeTransactions([...existing, ...toAdd]);
  }

  return true;
}
