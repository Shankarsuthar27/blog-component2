import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useUIStore } from '../../store/uiStore';
import { AuthProvider } from '../../lib/auth/AuthProvider';
import { ProtectedRoute } from '../auth/ProtectedRoute';

export const AdminLayout: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  return (
    <AuthProvider>
      <ProtectedRoute>
        <div className="min-h-screen flex bg-white dark:bg-[#0F172A] text-[#475569] dark:text-slate-300 transition-colors duration-200 antialiased overflow-x-hidden w-full">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Workspace */}
          <div
            className={`flex-grow flex flex-col min-h-screen transition-all duration-300 w-full overflow-x-hidden ${
              sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
            }`}
          >
            {/* Topbar */}
            <TopNav />

            {/* Viewport Content */}
            <main className="flex-grow px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 max-w-[1400px] w-full mx-auto overflow-x-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
};
export default AdminLayout;
