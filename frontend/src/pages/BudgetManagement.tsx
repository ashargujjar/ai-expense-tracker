import React, { useState } from 'react';
import { 
  Wallet, 
  Edit3, 
  AlertTriangle, 
  Sparkles, 
  Check
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../utils/mockData';

export const BudgetManagement: React.FC = () => {
  const { budget, setMonthlyBudget, setCategoryBudget, expenses } = useStore();

  const [monthlyLimitInput, setMonthlyLimitInput] = useState(budget.monthlyLimit);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryLimitInput, setCategoryLimitInput] = useState(0);

  // Calculations for current month's expenses
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));

  // Category totals for this month
  const categoryMonthlyTotals: Record<string, number> = {};
  CATEGORIES.forEach(c => { categoryMonthlyTotals[c] = 0; });
  monthlyExpenses.forEach(e => {
    categoryMonthlyTotals[e.category] = (categoryMonthlyTotals[e.category] || 0) + e.amount;
  });

  const totalMonthlySpend = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudgetProgress = (totalMonthlySpend / budget.monthlyLimit) * 100;

  const handleSaveMonthlyLimit = (e: React.FormEvent) => {
    e.preventDefault();
    setMonthlyBudget(Number(monthlyLimitInput) || 0);
  };

  const handleEditCategoryLimit = (cat: string) => {
    setEditingCategory(cat);
    setCategoryLimitInput(budget.categoryLimits[cat] || 0);
  };

  const handleSaveCategoryLimit = (cat: string) => {
    setCategoryBudget(cat, Number(categoryLimitInput) || 0);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
          Budget Control Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Configure monthly limit limits and category-specific targets to force smart savings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: OVERALL MONTHLY LIMIT */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-6 text-center">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-250 text-left flex items-center gap-2">
              <Wallet className="h-4.5 w-4.5 text-brand-500" />
              <span>Overall Monthly Budget</span>
            </h3>

            {/* Circular progress visual */}
            <div className="flex justify-center py-4">
              <div className="relative h-40 w-40 flex items-center justify-center">
                {/* SVG circular track */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-slate-100 dark:stroke-slate-800/80 fill-transparent"
                    strokeWidth="10"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className={`fill-transparent transition-all duration-500 stroke-linecap-round
                      ${totalBudgetProgress > 90 ? 'stroke-rose-500' : totalBudgetProgress > 75 ? 'stroke-amber-500' : 'stroke-brand-500'}
                    `}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 68}
                    strokeDashoffset={2 * Math.PI * 68 * (1 - Math.min(100, totalBudgetProgress) / 100)}
                  />
                </svg>
                <div className="absolute text-center space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Spent</span>
                  <p className="font-outfit text-base font-extrabold text-slate-805 dark:text-slate-100">
                    {totalBudgetProgress.toFixed(0)}%
                  </p>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                    Rs. {totalMonthlySpend.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Set limit form */}
            <form onSubmit={handleSaveMonthlyLimit} className="space-y-3 pt-2 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-505 uppercase">
                  Monthly Budget Limit (Rs.)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={monthlyLimitInput}
                    onChange={(e) => setMonthlyLimitInput(Number(e.target.value))}
                    className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-805 text-xs text-slate-700 dark:text-slate-200 px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-3.5 py-2"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Savings Callout */}
          <div className="rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-white/5 rounded-bl-full" />
            <Sparkles className="h-6 w-6 text-brand-100 animate-pulse" />
            <h4 className="font-outfit font-bold text-sm mt-3">Smart Budgets Tip</h4>
            <p className="text-[11px] leading-relaxed text-brand-50 mt-1">
              Aashar, keeping category caps under 20% of your total income helps you reach your savings targets 2.5x faster! Use the assistant chat to get personalized calculations.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: CATEGORY BUDGETS LIST */}
        <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
              Category Limits & Tracking
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">
              Current Month: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-5">
            {CATEGORIES.map(cat => {
              const limit = budget.categoryLimits[cat] || 0;
              const spend = categoryMonthlyTotals[cat] || 0;
              const pct = limit > 0 ? (spend / limit) * 100 : 0;
              const isEditing = editingCategory === cat;

              return (
                <div key={cat} className="space-y-2 pb-2.5 border-b border-slate-50 dark:border-slate-900/50 last:border-b-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full bg-brand-500" />
                      <span className="text-xs font-bold text-slate-705 dark:text-slate-200">{cat}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          <input
                            type="number"
                            value={categoryLimitInput}
                            onChange={(e) => setCategoryLimitInput(Number(e.target.value))}
                            className="w-20 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-805 text-[10px] px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                          />
                          <button
                            onClick={() => handleSaveCategoryLimit(cat)}
                            className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-405 font-medium">
                            Rs. {spend.toLocaleString()} / <strong className="text-slate-700 dark:text-slate-300">{limit > 0 ? `Rs. ${limit.toLocaleString()}` : 'No Limit'}</strong>
                          </span>
                          <button
                            onClick={() => handleEditCategoryLimit(cat)}
                            className="text-slate-400 hover:text-slate-600 p-1 dark:hover:text-slate-300"
                            title="Edit Target Limit"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {limit > 0 ? (
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-1.5 rounded-full transition-all duration-300
                            ${pct > 90 ? 'bg-rose-500' : pct > 75 ? 'bg-amber-500' : 'bg-brand-500'}
                          `}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
                        <span>{pct.toFixed(0)}% utilized</span>
                        {pct > 90 ? (
                          <span className="text-rose-500 flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" /> Over Limit!
                          </span>
                        ) : pct > 75 ? (
                          <span className="text-amber-500">Warning threshold reached</span>
                        ) : (
                          <span className="text-emerald-500">Within Budget</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">No limit set. Spend values are tracked.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
