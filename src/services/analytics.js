/**
 * Analytics Service - Core Financial Calculation & Insights Engine
 * Pure computational logic matching all prompt specifications.
 */

import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES, DEFAULT_PAYMENT_MODES } from './settings';

/**
 * Calculate overall balance and totals
 */
export function calculateBalance(transactions = []) {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    const amt = Number(tx.amount) || 0;
    if (tx.type === 'INCOME') {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }
  }

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  return {
    netBalance,
    totalIncome,
    totalExpense,
    savingsRate: Math.max(0, savingsRate),
    transactionCount: transactions.length
  };
}

/**
 * Get Today's financial overview
 */
export function getTodayStats(transactions = []) {
  const todayStr = new Date().toISOString().split('T')[0];
  let todayIncome = 0;
  let todayExpense = 0;
  let count = 0;

  for (const tx of transactions) {
    if (tx.date === todayStr) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') {
        todayIncome += amt;
      } else {
        todayExpense += amt;
      }
      count++;
    }
  }

  return {
    todayIncome,
    todayExpense,
    todayNet: todayIncome - todayExpense,
    todayCount: count
  };
}

/**
 * Get Monthly Snapshot & Progress
 */
export function getMonthlySummary(transactions = [], year = new Date().getFullYear(), month = new Date().getMonth()) {
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  const dailyExpenses = {};

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyExpenses[dayKey] = 0;
  }

  for (const tx of transactions) {
    if (!tx.date) continue;
    const txDate = new Date(tx.date);
    if (txDate.getFullYear() === year && txDate.getMonth() === month) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'INCOME') {
        monthlyIncome += amt;
      } else {
        monthlyExpense += amt;
        if (dailyExpenses[tx.date] !== undefined) {
          dailyExpenses[tx.date] += amt;
        } else {
          dailyExpenses[tx.date] = amt;
        }
      }
    }
  }

  const monthlyNet = monthlyIncome - monthlyExpense;
  const savings = Math.max(0, monthlyNet);
  const savingsPercentage = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

  return {
    year,
    month,
    monthlyIncome,
    monthlyExpense,
    monthlyNet,
    savings,
    savingsPercentage,
    dailyExpenses
  };
}

/**
 * Get category-wise spending / income breakdown
 */
export function getCategoryBreakdown(transactions = [], type = 'EXPENSE', categoriesList = []) {
  const totals = {};
  const counts = {};
  let overallTotal = 0;

  const relevantTxs = transactions.filter(t => t.type === type);

  for (const tx of relevantTxs) {
    const cat = tx.category || 'Other';
    const amt = Number(tx.amount) || 0;
    totals[cat] = (totals[cat] || 0) + amt;
    counts[cat] = (counts[cat] || 0) + 1;
    overallTotal += amt;
  }

  const defaultList = type === 'INCOME' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
  const lookup = new Map();
  [...defaultList, ...categoriesList].forEach(c => lookup.set(c.name, c));

  const results = Object.keys(totals).map(catName => {
    const amount = totals[catName];
    const percentage = overallTotal > 0 ? (amount / overallTotal) * 100 : 0;
    const meta = lookup.get(catName) || { color: '#64748b', icon: 'Tag' };

    return {
      category: catName,
      total: amount,
      count: counts[catName],
      percentage,
      color: meta.color || '#6366f1',
      icon: meta.icon || 'Tag'
    };
  });

  return results.sort((a, b) => b.total - a.total);
}

/**
 * Get payment mode distribution
 */
export function getPaymentModeBreakdown(transactions = [], type = 'EXPENSE', paymentModesList = []) {
  const totals = {};
  const counts = {};
  let overallTotal = 0;

  const relevantTxs = transactions.filter(t => t.type === type);

  for (const tx of relevantTxs) {
    const mode = tx.paymentMode || 'Cash';
    const amt = Number(tx.amount) || 0;
    totals[mode] = (totals[mode] || 0) + amt;
    counts[mode] = (counts[mode] || 0) + 1;
    overallTotal += amt;
  }

  const lookup = new Map();
  [...DEFAULT_PAYMENT_MODES, ...paymentModesList].forEach(p => lookup.set(p.name, p));

  const results = Object.keys(totals).map(modeName => {
    const amount = totals[modeName];
    const percentage = overallTotal > 0 ? (amount / overallTotal) * 100 : 0;
    const meta = lookup.get(modeName) || { color: '#64748b', icon: 'CreditCard' };

    return {
      mode: modeName,
      total: amount,
      count: counts[modeName],
      percentage,
      color: meta.color || '#3b82f6',
      icon: meta.icon || 'CreditCard'
    };
  });

  return results.sort((a, b) => b.total - a.total);
}

/**
 * Get weekly spending array (Last 7 days)
 */
export function getWeeklySpending(transactions = []) {
  const days = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

    let expense = 0;
    let income = 0;

    for (const tx of transactions) {
      if (tx.date === dateStr) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'EXPENSE') expense += amt;
        else income += amt;
      }
    }

    days.push({
      date: dateStr,
      dayLabel,
      expense,
      income,
      isToday: i === 0
    });
  }

  return days;
}

