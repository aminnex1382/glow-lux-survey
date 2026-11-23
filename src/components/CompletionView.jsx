import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  User, 
  Phone, 
  Send, 
  Gift, 
  Check,
  UserCheck,
  Heart,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { SURVEY_INFO } from '../data/questions';

export default function CompletionView({ 
  onReset, 
  onSaveContact, 
  isContactSaved,
  personalizedUser 
}) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [submittedContact, setSubmittedContact] = useState(isContactSaved || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Fire festive confetti in rose and gold colors
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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim() && !fullName.trim()) {
      setValidationError('لطفاً حداقل شماره تماس یا نام خود را وارد کنید، یا این بخش را نادیده بگیرید.');
      return;
    }

    setValidationError('');
    setIsSubmitting(true);
    try {
      if (onSaveContact) {
        await onSaveContact({ fullName, phone });
      }
      setSubmittedContact(true);
    } catch (err) {
      alert('خطا در ثبت مشخصات: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 text-center animate-fade-in">
      {/* Thank you card */}
      <div className="glass-panel-luxury rounded-3xl p-6 sm:p-10 shadow-luxury-card relative overflow-hidden mb-6">
        {/* Glow circle */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 p-1 shadow-lg shadow-teal-200 mb-4 flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>نظرسنجی با موفقیت ثبت شد</span>
        </div>

        {/* Personalized Thank you Title if came from personal link */}
        {personalizedUser?.name ? (
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight">
              {personalizedUser.name} عزیز، از همراهی شما بی‌نهایت سپاسگزاریم 💖
            </h2>
            <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm leading-relaxed text-right flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">پاسخ‌های شما با شناسه اختصاصی ثبت گردید.</p>
                <p className="text-[11px] text-emerald-700">
                  دیدگاه‌های ارزشمند شما مستقیماً برای مدیریت کانال ارسال شد و نیازی به وارد کردن هیچ‌گونه شماره یا اطلاعات تماس تکمیلی ندارید.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2 tracking-tight">
              از همراهی پرمهرتان سپاسگزاریم 💖
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6 max-w-md mx-auto">
              پاسخ‌های ارزشمند شما در ارتقای محتوا و انتخاب بهترین محصولات بهداشتی کانال
              {' '}
              <strong className="text-slate-900 font-bold">«{SURVEY_INFO.channelName}»</strong>
              {' '}
              نقش تعیین‌کننده خواهد داشت.
            </p>

            {/* Optional Contact Information Form - ONLY for non-personalized general visitors */}
            <div className="bg-white/80 rounded-2xl p-5 border border-rose-200/80 shadow-sm text-right transition-all mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-rose-600" />
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                    دریافت مشاوره رایگان یا هدایای ویژه کانال
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  کاملاً اختیاری
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                در صورت تمایل، می‌توانید نام و شماره تماس خود را ثبت کنید تا در قرعه‌کشی‌ها، کدهای تخفیف و مشاوره‌های تخصصی محصولات در اولویت قرار بگیرید:
              </p>

              {submittedContact ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center gap-2 animate-fade-in font-medium">
                  <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  <span>مشخصات تماس شما با موفقیت ثبت شد. از اعتمادتان سپاسگزاریم 🌸</span>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      نام و نام خانوادگی (اختیاری):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="مثال: مریم کریمی"
                        className="w-full pr-9 pl-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      شماره موبایل / تماس (اختیاری):
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                        className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50/80 border border-slate-200 focus:bg-white focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none transition text-right"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {validationError && (
                    <p className="text-[11px] text-amber-600 font-medium">
                      {validationError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] hover:from-[#d1295d] hover:to-[#9f5762] text-white font-bold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>در حال ثبت...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>ثبت مشخصات تماس</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Official Channel Contact & Support Box */}
        <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/80 to-amber-50/90 rounded-2xl p-5 border border-rose-200/90 shadow-sm text-right">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">
              ما اینجا هستیم تا به دغدغه‌های واقعی شما پاسخ بدیم 💗
            </h3>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed mb-4 font-normal">
            اگر برای شناخت نیازهای پوست و مو یا انتخاب محصولات مراقبتی مناسب به راهنمایی نیاز دارید، می‌تونید با ما در ارتباط باشید:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Phone button */}
            <a
              href={`tel:${SURVEY_INFO.contactPhone}`}
              className="p-3 rounded-xl bg-white border border-rose-200 shadow-sm flex items-center justify-between gap-2 hover:bg-rose-50 transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">تماس مستقیم:</p>
                  <p className="text-xs font-bold text-slate-800 font-mono" dir="ltr">
                    {SURVEY_INFO.contactPhoneDisplay}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-rose-600 group-hover:scale-105 transition-transform">
                تماس
              </span>
            </a>

            {/* Telegram ID button */}
            <a
              href={SURVEY_INFO.contactIdLink}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-white border border-sky-200 shadow-sm flex items-center justify-between gap-2 hover:bg-sky-50 transition group"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">آیدی ارتباطی در تلگرام:</p>
                  <p className="text-xs font-bold text-sky-700 font-mono" dir="ltr">
                    {SURVEY_INFO.contactId}
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-sky-600 group-hover:scale-105 transition-transform">
                پیام
              </span>
            </a>
          </div>

          <div className="mt-3 text-center border-t border-rose-200/50 pt-2.5">
            <span className="text-[10px] font-bold text-slate-500">
              {SURVEY_INFO.brandName} | {SURVEY_INFO.channelName}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onReset}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ثبت نظر جدید یا شروع مجدد</span>
          </button>
        </div>
      </div>
    </div>
  );
}
