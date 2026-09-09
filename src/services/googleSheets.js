/**
 * Google Sheets Database Service - Zero-Login Multi-Device Cloud Sync
 * Connects any Mobile phone or Laptop to a single Google Spreadsheet.
 * Acts as an authoritative cloud database for both Transactions & Settings.
 */

import {
  serializeSettingsForSheet,
  deserializeSettingsFromSheet
} from './settings';

const GOOGLE_SHEET_URL_KEY = 'personal_expense_tracker_gsheet_url';

/**
 * Get configured Google Sheet Web App URL from localStorage or Vite environment variable
 */
export function getGoogleSheetConfig() {
  try {
    const stored = localStorage.getItem(GOOGLE_SHEET_URL_KEY);
    if (stored && stored.trim()) {
      return {
        url: stored.trim(),
        source: 'settings'
      };
    }
  } catch (e) {
    console.error('Error reading Google Sheet URL from storage:', e);
  }

  const envUrl =
    import.meta.env.VITE_GOOGLE_SHEET_URL ||
    import.meta.env.VITE_GSHEET_URL ||
    import.meta.env.GOOGLE_SHEET_URL;

  if (envUrl && String(envUrl).trim() !== '') {
    return {
      url: String(envUrl).trim(),
      source: 'env'
    };
  }

  return { url: '', source: 'none' };
}

/**
 * Save Google Sheet Web App URL
 */
export function saveGoogleSheetConfig(url) {
  try {
    localStorage.setItem(GOOGLE_SHEET_URL_KEY, (url || '').trim());
    return true;
  } catch (e) {
    console.error('Error saving Google Sheet URL:', e);
    return false;
  }
}

/**
 * Clear Google Sheet URL
 */
export function clearGoogleSheetConfig() {
  localStorage.removeItem(GOOGLE_SHEET_URL_KEY);
}

/**
 * Check if Google Sheets database is configured
 */
export function isGoogleSheetConfigured() {
  const config = getGoogleSheetConfig();
  return Boolean(config.url && config.url.startsWith('http'));
}

/**
 * Automatically inspect URL search parameters for ?sync_url=... or ?sheet_url=...
 * When opened on mobile phone, automatically saves config to localStorage and cleans address bar.
 */
export function checkAndApplyUrlSyncConfig() {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const syncUrl = params.get('sync_url') || params.get('sheetUrl') || params.get('sheet_url');
    if (syncUrl && syncUrl.trim().startsWith('http')) {
      saveGoogleSheetConfig(syncUrl.trim());
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return true;
    }
  } catch (e) {
    console.error('Error auto-syncing from URL:', e);
  }
  return false;
}

/**
 * Generate a mobile pairing URL given a Google Sheet Web App URL
 */
export function generateSyncShareUrl(customUrl) {
  const url = customUrl || getGoogleSheetConfig().url;
  if (!url) return '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}?sync_url=${encodeURIComponent(url.trim())}`;
}

/**
 * Transform Sheet row to App Model
 */
