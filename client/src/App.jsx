import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/shared/Toast';
import { PublicLayout } from './components/layout/PublicLayout';
import { ResidentLayout } from './components/layout/ResidentLayout';
import { CaretakerLayout } from './components/layout/CaretakerLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './lib/auth/ProtectedRoute';
import { LoadingSpinner } from './components/shared/LoadingSpinner';

// Route-level code splitting: a mobile visitor who only wants prayer times
// should not have to download the admin/PDF/reports bundle on first load.
const HomePage = lazy(() => import('./pages/public/HomePage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));

const ResidentDashboardPage = lazy(() => import('./pages/resident/ResidentDashboardPage'));
const ResidentProfilePage = lazy(() => import('./pages/resident/ResidentProfilePage'));
const ResidentFeedbackPage = lazy(() => import('./pages/resident/ResidentFeedbackPage'));

const CaretakerDashboardPage = lazy(() => import('./pages/caretaker/CaretakerDashboardPage'));
const CaretakerScheduleAheadPage = lazy(() => import('./pages/caretaker/CaretakerScheduleAheadPage'));

const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminHouseholdsPage = lazy(() => import('./pages/admin/AdminHouseholdsPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/admin/AdminAnnouncementsPage'));
const AdminRemindersPage = lazy(() => import('./pages/admin/AdminRemindersPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminFeedbackPage = lazy(() => import('./pages/admin/AdminFeedbackPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <LoadingSpinner label="Loading…" />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Suspense fallback={<PageFallback />}>
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
      </Suspense>
    </ToastProvider>
  );
}
