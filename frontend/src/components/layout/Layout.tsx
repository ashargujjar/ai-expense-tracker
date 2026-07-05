import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useStore } from '../../store/useStore';

export const Layout: React.FC = () => {
  const { isAuthenticated, initTheme, fetchExpenses } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    initTheme();
    // Simple route protection logic
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchExpenses();
    }
  }, [isAuthenticated, navigate, initTheme, fetchExpenses]);

  if (!isAuthenticated) {
    return null; // Don't render page if not authenticated (will redirect)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-brand-950 font-sans transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-7xl"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
