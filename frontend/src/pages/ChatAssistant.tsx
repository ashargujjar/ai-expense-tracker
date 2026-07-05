import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Send, 
  Paperclip, 
  Sparkles, 
  Loader2,
  X,
  FileImage,
  ArrowRight
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
  YAxis 
} from 'recharts';
import { useStore } from '../store/useStore';
import type { Message } from '../utils/mockData';

export const ChatAssistant: React.FC = () => {
  const { 
    chats, 
    activeChatId, 
    addChat, 
    deleteChat, 
    sendMessage, 
    clearChats,
    theme 
  } = useStore();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const isDark = theme === 'dark';

  // Preset Questions
  const SUGGESTED_PROMPTS = [
    { text: 'How much did I spend this month?', icon: '💰' },
    { text: 'What is my highest expense category?', icon: '📊' },
    { text: 'Can I afford a new laptop?', icon: '💻' },
    { text: 'How can I reduce my expenses?', icon: '💡' }
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim() && !attachment) return;
    
    setInput('');
    setIsTyping(true);
    
    const fileToSend = attachment || undefined;
    
    // Clear attachment preview
    setAttachment(null);
    setAttachmentName(null);

    await sendMessage(text, fileToSend);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachmentName(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Simple Markdown-like Renderer Helper
  const formatMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formattedLine = line;
      
      // Bold text formatting
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(formattedLine)) !== null) {
        // Add preceding text
        if (match.index > lastIndex) {
          parts.push(formattedLine.substring(lastIndex, match.index));
        }
        // Add bold text
        parts.push(<strong key={match.index} className="font-bold text-slate-800 dark:text-slate-100">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < formattedLine.length) {
        parts.push(formattedLine.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : formattedLine;

      // Unordered lists formatting
      if (line.startsWith('* ') || line.startsWith('- ')) {
        return (
          <li key={i} className="list-disc list-inside ml-2 my-1 text-slate-650 dark:text-slate-350">
            {line.substring(2)}
          </li>
        );
      }
      
      // Number lists formatting
      if (/^\d+\.\s/.test(line)) {
        const dotIndex = line.indexOf('.');
        return (
          <li key={i} className="list-decimal list-inside ml-2 my-1 text-slate-650 dark:text-slate-350">
            {line.substring(dotIndex + 2)}
          </li>
        );
      }

      return (
        <p key={i} className="my-1.5 min-h-[1em] text-slate-650 dark:text-slate-300">
          {content}
        </p>
      );
    });
  };

  // Inline Chart Renderer inside Chat Bubbles
  const renderInlineChart = (msg: Message) => {
    if (!msg.chartData || msg.chartData.length === 0) return null;

    const CHART_COLORS = ['#0ea5e9', '#a855f7', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

    return (
      <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60 max-w-md">
        <h5 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-505 mb-3 flex items-center gap-1">
          <span>AI Insight Visualization</span>
        </h5>
        
        <div className="h-44 w-full text-[10px]">
          {msg.chartType === 'pie' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={msg.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {msg.chartData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#0b0f19' : '#ffffff', borderColor: isDark ? '#1e293b' : '#e2e8f0' }}
                  formatter={(v) => [`Rs. ${v}`, 'Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={msg.chartData}>
                <XAxis dataKey="name" stroke={isDark ? '#64748b' : '#94a3b8'} />
                <YAxis stroke={isDark ? '#64748b' : '#94a3b8'} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#0b0f19' : '#ffffff' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-850 overflow-hidden relative">
      
      {/* SIDEBAR CONVERSATIONS DRAWER */}
      <div className={`
        absolute inset-y-0 left-0 z-20 w-64 border-r border-slate-100 bg-slate-50 dark:border-slate-800/80 dark:bg-slate-950 transition-transform duration-250 lg:static lg:translate-x-0
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col justify-between p-4 space-y-4">
          <div className="space-y-4 flex-1 overflow-y-auto">
            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => addChat()}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs py-2.5 shadow-sm shadow-brand-500/10"
              >
                <Plus className="h-4 w-4" />
                <span>New Advisor Chat</span>
              </button>
              <button
                onClick={() => setShowSidebar(false)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conversation Links list */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider block px-2 pb-2">
                Recent Chats
              </span>
              
              {chats.map((c) => (
                <div
                  key={c.id}
                  onClick={() => useStore.setState({ activeChatId: c.id })}
                  className={`
                    group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold cursor-pointer transition-colors
                    ${c.id === activeChatId 
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400' 
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-905'}
                  `}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-all rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-105 dark:border-slate-805">
            <button
              onClick={clearChats}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold text-slate-400 hover:text-rose-550 dark:hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Clear Chats History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toggle button on Sidebar for screens */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="absolute top-4 left-4 z-10 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-805 text-slate-500 hover:bg-slate-105"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      )}

      {/* CHAT DISPLAY CONTAINER */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900 relative">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          
          {activeChat?.messages.length <= 1 && (
            /* Suggested prompts chips */
            <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                    <Sparkles className="h-6 w-6 animate-pulse" />
                  </div>
                </div>
                <h4 className="font-outfit text-base font-extrabold text-slate-800 dark:text-slate-200">
                  Consult Your Financial Assistant
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                  Ask questions about your budget ceilings, dining expenses, or upload a receipt to verify if you can afford purchase goals.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 max-w-md mx-auto">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.text)}
                    className="text-left rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-brand-400 dark:hover:border-brand-900 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-all flex items-start gap-3 text-xs text-slate-600 dark:text-slate-350 cursor-pointer"
                  >
                    <span className="text-base">{prompt.icon}</span>
                    <div className="flex-1 font-semibold flex items-center justify-between">
                      <span>{prompt.text}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actual Chat List Bubble */}
          <div className="max-w-3xl mx-auto space-y-4">
            {activeChat?.messages.map((message) => (
              <div 
                key={message.id}
                className={`flex gap-3.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                    <Sparkles className="h-4.5 w-4.5" />
                  </div>
                )}
                
                <div className={`
                  rounded-2xl px-4 py-3.5 text-xs max-w-xl text-left shadow-sm
                  ${message.role === 'user' 
                    ? 'bg-brand-600 text-white' 
                    : 'bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-slate-700 dark:text-slate-200'}
                `}>
                  <div className="leading-relaxed whitespace-pre-wrap">
                    {message.role === 'user' ? message.content : formatMarkdown(message.content)}
                  </div>
                  
                  {message.role === 'assistant' && renderInlineChart(message)}
                </div>

                {message.role === 'user' && (
                  <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-xl bg-slate-105 font-bold text-slate-650 text-xs border dark:bg-slate-805 dark:text-slate-300">
                    U
                  </div>
                )}
              </div>
            ))}

            {/* Simulated typing status */}
            {isTyping && (
              <div className="flex gap-3.5 justify-start">
                <div className="h-8.5 w-8.5 shrink-0 flex items-center justify-center rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20">
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                </div>
                <div className="rounded-2xl px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900 text-slate-400 dark:text-slate-500 text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850 max-w-3xl w-full mx-auto space-y-3">
          {/* File upload attachment indicators */}
          {attachmentName && (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 px-3.5 py-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                <FileImage className="h-4 w-4 text-brand-500" />
                <span className="truncate max-w-[200px]">{attachmentName}</span>
              </div>
              <button 
                onClick={() => { setAttachment(null); setAttachmentName(null); }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-900 rounded-lg text-slate-400"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-2">
            {/* Attachment input hidden */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors"
              title="Attach File"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>

            {/* Input field */}
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about spending logs, budgets, or savings tips..."
              rows={1}
              className="flex-1 resize-none bg-transparent py-2.5 px-1 border-0 focus:ring-0 focus:outline-none text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 max-h-24 overflow-y-auto"
            />

            {/* Send action */}
            <button
              onClick={() => handleSend(input)}
              disabled={isTyping || (!input.trim() && !attachment)}
              className="rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-30 disabled:hover:bg-brand-600 text-white p-2.5 shadow-sm shadow-brand-500/10 cursor-pointer transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
