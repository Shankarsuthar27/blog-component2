import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useUIStore } from '../../store/uiStore';
import { AuthProvider } from '../../lib/auth/AuthProvider';
import { ProtectedRoute } from '../auth/ProtectedRoute';

export const AdminLayout: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen flex bg-white dark:bg-[#0F172A] text-[#475569] dark:text-slate-300 transition-colors duration-200 antialiased">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Workspace */}
          <div
            className={`flex-grow flex flex-col min-h-screen transition-all duration-300 ${
              sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
            }`}
          >
            {/* Topbar */}
            <TopNav />

            {/* Viewport Content */}
            <main className="flex-grow px-4 sm:px-6 lg:px-8 pt-24 pb-12 max-w-[1400px] w-full mx-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
};
export default AdminLayout;
