import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailsPage } from './pages/BlogDetailsPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailsPage } from './pages/NewsDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { CategoriesPage as PublicCategoriesPage } from './pages/CategoriesPage';
import { ContactPage } from './pages/ContactPage';

// Admin Imports
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AdminLayout } from './components/admin/src/components/layout/AdminLayout';
import { LoginPage } from './components/admin/src/pages/auth/LoginPage';
import { ForgotPasswordPage } from './components/admin/src/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './components/admin/src/pages/auth/ResetPasswordPage';
import { DashboardPage } from './components/admin/src/pages/dashboard/DashboardPage';
import { BlogListPage } from './components/admin/src/pages/blogs/BlogListPage';
import { BlogEditorPage } from './components/admin/src/pages/blogs/BlogEditorPage';
import { NewsImportPage } from './components/admin/src/pages/news-import/NewsImportPage';
import { CategoriesPage } from './components/admin/src/pages/categories/CategoriesPage';
import { TagsPage } from './components/admin/src/pages/tags/TagsPage';
import { MediaLibraryPage } from './components/admin/src/pages/media/MediaLibraryPage';
import { CommentsPage } from './components/admin/src/pages/comments/CommentsPage';
import { NewsletterPage } from './components/admin/src/pages/newsletter/NewsletterPage';
import { AnalyticsPage } from './components/admin/src/pages/analytics/AnalyticsPage';
import { ProfilePage } from './components/admin/src/pages/profile/ProfilePage';
import { SettingsPage } from './components/admin/src/pages/settings/SettingsPage';
import { ActivityLogsPage } from './components/admin/src/pages/activity/ActivityLogsPage';
import { UsersPage } from './components/admin/src/pages/users/UsersPage';

import { BecomeAgentPage } from './pages/BecomeAgentPage';
import { AgentLoginPage } from './pages/agent/AgentLoginPage';
import { AgentLayout } from './components/agent/AgentLayout';
import { AgentDashboardPage } from './components/agent/pages/AgentDashboardPage';
import { AgentCreateNewsPage } from './components/agent/pages/AgentCreateNewsPage';
import { AgentMyNewsPage } from './components/agent/pages/AgentMyNewsPage';
import { AgentProfilePage } from './components/agent/pages/AgentProfilePage';
import { AgentReferralsPage } from './components/agent/pages/AgentReferralsPage';
import { AgentAnalyticsPage } from './components/agent/pages/AgentAnalyticsPage';
import { AgentNotificationsPage } from './components/agent/pages/AgentNotificationsPage';
import { AgentManagementPage } from './components/admin/src/pages/agents/AgentManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BlogPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:slug" element={<NewsDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/categories" element={<PublicCategoriesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog/:slug" element={<BlogDetailsPage />} />
        <Route path="/become-agent" element={<BecomeAgentPage />} />
        <Route path="/become-an-agent" element={<BecomeAgentPage />} />

        {/* Dedicated Agent Portal Scope */}
        <Route path="/agent/login" element={<AgentLoginPage />} />
        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<AgentDashboardPage />} />
          <Route path="dashboard" element={<AgentDashboardPage />} />
          <Route path="profile" element={<AgentProfilePage />} />
          <Route path="news/create" element={<AgentCreateNewsPage />} />
          <Route path="news" element={<AgentMyNewsPage />} />
          <Route path="referrals" element={<AgentReferralsPage />} />
          <Route path="analytics" element={<AgentAnalyticsPage />} />
          <Route path="notifications" element={<AgentNotificationsPage />} />
        </Route>
        
        {/* Admin Router Scope */}
        <Route
          path="/admin/*"
          element={
            <QueryClientProvider client={queryClient}>
              <Routes>
                {/* Admin Auth Routes */}
                <Route path="login" element={<LoginPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />

                {/* Dashboard layout and nested pages */}
                <Route path="" element={<AdminLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="blogs" element={<BlogListPage />} />
                  <Route path="blogs/new" element={<BlogEditorPage />} />
                  <Route path="blogs/edit/:id" element={<BlogEditorPage />} />
                  <Route path="news-import" element={<NewsImportPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="tags" element={<TagsPage />} />
                  <Route path="media" element={<MediaLibraryPage />} />
                  <Route path="comments" element={<CommentsPage />} />
                  <Route path="agents" element={<AgentManagementPage />} />
                  <Route path="newsletter" element={<NewsletterPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="activity-logs" element={<ActivityLogsPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
              </Routes>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                  },
                }}
              />
            </QueryClientProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
