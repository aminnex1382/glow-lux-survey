import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Download, 
  Upload, 
  RotateCcw, 
  RefreshCw, 
  ArrowRight, 
  MessageSquare, 
  Award, 
  Code2, 
  Check, 
  Copy,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { QUESTIONS, SURVEY_INFO } from '../data/questions';
import { surveyApi } from '../services/api';

export default function AdminDashboard({ responses, onRefresh, onBackToSurvey }) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'rawJson'
  const [copiedJson, setCopiedJson] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const totalParticipants = responses.length;

  // Compute analytics for each question
  const analytics = useMemo(() => {
    return QUESTIONS.map((q) => {
      if (q.type === 'choice') {
        const optionCounts = {};
        q.options.forEach(opt => {
          optionCounts[opt] = 0;
        });

        let answeredCount = 0;
        responses.forEach(r => {
          const val = r.answers?.[q.id];
          if (val && optionCounts[val] !== undefined) {
            optionCounts[val]++;
            answeredCount++;
          }
        });

        // Find max votes
        let maxVotes = 0;
        let topOption = null;
        Object.entries(optionCounts).forEach(([opt, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            topOption = opt;
          }
        });

        const breakdown = q.options.map(opt => {
          const count = optionCounts[opt] || 0;
          const percentage = answeredCount > 0 ? Math.round((count / answeredCount) * 100) : 0;
          return {
            option: opt,
            count,
            percentage,
            isTop: count === maxVotes && maxVotes > 0
          };
        });

        return {
          ...q,
          answeredCount,
          breakdown,
          topOption
        };
      } else {
        // Text / typed question
        const textEntries = responses
          .map(r => ({
            id: r.id,
            text: r.answers?.[q.id] || '',
            date: r.submittedAt
          }))
          .filter(item => item.text && item.text.trim().length > 0);

        return {
          ...q,
          answeredCount: textEntries.length,
          textEntries
        };
      }
    });
  }, [responses]);

  const handleDownload = () => {
    surveyApi.downloadJson(responses);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await surveyApi.importJson(file);
      onRefresh();
      alert('فایل JSON با موفقیت بارگذاری و جایگزین شد.');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید تمام پاسخ‌های ثبت شده را حذف کنید؟ این عمل غیرقابل بازگشت است.')) {
      setIsResetting(true);
      await surveyApi.resetResponses();
      await onRefresh();
      setIsResetting(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(responses, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'نامشخص';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fa-IR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Filter text responses if Q10
  const q10 = analytics.find(q => q.type === 'text');
  const filteredFeedbacks = q10?.textEntries.filter(item => 
    item.text.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={onBackToSurvey}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-800 mb-2 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فرم نظرسنجی</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 flex items-center gap-2">
            <span>گزارش و تحلیل نظرسنجی</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold">
              GLOW LUX
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            آمار تفکیکی پاسخ‌ها بر اساس سوالات چندگزینه‌ای و نظرات ثبت شده در فایل JSON
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            title="بروزرسانی اطلاعات"
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>دانلود responses.json</span>
          </button>

          <label className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-sm cursor-pointer transition flex items-center gap-1.5">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>بارگذاری JSON</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="پاکسازی تمام داده‌ها"
            className="p-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 shadow-sm transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">کل پاسخ‌دهندگان</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
            {totalParticipants}
            <span className="text-xs font-normal text-slate-500 mr-2">نفر</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">نظرات و پیشنهادات تایپی</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
            {q10?.answeredCount || 0}
            <span className="text-xs font-normal text-slate-500 mr-2">دیدگاه</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">وضعیت ذخیره‌سازی داده‌ها</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>پایگاه داده JSON آنلاین</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            ذخیره خودکار در data/responses.json
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-rose-200/80 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 text-sm font-bold transition relative ${
            activeTab === 'stats' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          تحلیل آماری به تفکیک سوالات
        </button>

        <button
          onClick={() => setActiveTab('rawJson')}
          className={`pb-3 text-sm font-bold transition relative flex items-center gap-1.5 ${
            activeTab === 'rawJson' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>مشاهده فایل خام JSON</span>
        </button>
      </div>

      {/* TAB 1: Statistical Breakdown */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {analytics.map((q, idx) => {
            if (q.type === 'choice') {
              return (
                <div 
                  key={q.id}
                  className="glass-panel-luxury rounded-2xl p-5 sm:p-6 shadow-sm border border-rose-100"
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-rose-100/80">
                    <div>
                      <span className="text-[11px] font-bold text-rose-600 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 inline-block mb-1">
                        {q.section}
                      </span>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                        {idx + 1}. {q.question}
                      </h3>
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      مجموع پاسخ‌ها: <strong className="text-slate-800 font-mono">{q.answeredCount}</strong> نفر
                    </div>
                  </div>

                  {/* Options Percentage and Vote Counts */}
                  <div className="space-y-3">
                    {q.breakdown.map((item, optIdx) => (
                      <div key={optIdx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-2 font-medium text-slate-700">
                            {item.isTop && (
                              <span title="بیشترین انتخاب">
                                <Award className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              </span>
                            )}
                            <span className={item.isTop ? 'font-bold text-slate-900' : ''}>
                              {item.option}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono font-bold">
                            <span className="text-slate-500">{item.count} نفر</span>
                            <span className={`px-2 py-0.5 rounded-md ${
                              item.isTop 
                                ? 'bg-rose-600 text-white shadow-sm' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {item.percentage}٪
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full h-3 bg-rose-50 rounded-full overflow-hidden p-0.5 border border-rose-100/60">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ease-out ${
                              item.isTop 
                                ? 'bg-gradient-to-l from-[#e54576] to-[#b76e79]' 
                                : 'bg-rose-300'
                            }`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Text Question (Q10)
            return (
              <div 
                key={q.id}
                className="glass-panel-luxury rounded-2xl p-5 sm:p-6 shadow-sm border border-purple-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-purple-100">
                  <div>
                    <span className="text-[11px] font-bold text-purple-700 px-2.5 py-0.5 rounded-full bg-purple-50 border border-purple-200 inline-block mb-1">
                      {q.section}
                    </span>
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800">
                      {idx + 1}. {q.question}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    تعداد نظرات ثبت شده: <strong className="text-slate-800 font-mono">{q.textEntries.length}</strong> نظر
                  </div>
                </div>

                {/* Search in feedbacks */}
                {q.textEntries.length > 0 && (
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="جستجو در متن نظرات مخاطبان..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-80 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
                    />
                  </div>
                )}

                {/* List of typed feedbacks */}
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                    {q.textEntries.length === 0 
                      ? 'هنوز نظر متنی ثبت نشده است.' 
                      : 'موردی مطابق با جستجوی شما پیدا نشد.'}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredFeedbacks.map((item, fIdx) => (
                      <div 
                        key={item.id || fIdx} 
                        className="p-4 rounded-xl bg-white/90 border border-slate-200/90 shadow-sm hover:border-purple-200 transition"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.date)}
                          </span>
                          <span className="font-mono text-[10px]">#{fIdx + 1}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Raw JSON View */}
      {activeTab === 'rawJson' && (
        <div className="glass-panel-luxury rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 font-mono">
              data/responses.json ({responses.length} آیتم)
            </span>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-sm"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">کپی شد!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی محتوای JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed" dir="ltr">
            {JSON.stringify(responses, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
