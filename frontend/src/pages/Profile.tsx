import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Download, 
  Trash2, 
  Check, 
  KeyRound, 
  Palette,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    updateProfile, 
    changePassword, 
    logout, 
    theme, 
    toggleTheme, 
    expenses 
  } = useStore();

  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState('');

  // Profile forms hook
  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      currency: user?.currency || 'Rs.'
    }
  });

  // Password form hook
  const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm } = useForm();

  const onProfileSave = (data: any) => {
    updateProfile(data.name, data.currency);
    alert('Profile preferences updated successfully.');
  };

  const onPasswordChange = async (data: any) => {
    setPwError('');
    setPwSuccess(false);

    if (data.newPassword !== data.confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    const success = await changePassword(data.oldPassword, data.newPassword);
    if (success) {
      setPwSuccess(true);
      resetPasswordForm();
    }
  };

  // CLIENT-SIDE FILE EXPORTERS
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(expenses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finai_expenses_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    // Generate CSV Header
    let csvContent = 'ID,Title,Category,Amount,Date,Payment Method,Store Name,Notes\n';
    
    // Rows
    expenses.forEach(e => {
      const sanitizedTitle = e.title.replace(/"/g, '""');
      const sanitizedStore = e.storeName.replace(/"/g, '""');
      const sanitizedNotes = (e.notes || '').replace(/"/g, '""');
      
      csvContent += `"${e.id}","${sanitizedTitle}","${e.category}",${e.amount},"${e.date}","${e.paymentMethod}","${sanitizedStore}","${sanitizedNotes}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finai_expenses_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('WARNING: Are you sure you want to delete your FinAI account? All recorded transactions, custom categories, budgets, and chat history will be permanently wiped out. This cannot be undone.')) {
      localStorage.clear();
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Profile & Preferences
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your account credentials, visual preferences, and financial reports downloads.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* LEFT COLUMN: Profile Info & Appearance */}
        <div className="md:col-span-7 space-y-6">
          {/* Card 1: User Info */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <User className="h-4.5 w-4.5 text-brand-500" />
              <span>User Information</span>
            </h3>

            <form onSubmit={handleProfileSubmit(onProfileSave)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    {...regProfile('name')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 px-3.5 py-2.5 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Currency Symbol</label>
                  <select
                    className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-3.5 py-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    {...regProfile('currency')}
                  >
                    <option value="Rs.">Rs. (INR)</option>
                    <option value="$">$ (USD)</option>
                    <option value="€">€ (EUR)</option>
                    <option value="£">£ (GBP)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">Member Since</label>
                  <input
                    type="text"
                    disabled
                    value={user?.joinedDate || '2026-06-01'}
                    className="w-full rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-400 px-3.5 py-2.5 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Appearance & Theme settings */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Palette className="h-4.5 w-4.5 text-brand-500" />
              <span>Appearance & Theme</span>
            </h3>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 p-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">Interface Colorscheme</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Toggle between dark mode and standard daylight theme.</p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-slate-500" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Change password & Data Actions */}
        <div className="md:col-span-5 space-y-6">
          {/* Card 3: Change Password */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <KeyRound className="h-4.5 w-4.5 text-brand-500" />
              <span>Security Settings</span>
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordChange)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  {...regPassword('oldPassword', { required: true })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  {...regPassword('newPassword', { required: true, minLength: 6 })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  {...regPassword('confirmPassword', { required: true })}
                />
              </div>

              {pwError && (
                <p className="text-[10px] font-medium text-rose-500">{pwError}</p>
              )}
              
              {pwSuccess && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-[10px] text-emerald-500 font-semibold flex items-center gap-1.5 justify-center">
                  <Check className="h-3.5 w-3.5" />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5"
              >
                Change Credentials
              </button>
            </form>
          </div>

          {/* Card 4: Backup Export & Termination */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Download className="h-4.5 w-4.5 text-brand-500" />
              <span>Data Export & Management</span>
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] py-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-brand-500" />
                <span>Export as CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] py-2.5 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-brand-500" />
                <span>Export as JSON</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
              <button
                onClick={handleDeleteAccount}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/25 hover:bg-rose-500/15 text-rose-500 font-bold text-[10px] py-3 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 shrink-0" />
                <span>Terminate FinAI Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
