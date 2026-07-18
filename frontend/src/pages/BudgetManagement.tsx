import React, { useState, useEffect } from 'react';
import {
  Wallet,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const BudgetManagement: React.FC = () => {
  const {
    budget,
    setMonthlyBudget,
    expenses,
    isLimitLoading,
    monthlySpending: storeMonthlySpending,
    user
  } = useStore();

  const [monthlyLimitInput, setMonthlyLimitInput] = useState(budget.monthlyLimit);

  // Sync input whenever the backend limit loads/updates
  useEffect(() => {
    setMonthlyLimitInput(budget.monthlyLimit);
  }, [budget.monthlyLimit]);

  // Current month filter
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));

  // Category totals from real backend expenses only
  const categoryMonthlyTotals: Record<string, number> = {};
  monthlyExpenses.forEach(e => {
    categoryMonthlyTotals[e.category] = (categoryMonthlyTotals[e.category] || 0) + e.amount;
  });

  // Categories that actually have spend this month — sorted highest first
  const activeCategories = Object.entries(categoryMonthlyTotals)
    .filter(([, spend]) => spend > 0)
    .sort((a, b) => b[1] - a[1]);

  // Real monthly spend — prefer server value, fallback to local sum
  const totalMonthlySpend = storeMonthlySpending || monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudgetProgress = budget.monthlyLimit > 0
    ? Math.min(100, (totalMonthlySpend / budget.monthlyLimit) * 100)
    : 0;

  const handleSaveMonthlyLimit = (e: React.FormEvent) => {
    e.preventDefault();
    setMonthlyBudget(Number(monthlyLimitInput) || 0);
  };

  const displayName = user?.name || 'there';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Budget Control Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Set your monthly spending limit and track where your money goes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-6 text-center">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-250 text-left flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5 text-brand-500" />
              <span>Overall Monthly Budget</span>
            </h3>

            {/* Circular progress */}
            <div className="flex justify-center py-4">
              <div className="relative h-40 w-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80" cy="80" r="68"
                    className="stroke-slate-100 dark:stroke-slate-800/80 fill-transparent"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80" cy="80" r="68"
                    className={`fill-transparent transition-all duration-500 stroke-linecap-round
                      ${totalBudgetProgress > 90 ? 'stroke-rose-500' : totalBudgetProgress > 75 ? 'stroke-amber-500' : 'stroke-brand-500'}
                    `}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - totalBudgetProgress / 100)}
                  />
                </svg>
                <div className="absolute text-center space-y-0.5">
                  {budget.monthlyLimit > 0 ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spent</span>
                      <p className="font-outfit text-base font-extrabold text-slate-800 dark:text-slate-100">
                        {totalBudgetProgress.toFixed(0)}%
                      </p>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                        Rs. {totalMonthlySpend.toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Limit</span>
                      <p className="font-outfit text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                        Set a limit<br />to track
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Spent / Remaining mini cards */}
            {budget.monthlyLimit > 0 && (
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Spent</p>
                  <p className="font-outfit text-sm font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                    Rs. {totalMonthlySpend.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining</p>
                  <p className={`font-outfit text-sm font-extrabold mt-0.5 ${
                    budget.monthlyLimit - totalMonthlySpend < 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}>
                    Rs. {Math.max(0, budget.monthlyLimit - totalMonthlySpend).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Set limit form */}
            <form onSubmit={handleSaveMonthlyLimit} className="space-y-3 pt-2 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  Monthly Budget Limit (Rs.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={monthlyLimitInput}
                    onChange={(e) => setMonthlyLimitInput(Number(e.target.value))}
                    placeholder="e.g. 50000"
                    className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isLimitLoading}
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs px-3.5 py-2 transition-all duration-150"
                  >
                    {isLimitLoading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Smart Budgets Tip */}
          <div className="rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/5 rounded-bl-full" />
            <Sparkles className="h-6 w-6 text-brand-100 animate-pulse" />
            <h4 className="font-outfit font-bold text-sm mt-3">Smart Budgets Tip</h4>
            <p className="text-[11px] leading-relaxed text-brand-50 mt-1">
              Hey {displayName}! Tracking where your money goes is the first step to saving more. Use the AI assistant to get personalised spending recommendations.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CATEGORY SPENDING */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
              Category Spending
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
              {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-5">
            {activeCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="h-12 w-12 rounded-2xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-brand-400" />
                </div>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No spending recorded yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
                  Add your first expense this month to see your category breakdown here.
                </p>
              </div>
            ) : (
              activeCategories.map(([cat, spend]) => {
                // Progress bar: this category's spend as % of total monthly spend
                const pctOfTotal = totalMonthlySpend > 0 ? (spend / totalMonthlySpend) * 100 : 0;
                // Progress bar: spend as % of monthly limit (if set)
                const pctOfLimit = budget.monthlyLimit > 0 ? (spend / budget.monthlyLimit) * 100 : 0;
                const isHigh = pctOfLimit > 30;
                const isMedium = pctOfLimit > 15;

                return (
                  <div key={cat} className="space-y-2 pb-3 border-b border-slate-50 dark:border-slate-900/50 last:border-b-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block h-2 w-2 rounded-full ${
                          isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-brand-500'
                        }`} />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{cat}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Rs. {spend.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          {pctOfTotal.toFixed(0)}% of total
                        </span>
                      </div>
                    </div>

                    {/* Progress bar: proportion of total monthly spend */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${Math.min(100, pctOfTotal)}%` }}
                      />
                    </div>

                    {/* Warning if this category is eating too much of the budget */}
                    {budget.monthlyLimit > 0 && isHigh && (
                      <p className="text-[9px] font-bold text-rose-500 flex items-center gap-0.5 uppercase tracking-wide">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {pctOfLimit.toFixed(0)}% of your monthly budget
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
