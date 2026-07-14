import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle,
  Clock, 
  TrendingDown,
  Sparkles,
  ShoppingBag,
  Info
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts';
import { useStore } from '../store/useStore';

export const Dashboard: React.FC = () => {
  const { expenses, budget, theme, totalSpending: storeTotalSpending, monthlySpending: storeMonthlySpending, highestSpending, categorywiseSpending, remainingBudget: storeRemainingBudget } = useStore();
  const navigate = useNavigate();

  const isDark = theme === 'dark';

  // Calculations
  const totalSpending = storeTotalSpending || expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Current month's spending
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonthStr));
  const monthlySpending = storeMonthlySpending || monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Budget left — prefer server-computed remaining budget; null means backend has no limit set yet
  const budgetRemainingLocal = budget.monthlyLimit - monthlySpending;
  const budgetRemaining = storeRemainingBudget !== null ? storeRemainingBudget : budgetRemainingLocal;
  const budgetProgress = budget.monthlyLimit > 0
    ? (monthlySpending / budget.monthlyLimit) * 100
    : 0;

  // All-time category totals (used by Pie chart)
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Current-month category totals (used by "Category Spending & Item Averages" section)
  const categoryMonthlyTotals: Record<string, number> = {};
  monthlyExpenses.forEach(e => {
    categoryMonthlyTotals[e.category] = (categoryMonthlyTotals[e.category] || 0) + e.amount;
  });

  let highestCategory = 'None';
  let highestCategoryAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > highestCategoryAmount) {
      highestCategoryAmount = val;
      highestCategory = cat;
    }
  });

  // Recharts Chart 1: Pie Category Data
  const pieData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);

  // Custom colors for dashboard charts
  const CHART_COLORS = [
    '#0ea5e9', // Brand 500
    '#a855f7', // Purple 500
    '#f43f5e', // Rose 500
    '#10b981', // Emerald 500
    '#f59e0b', // Amber 500
    '#ec4899', // Pink 500
    '#6366f1', // Indigo 500
    '#14b8a6', // Teal 500
    '#6b7280'  // Gray 500
  ];

  // Recharts Chart 2: Monthly Comparison (Dynamically calculated last 3 months)
  const monthlyBarData = React.useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short' });
      const yearStr = d.getFullYear();
      const monthStr = String(d.getMonth() + 1).padStart(2, '0');
      const monthKey = `${yearStr}-${monthStr}`;

      const monthExpenses = expenses.filter(e => e.date.startsWith(monthKey));
      const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

      // If it's the current month, we can prefer the monthlySpending from the store if it has been fetched
      const spentAmount = (i === 0 && storeMonthlySpending !== undefined) ? (storeMonthlySpending || monthSpent) : monthSpent;

      data.push({
        name: monthName,
        Spent: spentAmount,
        Budget: budget.monthlyLimit,
      });
    }
    return data;
  }, [expenses, storeMonthlySpending, budget.monthlyLimit]);

  // Build a dynamic category list from real backend data only
  // Union of: categories in this month's expenses + categories with historical averages
  const backendCategories = Array.from(new Set([
    ...Object.keys(categoryMonthlyTotals).filter(c => categoryMonthlyTotals[c] > 0),
    ...(categorywiseSpending || []).map((c: any) => c._id as string)
  ])).sort();

  // AI Insights — driven by real data only
  const getAIInsights = () => {
    const insights = [];

    // Insight 1: top spending category this month
    const topMonthCat = Object.entries(categoryMonthlyTotals).sort((a, b) => b[1] - a[1])[0];
    if (topMonthCat && topMonthCat[1] > 0) {
      insights.push({
        id: 'ins-1',
        text: `Your biggest spend this month is on **${topMonthCat[0]}** at Rs. ${topMonthCat[1].toLocaleString()}. Consider reviewing items in this category.`,
        type: 'info'
      });
    } else {
      insights.push({
        id: 'ins-1',
        text: 'No expenses recorded this month yet. Start adding transactions to get personalized insights.',
        type: 'info'
      });
    }

    // Insight 2: monthly budget status
    if (budget.monthlyLimit > 0) {
      if (budgetProgress > 90) {
        insights.push({
          id: 'ins-2',
          text: `Danger: You have used ${budgetProgress.toFixed(0)}% of your monthly budget. Hold off non-essential spending.`,
          type: 'danger'
        });
      } else if (budgetProgress > 75) {
        insights.push({
          id: 'ins-2',
          text: `Caution: You have used ${budgetProgress.toFixed(0)}% of your monthly budget with days remaining.`,
          type: 'warning'
        });
      } else if (budgetProgress > 0) {
        insights.push({
          id: 'ins-2',
          text: `On track: You have Rs. ${Math.max(0, budgetRemaining).toLocaleString()} remaining this month (${(100 - budgetProgress).toFixed(0)}% of your limit).`,
          type: 'success'
        });
      }
    } else {
      insights.push({
        id: 'ins-2',
        text: 'No monthly budget limit set. Go to Budget Control Center to set a limit and track your spending.',
        type: 'warning'
      });
    }

    // Insight 3: compare this month vs previous month
    const prevMonthStr = (() => {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    })();
    const prevMonthSpend = expenses
      .filter(e => e.date.startsWith(prevMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);

    if (prevMonthSpend > 0 && monthlySpending > 0) {
      const diff = monthlySpending - prevMonthSpend;
      const pct = Math.abs((diff / prevMonthSpend) * 100).toFixed(0);
      insights.push({
        id: 'ins-3',
        text: diff > 0
          ? `Spending is up ${pct}% vs last month (Rs. ${prevMonthSpend.toLocaleString()} → Rs. ${monthlySpending.toLocaleString()}). Try to reduce discretionary spend.`
          : `Great job! Spending is down ${pct}% vs last month (Rs. ${prevMonthSpend.toLocaleString()} → Rs. ${monthlySpending.toLocaleString()}).`,
        type: diff > 0 ? 'warning' : 'success'
      });
    }

    return insights;
  };

  const insights = getAIInsights();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100 md:text-3xl">
            Financial Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Welcome back! Here's your financial status overview at a glance.
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex gap-2">
          <button
            onClick={() => navigate('/add-expense')}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs px-4 py-2.5 shadow-md shadow-brand-500/10 transition-all duration-200 hover:-translate-y-0.5"
          >
            Add Transaction
          </button>
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all duration-200"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            <span>Consult AI</span>
          </button>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Spending */}
        <div className="rounded-2xl glass-panel p-5 shadow-glass dark:shadow-glass-dark relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 right-0 h-16 w-16 bg-brand-500/5 rounded-bl-full" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Recorded spend</p>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
            Rs. {totalSpending.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <Clock className="h-3.5 w-3.5" />
            <span>All time entries recorded {highestSpending > 0 && `(Peak: Rs. ${highestSpending.toLocaleString()})`}</span>
          </div>
        </div>

        {/* Card 2: Monthly Spending */}
        <div className="rounded-2xl glass-panel p-5 shadow-glass dark:shadow-glass-dark relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-bl-full" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Spending</p>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
            Rs. {monthlySpending.toLocaleString()}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <TrendingDown className="h-3.5 w-3.5" />
            <span>{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Card 3: Budget Remaining */}
        <div className="rounded-2xl glass-panel p-5 shadow-glass dark:shadow-glass-dark relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className={`absolute top-0 right-0 h-16 w-16 rounded-bl-full ${budgetRemaining < 0 ? 'bg-rose-500/5' : 'bg-emerald-500/5'}`} />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Budget Remaining</p>
          <h3 className={`font-outfit text-2xl font-extrabold mt-2 ${budgetRemaining < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
            Rs. {budgetRemaining.toLocaleString()}
          </h3>
          <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${budgetProgress > 90 ? 'bg-rose-500' : budgetProgress > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
              style={{ width: `${Math.min(100, Math.max(0, budgetProgress))}%` }}
            />
          </div>
        </div>

        {/* Card 4: Top Category */}
        <div className="rounded-2xl glass-panel p-5 shadow-glass dark:shadow-glass-dark relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
          <div className="absolute top-0 right-0 h-16 w-16 bg-rose-500/5 rounded-bl-full" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Highest Category</p>
          <h3 className="font-outfit text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2 truncate">
            {highestCategory}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
            <ShoppingBag className="h-3.5 w-3.5 text-rose-500" />
            <span>Rs. {highestCategoryAmount.toLocaleString()} total spend</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Category Chart */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm">
          <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Category Breakdown
          </h3>
          <div className="h-64 w-full">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense entries yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#0b0f19' : '#ffffff', 
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#0f172a'
                    }} 
                    formatter={(val) => [`Rs. ${val}`, 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Custom legend grid */}
          <div className="grid grid-cols-2 gap-2 mt-4 max-h-24 overflow-y-auto pt-2 border-t border-slate-100 dark:border-slate-800/50">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <span 
                  className="h-2 w-2 rounded-full shrink-0" 
                  style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }} 
                />
                <span className="truncate">{item.name}</span>
                <span className="font-bold text-slate-700 dark:text-slate-350 ml-auto">
                  {((item.value / totalSpending) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Bar Chart */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm">
          <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
            Monthly Spend vs Limit
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
                <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDark ? '#0b0f19' : '#ffffff', 
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="Spent" fill="#a855f7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Budget" fill={isDark ? '#1e293b' : '#e2e8f0'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights & Recent Expenses */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: AI Insights Panel */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm md:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Sparkles className="h-4.5 w-4.5 text-brand-500" />
            <h3 className="font-outfit text-sm font-bold">AI Financial Insights</h3>
          </div>

          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div 
                key={insight.id || idx}
                className={`
                  rounded-xl p-3.5 border flex gap-3 text-xs leading-relaxed text-left
                  ${insight.type === 'danger' ? 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400' : ''}
                  ${insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400' : ''}
                  ${insight.type === 'info' ? 'bg-brand-500/5 border-brand-500/20 text-brand-600 dark:text-brand-400' : ''}
                  ${insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : ''}
                `}
              >
                <div className="mt-0.5 shrink-0">
                  {insight.type === 'danger' && <AlertTriangle className="h-4 w-4" />}
                  {insight.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                  {insight.type === 'info' && <Info className="h-4 w-4" />}
                  {insight.type === 'success' && <CheckCircle className="h-4 w-4" />}
                </div>
                <p>{insight.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Category Average Insights */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
                Category Spending & Item Averages
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Current month spend compared with historical average cost per item.
              </p>
            </div>
            <Sparkles className="h-4 w-4 text-violet-500 shrink-0" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
            {backendCategories.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-10 text-center gap-2">
                <Sparkles className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  No expense data yet
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-600">
                  Add your first transaction to see category breakdowns here.
                </p>
              </div>
            ) : (
              backendCategories.map((cat) => {
                // This month's spend for this category (from backend expenses)
                const currentSpend = categoryMonthlyTotals[cat] || 0;

                // Historical average item price from GET /api/categorywise
                const avgItemObj = categorywiseSpending?.find((c: any) => c._id === cat);
                const avgItemPrice = avgItemObj ? Math.round(avgItemObj.averageAmount) : 0;

                // Progress bar: current month spend vs historical average scale
                const spendVsAvgPct = avgItemPrice > 0
                  ? Math.min(100, (currentSpend / (avgItemPrice * 10)) * 100)
                  : 0;

                return (
                  <div
                    key={cat}
                    className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-3 flex flex-col justify-between hover:scale-[1.01] transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{cat}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        currentSpend > 0 ? 'text-violet-500' : 'text-slate-400'
                      }`}>
                        This Month: Rs. {currentSpend.toLocaleString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Avg Item Cost:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {avgItemPrice > 0 ? `Rs. ${avgItemPrice.toLocaleString()}` : 'N/A'}
                      </span>
                    </div>

                    <div className="mt-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-1 rounded-full transition-all duration-500 ${
                          spendVsAvgPct > 80 ? 'bg-rose-500' :
                          spendVsAvgPct > 50 ? 'bg-amber-500' : 'bg-violet-500'
                        }`}
                        style={{ width: `${currentSpend > 0 ? Math.max(spendVsAvgPct, 4) : 0}%` }}
                      />
                    </div>
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
