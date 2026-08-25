/**
 * Settings Service - Defines default categories, payment modes, currencies, and configuration
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat_food', name: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
  { id: 'cat_shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat_housing', name: 'Housing & Rent', icon: 'Home', color: '#8b5cf6' },
  { id: 'cat_transport', name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { id: 'cat_bills', name: 'Bills & Utilities', icon: 'Zap', color: '#eab308' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Film', color: '#a855f7' },
  { id: 'cat_health', name: 'Health & Fitness', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat_education', name: 'Education', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'cat_travel', name: 'Travel & Vacations', icon: 'Plane', color: '#14b8a6' },
  { id: 'cat_personal', name: 'Personal Care', icon: 'Sparkles', color: '#d946ef' },
  { id: 'cat_investment', name: 'Investments', icon: 'TrendingUp', color: '#10b981' },
  { id: 'cat_other', name: 'Other / Misc', icon: 'HelpCircle', color: '#64748b' }
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'inc_salary', name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { id: 'inc_freelance', name: 'Freelance & Projects', icon: 'Laptop', color: '#06b6d4' },
  { id: 'inc_business', name: 'Business Income', icon: 'Building2', color: '#3b82f6' },
  { id: 'inc_investments', name: 'Dividends & Capital Gains', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'inc_rental', name: 'Rental Income', icon: 'Home', color: '#f59e0b' },
  { id: 'inc_gifts', name: 'Gifts & Grants', icon: 'Gift', color: '#ec4899' },
  { id: 'inc_other', name: 'Other Income', icon: 'PlusCircle', color: '#64748b' }
];

export const DEFAULT_PAYMENT_MODES = [
  { id: 'pm_cash', name: 'Cash', icon: 'Banknote', color: '#10b981' },
  { id: 'pm_upi', name: 'UPI / QR', icon: 'QrCode', color: '#6366f1' },
  { id: 'pm_credit', name: 'Credit Card', icon: 'CreditCard', color: '#f43f5e' },
  { id: 'pm_debit', name: 'Debit Card', icon: 'CreditCard', color: '#3b82f6' },
  { id: 'pm_bank', name: 'Bank Transfer', icon: 'Building', color: '#8b5cf6' },
  { id: 'pm_wallet', name: 'Digital Wallet', icon: 'Wallet', color: '#06b6d4' },
  { id: 'pm_crypto', name: 'Crypto', icon: 'Coins', color: '#f59e0b' }
];

export const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' }
];

export const QUICK_ADD_PRESETS = [
  { label: 'Coffee', amount: 4.5, category: 'Food & Dining', type: 'EXPENSE', paymentMode: 'UPI / QR', icon: 'Coffee' },
  { label: 'Lunch', amount: 15, category: 'Food & Dining', type: 'EXPENSE', paymentMode: 'UPI / QR', icon: 'Utensils' },
  { label: 'Groceries', amount: 45, category: 'Shopping', type: 'EXPENSE', paymentMode: 'Credit Card', icon: 'ShoppingBag' },
  { label: 'Fuel / Gas', amount: 30, category: 'Transportation', type: 'EXPENSE', paymentMode: 'Credit Card', icon: 'Fuel' },
  { label: 'Metro / Bus', amount: 5, category: 'Transportation', type: 'EXPENSE', paymentMode: 'Cash', icon: 'Bus' },
  { label: 'Quick Freelance', amount: 150, category: 'Freelance & Projects', type: 'INCOME', paymentMode: 'Bank Transfer', icon: 'Laptop' }
];

export const DEFAULT_SETTINGS = {
  currency: 'USD',
  currencySymbol: '$',
  monthlyBudget: 2500,
  budgetAlertThreshold: 85, // percentage
  theme: 'dark', // 'dark' | 'light' | 'midnight'
  expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
  incomeCategories: DEFAULT_INCOME_CATEGORIES,
  paymentModes: DEFAULT_PAYMENT_MODES,
  quickAddPresets: QUICK_ADD_PRESETS,
  userName: 'Alex',
  hideBalanceOnOpen: false
};

const SETTINGS_STORAGE_KEY = 'personal_expense_tracker_settings';

export function loadSettingsFromStorage() {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      expenseCategories: parsed.expenseCategories?.length ? parsed.expenseCategories : DEFAULT_EXPENSE_CATEGORIES,
      incomeCategories: parsed.incomeCategories?.length ? parsed.incomeCategories : DEFAULT_INCOME_CATEGORIES,
      paymentModes: parsed.paymentModes?.length ? parsed.paymentModes : DEFAULT_PAYMENT_MODES,
      quickAddPresets: parsed.quickAddPresets?.length ? parsed.quickAddPresets : QUICK_ADD_PRESETS
    };
  } catch (e) {
    console.error('Error loading settings from localStorage:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettingsToStorage(settings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Error saving settings to localStorage:', e);
    return false;
  }
}
