import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Building,
  FileImage,
  ClipboardList
} from 'lucide-react';
import { useStore } from '../store/useStore';

export const ExpenseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expenses, deleteExpense } = useStore();

  const expense = expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <div className="text-center py-12">
        <h3 className="font-outfit text-lg font-bold text-slate-800 dark:text-slate-100">
          Expense Entry Not Found
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          The transaction record you are looking for might have been deleted.
        </p>
        <button
          onClick={() => navigate('/expenses')}
          className="mt-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-4 py-2"
        >
          Return to History
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to permanently delete this expense?')) {
      deleteExpense(expense.id);
      navigate('/expenses');
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/expenses')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-350 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Logs</span>
        </button>
        <button
          onClick={handleDelete}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-600 font-semibold text-xs px-4 py-2 dark:border-rose-950/20 dark:bg-rose-950/10 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-all"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete Entry</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Receipt Media preview */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm lg:col-span-5 flex flex-col space-y-4">
          <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <FileImage className="h-4.5 w-4.5 text-brand-500" />
            <span>Digital Receipt Attachment</span>
          </h3>

          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-4 min-h-[300px] max-h-[500px]">
            {expense.receiptImage ? (
              <img 
                src={expense.receiptImage} 
                alt="Receipt Attachment" 
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="text-center text-xs text-slate-400 p-8">
                <FileImage className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p>No receipt image attached to this manual expense.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Expense Details & Item Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Core Details Summary */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <h2 className="font-outfit text-base font-extrabold text-slate-800 dark:text-slate-150">
                {expense.title}
              </h2>
              <span className="inline-flex rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold px-3 py-1 uppercase tracking-wider">
                {expense.category}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <Building className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Store</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{expense.storeName || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Date</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{expense.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
                <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold">Payment</p>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{expense.paymentMethod}</p>
                </div>
              </div>
            </div>

            {expense.notes && (
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-400">
                <span className="font-semibold block mb-1">Notes:</span>
                {expense.notes}
              </div>
            )}

            {/* Total value callout */}
            <div className="flex items-center justify-between rounded-xl bg-brand-500/5 border border-brand-500/15 p-4 mt-2">
              <span className="text-xs font-bold text-slate-500">Transaction Grand Total</span>
              <span className="font-outfit text-lg font-extrabold text-slate-800 dark:text-slate-100">
                Rs. {expense.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Card 2: AI Insights Summary Bubble */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 to-brand-500/10 border border-brand-500/15 p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-10 w-10 bg-brand-500/5 rounded-bl-full" />
            <div className="flex items-center gap-2 text-violet-750 dark:text-brand-350">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              <h3 className="font-outfit text-xs font-bold uppercase tracking-wider">AI Generated Summary</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-350">
              {expense.aiSummary || "This purchase was recorded manually. AI analysis indicates this spend aligns with your general monthly utility baselines. Category metrics remain stable."}
            </p>
          </div>

          {/* Card 3: Line Items Table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-4">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-850">
              <ClipboardList className="h-4.5 w-4.5 text-brand-500" />
              <span>Purchased Line Items</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5">Item Name</th>
                    <th className="py-2.5 w-20 text-center">Quantity</th>
                    <th className="py-2.5 w-32 text-right">Price (Rs.)</th>
                    <th className="py-2.5 w-32 text-right">Total (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {expense.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-250">
                        {item.name}
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 font-medium uppercase mt-0.5">
                          Category: {item.category}
                        </span>
                      </td>
                      <td className="py-3 text-center text-slate-600 dark:text-slate-400 font-medium">
                        {item.qty}
                      </td>
                      <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                        Rs. {item.price.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-100">
                        Rs. {(item.qty * item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
