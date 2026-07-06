export interface ExpenseItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  category: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  storeName: string;
  notes?: string;
  items: ExpenseItem[];
  receiptImage?: string;
  aiSummary?: string;
}

export interface Budget {
  monthlyLimit: number;
  categoryLimits: Record<string, number>;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  chartData?: { name: string; value: number }[];
  chartType?: 'pie' | 'bar';
}

export interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'success' | 'warning' | 'info';
  timestamp: string;
  isRead: boolean;
}

// Preset Categories
export const CATEGORIES = [
  'Grocery',
  'Dairy',
  'Food & Dining',
  'Rent & Utilities',
  'Travel & Transit',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Others'
];

export const PAYMENT_METHODS = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI / Bank Transfer',
  'Mobile Wallet'
];




// Initial Budgets
export const INITIAL_BUDGET: Budget = {
  monthlyLimit: 55000,
  categoryLimits: {
    'Grocery': 8000,
    'Dairy': 3000,
    'Food & Dining': 10000,
    'Rent & Utilities': 28000,
    'Travel & Transit': 6000,
    'Entertainment': 5000,
    'Shopping': 8000,
    'Healthcare': 4000,
    'Others': 3000
  }
};

// Initial Notifications
export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'not-1',
    title: 'Receipt Analyzed Successfully',
    body: 'Your receipt from Mother Dairy of Rs. 750 has been scanned and recorded automatically.',
    type: 'success',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    isRead: false
  },
  {
    id: 'not-2',
    title: 'Category Budget Warning (85% reached)',
    body: 'You have spent Rs. 4,200 out of Rs. 5,000 in your Entertainment budget.',
    type: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    isRead: false
  },
  {
    id: 'not-3',
    title: 'New AI Monthly Insight Available',
    body: 'AI Assistant detected that your Dining Out costs are 25% higher compared to last week.',
    type: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 600).toISOString(), // 10 hours ago
    isRead: true
  }
];

// Initial Chat messages
export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-default',
    name: 'Financial Health Check',
    messages: [
      {
        id: 'm-1',
        role: 'assistant',
        content: 'Hi! I am your AI Financial Assistant. I can help analyze your expenses, suggest ways to save, answer questions about your budget, or scan receipts. \n\nTry asking me **"What is my highest expense category?"** or **"How much did I spend this month?"**.',
        timestamp: new Date().toISOString()
      }
    ]
  }
];

// Quick automated AI responses engine
export const queryAIInsights = (query: string, expenses: Expense[], budget: Budget) => {
  const normalizedQuery = query.toLowerCase();

  // Calculate stats based on current expenses
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Category-wise totals
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Find highest category
  let highestCategory = 'N/A';
  let highestAmount = 0;
  Object.entries(categoryTotals).forEach(([cat, val]) => {
    if (val > highestAmount) {
      highestAmount = val;
      highestCategory = cat;
    }
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));

  // Responses
  if (normalizedQuery.includes('highest') || normalizedQuery.includes('most spent')) {
    return {
      content: `Based on your recent tracking, your highest spending category is **${highestCategory}** with a total of **Rs. ${highestAmount.toLocaleString()}**.\n\nHere is your full category-wise spending distribution:`,
      chartData,
      chartType: 'pie' as const
    };
  }

  if (normalizedQuery.includes('spend') || normalizedQuery.includes('total') || normalizedQuery.includes('how much')) {
    const monthlyLimit = budget.monthlyLimit;
    const pct = ((totalSpend / monthlyLimit) * 100).toFixed(0);
    return {
      content: `You have spent **Rs. ${totalSpend.toLocaleString()}** in total so far.\n\nCompared to your monthly budget of **Rs. ${monthlyLimit.toLocaleString()}**, you have utilized **${pct}%** of your funds. Let's look at a breakdown of your expenditures.`,
      chartData,
      chartType: 'bar' as const
    };
  }

  if (normalizedQuery.includes('laptop') || normalizedQuery.includes('afford')) {
    const remaining = budget.monthlyLimit - totalSpend;
    const canAfford = remaining > 45000;
    return {
      content: canAfford
        ? `Yes! You currently have **Rs. ${remaining.toLocaleString()}** remaining in your budget for this month. If the laptop costs around Rs. 40,000 - 45,000, you can afford it without breaching your budget. However, it will leave you with very little buffer for utilities.`
        : `I would recommend waiting. You have **Rs. ${remaining.toLocaleString()}** remaining in your budget, and a standard laptop purchase would breach your set limit. Try setting aside Rs. 10,000 per month in a custom category for the next few months instead.`,
    };
  }

  if (normalizedQuery.includes('reduce') || normalizedQuery.includes('save') || normalizedQuery.includes('tips')) {
    const diningSpend = categoryTotals['Food & Dining'] || 0;
    const shoppingSpend = categoryTotals['Shopping'] || 0;
    return {
      content: `Here are 3 customized recommendations to optimize your finances:\n\n1. **Food & Dining**: You spent **Rs. ${diningSpend.toLocaleString()}** on dining out. Reducing this by eating home 2 extra times a week can save you around Rs. 2,000.\n2. **Shopping**: Refrain from impulse purchases. You have spent **Rs. ${shoppingSpend.toLocaleString()}** on clothes this month. Try the 48-hour rule: wait 2 days before completing checkout.\n3. **Budgets Alerts**: I suggest reducing your **${highestCategory}** budget slightly next month to force mindful allocation.`,
    };
  }

  // Default AI chatbot fallback response
  return {
    content: `I've analyzed your query: "${query}". \n\nCurrently, you have recorded **${expenses.length} expenses** with a total spend of **Rs. ${totalSpend.toLocaleString()}**. Your remaining budget is **Rs. ${(budget.monthlyLimit - totalSpend).toLocaleString()}**.\n\nPlease ask about spending, budgets, affording purchases, or saving tips for a more detailed analysis!`
  };
};
