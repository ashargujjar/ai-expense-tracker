import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  Trash2,
  Calendar,
  XCircle,
  CreditCard,
  Building
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../utils/mockData';

export const ExpenseHistory: React.FC = () => {
  const { expenses, deleteExpense } = useStore();
  const navigate = useNavigate();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Layout theme view (Table vs Cards)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter Logic
  const filteredExpenses = expenses.filter(e => {
    // Search query matches
    const matchesSearch = 
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.storeName.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));

    // Category matches
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;

    // Date range matches
    const matchesStartDate = !startDate || new Date(e.date) >= new Date(startDate);
    const matchesEndDate = !endDate || new Date(e.date) <= new Date(endDate);

    return matchesSearch && matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage) || 1;
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Expense Log History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Search, filter, and track all your recorded billing transactions.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`
              p-2 rounded-xl border transition-all duration-205
              ${viewMode === 'table' 
                ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-900/30 dark:border-slate-800 dark:text-brand-400' 
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}
            `}
            aria-label="Table View"
          >
            <List className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`
              p-2 rounded-xl border transition-all duration-205
              ${viewMode === 'grid' 
                ? 'bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-900/30 dark:border-slate-800 dark:text-brand-400' 
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'}
            `}
            aria-label="Grid View"
          >
            <Grid className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Search query */}
          <div className="relative lg:col-span-2">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Search by title, store or note..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-4 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category drop */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 text-xs text-slate-700 dark:text-slate-250 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              placeholder="Start Date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Calendar className="h-4 w-4" />
            </div>
            <input
              type="date"
              placeholder="End Date"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-9 pr-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Clear filter indicator */}
        {(search || selectedCategory !== 'All' || startDate || endDate) && (
          <div className="flex justify-end">
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
            >
              <XCircle className="h-4 w-4" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* DATA VIEW CONTAINER */}
      {filteredExpenses.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400 dark:text-slate-500 flex items-center justify-center mb-4">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="font-outfit text-base font-bold text-slate-700 dark:text-slate-350">
            No Transactions Found
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
            We couldn't find any entries matching your filters. Try tweaking your search terms or date ranges.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2.5"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-4 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-3">Expense Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Store</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-right">Amount (Rs.)</th>
                  <th className="py-3 px-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {paginatedExpenses.map((expense) => (
                  <tr 
                    key={expense.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-150 cursor-pointer"
                    onClick={() => navigate(`/expenses/${expense.id}`)}
                  >
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-200 max-w-[180px] truncate">
                      {expense.title}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/5 border border-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold px-2 py-0.5 uppercase">
                        {expense.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                      {expense.storeName || 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 font-medium">
                      {expense.date}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 dark:text-slate-450">
                      {expense.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-800 dark:text-slate-100">
                      Rs. {expense.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/expenses/${expense.id}`)}
                          className="p-1 text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID / CARD VIEW */
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {paginatedExpenses.map((expense) => (
            <div
              key={expense.id}
              onClick={() => navigate(`/expenses/${expense.id}`)}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex rounded-full bg-brand-500/5 border border-brand-500/10 text-brand-600 dark:text-brand-400 text-[8px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    {expense.category}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {expense.date}
                  </span>
                </div>
                <h4 className="font-outfit font-bold text-slate-800 dark:text-slate-200 mt-3 line-clamp-1">
                  {expense.title}
                </h4>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>Store: <strong>{expense.storeName || 'N/A'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                    <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                    <span>Payment: <strong>{expense.paymentMethod}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-5">
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Rs. {expense.amount.toLocaleString()}
                </span>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/expenses/${expense.id}`)}
                    className="p-1.5 text-slate-400 hover:text-brand-500 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION NAVIGATION FOOTER */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Showing Page <strong>{currentPage}</strong> of {totalPages} ({filteredExpenses.length} entries)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-450 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
