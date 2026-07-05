import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  MessageSquare, 
  Wallet, 
  Bell, 
  User, 
  LogOut,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout, notifications } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Expense', path: '/add-expense', icon: PlusCircle },
    { name: 'Expenses', path: '/expenses', icon: History },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare, badge: 'AI' },
    { name: 'Budgets', path: '/budgets', icon: Wallet },
    { 
      name: 'Notifications', 
      path: '/notifications', 
      icon: Bell, 
      badgeCount: notifications.filter(n => !n.isRead).length 
    },
    { name: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out dark:bg-brand-950 dark:border-slate-800/85 lg:translate-x-0 lg:static lg:z-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-outfit font-bold tracking-tight text-slate-800 dark:text-slate-100">
                Fin<span className="text-brand-500">AI</span>
              </h1>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest block -mt-1">
                Tracker & Assistant
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-200'}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                
                {item.badge && (
                  <span className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-violet-600 to-brand-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow-sm">
                    <Sparkles className="h-2.5 w-2.5" />
                    {item.badge}
                  </span>
                )}

                {item.badgeCount !== undefined && item.badgeCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {item.badgeCount}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50">
          {user && (
            <div className="flex items-center gap-3 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/20 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-sm dark:bg-brand-900/50 dark:text-brand-300">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
