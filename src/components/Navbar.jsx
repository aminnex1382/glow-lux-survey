import React from 'react';
import { Sparkles, LogOut } from 'lucide-react';

export default function Navbar({ currentView, onExitAdmin }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-rose-100/80 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand & Channel Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b76e79] via-[#e54576] to-[#f7a8bd] p-[2px] shadow-md shadow-rose-200/50">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#e54576]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg text-slate-800 tracking-tight">
                راز زیبایی ماندگار
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                GLOW LUX
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              از نگاه علم و تخصص | نظرسنجی مخاطبان
            </p>
          </div>
        </div>

        {/* If in secret admin view, show exit button */}
        {currentView === 'admin' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 hidden sm:inline-block">
              حالت مدیریت فعال است
            </span>
            <button
              onClick={onExitAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-rose-50 rounded-xl transition border border-slate-200 shadow-sm hover:border-rose-300"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>خروج به سایت اصلی</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
