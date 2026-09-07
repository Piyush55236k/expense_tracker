/**
 * Google Sheets Database Service - Zero-Login Multi-Device Cloud Sync
 * Connects any Mobile phone or Laptop to a single Google Spreadsheet.
 */

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
    updatedAt: new Date().toISOString()
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
        message: 'Connected to Google Spreadsheet successfully!',
        count: data.count || data.recordsCount || 0
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
 * Fetch all transactions from Google Sheet
 */
export async function fetchGoogleSheetTransactions() {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  try {
    const fetchUrl = url.includes('?') ? `${url}&action=getAll` : `${url}?action=getAll`;
    const res = await fetch(fetchUrl, { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();

    const rawList = Array.isArray(result) ? result : (result.transactions || result.data || []);
    return rawList.map(formatFromSheetRow);
  } catch (err) {
    console.error('Error fetching from Google Sheet:', err);
    throw err;
  }
}

/**
 * Insert a transaction to Google Sheet
 */
export async function insertGoogleSheetTransaction(tx) {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  const payload = {
    action: 'insert',
    transaction: formatForSheetRow(tx)
  };

  try {
    await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // text/plain prevents CORS preflight in Apps Script
      body: JSON.stringify(payload)
    });
    return tx;
  } catch (err) {
    console.warn('Google Sheet remote insert delayed:', err);
    return tx;
  }
}

/**
 * Update an existing transaction in Google Sheet
 */
export async function updateGoogleSheetTransaction(tx) {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  const payload = {
    action: 'update',
    transaction: formatForSheetRow(tx)
  };

  try {
    await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return tx;
  } catch (err) {
    console.warn('Google Sheet remote update delayed:', err);
    return tx;
  }
}

/**
 * Delete a transaction from Google Sheet
 */
export async function deleteGoogleSheetTransaction(id) {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  const payload = {
    action: 'delete',
    id: String(id)
  };

  try {
    await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('Google Sheet remote delete delayed:', err);
    return false;
  }
}

/**
 * Delete multiple transactions from Google Sheet
 */
export async function deleteMultipleGoogleSheetTransactions(ids) {
  const { url } = getGoogleSheetConfig();
  if (!url || !ids || ids.length === 0) return null;

  const payload = {
    action: 'bulkDelete',
    ids: ids.map(String)
  };

  try {
    await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (err) {
    console.warn('Google Sheet bulk delete delayed:', err);
    return false;
  }
}

/**
 * Sync all local transactions to Google Sheet (Full Replace or Upsert)
 */
export async function syncAllLocalToGoogleSheet(localTransactions = []) {
  const { url } = getGoogleSheetConfig();
  if (!url) return null;

  const payload = {
    action: 'syncAll',
    transactions: localTransactions.map(formatForSheetRow)
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error syncing all to Google Sheet:', err);
    throw err;
  }
}

/**
 * Full copyable Google Apps Script Template Code
 * The user can copy-paste this into Google Sheets > Extensions > Apps Script and click "Deploy as Web App"
 */
export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * ==============================================================================
 * PERSONAL EXPENSE TRACKER - GOOGLE SPREADSHEET DATABASE API (Apps Script)
 * ==============================================================================
 * 
 * INSTRUCTIONS (Only 1 Minute Setup):
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Click "Extensions" > "Apps Script"
 * 3. Delete any default code and PASTE this entire script.
 * 4. Click "Deploy" (top right) > "New deployment"
 * 5. Click the gear icon next to "Select type" > choose "Web app"
 * 6. Set Description: "Expense Tracker DB"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"  <-- CRITICAL for mobile & laptop sync without login!
 * 9. Click "Deploy", Authorize permissions, and COPY the Web App URL.
 * 10. Paste that Web App URL into Expense Tracker Settings or in .env file!
 */

var SHEET_NAME = 'Transactions';
var HEADERS = ['id', 'date', 'time', 'type', 'amount', 'category', 'paymentMode', 'notes', 'tags', 'isRecurring', 'createdAt', 'updatedAt'];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#1e1b4b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  try {
    var sheet = getOrCreateSheet();
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return responseJSON({ status: 'ok', success: true, count: 0, transactions: [] });
    }
    
    var values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
    var list = [];
    
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (!row[0]) continue;
      
      var dateStr = '';
      if (row[1] instanceof Date) {
        dateStr = Utilities.formatDate(row[1], Session.getScriptTimeZone(), 'yyyy-MM-dd');
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
    
    return responseJSON({ status: 'ok', success: true, count: list.length, transactions: list });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var postData = JSON.parse(e.postData.contents);
    var action = postData.action;
    
    if (action === 'insert') {
      var tx = postData.transaction;
      sheet.appendRow([
        tx.id,
        tx.date,
        tx.time,
        tx.type,
        tx.amount,
        tx.category,
        tx.paymentMode,
        tx.notes,
        tx.tags,
        tx.isRecurring,
        tx.createdAt,
        tx.updatedAt
      ]);
      return responseJSON({ status: 'ok', success: true, action: 'insert', id: tx.id });
    }
    
    if (action === 'update') {
      var tx = postData.transaction;
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        for (var i = 0; i < ids.length; i++) {
          if (String(ids[i][0]) === String(tx.id)) {
            var rowIdx = i + 2;
            sheet.getRange(rowIdx, 1, 1, HEADERS.length).setValues([[
              tx.id, tx.date, tx.time, tx.type, tx.amount, tx.category,
              tx.paymentMode, tx.notes, tx.tags, tx.isRecurring, tx.createdAt, tx.updatedAt
            ]]);
            return responseJSON({ status: 'ok', success: true, action: 'update', id: tx.id });
          }
        }
      }
      // If not found, append
      sheet.appendRow([tx.id, tx.date, tx.time, tx.type, tx.amount, tx.category, tx.paymentMode, tx.notes, tx.tags, tx.isRecurring, tx.createdAt, tx.updatedAt]);
      return responseJSON({ status: 'ok', success: true, action: 'inserted_fallback', id: tx.id });
    }
    
    if (action === 'delete') {
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
    
    if (action === 'bulkDelete') {
      var idsToDelete = (postData.ids || []).map(String);
      var lastRow = sheet.getLastRow();
      if (lastRow > 1 && idsToDelete.length > 0) {
        var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
        // Delete backwards so index doesn't shift
        for (var i = ids.length - 1; i >= 0; i--) {
          if (idsToDelete.indexOf(String(ids[i][0])) !== -1) {
            sheet.deleteRow(i + 2);
          }
        }
      }
      return responseJSON({ status: 'ok', success: true, action: 'bulkDelete', count: idsToDelete.length });
    }
    
    if (action === 'syncAll') {
      var txs = postData.transactions || [];
      // Clear existing content except header
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
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }
      return responseJSON({ status: 'ok', success: true, action: 'syncAll', count: txs.length });
    }
    
    return responseJSON({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return responseJSON({ status: 'error', message: err.toString() });
  }
}

function responseJSON(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
