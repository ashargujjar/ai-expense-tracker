import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const Signup: React.FC = () => {
  const { signup, isAuthLoading, initTheme } = useStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  const onSubmit = async (data: any) => {
    const success = await signup(data.name, data.email, data.password);
    if (success) {
      alert('Account registered successfully! Please sign in.');
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-950 font-sans text-slate-100 overflow-x-hidden">
      {/* Left panel: Fintech branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-slate-950 via-brand-950 to-brand-900 p-12 relative overflow-hidden border-r border-slate-800/40">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-violet-500/10 blur-[120px]" />

        <div className="flex items-center gap-2 relative z-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/25">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-outfit text-xl font-bold tracking-tight text-white">
              Fin<span className="text-brand-400">AI</span>
            </h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block -mt-1">
              Expense Tracker
            </span>
          </div>
        </div>

        <div className="space-y-6 relative z-10 max-w-md">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 border border-violet-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            Join the Smart Savings Movement
          </div>
          <h2 className="font-outfit text-4xl font-extrabold leading-tight text-white">
            Plan, analyze, and optimize effortlessly.
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create an account to digitize your receipts in seconds, track monthly spending patterns, and get AI recommendations directly suited to your spending habits.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">Zero Manual OCR Mistakes</p>
                <p className="text-[10px] text-slate-500">Automated categorization with deep learning parsing.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-200">Insight Notifications</p>
                <p className="text-[10px] text-slate-500">Receive alerts if a category spend spikes unexpectedly.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 relative z-10">
          &copy; 2026 FinAI Systems. All rights reserved. Designed for next-generation smart accounting.
        </div>
      </div>

      {/* Right panel: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950 relative">
        <div className="absolute top-10 right-10 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
            <span className="font-outfit text-base font-bold text-white">FinAI</span>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h3 className="font-outfit text-2xl font-extrabold text-white">Create Account</h3>
            <p className="text-sm text-slate-400">Get started today with our AI financial assistant.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block" htmlFor="name">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={`
                    w-full rounded-xl bg-slate-900 border text-slate-100 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200
                    ${errors.name ? 'border-rose-500' : 'border-slate-800'}
                  `}
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name?.message && (
                <span className="text-rose-500 text-[11px] font-medium block mt-0.5">{String(errors.name.message)}</span>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`
                    w-full rounded-xl bg-slate-900 border text-slate-100 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200
                    ${errors.email ? 'border-rose-500' : 'border-slate-800'}
                  `}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                  })}
                />
              </div>
              {errors.email?.message && (
                <span className="text-rose-500 text-[11px] font-medium block mt-0.5">{String(errors.email.message)}</span>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 block" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`
                    w-full rounded-xl bg-slate-900 border text-slate-100 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200
                    ${errors.password ? 'border-rose-500' : 'border-slate-800'}
                  `}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.password?.message && (
                <span className="text-rose-500 text-[11px] font-medium block mt-0.5">{String(errors.password.message)}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAuthLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3 px-4 shadow-lg shadow-brand-500/10 focus:outline-none focus:ring-2 focus:ring-brand-500/50 disabled:opacity-50 transition-all duration-250 cursor-pointer"
            >
              {isAuthLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="font-bold text-brand-400 hover:text-brand-350 hover:underline transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
