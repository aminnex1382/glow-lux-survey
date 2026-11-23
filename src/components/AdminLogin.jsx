import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { securityService } from '../services/security';

export default function AdminLogin({ onLoginSuccess, onBackToSurvey }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('لطفاً رمز عبور را وارد کنید.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const isValid = await securityService.verifyPassword(password);
      if (isValid) {
        onLoginSuccess();
      } else {
        setErrorMsg('رمز عبور وارد شده نادرست است.');
      }
    } catch (err) {
      setErrorMsg('خطا در اعتبارسنجی رمز عبور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
      <div className="glass-panel-luxury rounded-3xl p-6 sm:p-8 shadow-luxury-card text-center relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-200/50 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-[#b76e79] via-[#e54576] to-[#fbcfe8] p-1 shadow-md shadow-rose-200 mb-4 flex items-center justify-center animate-pulse-subtle">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <Lock className="w-7 h-7 text-[#e54576]" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>حفاظت امنیتی دو مرحله‌ای</span>
        </div>

        <h2 className="text-xl font-black text-slate-800 mb-2">
          ورود امن به پنل مدیریت
        </h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          جهت حفظ محرمانگی پاسخ‌ها و شماره‌های تماس مخاطبان، دسترسی به این بخش تنها با رمز عبور مدیریت امکان‌پذیر است.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              رمز عبور مدیریت:
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setErrorMsg('');
                  setPassword(e.target.value);
                }}
                placeholder="رمز عبور را وارد کنید..."
                className="w-full pr-10 pl-10 py-3 text-xs sm:text-sm rounded-xl bg-white/90 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition"
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center font-semibold animate-shake">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] hover:from-[#d1295d] hover:to-[#9f5762] text-white font-bold text-sm shadow-glow-soft hover:shadow-glow-hover transition flex items-center justify-center gap-2"
          >
            {isLoading ? <span>در حال بررسی...</span> : <span>ورود به داشبورد</span>}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between text-xs">
          <button
            onClick={onBackToSurvey}
            className="text-slate-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>بازگشت به سایت اصلی</span>
          </button>

          <span className="text-[11px] text-slate-400">
            رمز پیش‌فرض: <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">glowlux2026</code>
          </span>
        </div>
      </div>
    </div>
  );
}
