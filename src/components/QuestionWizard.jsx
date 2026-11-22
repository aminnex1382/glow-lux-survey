import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Send, 
  AlertCircle,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function QuestionWizard({ 
  questions, 
  answers, 
  onAnswerChange, 
  onSubmit, 
  isSubmitting 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const currentQ = questions[currentIndex];
  const total = questions.length;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  const selectedAnswer = answers[currentQ.id] || '';

  const handleOptionSelect = (option) => {
    setErrorMsg('');
    onAnswerChange(currentQ.id, option);
  };

  const handleNext = () => {
    if (currentQ.type === 'choice' && !selectedAnswer) {
      setErrorMsg('لطفاً یکی از گزینه‌ها را برای ادامه انتخاب کنید.');
      return;
    }
    setErrorMsg('');

    if (currentIndex < total - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Last question - submit
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setErrorMsg('');
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      {/* Top Header & Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-500 mb-2">
          <span className="flex items-center gap-1.5 text-rose-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            سوال {currentIndex + 1} از {total}
          </span>
          <span className="text-slate-400 font-mono">{progressPercent}٪ تکمیل شده</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-rose-100/70 rounded-full overflow-hidden p-0.5">
          <div 
            className="h-full bg-gradient-to-l from-[#e54576] to-[#b76e79] rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="glass-panel-luxury rounded-3xl p-6 sm:p-8 shadow-luxury-card relative overflow-hidden">
        {/* Section Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>{currentQ.section}</span>
        </div>

        {/* Question Title */}
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug mb-6">
          {currentQ.question}
        </h2>

        {/* Choice Options */}
        {currentQ.type === 'choice' && (
          <div className="space-y-3 mb-6">
            {currentQ.options.map((opt, index) => {
              const isSelected = selectedAnswer === opt;
              const persianIndex = (index + 1).toLocaleString('fa-IR');

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleOptionSelect(opt)}
                  className={`w-full text-right p-4 rounded-2xl transition-all duration-200 flex items-center justify-between gap-3 border ${
                    isSelected
                      ? 'bg-gradient-to-l from-rose-50/90 to-rose-100/60 border-rose-400 text-rose-900 shadow-sm ring-2 ring-rose-200'
                      : 'bg-white/80 hover:bg-rose-50/40 border-slate-200 text-slate-700 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                      isSelected 
                        ? 'bg-rose-600 text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {persianIndex}
                    </span>
                    <span className="text-sm sm:text-base font-medium">
                      {opt}
                    </span>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'bg-rose-600 text-white scale-110' : 'border border-slate-300'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Text Area (For Question 10 - feedback & suggestions) */}
        {currentQ.type === 'text' && (
          <div className="mb-6">
            <div className="relative">
              <textarea
                value={selectedAnswer}
                onChange={(e) => {
                  setErrorMsg('');
                  onAnswerChange(currentQ.id, e.target.value);
                }}
                rows={5}
                placeholder={currentQ.placeholder}
                className="w-full p-4 rounded-2xl bg-white/90 border border-slate-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none text-slate-800 text-sm leading-relaxed transition-all resize-none shadow-inner"
              />
              <div className="absolute bottom-3 left-3 text-[11px] text-slate-400 font-mono">
                {selectedAnswer.length} کاراکتر
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span>پاسخ به این سوال اختیاری است؛ اما بیان ایده‌ها و نظراتتان به پیشرفت کانال کمک بزرگی می‌کند.</span>
            </p>
          </div>
        )}

        {/* Validation Warning */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="pt-4 border-t border-rose-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              currentIndex === 0 
                ? 'opacity-40 cursor-not-allowed text-slate-400' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>سوال قبل</span>
          </button>

          <div className="flex items-center gap-1 hidden sm:flex">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentIndex 
                    ? 'w-5 bg-rose-600' 
                    : answers[questions[i].id] 
                      ? 'bg-rose-300' 
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 ${
              currentIndex === total - 1
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200'
                : 'bg-gradient-to-r from-[#e54576] to-[#b76e79] hover:from-[#d1295d] hover:to-[#9f5762] text-white shadow-rose-200'
            }`}
          >
            {isSubmitting ? (
              <span>در حال ارسال...</span>
            ) : currentIndex === total - 1 ? (
              <>
                <span>ثبت نهایی و ارسال</span>
                <Send className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>سوال بعدی</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
