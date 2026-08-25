/**
 * CSV Export and Import Helpers
 */

/**
 * Convert transactions array to downloadable CSV string
 */
export function exportTransactionsToCSV(transactions, currencySymbol = '$') {
  if (!transactions || transactions.length === 0) {
    return 'ID,Date,Time,Type,Category,Amount,PaymentMode,Notes,Tags\n';
  }

  const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Amount', 'Currency', 'Payment Mode', 'Notes', 'Tags'];
  
  const rows = transactions.map(tx => {
    const dateObj = new Date(tx.date || tx.createdAt);
    const dateStr = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : '';
    const timeStr = !isNaN(dateObj) ? dateObj.toLocaleTimeString('en-US', { hour12: false }) : '';
    const amountVal = Number(tx.amount || 0).toFixed(2);
    const tagsStr = Array.isArray(tx.tags) ? tx.tags.join(';') : (tx.tags || '');

    // Escape fields that might contain commas or quotes
    const escape = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(tx.id),
      escape(dateStr),
      escape(timeStr),
      escape(tx.type),
      escape(tx.category),
      escape(amountVal),
      escape(currencySymbol),
      escape(tx.paymentMode),
      escape(tx.notes || ''),
      escape(tagsStr)
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\r\n');
}

/**
 * Simple CSV parser to convert CSV text back into transactions
 */
export function parseTransactionsCSV(csvText) {
  const lines = csvText.trim().split(/\r\n|\n|\r/);
  if (lines.length <= 1) return [];

  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  const transactions = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Regex to split line respecting quotes
    const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    if (!match) continue;

    const values = match.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const amount = parseFloat(row['amount']) || 0;
    const type = (row['type'] || 'EXPENSE').toUpperCase() === 'INCOME' ? 'INCOME' : 'EXPENSE';
    const dateStr = row['date'] || new Date().toISOString().split('T')[0];

    transactions.push({
      id: row['id'] || 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
      type: type,
      category: row['category'] || (type === 'INCOME' ? 'Salary' : 'General'),
      amount: Math.abs(amount),
      paymentMode: row['payment mode'] || row['paymentmode'] || 'Cash',
      date: dateStr,
      notes: row['notes'] || '',
      tags: row['tags'] ? row['tags'].split(';').map(t => t.trim()).filter(Boolean) : [],
      createdAt: new Date().toISOString()
    });
  }

  return transactions;
}
