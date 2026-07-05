import { create } from 'zustand';
import type { 
  Expense, 
  Budget, 
  Chat, 
  Message, 
  Notification 
} from '../utils/mockData';
import { 
  INITIAL_BUDGET, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_CHATS,
  queryAIInsights
} from '../utils/mockData';

const BACKEND_URL = import.meta.env.BACKEND_URL || 'http://localhost:5000';


interface User {
  name: string;
  email: string;
  currency: string;
  joinedDate: string;
}

interface ScanReceipt {
  image: string;
  name: string;
  progress: number;
  status: 'idle' | 'uploaded' | 'processing' | 'completed' | 'failed';
  error?: string;
  ocrItems?: { name: string; price: number; category: string }[];
}

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  initTheme: () => void;

  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  verifyEmail: (code: string) => Promise<boolean>;
  updateProfile: (name: string, currency: string) => void;
  changePassword: (oldPw: string, newPw: string) => Promise<boolean>;

  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  fetchExpenses: () => Promise<void>;
  totalSpending: number;
  monthlySpending: number;
  highestSpending: number;
  categorywiseSpending: any[];

  // Scanning Receipt
  currentScan: ScanReceipt | null;
  setScanReceipt: (image: string, fileName: string) => void;
  startScanning: () => void;
  cancelScanning: () => void;
  completeScanning: (items: { name: string; price: number; category: string }[]) => void;
  failScanning: (err: string) => void;

  // Budgets
  budget: Budget;
  setMonthlyBudget: (limit: number) => void;
  setCategoryBudget: (category: string, limit: number) => void;

  // Chats
  chats: Chat[];
  activeChatId: string;
  addChat: (name?: string) => string;
  deleteChat: (id: string) => void;
  sendMessage: (content: string, fileAttachment?: string) => Promise<void>;
  clearChats: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (title: string, body: string, type: 'success' | 'warning' | 'info') => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

// Load initial values from localStorage if they exist, otherwise use defaults
const getLocal = <T>(key: string, def: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
};

const setLocal = <T>(key: string, val: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(e);
  }
};

