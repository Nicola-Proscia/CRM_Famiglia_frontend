import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute, PublicRoute } from '@/router/index';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { MembersPage } from '@/pages/members/MembersPage';
import { ExpensesPage } from '@/pages/expenses/ExpensesPage';
import { RenovationPage } from '@/pages/renovation/RenovationPage';
import { AgendaPage } from '@/pages/agenda/AgendaPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ShoppingPage } from '@/pages/shopping/ShoppingPage';
import { useInitAuth } from '@/hooks/useAuth';
import { PageLoader } from '@/components/shared/LoadingSpinner';

function AppWithAuth() {
  const { isInitialized } = useInitAuth();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/renovation" element={<RenovationPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWithAuth />
    </BrowserRouter>
  );
}
