import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Sun, 
  Moon, 
  Bell, 
  Plus, 
  Check, 
  Sparkles,
  BadgeAlert
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { theme, toggleTheme, notifications, markAsRead } = useStore();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/add-expense': return 'Add Expense';
      case '/expenses': return 'Expense History';
      case '/chat': return 'AI Chat Assistant';
      case '/budgets': return 'Budget Management';
      case '/notifications': return 'Notifications';
      case '/profile': return 'Profile Settings';
      case '/receipt-processing': return 'Receipt OCR Review';
      default:
        if (location.pathname.startsWith('/expenses/')) return 'Expense Details';
        return 'FinAI';
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setShowNotifMenu(false);
    navigate('/notifications');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:bg-brand-950/80 dark:border-slate-800/80 transition-colors duration-200">
      {/* Mobile Menu & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none lg:hidden dark:text-slate-400 dark:hover:bg-slate-900/60 dark:hover:text-slate-200"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <h2 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-100">
          {getPageTitle()}
        </h2>
      </div>

      {/* Action items */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Quick Add Button */}
        {location.pathname !== '/add-expense' && (
          <button
            onClick={() => navigate('/add-expense')}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs px-3.5 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 shadow-brand-500/10"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        )}

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200 transition-all duration-200 border border-slate-100 dark:border-slate-800/50"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className={`
              rounded-xl p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200 transition-all duration-200 border border-slate-100 dark:border-slate-800/50 relative
              ${showNotifMenu ? 'bg-slate-50 dark:bg-slate-900/50' : ''}
            `}
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-brand-950" />
            )}
          </button>

          {showNotifMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifMenu(false)} />
              <div className="absolute right-0 mt-2.5 w-80 z-50 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-xl dark:bg-brand-950 dark:border-slate-800/80">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Alerts & Notifications</span>
                  {unreadNotifications.length > 0 && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                      {unreadNotifications.length} New
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 4).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id)}
                        className={`
                          flex gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-900/50 mb-1
                          ${!notif.isRead ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''}
                        `}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'success' && <Check className="h-4 w-4 text-emerald-500" />}
                          {notif.type === 'warning' && <BadgeAlert className="h-4 w-4 text-amber-500" />}
                          {notif.type === 'info' && <Sparkles className="h-4 w-4 text-brand-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{notif.title}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5">{notif.body}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-100 p-1.5 dark:border-slate-800/50">
                  <button
                    onClick={() => {
                      setShowNotifMenu(false);
                      navigate('/notifications');
                    }}
                    className="flex w-full items-center justify-center rounded-xl py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20 transition-all duration-200"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Mini Avatar Link */}
        <button
          onClick={() => navigate('/profile')}
          className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-bold text-xs shadow-md shadow-brand-500/10 hover:scale-105 transition-all duration-200"
        >
          {useStore.getState().user?.name.split(' ').map(n => n[0]).join('') || 'AK'}
        </button>
      </div>
    </header>
  );
};
