import React from 'react';
import { 
  Trash2, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  CheckCheck,
  Inbox
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const Notifications: React.FC = () => {
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    clearNotifications 
  } = useStore();

  const getRelativeTime = (isoString: string) => {
    try {
      const past = new Date(isoString);
      const diffMs = Date.now() - past.getTime();
      const diffMins = Math.floor(diffMs / 1000 / 60);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return past.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Inbox Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep track of scanning status reports, budget alerts, and new savings analysis.
          </p>
        </div>
        {notifications.length > 0 && (
          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark all as Read</span>
            </button>
            <span className="text-slate-300 dark:text-slate-800">|</span>
            <button
              onClick={clearNotifications}
              className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Main notifications List */}
      {notifications.length === 0 ? (
        /* Empty Inbox View */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/15 flex items-center justify-center mb-4">
            <Inbox className="h-7 w-7" />
          </div>
          <h3 className="font-outfit text-base font-bold text-slate-700 dark:text-slate-350">
            Your Inbox is Empty
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
            Excellent! You have read all notifications. New updates will land here as they occur.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
              className={`
                rounded-2xl border p-4 flex gap-4 text-left transition-all duration-200 cursor-pointer relative overflow-hidden
                ${notif.isRead 
                  ? 'bg-white border-slate-200/80 dark:bg-slate-900 dark:border-slate-850' 
                  : 'bg-brand-50/20 border-brand-100 dark:bg-brand-900/10 dark:border-brand-900/50 shadow-sm'}
              `}
            >
              {/* Unread strip indicator */}
              {!notif.isRead && (
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand-500" />
              )}

              {/* Icon classification */}
              <div className="shrink-0">
                {notif.type === 'success' && (
                  <div className="h-8.5 w-8.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle className="h-4.5 w-4.5" />
                  </div>
                )}
                {notif.type === 'warning' && (
                  <div className="h-8.5 w-8.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
                    <AlertTriangle className="h-4.5 w-4.5" />
                  </div>
                )}
                {notif.type === 'info' && (
                  <div className="h-8.5 w-8.5 rounded-xl bg-brand-50 dark:bg-brand-950/30 text-brand-500 flex items-center justify-center border border-brand-100 dark:border-brand-900/30">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-4">
                  <h4 className={`text-xs font-bold truncate ${notif.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-850 dark:text-slate-100'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {getRelativeTime(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {notif.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
