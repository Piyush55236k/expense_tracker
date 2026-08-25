/**
 * Settings Service - Defines default categories, payment modes, currencies, and configuration
 */

export const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat_food', name: 'Food & Dining', icon: 'Utensils', color: '#f97316' },
  { id: 'cat_shopping', name: 'Shopping & Groceries', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat_housing', name: 'Housing & Rent', icon: 'Home', color: '#8b5cf6' },
  { id: 'cat_transport', name: 'Transportation & Fuel', icon: 'Car', color: '#3b82f6' },
  { id: 'cat_bills', name: 'Bills & Recharges', icon: 'Zap', color: '#eab308' },
  { id: 'cat_entertainment', name: 'Entertainment & OTT', icon: 'Film', color: '#a855f7' },
  { id: 'cat_health', name: 'Health & Medical', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat_education', name: 'Education & Courses', icon: 'GraduationCap', color: '#06b6d4' },
  { id: 'cat_travel', name: 'Travel & Trips', icon: 'Plane', color: '#14b8a6' },
  { id: 'cat_personal', name: 'Personal Care', icon: 'Sparkles', color: '#d946ef' },
  { id: 'cat_investment', name: 'Investments & Mutual Funds', icon: 'TrendingUp', color: '#10b981' },
  { id: 'cat_other', name: 'Other / Misc', icon: 'HelpCircle', color: '#64748b' }
];

export const DEFAULT_INCOME_CATEGORIES = [
  { id: 'inc_salary', name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { id: 'inc_freelance', name: 'Freelance & Projects', icon: 'Laptop', color: '#06b6d4' },
  { id: 'inc_business', name: 'Business Income', icon: 'Building2', color: '#3b82f6' },
  { id: 'inc_investments', name: 'Dividends & Returns', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'inc_rental', name: 'Rental Income', icon: 'Home', color: '#f59e0b' },
  { id: 'inc_gifts', name: 'Gifts & Rewards', icon: 'Gift', color: '#ec4899' },
  { id: 'inc_other', name: 'Other Income', icon: 'PlusCircle', color: '#64748b' }
];

export const DEFAULT_PAYMENT_MODES = [
  { id: 'pm_upi', name: 'UPI / QR (GPay/PhonePe/Paytm)', icon: 'QrCode', color: '#6366f1' },
  { id: 'pm_cash', name: 'Cash', icon: 'Banknote', color: '#10b981' },
  { id: 'pm_credit', name: 'Credit Card', icon: 'CreditCard', color: '#f43f5e' },
  { id: 'pm_debit', name: 'Debit Card', icon: 'CreditCard', color: '#3b82f6' },
  { id: 'pm_bank', name: 'Net Banking / IMPS', icon: 'Building', color: '#8b5cf6' },
  { id: 'pm_wallet', name: 'Digital Wallet', icon: 'Wallet', color: '#06b6d4' }
];

export const CURRENCY_OPTIONS = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
  { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', name: 'Euro (€)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CA$)' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar (S$)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' }
];

export const QUICK_ADD_PRESETS = [
  { label: 'Chai / Coffee', amount: 30, category: 'Food & Dining', type: 'EXPENSE', paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)', icon: 'Coffee' },
  { label: 'Lunch / Snacks', amount: 150, category: 'Food & Dining', type: 'EXPENSE', paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)', icon: 'Utensils' },
  { label: 'Groceries / Mart', amount: 500, category: 'Shopping & Groceries', type: 'EXPENSE', paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)', icon: 'ShoppingBag' },
  { label: 'Petrol / Fuel', amount: 300, category: 'Transportation & Fuel', type: 'EXPENSE', paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)', icon: 'Fuel' },
  { label: 'Auto / Cab / Metro', amount: 80, category: 'Transportation & Fuel', type: 'EXPENSE', paymentMode: 'UPI / QR (GPay/PhonePe/Paytm)', icon: 'Bus' },
  { label: 'Quick Freelance', amount: 5000, category: 'Freelance & Projects', type: 'INCOME', paymentMode: 'Net Banking / IMPS', icon: 'Laptop' }
];

export const DEFAULT_SETTINGS = {
  currency: 'INR',
  currencySymbol: '₹',
  monthlyBudget: 25000,
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
    
    // Auto-migrate old USD defaults to INR if currency was USD
    const currency = (!parsed.currency || parsed.currency === 'USD') ? 'INR' : parsed.currency;
    const currencySymbol = (!parsed.currencySymbol || parsed.currencySymbol === '$') ? '₹' : parsed.currencySymbol;
    const monthlyBudget = parsed.monthlyBudget && parsed.monthlyBudget !== 2500 ? parsed.monthlyBudget : 25000;

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      currency,
      currencySymbol,
      monthlyBudget,
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
