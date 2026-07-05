import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Check, 
  AlertCircle,
  Building,
  Calendar,
  CreditCard,
  Notebook
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/mockData';

export const ReceiptProcessing: React.FC = () => {
  const navigate = useNavigate();
  const { currentScan, addExpense, cancelScanning } = useStore();

  const [storeName, setStoreName] = useState('Scanned Merchant');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('Processed via AI OCR scan.');
  const [items, setItems] = useState<{ name: string; price: number; category: string }[]>([]);

  // Safety redirect if page loaded with no scanner state
  useEffect(() => {
    if (!currentScan) {
      navigate('/add-expense');
      return;
    }

    if (currentScan.ocrItems) {
      setItems(currentScan.ocrItems);
    }
    // Pull simple name from scanning file name
    const guessedName = currentScan.name
      .replace(/\.[^/.]+$/, "") // remove extension
      .replace(/[_-]/g, " ");   // replace dashes with spaces
    setStoreName(guessedName || 'Retail Store');
  }, [currentScan, navigate]);

  if (!currentScan) return null;

  // Calculate sum of OCR items
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  // Table row editing actions
  const handleItemFieldChange = (idx: number, field: string, value: any) => {
    const updated = items.map((item, i) => {
      if (i === idx) {
        return { 
          ...item, 
          [field]: field === 'price' ? Number(value) || 0 : value 
        };
      }
      return item;
    });
    setItems(updated);
  };

  const handleAddNewItem = () => {
    setItems([...items, { name: 'New Item', price: 0, category: 'Grocery' }]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (items.length === 0) {
      alert('Please specify at least one expense line-item.');
      return;
    }

    // Map fields
    const formattedItems = items.map((item, idx) => ({
      id: `item-ocr-${Date.now()}-${idx}`,
      name: item.name,
      qty: 1,
      price: item.price,
      category: item.category
    }));

    // Detect primary category (highest amount)
    const categoryTotals: Record<string, number> = {};
    items.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.price;
    });
    let primaryCategory = 'Others';
    let highestCatAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > highestCatAmount) {
        highestCatAmount = val;
        primaryCategory = cat;
      }
    });

    await addExpense({
      title: `${storeName} Bill`,
      category: primaryCategory,
      amount: totalAmount,
      date,
      paymentMethod,
      storeName,
      notes,
      items: formattedItems,
      receiptImage: currentScan.image,
      aiSummary: `AI Scan completed. Extracted ${items.length} items. Confirmed by user.`
    });

    // Clear scanning state
    cancelScanning();
    navigate('/expenses');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-outfit text-2xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Receipt OCR Review
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Verify and correct extracted information before final entry saving.
          </p>
        </div>
        <button
          onClick={() => {
            cancelScanning();
            navigate('/add-expense');
          }}
          className="self-start rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
        >
          Cancel & Exit
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Receipt Preview Panel */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 shadow-sm lg:col-span-5 flex flex-col space-y-4">
          <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200">
            Original Receipt Image
          </h3>
          <div className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-4 min-h-[300px] max-h-[500px]">
            {currentScan.image ? (
              <img 
                src={currentScan.image} 
                alt="Uploaded Receipt" 
                className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="text-center text-xs text-slate-400">No Image available</div>
            )}
          </div>
          <div className="rounded-xl bg-brand-500/5 border border-brand-500/15 p-3 flex gap-2 text-[11px] text-brand-600 dark:text-brand-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>OCR reads text blocks. Double-check price lines in case of light print leaks.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Correction Form & Items Table */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-850">
              Extracted Transaction Details
            </h3>

            {/* Core Metadata */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-brand-500" />
                  <span>Store Name</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-brand-500" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-brand-500" />
                  <span>Payment Method</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                  <Notebook className="h-3.5 w-3.5 text-brand-500" />
                  <span>Remarks</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* OCR Items Correction Table */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
              <h4 className="font-outfit text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Line Items correction
              </h4>
              <button
                onClick={handleAddNewItem}
                className="flex items-center gap-1 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold text-[10px] px-3.5 py-1.5 hover:bg-brand-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Extracted Item</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2 px-1">Item Name</th>
                    <th className="py-2 px-1 w-28">Price (Rs.)</th>
                    <th className="py-2 px-1 w-36">Category</th>
                    <th className="py-2 px-1 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2 px-1">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemFieldChange(index, 'name', e.target.value)}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => handleItemFieldChange(index, 'price', e.target.value)}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                        />
                      </td>
                      <td className="py-2 px-1">
                        <select
                          value={item.category}
                          onChange={(e) => handleItemFieldChange(index, 'category', e.target.value)}
                          className="w-full rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal view */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 p-4 pt-4 mt-4">
              <span className="text-xs font-bold text-slate-500">Calculated Grand Total</span>
              <span className="font-outfit text-base font-extrabold text-slate-800 dark:text-slate-100">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              onClick={() => {
                cancelScanning();
                navigate('/add-expense');
              }}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800"
            >
              Discard Scan
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-brand-500/10 transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <Check className="h-4 w-4" />
              <span>Confirm & Save Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