export const useStore = create<AppState>((set, get) => ({
  // Theme State
  theme: getLocal<'light' | 'dark'>('theme', 'dark'),
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: newTheme });
    setLocal('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  initTheme: () => {
    const t = get().theme;
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  user: getLocal<User | null>('user', null),
  isAuthenticated: !!localStorage.getItem('token'),
  isAuthLoading: false,
  totalSpending: 0,
  monthlySpending: 0,
  highestSpending: 0,
  categorywiseSpending: [],

  login: async (email, password) => {
    set({ isAuthLoading: true });
    try {
      const response = await fetch(`${BACKEND_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const user = { 
        name: data.user?.name || 'User', 
        email: data.user?.email || email, 
        currency: 'Rs.', 
        joinedDate: new Date().toISOString().split('T')[0] 
      };

      // Store token starting with Bearer in localStorage
      localStorage.setItem('token', `Bearer ${data.token}`);

      set({ user, isAuthenticated: true, isAuthLoading: false });
      setLocal('user', user);
      setLocal('isAuthenticated', true);
      await get().fetchExpenses();
      return true;
    } catch (err: any) {
      set({ isAuthLoading: false });
      alert(err.message || 'Could not log in.');
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isAuthLoading: true });
    try {
      const response = await fetch(`${BACKEND_URL}/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      const user = { name, email, currency: 'Rs.', joinedDate: new Date().toISOString().split('T')[0] };
      set({ user, isAuthenticated: false, isAuthLoading: false });
      setLocal('user', user);
      return true;
    } catch (err: any) {
      set({ isAuthLoading: false });
      alert(err.message || 'Could not create account.');
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setLocal('isAuthenticated', false);
  },

  forgotPassword: async (email) => {
    set({ isAuthLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ isAuthLoading: false });
    get().addNotification(
      'Recovery Email Sent',
      `Instructions to reset your password have been sent to ${email}`,
      'info'
    );
    return true;
  },

  verifyEmail: async (_code) => {
    set({ isAuthLoading: true });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set({ isAuthenticated: true, isAuthLoading: false });
    setLocal('isAuthenticated', true);
    get().addNotification(
      'Account Verified',
      'Welcome to AI Expense Tracker! Your email is verified.',
      'success'
    );
    return true;
  },

  updateProfile: (name, currency) => {
    const u = get().user;
    if (u) {
      const updated = { ...u, name, currency };
      set({ user: updated });
      setLocal('user', updated);
    }
  },

  changePassword: async (_oldPw, _newPw) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    get().addNotification('Password Changed', 'Your account password has been updated.', 'success');
    return true;
  },

  // Expenses State
  expenses: getLocal<Expense[]>('expenses', []),
  
  fetchExpenses: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      // 1. Fetch live expenses
      const response = await fetch(`${BACKEND_URL}/api/expenses?page=1&limit=100`, {
        headers: {
          'Authorization': token
        }
      });
      if (response.ok) {
        const data = await response.json();
        const mappedExpenses = (data.expenses || []).map((be: any) => {
          let primaryCategory = 'Grocery';
          if (be.items && be.items.length > 0) {
            primaryCategory = be.items[0].category || 'Grocery';
          }
          let title = 'Expense';
          if (be.items && be.items.length > 0) {
            const firstItemName = be.items[0].name;
            title = be.items.length > 1 
              ? `${firstItemName} & ${be.items.length - 1} other item${be.items.length > 2 ? 's' : ''}`
              : firstItemName;
          }
          let dateStr = new Date().toISOString().split('T')[0];
          if (be.date) {
            dateStr = new Date(be.date).toISOString().split('T')[0];
          }
          return {
            id: be._id,
            title: title,
            category: primaryCategory,
            amount: be.totalAmount || 0,
            date: dateStr,
            paymentMethod: 'Cash',
            storeName: 'Store',
            notes: '',
            items: (be.items || []).map((item: any, idx: number) => ({
              id: item._id || `item-${be._id}-${idx}`,
              name: item.name,
              qty: item.quantity || 1,
              price: item.price || 0,
              category: item.category || primaryCategory
            }))
          };
        });
        set({ expenses: mappedExpenses });
        setLocal('expenses', mappedExpenses);
      }

      // 2. Fetch total spending
      const totalRes = await fetch(`${BACKEND_URL}/api/total`, {
        headers: {
          'Authorization': token
        }
      });
      if (totalRes.ok) {
        const totalData = await totalRes.json();
        const totalAmount = totalData.totalSpendings?.[0]?.totalAmount || 0;
        set({ totalSpending: totalAmount });
      }

      // 3. Fetch monthly spending
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const monthlyRes = await fetch(`${BACKEND_URL}/api/monthly?year=${year}&month=${month}`, {
        headers: {
          'Authorization': token
        }
      });
      if (monthlyRes.ok) {
        const monthlyData = await monthlyRes.json();
        const monthlyAmount = monthlyData.monthlySpendings?.[0]?.totalAmount || 0;
        set({ monthlySpending: monthlyAmount });
      }

      // 4. Fetch highest spending
      const highestRes = await fetch(`${BACKEND_URL}/api/highest`, {
        headers: {
          'Authorization': token
        }
      });
      if (highestRes.ok) {
        const highestData = await highestRes.json();
        const highestAmount = highestData.highestSpendings?.[0]?.totalAmount || 0;
        set({ highestSpending: highestAmount });
      }

      // 5. Fetch categorywise spending averages
      const categorywiseRes = await fetch(`${BACKEND_URL}/api/categorywise`, {
        headers: {
          'Authorization': token
        }
      });
      if (categorywiseRes.ok) {
        const categorywiseData = await categorywiseRes.json();
        set({ categorywiseSpending: categorywiseData.averageSpendingByCategory || [] });
      }
    } catch (err) {
      console.error('Failed to fetch expenses from backend', err);
    }
  },

  addExpense: async (expenseData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found');
      return;
    }

    const backendItems = expenseData.items.map(item => ({
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.qty || 1,
      total: item.price * (item.qty || 1)
    }));

    const body = {
      items: backendItems,
      totalAmount: expenseData.amount,
      totalItems: expenseData.items.length
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save expense');
      }

      // Fetch live updated list and stats
      await get().fetchExpenses();

      // Trigger budget checks / notifications based on updated expenses
      const totalSpend = get().monthlySpending || get().expenses.reduce((sum, e) => sum + e.amount, 0);
      const budget = get().budget;
      if (totalSpend > budget.monthlyLimit) {
        get().addNotification(
          'Monthly Budget Exceeded!',
          `Your total spending (Rs. ${totalSpend.toLocaleString()}) has exceeded your limit of Rs. ${budget.monthlyLimit.toLocaleString()}`,
          'warning'
        );
      } else if (totalSpend > budget.monthlyLimit * 0.85) {
        get().addNotification(
          'Monthly Budget Warning (85%)',
          `You have utilized 85% of your monthly budget. Remaining: Rs. ${(budget.monthlyLimit - totalSpend).toLocaleString()}`,
          'warning'
        );
      }

      const catSpend = get().expenses
        .filter(e => e.category === expenseData.category)
        .reduce((sum, e) => sum + e.amount, 0);
      const catLimit = budget.categoryLimits[expenseData.category] || 0;
      if (catLimit > 0 && catSpend > catLimit) {
        get().addNotification(
          'Category Budget Exceeded!',
          `Your spend on ${expenseData.category} (Rs. ${catSpend.toLocaleString()}) has breached the limit of Rs. ${catLimit.toLocaleString()}`,
          'warning'
        );
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Could not save expense.');
    }
  },

  updateExpense: (id, updatedFields) => {
    const updated = get().expenses.map(e => e.id === id ? { ...e, ...updatedFields } : e);
    set({ expenses: updated });
    setLocal('expenses', updated);
  },

  deleteExpense: (id) => {
    const updated = get().expenses.filter(e => e.id !== id);
    set({ expenses: updated });
    setLocal('expenses', updated);
  },

  // Scanning Receipt State
  currentScan: null,
  setScanReceipt: (image, fileName) => {
    set({
      currentScan: {
        image,
        name: fileName,
        progress: 0,
        status: 'uploaded',
      }
    });
  },

  startScanning: () => {
    const scan = get().currentScan;
    if (!scan) return;
    set({ currentScan: { ...scan, status: 'processing', progress: 10 } });

    // Simulate scanning ticks
    const interval = setInterval(() => {
      const current = get().currentScan;
      if (!current || current.status !== 'processing') {
        clearInterval(interval);
        return;
      }

      if (current.progress >= 90) {
        clearInterval(interval);
        
        // Mock OCR result generator
        const isSuccess = Math.random() < 0.92; // 92% Success
        if (isSuccess) {
          const names = ['A2 Organic Milk', 'Fresh Boneless Chicken', 'Basmati Rice Premium', 'Cage Free Eggs', 'Sourdough Bread'];
          const cats = ['Dairy', 'Food & Dining', 'Grocery', 'Dairy', 'Dairy'];
          
          const itemsCount = Math.floor(Math.random() * 3) + 2; // 2 to 4 items
          const items = Array.from({ length: itemsCount }).map(() => {
            const idx = Math.floor(Math.random() * names.length);
            const price = Math.floor(Math.random() * 400) + 150;
            return {
              name: names[idx],
              price,
              category: cats[idx]
            };
          });

          set({
            currentScan: {
              ...current,
              status: 'completed',
              progress: 100,
              ocrItems: items
            }
          });

          get().addNotification(
            'Receipt Scanned Successfully',
            `Extracted ${items.length} items from ${current.name}. Ready for review.`,
            'success'
          );
        } else {
          set({
            currentScan: {
              ...current,
              status: 'failed',
              error: 'Failed to align text. Image quality too low or text unreadable.'
            }
          });
          get().addNotification(
            'OCR Processing Failed',
            `Could not extract data from ${current.name}. Try manual upload.`,
            'warning'
          );
        }
      } else {
        set({
          currentScan: {
            ...current,
            progress: current.progress + Math.floor(Math.random() * 20) + 10
          }
        });
      }
    }, 800);
  },

  cancelScanning: () => {
    set({ currentScan: null });
  },

  completeScanning: (_items) => {
    set({ currentScan: null });
  },

  failScanning: (err) => {
    if (get().currentScan) {
      set({ currentScan: { ...get().currentScan!, status: 'failed', error: err } });
    }
  },

  // Budget State
  budget: getLocal<Budget>('budget', INITIAL_BUDGET),
  setMonthlyBudget: (limit) => {
    const updated = { ...get().budget, monthlyLimit: limit };
    set({ budget: updated });
    setLocal('budget', updated);
    get().addNotification('Budget Configured', `Monthly spending limit updated to Rs. ${limit.toLocaleString()}`, 'info');
  },
  setCategoryBudget: (category, limit) => {
    const updatedLimits = { ...get().budget.categoryLimits, [category]: limit };
    const updated = { ...get().budget, categoryLimits: updatedLimits };
    set({ budget: updated });
    setLocal('budget', updated);
    get().addNotification('Category Budget Configured', `${category} category limit set to Rs. ${limit.toLocaleString()}`, 'info');
  },

  // Chats State
  chats: getLocal<Chat[]>('chats', INITIAL_CHATS),
  activeChatId: getLocal<string>('activeChatId', 'chat-default'),
  addChat: (name = `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`) => {
    const newChatId = `chat-${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      name,
      messages: [
        {
          id: `msg-${Date.now()}-1`,
          role: 'assistant',
          content: 'Hi! Ask me anything about your monthly spending, categories, savings tips, or ask if you can afford a purchase.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    const updatedChats = [...get().chats, newChat];
    set({ chats: updatedChats, activeChatId: newChatId });
    setLocal('chats', updatedChats);
    setLocal('activeChatId', newChatId);
    return newChatId;
  },

  deleteChat: (id) => {
    let updatedChats = get().chats.filter(c => c.id !== id);
    if (updatedChats.length === 0) {
      const defaultId = 'chat-default';
      updatedChats = [
        {
          id: defaultId,
          name: 'Financial Health Check',
          messages: [
            {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: 'Hi! I am your AI Financial Assistant. Ask me anything about your expenditures or upload a receipt to start.',
              timestamp: new Date().toISOString()
            }
          ]
        }
      ];
      set({ chats: updatedChats, activeChatId: defaultId });
    } else {
      set({ 
        chats: updatedChats, 
        activeChatId: get().activeChatId === id ? updatedChats[0].id : get().activeChatId 
      });
    }
    setLocal('chats', updatedChats);
    setLocal('activeChatId', get().activeChatId);
  },

  sendMessage: async (content, fileAttachment) => {
    const activeChatId = get().activeChatId;
    const currentChats = get().chats;
    const activeChat = currentChats.find(c => c.id === activeChatId);
    if (!activeChat) return;

    // User Message
    const userMsgId = `msg-${Date.now()}-user`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: content + (fileAttachment ? `\n\n*Uploaded Receipt Attachment: ${fileAttachment.split('/').pop()}*` : ''),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...activeChat.messages, userMsg];
    let updatedChats = currentChats.map(c => c.id === activeChatId ? { ...c, messages: updatedMessages } : c);
    set({ chats: updatedChats });
    setLocal('chats', updatedChats);

    // Simulate Assistant typing latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulated streaming response setup
    const assistantMsgId = `msg-${Date.now()}-assistant`;
    const finalAnswer = queryAIInsights(content, get().expenses, get().budget);
    
    const initialAssistantMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '', // Start empty for typing streaming effect
      timestamp: new Date().toISOString(),
      chartData: finalAnswer.chartData,
      chartType: finalAnswer.chartType
    };

    // Append empty assistant message
    set({
      chats: get().chats.map(c => 
        c.id === activeChatId 
          ? { ...c, messages: [...updatedMessages, initialAssistantMsg] } 
          : c
      )
    });

    // Stream text character by character / chunk by chunk
    const textToStream = finalAnswer.content;
    let currentIdx = 0;
    const chunkSize = Math.max(1, Math.floor(textToStream.length / 15)); // Stream in 15 chunks
    
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (currentIdx >= textToStream.length) {
          clearInterval(interval);
          resolve();
          return;
        }

        currentIdx += chunkSize;
        const slicedText = textToStream.slice(0, currentIdx);

        set({
          chats: get().chats.map(c => 
            c.id === activeChatId 
              ? {
                  ...c,
                  messages: c.messages.map(m => 
                    m.id === assistantMsgId ? { ...m, content: slicedText } : m
                  )
                }
              : c
          )
        });

        // Save at the end of streaming
        if (currentIdx >= textToStream.length) {
          setLocal('chats', get().chats);
        }
      }, 70);
    });
  },

  clearChats: () => {
    localStorage.removeItem('chats');
    set({ chats: INITIAL_CHATS, activeChatId: 'chat-default' });
    setLocal('chats', INITIAL_CHATS);
    setLocal('activeChatId', 'chat-default');
  },

  // Notifications State
  notifications: getLocal<Notification[]>('notifications', INITIAL_NOTIFICATIONS),
  addNotification: (title, body, type) => {
    const newNotification: Notification = {
      id: `not-${Date.now()}`,
      title,
      body,
      type,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    const updated = [newNotification, ...get().notifications];
    set({ notifications: updated });
    setLocal('notifications', updated);
  },

  markAsRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    set({ notifications: updated });
    setLocal('notifications', updated);
  },

  markAllAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, isRead: true }));
    set({ notifications: updated });
    setLocal('notifications', updated);
  },

  clearNotifications: () => {
    set({ notifications: [] });
    setLocal('notifications', []);
  }
}));
