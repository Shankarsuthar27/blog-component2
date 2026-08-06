import React from 'react';
import { Routes, Route, HashRouter } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Lazy load Dashboard pages
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { BlogListPage } from './pages/blogs/BlogListPage';
import { BlogEditorPage } from './pages/blogs/BlogEditorPage';
import { CategoriesPage } from './pages/categories/CategoriesPage';
import { TagsPage } from './pages/tags/TagsPage';
import { MediaLibraryPage } from './pages/media/MediaLibraryPage';
import { CommentsPage } from './pages/comments/CommentsPage';
import { NewsletterPage } from './pages/newsletter/NewsletterPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ActivityLogsPage } from './pages/activity/ActivityLogsPage';
import { UsersPage } from './pages/users/UsersPage';

export const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Dashboard Layout Protected routes */}
        <Route path="/" element={<AdminLayout />}>
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
    </HashRouter>
  );
};
export default App;
