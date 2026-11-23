import React from 'react';
import { Sparkles, Clock, ShieldCheck, ArrowLeft, UserCheck, Phone, Send, Heart } from 'lucide-react';
import { SURVEY_INFO } from '../data/questions';

export default function WelcomeView({ onStart, personalizedUser }) {
  const topics = [
    { title: "لک، تیرگی و مشکلات پوستی", icon: "🌸" },
    { title: "ریزش، شوره و سلامت مو", icon: "💆‍♀️" },
    { title: "آبرسانی و جوانسازی روزانه", icon: "✨" },
    { title: "پاسخ به سوالات و نیازهای شما", icon: "💬" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Luxury Hero Card */}
      <div className="glass-panel-luxury rounded-3xl p-6 sm:p-10 text-center relative overflow-hidden shadow-luxury-card">
        {/* Soft decorative background glows */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-300/30 rounded-full blur-3xl pointer-events-none" />

        {/* Personalized Welcome Badge if entered via VIP personalized link */}
        {personalizedUser && personalizedUser.name && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-amber-50 border border-amber-200/80 shadow-sm animate-fade-in text-right flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                دعوت‌نامه اختصاصی GLOW LUX
              </p>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-800">
                سلام {personalizedUser.name} عزیز، به نظرسنجی اختصاصی خوش آمدید 🌸
              </h2>
            </div>
          </div>
        )}

        {/* Brand Emblem */}
        <div className="inline-flex items-center justify-center mb-4 relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#b76e79] via-[#e54576] to-[#fbcfe8] p-1 shadow-lg shadow-rose-200 animate-pulse-subtle">
            <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center p-2 text-center">
              <Sparkles className="w-7 h-7 sm:w-9 sm:h-9 text-[#e54576] mb-0.5" />
              <span className="text-[9px] font-black tracking-wider text-[#921b40] uppercase">GLOW LUX</span>
            </div>
          </div>
        </div>

        {/* Main Titles */}
        <div className="inline-block px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold mb-3">
          {SURVEY_INFO.title}
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-2">
          {SURVEY_INFO.channelName}
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-rose-600 mb-4 tracking-wide">
          {SURVEY_INFO.subtitle}
        </p>

        {/* Welcome Message */}
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-6 font-normal">
          {personalizedUser?.name ? (
            <>
              {personalizedUser.name} گرامی، دیدگاه‌ها و نیازهای شما برای ما اولویت ویژه دارد. پاسخ‌های شما مستقیماً توسط تیم تخصصی کانال بررسی خواهد شد.
            </>
          ) : (
            SURVEY_INFO.description
          )}
        </p>

        {/* Feature Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6 text-right">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-rose-100/90 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">سریع و آسان</p>
              <p className="text-[11px] text-slate-500">{SURVEY_INFO.estimatedTime}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 border border-rose-100/90 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {personalizedUser ? 'ثبت مستقیم و اختصاصی' : 'کاملاً محرمانه و بی‌نام'}
              </p>
              <p className="text-[11px] text-slate-500">
                {personalizedUser ? 'بدون نیاز به ثبت مجدد مشخصات' : 'بدون نیاز به نام یا شماره تماس'}
              </p>
            </div>
          </div>
        </div>

        {/* Survey Topics Covered */}
        <div className="mb-6 pt-4 border-t border-rose-100/70">
          <p className="text-xs font-bold text-slate-500 mb-3">موضوعات مورد بررسی در این نظرسنجی:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {topics.map((sec, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-rose-50/90 text-rose-800 border border-rose-200/60"
              >
                <span>{sec.icon}</span>
                <span>{sec.title}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={onStart}
            className="w-full sm:w-auto min-w-[240px] px-8 py-4 rounded-2xl bg-gradient-to-r from-[#e54576] to-[#b76e79] hover:from-[#d1295d] hover:to-[#9f5762] text-white font-bold text-base shadow-glow-soft hover:shadow-glow-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <span>شروع نظرسنجی</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Direct Contact Bar */}
        <div className="pt-4 border-t border-rose-100/70 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>راهنمایی و مشاوره مستقیم:</span>
          </span>
          <a 
            href={`tel:${SURVEY_INFO.contactPhone}`} 
            className="flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 transition"
          >
            <Phone className="w-3 h-3" />
            <span>{SURVEY_INFO.contactPhoneDisplay}</span>
          </a>
          <a 
            href={SURVEY_INFO.contactIdLink} 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center gap-1 font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 hover:bg-purple-100 transition"
            title="ارتباط در روبیکا"
          >
            <span>روبیکا: {SURVEY_INFO.contactId}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
