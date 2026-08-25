/**
 * Database Service - Client-side Storage Engine (LocalStorage)
 * Provides robust CRUD operations, querying, batch actions, and initial demo data.
 */

import { generateId } from '../utils/helpers';

const TRANSACTIONS_STORAGE_KEY = 'personal_expense_tracker_transactions';

/**
 * Fetch all transactions from storage
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
 * Save array of transactions to storage
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
 * Insert a single transaction
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  transactions.unshift(newTx);
  writeTransactions(transactions);
  return newTx;
}

/**
 * Update an existing transaction
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
 * Delete a transaction by ID
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
 * Delete multiple transactions by IDs
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
 * Clear all transaction records
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

/**
 * Seed realistic initial demo transactions spanning the current and previous months
 */
export function seedInitialDemoData() {
  const today = new Date();
  const makeDate = (daysAgo) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const demoTransactions = [
    // Today
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 4.80,
      category: 'Food & Dining',
      paymentMode: 'UPI / QR',
      date: makeDate(0),
      time: '08:30',
      notes: 'Morning Cappuccino & Croissant',
      tags: ['coffee', 'breakfast'],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 18.50,
      category: 'Food & Dining',
      paymentMode: 'UPI / QR',
      date: makeDate(0),
      time: '13:15',
      notes: 'Healthy Sushi Lunch Bowl',
      tags: ['lunch'],
      createdAt: new Date().toISOString()
    },
    // Yesterday
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 62.40,
      category: 'Shopping',
      paymentMode: 'Credit Card',
      date: makeDate(1),
      time: '17:45',
      notes: 'Weekly organic groceries at Whole Foods',
      tags: ['groceries', 'food'],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 25.00,
      category: 'Transportation',
      paymentMode: 'Credit Card',
      date: makeDate(1),
      time: '09:10',
      notes: 'City Cab ride to client meeting',
      tags: ['commute'],
      createdAt: new Date().toISOString()
    },
    // 3 days ago
    {
      id: generateId(),
      type: 'INCOME',
      amount: 650.00,
      category: 'Freelance & Projects',
      paymentMode: 'Bank Transfer',
      date: makeDate(3),
      time: '11:00',
      notes: 'UI/UX Design milestone payment - SaaS Dashboard',
      tags: ['freelance', 'client'],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 14.99,
      category: 'Bills & Utilities',
      paymentMode: 'Credit Card',
      date: makeDate(3),
      time: '14:20',
      notes: 'Cloud Storage & Spotify Duo Subscription',
      tags: ['subscription'],
      createdAt: new Date().toISOString()
    },
    // 5 days ago
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 45.00,
      category: 'Health & Fitness',
      paymentMode: 'Debit Card',
      date: makeDate(5),
      time: '07:30',
      notes: 'Monthly gym & yoga pass',
      tags: ['fitness', 'health'],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 32.50,
      category: 'Entertainment',
      paymentMode: 'UPI / QR',
      date: makeDate(5),
      time: '20:30',
      notes: 'IMAX Cinema tickets with friends',
      tags: ['movie', 'weekend'],
      createdAt: new Date().toISOString()
    },
    // 7 days ago
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 85.00,
      category: 'Shopping',
      paymentMode: 'Credit Card',
      date: makeDate(7),
      time: '16:00',
      notes: 'Ergonomic mouse & desk accessories',
      tags: ['tech', 'workspace'],
      createdAt: new Date().toISOString()
    },
    // 12 days ago
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 110.00,
      category: 'Bills & Utilities',
      paymentMode: 'Bank Transfer',
      date: makeDate(12),
      time: '10:00',
      notes: 'Electricity & High-speed Internet Bill',
      tags: ['utilities'],
      createdAt: new Date().toISOString()
    },
    // 15 days ago - Salary
    {
      id: generateId(),
      type: 'INCOME',
      amount: 3400.00,
      category: 'Salary',
      paymentMode: 'Bank Transfer',
      date: makeDate(15),
      time: '09:00',
      notes: 'Monthly Salary Credit - Tech Corp',
      tags: ['salary', 'primary-income'],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 850.00,
      category: 'Housing & Rent',
      paymentMode: 'Bank Transfer',
      date: makeDate(15),
      time: '12:00',
      notes: 'Apartment monthly rent payment',
      tags: ['rent', 'fixed-expense'],
      createdAt: new Date().toISOString()
    },
    // 20 days ago
    {
      id: generateId(),
      type: 'EXPENSE',
      amount: 95.00,
      category: 'Food & Dining',
      paymentMode: 'Credit Card',
      date: makeDate(20),
      time: '19:45',
      notes: 'Weekend Family Dinner at Italian Bistro',
      tags: ['dinner', 'family'],
      createdAt: new Date().toISOString()
    },
    {
      id: generateId(),
      type: 'INCOME',
      amount: 180.00,
      category: 'Dividends & Capital Gains',
      paymentMode: 'Digital Wallet',
      date: makeDate(22),
      time: '14:30',
      notes: 'Quarterly index fund dividend payout',
      tags: ['passive-income', 'stocks'],
      createdAt: new Date().toISOString()
    }
  ];

  writeTransactions(demoTransactions);
  return demoTransactions;
}
