import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, KeyRound, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const VerifyEmail: React.FC = () => {
  const { verifyEmail, isAuthLoading, initTheme } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    initTheme();
  }, [initTheme]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);
    setErrorMsg('');

    // Focus next input automatically
    if (element.value !== '' && element.nextSibling) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && code[index] === '' && e.currentTarget.previousSibling) {
      (e.currentTarget.previousSibling as HTMLInputElement).focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of your verification code.');
      return;
    }

    const success = await verifyEmail(verificationCode);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-950 font-sans text-slate-100 items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-500/10 blur-[130px]" />
      
      <div className="absolute top-10 left-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <span className="font-outfit text-base font-bold text-white">FinAI</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl backdrop-blur-xl relative z-10 space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-outfit text-2xl font-extrabold text-white">Verify Your Email</h3>
          <p className="text-sm text-slate-400">
            We've sent a 6-digit confirmation code to your email. Enter it below to unlock your dashboard.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* Numeric verification slots */}
          <div className="flex justify-between gap-2 max-w-xs mx-auto">
            {code.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className="w-12 h-14 text-center rounded-xl bg-slate-900 border border-slate-800 text-lg font-bold text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all duration-200"
              />
            ))}
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 flex gap-2 justify-center text-xs text-rose-400 font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isAuthLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold py-3 px-4 disabled:opacity-50 transition-all duration-250 cursor-pointer"
          >
            {isAuthLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <span>Complete Verification</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="text-xs text-slate-500">
            Didn't receive the code?{' '}
            <button 
              type="button" 
              onClick={() => alert('Code re-sent successfully!')}
              className="font-bold text-brand-400 hover:text-brand-350 hover:underline transition-all"
            >
              Resend Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
