import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  Copy, 
  Check, 
  UserCheck, 
  PhoneCall, 
  MessageSquare,
  Sparkles,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function UserAnswersModal({ 
  isOpen, 
  onClose, 
  lead, 
  questions = [] 
}) {
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !lead) return null;

  // Format date to Persian
  const formatDate = (dateStr) => {
    if (!dateStr) return 'نامشخص';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Count answered questions
  const totalQuestions = questions.length;
  const answeredQuestionsCount = questions.filter(q => {
    const ans = lead.answers?.[q.id];
    return ans && ans.toString().trim().length > 0;
  }).length;

  const completionPercentage = totalQuestions > 0 
    ? Math.round((answeredQuestionsCount / totalQuestions) * 100) 
    : 0;

  // Copy full user answers summary to clipboard
  const handleCopySummary = () => {
    let text = `📋 کارنامه پاسخ‌های نظرسنجی GLOW LUX\n`;
    text += `👤 نام مخاطب: ${lead.fullName}\n`;
    text += `📞 شماره تماس: ${lead.phone}\n`;
    text += `📅 زمان ثبت: ${formatDate(lead.savedAt)}\n`;
    if (lead.isPersonalized) {
      text += `💎 وضعیت: پاسخ داده شده از طریق لینک اختصاصی\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    questions.forEach((q, idx) => {
      const ans = lead.answers?.[q.id];
      const answerDisplay = ans && ans.toString().trim().length > 0 
        ? ans.toString().trim() 
        : '(پاسخ نداده است)';
      text += `${idx + 1}. ${q.question}\n`;
      text += `👈 پاسخ: ${answerDisplay}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🌸 کانال راز زیبایی ماندگار (GLOW LUX)`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative border border-rose-100 flex flex-col max-h-[90vh] overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-rose-100 bg-gradient-to-r from-rose-50/80 via-white to-pink-50/80 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute left-4 top-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition flex items-center justify-center"
            title="بستن پنجره"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pr-1 pl-10 text-right">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0 ${
                lead.isPersonalized 
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-emerald-200' 
                  : 'bg-gradient-to-tr from-[#e54576] to-[#b76e79] text-white shadow-rose-200'
              }`}>
                {lead.isPersonalized ? <UserCheck className="w-6 h-6" /> : <User className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    {lead.fullName}
                  </h3>
                  {lead.isPersonalized ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      💎 مخاطب اختصاصی VIP
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      🌸 لید ثبت‌شده
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(lead.savedAt)}</span>
                  </span>

                  <span className="text-slate-300">|</span>

                  <span className="font-mono text-slate-700 font-bold" dir="ltr">
                    📞 {lead.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action: Copy All Answers */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handleCopySummary}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 shadow-sm transition flex items-center gap-1.5"
                title="کپی متن کامل تمام پاسخ‌ها برای پیام‌رسان یا اکسل"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-rose-600" />
                    <span>کپی پاسخ‌ها</span>
                  </>
                )}
              </button>

              {lead.phone && lead.phone !== 'ثبت نشده' && !lead.phone.includes('لینک اختصاصی') && (
                <a
                  href={`tel:${lead.phone}`}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm transition"
                  title="تماس تلفنی با مخاطب"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Completion Progress Bar */}
          <div className="mt-4 pt-3 border-t border-rose-100/70 flex items-center justify-between text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1 text-slate-700 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span>پاسخ‌گویی به سوالات:</span>
              <strong className="text-rose-700 font-mono">
                {answeredQuestionsCount} از {totalQuestions} سوال ({completionPercentage}٪)
              </strong>
            </span>

            <span className="text-[11px] text-slate-400">
              شناسه پاسخ: <code className="font-mono text-slate-500">{lead.id?.substring(0, 14)}...</code>
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body: Questions & User's Answers */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-right flex-1 bg-slate-50/50">
          {questions.map((q, idx) => {
            const rawAnswer = lead.answers?.[q.id];
            const hasAnswer = rawAnswer !== undefined && rawAnswer !== null && rawAnswer.toString().trim().length > 0;
            const answerText = hasAnswer ? rawAnswer.toString().trim() : '';

            return (
              <div 
                key={q.id || idx}
                className={`p-4 sm:p-5 rounded-2xl transition border shadow-sm ${
                  hasAnswer 
                    ? 'bg-white border-slate-200/90 hover:border-rose-200' 
                    : 'bg-slate-100/70 border-slate-200/60 opacity-70'
                }`}
              >
                {/* Question Section & Header */}
                <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 font-mono font-bold text-xs flex items-center justify-center border border-rose-200/60">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-50/80 px-2 py-0.5 rounded-full border border-rose-200/50">
                      {q.sectionBadge || q.section}
                    </span>
                  </div>

                  {hasAnswer ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>پاسخ داده شده</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      <span>بدون پاسخ</span>
                    </span>
                  )}
                </div>

                {/* Question Title */}
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 mb-3 leading-snug">
                  {q.question}
                </h4>

                {/* The User's Exact Answer Display */}
                {hasAnswer ? (
                  q.type === 'text' ? (
                    // Open-ended typed response
                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs sm:text-sm leading-relaxed font-normal relative">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-700 mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>متن تایپ شده توسط {lead.fullName}:</span>
                      </div>
                      <p className="whitespace-pre-wrap">{answerText}</p>
                    </div>
                  ) : (
                    // Multiple choice option selected
                    <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/90 text-emerald-950 flex items-center justify-between gap-2 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm font-extrabold">
                          {answerText}
                        </span>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-lg border border-emerald-200">
                        گزینه انتخابی
                      </span>
                    </div>
                  )
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs text-center">
                    این کاربر پاسخی به این سوال ثبت نکرده است.
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 border-t border-rose-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-500 text-right">
            <span>برای مشاوره با <strong>{lead.fullName}</strong>، می‌توانید از اطلاعات فوق استفاده نمایید.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSummary ? 'کپی شد' : 'کپی کل گزارش'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] text-white text-xs font-bold shadow-sm hover:shadow transition"
            >
              بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
