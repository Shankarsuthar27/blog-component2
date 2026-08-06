import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BlogPage } from './pages/BlogPage';
import { BlogDetailsPage } from './pages/BlogDetailsPage';

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
        <Route path="/blog/:slug" element={<BlogDetailsPage />} />
        
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
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="tags" element={<TagsPage />} />
                  <Route path="media" element={<MediaLibraryPage />} />
                  <Route path="comments" element={<CommentsPage />} />
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
