import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared/Toast';
import { PublicLayout } from './components/layout/PublicLayout';
import { ResidentLayout } from './components/layout/ResidentLayout';
import { CaretakerLayout } from './components/layout/CaretakerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './lib/auth/ProtectedRoute';

import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';

import ResidentDashboardPage from './pages/resident/ResidentDashboardPage';
import ResidentProfilePage from './pages/resident/ResidentProfilePage';
import ResidentFeedbackPage from './pages/resident/ResidentFeedbackPage';

import CaretakerDashboardPage from './pages/caretaker/CaretakerDashboardPage';
import CaretakerScheduleAheadPage from './pages/caretaker/CaretakerScheduleAheadPage';

import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminHouseholdsPage from './pages/admin/AdminHouseholdsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';
import AdminRemindersPage from './pages/admin/AdminRemindersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminFeedbackPage from './pages/admin/AdminFeedbackPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login/:role" element={<LoginPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="resident">
              <ResidentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/resident" element={<ResidentDashboardPage />} />
          <Route path="/resident/feedback" element={<ResidentFeedbackPage />} />
          <Route path="/resident/profile" element={<ResidentProfilePage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="caretaker">
              <CaretakerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/caretaker" element={<CaretakerDashboardPage />} />
          <Route path="/caretaker/schedule-ahead" element={<CaretakerScheduleAheadPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          <Route path="/admin/households" element={<AdminHouseholdsPage />} />
          <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
          <Route path="/admin/reminders" element={<AdminRemindersPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}