export function formatFromSheetRow(row) {
  if (!row) return null;
  return {
    id: String(row.id || ('tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6))),
    type: row.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: Math.abs(Number(row.amount) || 0),
    category: String(row.category || 'Other / Misc'),
    paymentMode: String(row.paymentMode || row.payment_mode || 'Cash'),
    date: row.date ? String(row.date).split('T')[0] : new Date().toISOString().split('T')[0],
    time: String(row.time || ''),
    notes: String(row.notes || ''),
    tags: Array.isArray(row.tags) ? row.tags : (row.tags ? String(row.tags).split(',').map(t => t.trim()).filter(Boolean) : []),
    isRecurring: Boolean(row.isRecurring || row.is_recurring),
    createdAt: row.createdAt || row.created_at || new Date().toISOString(),
    updatedAt: row.updatedAt || row.updated_at || new Date().toISOString()
  };
}

/**
 * Transform App Model to Sheet Row
 */
export function formatForSheetRow(tx) {
  return {
    id: tx.id,
    type: tx.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
    amount: Math.abs(Number(tx.amount) || 0),
    category: tx.category || 'Other / Misc',
    paymentMode: tx.paymentMode || 'Cash',
    date: tx.date || new Date().toISOString().split('T')[0],
    time: tx.time || '',
    notes: tx.notes || '',
    tags: Array.isArray(tx.tags) ? tx.tags.join(', ') : (tx.tags || ''),
    isRecurring: Boolean(tx.isRecurring),
    createdAt: tx.createdAt || new Date().toISOString(),
    updatedAt: tx.updatedAt || new Date().toISOString()
  };
}

/**
 * Test Connection to Google Sheet Web App
 */
export async function testGoogleSheetConnection(customUrl) {
  const url = (customUrl || getGoogleSheetConfig().url || '').trim();
  if (!url) {
    return { success: false, message: 'Google Apps Script Web App URL is required.' };
  }

  try {
    const testEndpoint = url.includes('?') ? `${url}&action=ping` : `${url}?action=ping`;
    const res = await fetch(testEndpoint, { method: 'GET', redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
    const data = await res.json();
    if (data.status === 'ok' || data.success) {
      return {
        success: true,
        message: 'Connected to Google Spreadsheet database successfully!',
        count: data.count || data.recordsCount || 0,
        settingsCount: data.settingsCount || 0
      };
    }
    return {
      success: true,
      message: 'Connected to Google Sheet!',
      count: data.data ? data.data.length : 0
    };
  } catch (err) {
    console.error('Google Sheet connection test error:', err);
    return {
      success: false,
      message: err.message || 'Could not connect to Google Apps Script. Check the Web App deployment URL.'
    };
  }
}

/**
 * Fetch Full Database (Transactions AND Settings in ONE single fast roundtrip)
 */
export async function fetchGoogleSheetDatabase() {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  try {
    const fetchUrl = url.includes('?') ? `${url}&action=getDatabase` : `${url}?action=getDatabase`;
    const res = await fetch(fetchUrl, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    const rawList = Array.isArray(result)
      ? result
      : (result.transactions || result.data || []);
    const transactions = rawList.map(formatFromSheetRow);

    const rawSettings = result.settings || null;
    const settings = rawSettings ? deserializeSettingsFromSheet(rawSettings) : null;

    return {
      transactions,
      settings,
      timestamp: result.timestamp || new Date().toISOString()
    };
  } catch (err) {
    console.error('Error fetching database from Google Sheet:', err);
    throw err;
  }
}

/**
 * Fetch all transactions from Google Sheet (Wrapper for backward compatibility)
 */
export async function fetchGoogleSheetTransactions() {
  const data = await fetchGoogleSheetDatabase();
  return data ? data.transactions : null;
}

/**
 * Fetch settings from Google Sheet
 */
export async function fetchGoogleSheetSettings() {
  const data = await fetchGoogleSheetDatabase();
  return data ? data.settings : null;
}

/**
 * Low-level post helper with text/plain to avoid CORS preflight latency
 */
async function postToGoogleSheet(payload) {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  const res = await fetch(url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

/**
 * Insert a transaction to Google Sheet
 */
export async function insertGoogleSheetTransaction(tx) {
  const payload = {
    action: 'insert',
    transaction: formatForSheetRow(tx)
  };
  return postToGoogleSheet(payload);
}

/**
 * Update an existing transaction in Google Sheet
 */
export async function updateGoogleSheetTransaction(tx) {
  const payload = {
    action: 'update',
    transaction: formatForSheetRow(tx)
  };
  return postToGoogleSheet(payload);
}

/**
 * Delete a transaction from Google Sheet
 */
export async function deleteGoogleSheetTransaction(id) {
  const payload = {
    action: 'delete',
    id: String(id)
  };
  return postToGoogleSheet(payload);
}

/**
 * Delete multiple transactions from Google Sheet
 */
export async function deleteMultipleGoogleSheetTransactions(ids) {
  if (!ids || ids.length === 0) return null;
  const payload = {
    action: 'bulkDelete',
    ids: ids.map(String)
  };
  return postToGoogleSheet(payload);
}

/**
 * Save settings to Google Sheet Settings tab
 */
export async function saveGoogleSheetSettings(settings) {
  const serialized = serializeSettingsForSheet(settings);
  const payload = {
    action: 'saveSettings',
    settings: serialized
  };
  return postToGoogleSheet(payload);
}

/**
 * Sync entire local database (Transactions & Settings) to Google Sheet in a single POST
 */
export async function syncAllDatabaseToGoogleSheet({ transactions = [], settings = null }) {
  const payload = {
    action: 'syncDatabase',
    transactions: transactions.map(formatForSheetRow),
    settings: settings ? serializeSettingsForSheet(settings) : null
  };
  return postToGoogleSheet(payload);
}

/**
 * Sync all local transactions to Google Sheet (Backward compatibility)
 */
export async function syncAllLocalToGoogleSheet(localTransactions = []) {
  const payload = {
    action: 'syncAll',
    transactions: localTransactions.map(formatForSheetRow)
  };
  return postToGoogleSheet(payload);
}

/**
 * ---------------------------------------------------------------------------
 * ASYNCHRONOUS BACKGROUND SYNC QUEUE & LATENCY ELIMINATOR
 * ---------------------------------------------------------------------------
 * This ensures UI operations (add, edit, delete, settings changes) are 100%
 * optimistic and zero-latency (0ms), while updates are queued and processed
 * non-blockingly in the background. Settings updates are automatically debounced.
 */

class BackgroundSyncManager {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.listeners = new Set();
    this.settingsDebounceTimer = null;
    this.lastSyncedAt = null;
    this.status = 'idle'; // 'idle' | 'syncing' | 'error'
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Initial notification
    listener({
      status: this.status,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt
    });
    return () => this.listeners.delete(listener);
  }

  notify() {
    const state = {
      status: this.status,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt
    };
    for (const listener of this.listeners) {
      try {
        listener(state);
      } catch (e) {
        console.error('Error notifying sync listener:', e);
      }
    }
  }

  enqueue(taskFn, description = '') {
    if (!isGoogleSheetConfigured()) return;
    this.queue.push({ taskFn, description, timestamp: Date.now() });
    this.process();
  }

  debounceSettingsSync(settings, delayMs = 600) {
    if (!isGoogleSheetConfigured()) return;
    if (this.settingsDebounceTimer) {
      clearTimeout(this.settingsDebounceTimer);
    }
    this.settingsDebounceTimer = setTimeout(() => {
      this.enqueue(() => saveGoogleSheetSettings(settings), 'Sync settings');
    }, delayMs);
  }

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;
    if (!isGoogleSheetConfigured()) {
      this.queue = [];
      return;
    }

    this.isProcessing = true;
    this.status = 'syncing';
    this.notify();

    while (this.queue.length > 0) {
      const current = this.queue[0];
      try {
        await current.taskFn();
        this.queue.shift(); // Remove successful item
        this.lastSyncedAt = new Date();
      } catch (err) {
        console.warn(`Sync task failed (${current.description}):`, err);
        // If failed, drop or retry after short pause so we don't loop indefinitely
        this.queue.shift();
        this.status = 'error';
        this.notify();
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    this.isProcessing = false;
    this.status = 'idle';
    this.notify();
  }
}

export const backgroundSync = new BackgroundSyncManager();

/**
 * Full copyable Google Apps Script Template Code
 * Creates a two-tab database: "Transactions" and "Settings".
 * Fully optimized with batch reads and script locks for speed and reliability.
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ==============================================================================
 * PERSONAL EXPENSE TRACKER - GOOGLE SPREADSHEET DATABASE API (Apps Script)
 * Version: 2.0.0 (Full Database: Transactions + Settings + High-Speed Batching)
 * ==============================================================================
 * 
 * INSTRUCTIONS (Only 1 Minute Setup):
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any default code and PASTE this entire script.
 * 4. Click "Deploy" (top right) > "New deployment"
 * 5. Click the gear icon next to "Select type" > choose "Web app"
 * 6. Set Description: "Expense Tracker Database"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for mobile & laptop sync without login!
 * 9. Click "Deploy", Authorize permissions, and COPY the Web App URL.
 * 10. Paste that Web App URL into Expense Tracker Settings or in .env file!
 */

var TX_SHEET_NAME = 'Transactions';
var SETTINGS_SHEET_NAME = 'Settings';

var TX_HEADERS = [
  'id', 'date', 'time', 'type', 'amount', 'category',
  'paymentMode', 'notes', 'tags', 'isRecurring', 'createdAt', 'updatedAt'
];

var SETTINGS_HEADERS = ['key', 'value', 'updatedAt'];

function getOrCreateSheet(sheetName, headers, headerBg) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground(headerBg || '#1e1b4b')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getTxSheet() {
  return getOrCreateSheet(TX_SHEET_NAME, TX_HEADERS, '#1e1b4b');
}

function getSettingsSheet() {
  return getOrCreateSheet(SETTINGS_SHEET_NAME, SETTINGS_HEADERS, '#0f172a');
}

/**
 * Read all transactions into memory array
 */
function readAllTransactions() {
  var sheet = getTxSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, TX_HEADERS.length).getValues();
  var list = [];
  var tz = Session.getScriptTimeZone();

  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;

    var dateStr = '';
    if (row[1] instanceof Date) {
      dateStr = Utilities.formatDate(row[1], tz, 'yyyy-MM-dd');
    } else {
      dateStr = String(row[1] || '');
    }

    list.push({
      id: String(row[0]),
      date: dateStr,
      time: String(row[2] || ''),
      type: String(row[3] || 'EXPENSE'),
      amount: Number(row[4]) || 0,
      category: String(row[5] || 'Other / Misc'),
      paymentMode: String(row[6] || 'Cash'),
      notes: String(row[7] || ''),
      tags: String(row[8] || ''),
      isRecurring: Boolean(row[9]),
      createdAt: String(row[10] || ''),
      updatedAt: String(row[11] || '')
    });
  }
  return list;
}

/**
 * Read all settings into key-value map
 */
function readAllSettings() {
  var sheet = getSettingsSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return {};

  var values = sheet.getRange(2, 1, lastRow - 1, SETTINGS_HEADERS.length).getValues();
  var map = {};
  for (var i = 0; i < values.length; i++) {
    var key = String(values[i][0] || '').trim();
    if (key) {
      map[key] = values[i][1];
    }
  }
  return map;
}

/**
 * Batch save settings map to Settings sheet
 */
function writeSettingsMap(settingsMap) {
  if (!settingsMap || typeof settingsMap !== 'object') return;
  var sheet = getSettingsSheet();
  var lastRow = sheet.getLastRow();
  var existingKeys = {};

  if (lastRow > 1) {
    var currentValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < currentValues.length; i++) {
      existingKeys[String(currentValues[i][0]).trim()] = i + 2;
    }
  }

  var nowStr = new Date().toISOString();
  var toAppend = [];

  for (var key in settingsMap) {
    if (!settingsMap.hasOwnProperty(key)) continue;
    var val = settingsMap[key];
    var valStr = typeof val === 'object' ? JSON.stringify(val) : String(val);

    if (existingKeys[key]) {
      var rowIdx = existingKeys[key];
      sheet.getRange(rowIdx, 2, 1, 2).setValues([[valStr, nowStr]]);
    } else {
      toAppend.push([key, valStr, nowStr]);
    }
  }

  if (toAppend.length > 0) {
    var startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, toAppend.length, SETTINGS_HEADERS.length).setValues(toAppend);
  }
}

/**
 * GET Handler - Fast single-roundtrip retrieval of Transactions & Settings
 */
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) || 'getDatabase';

    if (action === 'ping') {
      var txSheet = getTxSheet();
      var sSheet = getSettingsSheet();
      return responseJSON({
        status: 'ok',
        success: true,
        count: Math.max(0, txSheet.getLastRow() - 1),
        settingsCount: Math.max(0, sSheet.getLastRow() - 1),
        message: 'Google Spreadsheet Database Ready'
      });
    }

    if (action === 'getSettings') {
      return responseJSON({
        status: 'ok',
        success: true,
        settings: readAllSettings()
      });
    }

    if (action === 'getTransactions') {
      var txs = readAllTransactions();
      return responseJSON({
        status: 'ok',
        success: true,
        count: txs.length,
        transactions: txs
      });
    }

    // Default: 'getDatabase' or 'getAll' -> Returns BOTH in ONE single HTTP call!
    var txList = readAllTransactions();
    var settingsData = readAllSettings();

    return responseJSON({
      status: 'ok',
      success: true,
      count: txList.length,
      transactions: txList,
      settings: settingsData,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

/**
 * POST Handler - CRUD & Batch Writes with Script Locking
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.tryLock(20000);

    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;

    // 1. Insert Transaction
    if (action === 'insert') {
      var sheet = getTxSheet();
      var tx = postData.transaction;
      sheet.appendRow([
        tx.id, tx.date, tx.time, tx.type, tx.amount, tx.category,
        tx.paymentMode, tx.notes, tx.tags, tx.isRecurring, tx.createdAt, tx.updatedAt
      ]);
      return responseJSON({ status: 'ok', success: true, action: 'insert', id: tx.id });
    }

    // 2. Update Transaction
    if (action === 'update') {
      var sheet = getTxSheet();
      var tx = postData.transaction;
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]) === String(tx.id)) {
            var rowIdx = i + 2;
            sheet.getRange(rowIdx, 1, 1, TX_HEADERS.length).setValues([[
              tx.id, tx.date, tx.time, tx.type, tx.amount, tx.category,
              tx.paymentMode, tx.notes, tx.tags, tx.isRecurring, tx.createdAt, tx.updatedAt
            ]]);
            return responseJSON({ status: 'ok', success: true, action: 'update', id: tx.id });
          }
        }
      }
      sheet.appendRow([tx.id, tx.date, tx.time, tx.type, tx.amount, tx.category, tx.paymentMode, tx.notes, tx.tags, tx.isRecurring, tx.createdAt, tx.updatedAt]);
      return responseJSON({ status: 'ok', success: true, action: 'inserted_fallback', id: tx.id });
    }

    // 3. Delete Transaction
    if (action === 'delete') {
      var sheet = getTxSheet();
      var idToDelete = String(postData.id);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]) === idToDelete) {
            sheet.deleteRow(i + 2);
            return responseJSON({ status: 'ok', success: true, action: 'delete', id: idToDelete });
          }
        }
      }
      return responseJSON({ status: 'ok', success: true, action: 'not_found' });
    }

    // 4. Bulk Delete Transactions
    if (action === 'bulkDelete') {
      var sheet = getTxSheet();
      var idsToDelete = (postData.ids || []).map(String);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1 && idsToDelete.length > 0) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = ids.length - 1; i >= 0; i--) {
          if (idsToDelete.indexOf(String(ids[i][0])) !== -1) {
            sheet.deleteRow(i + 2);
          }
        }
      }
      return responseJSON({ status: 'ok', success: true, action: 'bulkDelete', count: idsToDelete.length });
    }

    // 5. Save Settings
    if (action === 'saveSettings') {
      writeSettingsMap(postData.settings);
      return responseJSON({ status: 'ok', success: true, action: 'saveSettings' });
    }

    // 6. Full Transaction Sync
    if (action === 'syncAll' || action === 'syncTransactions') {
      var sheet = getTxSheet();
      var txs = postData.transactions || [];
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      if (txs.length > 0) {
        var rows = txs.map(function(t) {
          return [
            t.id, t.date, t.time, t.type, t.amount, t.category,
            t.paymentMode, t.notes, t.tags, t.isRecurring, t.createdAt, t.updatedAt
          ];
        });
        sheet.getRange(2, 1, rows.length, TX_HEADERS.length).setValues(rows);
      }
      return responseJSON({ status: 'ok', success: true, action: 'syncAll', count: txs.length });
    }

    // 7. Full Database Sync (Transactions AND Settings in one atomic call!)
    if (action === 'syncDatabase') {
      var sheet = getTxSheet();
      var txs = postData.transactions || [];
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      if (txs.length > 0) {
        var rows = txs.map(function(t) {
          return [
            t.id, t.date, t.time, t.type, t.amount, t.category,
            t.paymentMode, t.notes, t.tags, t.isRecurring, t.createdAt, t.updatedAt
          ];
        });
        sheet.getRange(2, 1, rows.length, TX_HEADERS.length).setValues(rows);
      }

      if (postData.settings) {
        writeSettingsMap(postData.settings);
      }

      return responseJSON({
        status: 'ok',
        success: true,
        action: 'syncDatabase',
        txCount: txs.length
      });
    }

    return responseJSON({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  } finally {
    try {
      lock.releaseLock();
    } catch (e) {}
  }
}

function responseJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
