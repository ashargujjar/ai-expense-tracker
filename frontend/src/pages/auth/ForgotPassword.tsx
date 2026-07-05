import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Send, TrendingUp, CheckCircle } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword, isAuthLoading, initTheme } = useStore();
  const [isSent, setIsSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  const onSubmit = async (data: any) => {
    const success = await forgotPassword(data.email);
    if (success) {
      setIsSent(true);
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-950 font-sans text-slate-100 items-center justify-center p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-500/10 blur-[130px]" />
      
      <div className="absolute top-10 left-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <span className="font-outfit text-base font-bold text-white">FinAI</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="space-y-2 text-center">
          <h3 className="font-outfit text-2xl font-extrabold text-white">Reset Password</h3>
          <p className="text-sm text-slate-400">
            {isSent 
              ? "We've sent a link to recover your credentials." 
              : "Enter your registered email address to receive a recovery link."}
          </p>
        </div>

        {isSent ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex gap-3 text-left">
              <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Email Dispatched</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Check your spam/junk folder if you do not receive the email within 2-3 minutes.
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 text-sm transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isAuthLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3 px-4 disabled:opacity-50 transition-all duration-250 cursor-pointer"
            >
              {isAuthLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <Send className="h-3.5 w-3.5" />
                </>
              )}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-200 pt-2 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Cancel and Return</span>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};
