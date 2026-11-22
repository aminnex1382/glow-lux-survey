import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, CheckCircle2 } from 'lucide-react';
import { SURVEY_INFO } from '../data/questions';

export default function CompletionView({ onReset }) {
  useEffect(() => {
    // Fire beautiful festive confetti in rose and gold colors
    const end = Date.now() + 1.5 * 1000;
    const colors = ['#e54576', '#b76e79', '#d4af37', '#fbcfe8', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-12 text-center animate-fade-in">
      <div className="glass-panel-luxury rounded-3xl p-8 sm:p-12 shadow-luxury-card relative overflow-hidden">
        {/* Glow circle */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-1 shadow-lg shadow-teal-200 mb-6 flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>پاسخ شما با موفقیت ثبت شد</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 tracking-tight">
          از همراهی پرمهرتان سپاسگزاریم 💖
        </h2>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto">
          پاسخ‌های دقیق شما به ما کمک می‌کند تا آموزش‌ها و محصولات آتی کانال
          {' '}
          <strong className="text-slate-900 font-bold">«{SURVEY_INFO.channelName}»</strong>
          {' '}
          دقیقاً بر اساس نیازها و دغدغه‌های واقعی شما عزیزان توسعه یابد.
        </p>

        <div className="flex justify-center">
          <button
            onClick={onReset}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#e54576] to-[#b76e79] hover:from-[#d1295d] hover:to-[#9f5762] text-white font-bold text-sm shadow-glow-soft hover:shadow-glow-hover transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ثبت نظر جدید</span>
          </button>
        </div>
      </div>
    </div>
  );
}
