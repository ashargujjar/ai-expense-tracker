import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// No react-hook-form used
import { 
  Upload, 
  Plus, 
  Trash2, 
  AlertCircle, 
  ClipboardList,
  Loader2,
  Calendar
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { CATEGORIES } from '../utils/mockData';

export const AddExpense: React.FC = () => {
  const navigate = useNavigate();
  const { 
    addExpense, 
    currentScan, 
    setScanReceipt, 
    startScanning, 
    cancelScanning 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Local state for manual items
  const [itemsList, setItemsList] = useState<{ name: string; qty: number; price: number; category: string }[]>([]);
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  // Local state for single item form inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [newItemCategory, setNewItemCategory] = useState('Grocery');

  // Drag and Drop State
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    // Generate image preview (or standard doc preview)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFilePreview(base64String);
      setScanReceipt(base64String, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Trigger OCR scan process
  useEffect(() => {
    if (currentScan && currentScan.status === 'uploaded') {
      startScanning();
    }
  }, [currentScan, startScanning]);

  // Handle Scan redirection
  useEffect(() => {
    if (currentScan && currentScan.status === 'completed') {
      // Redirect to review page
      navigate('/receipt-processing');
    }
  }, [currentScan, navigate]);

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      alert('Please enter an item name.');
      return;
    }
    if (newItemQty <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    if (newItemPrice < 0) {
      alert('Price cannot be negative.');
      return;
    }

    setItemsList([
      ...itemsList,
      {
        name: newItemName,
        qty: Number(newItemQty),
        price: Number(newItemPrice),
        category: newItemCategory
      }
    ]);

    // Reset single item fields
    setNewItemName('');
    setNewItemQty(1);
    setNewItemPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setItemsList(itemsList.filter((_, idx) => idx !== index));
  };

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const onSubmitManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsList.length === 0) {
      alert('Please add at least one item to the list.');
      return;
    }

    // Calculate total amount
    const totalAmount = itemsList.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Primary category determination based on highest item amount
    const categoryTotals: Record<string, number> = {};
    itemsList.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + (item.price * item.qty);
    });
    let primaryCategory = 'Grocery';
    let highestCatAmount = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > highestCatAmount) {
        highestCatAmount = val;
        primaryCategory = cat;
      }
    });

    // Auto-generate title
    const primaryTitle = itemsList[0].name;
    const expenseTitle = itemsList.length > 1 
      ? `${primaryTitle} & ${itemsList.length - 1} other item${itemsList.length > 2 ? 's' : ''}`
      : primaryTitle;

    // Structure items with unique ids
    const itemsWithId = itemsList.map((item: any, idx: number) => ({
      id: `item-${Date.now()}-${idx}`,
      name: item.name || 'Item',
      qty: Number(item.qty) || 1,
      price: Number(item.price) || 0,
      category: item.category || primaryCategory
    }));

    await addExpense({
      title: expenseTitle,
      category: primaryCategory,
      amount: totalAmount,
      date: transactionDate,
      paymentMethod: 'Cash',
      storeName: 'Manual Entry Store',
      notes: 'Logged manual item list.',
      items: itemsWithId
    });

    navigate('/expenses');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Tabs Control */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('upload')}
          className={`
            flex items-center gap-2 px-6 py-3 border-b-2 font-outfit text-sm font-bold transition-all duration-200
            ${activeTab === 'upload' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}
          `}
        >
          <Upload className="h-4 w-4" />
          <span>Upload Receipt (AI Scan)</span>
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={`
            flex items-center gap-2 px-6 py-3 border-b-2 font-outfit text-sm font-bold transition-all duration-200
            ${activeTab === 'manual' 
              ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-350'}
          `}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Manual Form Entry</span>
        </button>
      </div>

      {activeTab === 'upload' ? (
        /* METHOD 1: UPLOAD RECEIPT */
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-6">
          <div className="text-center max-w-md mx-auto space-y-1">
            <h3 className="font-outfit text-base font-bold text-slate-800 dark:text-slate-200">
              Upload Bill or Receipt
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Drag and drop an image or PDF. Our AI OCR engine will automatically extract the store name, date, categories, and itemized billing lines.
            </p>
          </div>

          {!currentScan ? (
            /* Upload Dropzone Drop Area */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                ${isDragActive 
                  ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-900'}
              `}
            >
              <input
                id="receipt-file"
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="receipt-file" className="cursor-pointer flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-950/40 text-brand-500 flex items-center justify-center mb-4 border border-brand-100 dark:border-brand-900/50">
                  <Upload className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-350">
                  Click to select or drag receipt here
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Supports JPEG, PNG, or PDF files (Up to 10MB)
                </span>
              </label>
            </div>
          ) : (
            /* Uploading / Scan Progress Screen */
            <div className="border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/40 space-y-6 max-w-xl mx-auto">
              <div className="flex gap-4 items-center">
                {filePreview && (
                  <img 
                    src={filePreview} 
                    alt="Receipt Thumbnail" 
                    className="h-20 w-16 object-cover rounded-lg border border-slate-200 dark:border-slate-850 shrink-0" 
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{currentScan.name}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mt-1">
                    Status: <span className={`
                      ${currentScan.status === 'processing' ? 'text-brand-500 animate-pulse' : ''}
                      ${currentScan.status === 'completed' ? 'text-emerald-500' : ''}
                      ${currentScan.status === 'failed' ? 'text-rose-500' : ''}
                    `}>{currentScan.status}</span>
                  </p>
                </div>
              </div>

              {/* Progress Indicator */}
              {currentScan.status === 'processing' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Extracting line items...</span>
                    <span>{currentScan.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className="h-2 bg-brand-500 rounded-full transition-all duration-300"
                      style={{ width: `${currentScan.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 justify-center text-[10px] text-brand-500 font-medium pt-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>AI Model reading receipts and categories...</span>
                  </div>
                </div>
              )}

              {/* Failed Scan Error View */}
              {currentScan.status === 'failed' && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex gap-3 text-xs text-rose-600 dark:text-rose-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>
                    <h5 className="font-bold">Scanning Failed</h5>
                    <p className="mt-0.5">{currentScan.error}</p>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={cancelScanning}
                        className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 text-[10px]"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => {
                          cancelScanning();
                          setActiveTab('manual');
                        }}
                        className="rounded-lg border border-rose-500/35 hover:bg-rose-500/10 text-rose-500 font-bold px-3 py-1.5 text-[10px] dark:hover:bg-rose-950/20"
                      >
                        Enter Manually
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cancel Button */}
              {currentScan.status === 'processing' && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={cancelScanning}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-350"
                  >
                    Cancel Scan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* METHOD 2: MANUAL ENTRY FORM */
        <form onSubmit={onSubmitManual} className="space-y-6">
          {/* ITEM DETAILED LIST CARD */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 shadow-sm space-y-5">
            {/* Header with Date Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div>
                <h3 className="font-outfit text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <ClipboardList className="h-4.5 w-4.5 text-brand-500" />
                  <span>Manual Expense Breakdown</span>
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Add items to your purchase. The system will auto-calculate categories and grand totals.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
                <Calendar className="h-3.5 w-3.5 text-brand-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date:</span>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Inputs Row for adding a new item */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-12 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-150/60 dark:border-slate-850/80">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Milk packet, Coffee"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={handleItemKeyDown}
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Quantity</label>
                <input
                  type="number"
                  placeholder="1"
                  min={1}
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(Number(e.target.value) || 1)}
                  onKeyDown={handleItemKeyDown}
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Price (Rs.)</label>
                <input
                  type="number"
                  placeholder="0"
                  min={0}
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(Number(e.target.value) || 0)}
                  onKeyDown={handleItemKeyDown}
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 px-2 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full flex items-center justify-center gap-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* List down below */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-bold text-slate-400">
                    <th className="py-2.5 px-2">Item Name</th>
                    <th className="py-2.5 px-2 text-center w-20">Quantity</th>
                    <th className="py-2.5 px-2 text-right w-28">Price (Rs.)</th>
                    <th className="py-2.5 px-2 text-center w-36">Category</th>
                    <th className="py-2.5 px-2 text-right w-28">Total (Rs.)</th>
                    <th className="py-2.5 px-2 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {itemsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                        No items added to the list yet. Enter details above and click "Add Item".
                      </td>
                    </tr>
                  ) : (
                    itemsList.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <td className="py-3 px-2 font-semibold text-slate-700 dark:text-slate-200">{item.name}</td>
                        <td className="py-3 px-2 text-center font-medium text-slate-600 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-950/10 rounded">{item.qty}</td>
                        <td className="py-3 px-2 text-right font-medium text-slate-600 dark:text-slate-450">Rs. {item.price.toLocaleString()}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="inline-flex rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-wide">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-slate-800 dark:text-slate-100">
                          Rs. {(item.qty * item.price).toLocaleString()}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Summary Footer */}
            {itemsList.length > 0 && (
              <div className="p-4 rounded-2xl bg-brand-500/[0.03] dark:bg-brand-500/[0.01] border border-brand-500/10 dark:border-brand-500/5 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-450">
                  Total Items: <span className="font-bold text-slate-850 dark:text-slate-200">{itemsList.length}</span>
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-450 flex items-center gap-3">
                  <span>Grand Total:</span>
                  <span className="font-outfit text-lg font-black text-brand-600 dark:text-brand-400 tracking-tight">
                    Rs. {itemsList.reduce((sum, item) => sum + (item.qty * item.price), 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-brand-500/10 transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Save Transaction
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
