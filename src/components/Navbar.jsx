import React from 'react';
import { Sparkles, BarChart3, ClipboardList, ShieldCheck } from 'lucide-react';

export default function Navbar({ currentView, setView, responseCount }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-rose-100/80 shadow-sm transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Brand & Channel Info */}
        <div 
          onClick={() => setView('survey')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#b76e79] via-[#e54576] to-[#f7a8bd] p-[2px] shadow-md shadow-rose-200/50 group-hover:scale-105 transition-transform">
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

        {/* View Switchers */}
        <div className="flex items-center gap-2">
          {currentView === 'admin' ? (
            <button
              onClick={() => setView('survey')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition border border-rose-200 shadow-sm"
            >
              <ClipboardList className="w-4 h-4" />
              <span>فرم نظرسنجی</span>
            </button>
          ) : (
            <button
              onClick={() => setView('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-rose-50/70 rounded-xl transition border border-slate-200 shadow-sm hover:border-rose-200 group"
            >
              <BarChart3 className="w-4 h-4 text-rose-600 group-hover:scale-110 transition-transform" />
              <span>نتایج و آمار</span>
              {typeof responseCount === 'number' && responseCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full mr-1">
                  {responseCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
