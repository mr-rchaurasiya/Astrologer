import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { MainLayout } from './layouts/MainLayout';
import { Loader2 } from 'lucide-react';

// Core public / high-frequency pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

// Lazy-loaded heavy & admin modules for bundle performance
const KundliPage = lazy(() => import('./pages/KundliPage').then((m) => ({ default: m.KundliPage })));
const ChatPage = lazy(() => import('./pages/ChatPage').then((m) => ({ default: m.ChatPage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SubscriptionPage = lazy(() => import('./pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const SavedConsultationsPage = lazy(() => import('./pages/SavedConsultationsPage').then((m) => ({ default: m.SavedConsultationsPage })));
const ReferralPage = lazy(() => import('./pages/ReferralPage').then((m) => ({ default: m.ReferralPage })));
const SharedKundliPage = lazy(() => import('./pages/SharedKundliPage').then((m) => ({ default: m.SharedKundliPage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminSubscriptionsPage = lazy(() => import('./pages/admin/AdminSubscriptionsPage').then((m) => ({ default: m.AdminSubscriptionsPage })));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })));
const AdminGrowthPage = lazy(() => import('./pages/admin/AdminGrowthPage').then((m) => ({ default: m.AdminGrowthPage })));
const AdminArticlesPage = lazy(() => import('./pages/admin/AdminArticlesPage').then((m) => ({ default: m.AdminArticlesPage })));

// Phase 15: Public SEO Landing & Content pages
const KundliOnlinePage = lazy(() => import('./pages/public/KundliOnlinePage').then((m) => ({ default: m.KundliOnlinePage })));
const VedicAstrologyPage = lazy(() => import('./pages/public/VedicAstrologyPage').then((m) => ({ default: m.VedicAstrologyPage })));
const AIAstrologerPage = lazy(() => import('./pages/public/AIAstrologerPage').then((m) => ({ default: m.AIAstrologerPage })));
const AstrologyReportsPage = lazy(() => import('./pages/public/AstrologyReportsPage').then((m) => ({ default: m.AstrologyReportsPage })));
const BlogIndexPage = lazy(() => import('./pages/public/BlogIndexPage').then((m) => ({ default: m.BlogIndexPage })));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));

const PageLoader: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', color: 'var(--gold-primary)' }}>
    <Loader2 className="animate-spin" size={36} />
  </div>
);

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              {/* Public routes */}
              <Route index element={<HomePage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="shared/kundli/:token" element={<SharedKundliPage />} />
              <Route path="kundli-online" element={<KundliOnlinePage />} />
              <Route path="vedic-astrology" element={<VedicAstrologyPage />} />
              <Route path="ai-astrologer" element={<AIAstrologerPage />} />
              <Route path="astrology-reports" element={<AstrologyReportsPage />} />
              <Route path="blog" element={<BlogIndexPage />} />
              <Route path="blog/:slug" element={<BlogPostPage />} />

              {/* Protected user routes */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="kundli"
                element={
                  <ProtectedRoute>
                    <KundliPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="analytics"
                element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="saved-consultations"
                element={
                  <ProtectedRoute>
                    <SavedConsultationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="referrals"
                element={
                  <ProtectedRoute>
                    <ReferralPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="subscription"
                element={
                  <ProtectedRoute>
                    <SubscriptionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected admin routes */}
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <AdminRoute>
                    <AdminUsersPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/subscriptions"
                element={
                  <AdminRoute>
                    <AdminSubscriptionsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/audit-logs"
                element={
                  <AdminRoute>
                    <AdminAuditLogsPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/growth"
                element={
                  <AdminRoute>
                    <AdminGrowthPage />
                  </AdminRoute>
                }
              />
              <Route
                path="admin/articles"
                element={
                  <AdminRoute>
                    <AdminArticlesPage />
                  </AdminRoute>
                }
              />

              {/* Fallback route */}
              <Route path="*" element={<HomePage />} />
            </Route>
          </Routes>
          </Suspense>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
