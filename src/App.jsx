import React from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import BottomNav from './components/layout/BottomNav';
import QuickAddFab from './components/layout/QuickAddFab';
import ToastContainer from './components/common/Toast';
import ConfirmDialog from './components/common/ConfirmDialog';
import TransactionModal from './components/transactions/TransactionModal';

// Screens
import Dashboard from './components/dashboard/Dashboard';
import ExpenseScreen from './components/transactions/ExpenseScreen';
import IncomeScreen from './components/transactions/IncomeScreen';
import HistoryScreen from './components/history/HistoryScreen';
import AnalyticsScreen from './components/analytics/AnalyticsScreen';
import SettingsScreen from './components/settings/SettingsScreen';

function AppContent() {
  const { activeTab } = useExpense();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'expense':
        return <ExpenseScreen />;
      case 'income':
        return <IncomeScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Viewport */}
      <div className="main-content-wrapper">
        <Header />
        <main>{renderActiveScreen()}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Floating Action Button (FAB) */}
      <QuickAddFab />

      {/* Global Modals & Notifications */}
      <TransactionModal />
      <ConfirmDialog />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
