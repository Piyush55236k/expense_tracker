/**
 * Utility functions for currency and date formatting
 */

/**
 * Format numeric amount into currency string
 * @param {number} amount - The numeric value
 * @param {string} currencyCode - e.g. 'USD', 'INR', 'EUR', 'GBP'
 * @param {string} currencySymbol - e.g. '$', '₹', '€', '£'
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'USD', currencySymbol = '$') {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currencySymbol}0.00`;
  }
  
  const num = Number(amount);
  const isNegative = num < 0;
  const absAmount = Math.abs(num);

  const formattedNum = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${isNegative ? '-' : ''}${currencySymbol}${formattedNum}`;
}

/**
 * Format a Date or date string to readable calendar format
 * @param {string|Date} dateInput 
 * @param {string} mode - 'relative', 'short', 'full', 'monthYear', 'isoDate'
 * @returns {string}
 */
export function formatDate(dateInput, mode = 'short') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today - targetDay) / (1000 * 60 * 60 * 24));

  if (mode === 'relative') {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays === -1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 7) return `${diffDays} days ago`;
  }

  if (mode === 'monthYear') {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  if (mode === 'full') {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  if (mode === 'isoDate') {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Default 'short'
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

/**
 * Format time from date string (e.g. 10:30 AM)
 * @param {string|Date} dateInput 
 * @returns {string}
 */
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format a percentage
 * @param {number} value 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatPercentage(value, decimals = 1) {
  if (isNaN(value) || value === null || value === undefined) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}
