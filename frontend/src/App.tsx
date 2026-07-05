import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout wrappers
import { Layout } from './components/layout/Layout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';

// App Pages
import { Dashboard } from './pages/Dashboard';
import { AddExpense } from './pages/AddExpense';
import { ReceiptProcessing } from './pages/ReceiptProcessing';
import { ExpenseHistory } from './pages/ExpenseHistory';
import { ExpenseDetails } from './pages/ExpenseDetails';
import { ChatAssistant } from './pages/ChatAssistant';
import { BudgetManagement } from './pages/BudgetManagement';
import { Notifications } from './pages/Notifications';
import { Profile } from './pages/Profile';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Protected Dashboard/App routes wrapped in Layout shell */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-expense" element={<AddExpense />} />
          <Route path="/receipt-processing" element={<ReceiptProcessing />} />
          <Route path="/expenses" element={<ExpenseHistory />} />
          <Route path="/expenses/:id" element={<ExpenseDetails />} />
          <Route path="/chat" element={<ChatAssistant />} />
          <Route path="/budgets" element={<BudgetManagement />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback redirection */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