/**
 * Get monthly trend for the last N months
 */
export function getMonthlyTrend(transactions = [], numberOfMonths = 6) {
  const result = [];
  const now = new Date();

  for (let i = numberOfMonths - 1; i >= 0; i--) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });

    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
      if (!tx.date) continue;
      const d = new Date(tx.date);
      if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
        const amt = Number(tx.amount) || 0;
        if (tx.type === 'INCOME') income += amt;
        else expense += amt;
      }
    }

    result.push({
      monthLabel: `${monthName} '${String(targetYear).slice(2)}`,
      shortLabel: monthName,
      year: targetYear,
      month: targetMonth,
      income,
      expense,
      net: income - expense,
      savingsRate: income > 0 ? Math.max(0, ((income - expense) / income) * 100) : 0
    });
  }

  return result;
}

/**
 * Get largest expense in dataset or given period
 */
export function getLargestExpense(transactions = []) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  if (expenses.length === 0) return null;
  return expenses.reduce((max, curr) => (Number(curr.amount) > Number(max.amount) ? curr : max), expenses[0]);
}

/**
 * Get daily average spending over active days or month
 */
export function getDailyAverage(transactions = [], daysSpan = 30) {
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  const total = expenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  
  // Count unique active expense days or fallback to span
  const uniqueDays = new Set(expenses.map(t => t.date)).size;
  const divisor = Math.max(1, Math.min(uniqueDays || 1, daysSpan));
  return total / divisor;
}

/**
 * Generate Smart AI / Financial Insights
 */
export function generateSmartInsights(transactions = [], settings = {}) {
  const insights = [];
  const { totalIncome, savingsRate } = calculateBalance(transactions);
  const monthlySummary = getMonthlySummary(transactions);
  const categories = getCategoryBreakdown(transactions, 'EXPENSE', settings.expenseCategories || []);
  const budget = Number(settings.monthlyBudget) || 2000;

  // 1. Budget Utilization Insight
  if (budget > 0) {
    const budgetPct = (monthlySummary.monthlyExpense / budget) * 100;
    if (budgetPct >= 100) {
      insights.push({
        id: 'budget_exceeded',
        type: 'danger',
        icon: 'AlertTriangle',
        title: 'Monthly Budget Exceeded',
        message: `You've spent 100% (${budgetPct.toFixed(0)}%) of your monthly budget limit. Consider limiting non-essential expenses.`
      });
    } else if (budgetPct >= (settings.budgetAlertThreshold || 85)) {
      insights.push({
        id: 'budget_warning',
        type: 'warning',
        icon: 'AlertCircle',
        title: 'Budget Alert Threshold Reached',
        message: `You have utilized ${budgetPct.toFixed(0)}% of your monthly budget. ${(100 - budgetPct).toFixed(0)}% remaining for this month.`
      });
    } else {
      insights.push({
        id: 'budget_healthy',
        type: 'success',
        icon: 'CheckCircle2',
        title: 'Budget On Track',
        message: `You've used only ${budgetPct.toFixed(0)}% of your ${settings.currencySymbol || '$'}${budget.toLocaleString()} monthly budget. Great discipline!`
      });
    }
  }

  // 2. Top Category Spending Insight
  if (categories.length > 0) {
    const topCat = categories[0];
    insights.push({
      id: 'top_category',
      type: 'info',
      icon: 'PieChart',
      title: `Top Spending: ${topCat.category}`,
      message: `${topCat.category} represents ${topCat.percentage.toFixed(1)}% of your total spending across ${topCat.count} transactions.`
    });
  }

  // 3. Savings Rate Assessment
  if (totalIncome > 0) {
    if (savingsRate >= 30) {
      insights.push({
        id: 'savings_strong',
        type: 'success',
        icon: 'Sparkles',
        title: 'Excellent Savings Rate',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%, exceeding the recommended 20% rule of thumb!`
      });
    } else if (savingsRate > 0) {
      insights.push({
        id: 'savings_moderate',
        type: 'info',
        icon: 'TrendingUp',
        title: 'Positive Net Savings',
        message: `You are currently saving ${savingsRate.toFixed(1)}% of your income. Aiming for 20%+ can build an emergency cushion faster.`
      });
    } else {
      insights.push({
        id: 'savings_negative',
        type: 'danger',
        icon: 'TrendingDown',
        title: 'Expenses Exceed Income',
        message: 'Your total expenses currently exceed total recorded income. Review discretionary subscriptions & dining.'
      });
    }
  }

  // 4. Payment Mode Behavior
  const paymentModes = getPaymentModeBreakdown(transactions, 'EXPENSE', settings.paymentModes || []);
  if (paymentModes.length > 0) {
    const topMode = paymentModes[0];
    insights.push({
      id: 'frequent_payment',
      type: 'neutral',
      icon: 'CreditCard',
      title: `Primary Payment: ${topMode.mode}`,
      message: `${topMode.percentage.toFixed(0)}% of your expenses are paid via ${topMode.mode}.`
    });
  }

  return insights;
}
