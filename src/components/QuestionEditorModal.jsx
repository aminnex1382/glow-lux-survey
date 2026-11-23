import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, HelpCircle, Layers, Sparkles } from 'lucide-react';

export default function QuestionEditorModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialQuestion = null 
}) {
  const isEditing = !!initialQuestion;

  const [questionText, setQuestionText] = useState('');
  const [sectionText, setSectionText] = useState('بخش عمومی: نظرات تکمیلی');
  const [badgeText, setBadgeText] = useState('نظرسنجی');
  const [type, setType] = useState('choice'); // 'choice' | 'text'
  const [options, setOptions] = useState(['گزینه اول', 'گزینه دوم', 'گزینه سوم']);
  const [placeholder, setPlaceholder] = useState('پاسخ خود را اینجا بنویسید...');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialQuestion) {
      setQuestionText(initialQuestion.question || '');
      setSectionText(initialQuestion.section || 'بخش عمومی');
      setBadgeText(initialQuestion.sectionBadge || 'سوال');
      setType(initialQuestion.type || 'choice');
      setOptions(Array.isArray(initialQuestion.options) ? [...initialQuestion.options] : ['گزینه ۱', 'گزینه ۲']);
      setPlaceholder(initialQuestion.placeholder || '');
    } else {
      setQuestionText('');
      setSectionText('بخش جدید: سوالات تکمیلی');
      setBadgeText('سوال جدید');
      setType('choice');
      setOptions(['گزینه اول', 'گزینه دوم', 'گزینه سوم']);
      setPlaceholder('پاسخ خود را اینجا بنویسید...');
    }
    setErrorMsg('');
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleAddOption = () => {
    setOptions(prev => [...prev, `گزینه جدید ${prev.length + 1}`]);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setErrorMsg('هر سوال چندگزینه‌ای باید حداقل ۲ گزینه داشته باشد.');
      return;
    }
    setErrorMsg('');
    setOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    setOptions(prev => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setErrorMsg('متن سوال نمی‌تواند خالی باشد.');
      return;
    }

    if (type === 'choice') {
      const cleanOptions = options.map(o => o.trim()).filter(Boolean);
      if (cleanOptions.length < 2) {
        setErrorMsg('لطفاً حداقل ۲ گزینه معتبر وارد کنید.');
        return;
      }

      onSave({
        id: initialQuestion?.id || 'q_' + Date.now().toString(36),
        section: sectionText.trim() || 'بخش عمومی',
        sectionBadge: badgeText.trim() || 'سوال',
        question: questionText.trim(),
        type: 'choice',
        options: cleanOptions
      });
    } else {
      onSave({
        id: initialQuestion?.id || 'q_' + Date.now().toString(36),
        section: sectionText.trim() || 'بخش عمومی',
        sectionBadge: badgeText.trim() || 'تشریحی',
        question: questionText.trim(),
        type: 'text',
        placeholder: placeholder.trim() || 'اینجا بنویسید...',
        required: false
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up border border-rose-100 max-h-[90vh] overflow-y-auto text-right">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-slate-800">
            {isEditing ? 'ویرایش سوال نظرسنجی' : 'افزودن سوال جدید'}
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          می‌توانید صورت سوال، بخش، نوع پاسخ (گزینه‌ای یا تایپی) و گزینه‌ها را تعیین کنید.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                نام بخش / سرفصل:
              </label>
              <input
                type="text"
                value={sectionText}
                onChange={(e) => setSectionText(e.target.value)}
                placeholder="مثال: بخش هفتم: مراقبت مو"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                برچسب کوتاه بخش:
              </label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="مثال: سلامت مو"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              متن کامل سوال:
            </label>
            <textarea
              rows={2}
              value={questionText}
              onChange={(e) => {
                setErrorMsg('');
                setQuestionText(e.target.value);
              }}
              placeholder="مثال: چه نوع محصولی برای روتین روزانه خود بیشتر استفاده می‌کنید؟"
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Question Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              نوع سوال:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('choice')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  type === 'choice' 
                    ? 'bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>چندگزینه‌ای</span>
              </button>

              <button
                type="button"
                onClick={() => setType('text')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                  type === 'text' 
                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>تشریحی / تایپی</span>
              </button>
            </div>
          </div>

          {/* Choice Options List */}
          {type === 'choice' && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  گزینه‌های پاسخ ({options.length}):
                </span>
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                  <span>افزودن گزینه</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`عنوان گزینه ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 focus:border-rose-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      disabled={options.length <= 2}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none transition"
                      title="حذف گزینه"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Placeholder */}
          {type === 'text' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                متن پیش‌فرض داخل کادر (Placeholder):
              </label>
              <input
                type="text"
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                placeholder="مثال: نظرات خود را بنویسید..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-400 outline-none"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] hover:from-[#d1295d] hover:to-[#9f5762] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'ذخیره تغییرات' : 'افزودن به نظرسنجی'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
