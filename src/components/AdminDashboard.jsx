import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Users, 
  Download, 
  Upload, 
  RefreshCw, 
  ArrowRight, 
  MessageSquare, 
  Award, 
  Code2, 
  Check, 
  Copy, 
  Trash2, 
  Calendar, 
  Sparkles, 
  Phone, 
  User, 
  PhoneCall, 
  Search, 
  Lock, 
  KeyRound, 
  Send, 
  X,
  Settings,
  Bell
} from 'lucide-react';
import { QUESTIONS, SURVEY_INFO } from '../data/questions';
import { surveyApi } from '../services/api';
import { securityService } from '../services/security';

export default function AdminDashboard({ responses, onRefresh, onBackToSurvey, onLogout }) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'leads' | 'rawJson'
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPhoneIdx, setCopiedPhoneIdx] = useState(null);
  const [copiedAllPhones, setCopiedAllPhones] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState({ type: '', text: '' });

  // Telegram settings modal state
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState(surveyApi.getTelegramConfig());
  const [telegramSaved, setTelegramSaved] = useState(false);

  const totalParticipants = responses.length;

  // Filter respondents who provided contact info
  const leads = useMemo(() => {
    return responses
      .filter(r => r.contact && (r.contact.fullName || r.contact.phone))
      .map(r => ({
        id: r.id,
        fullName: r.contact.fullName || 'ثبت نشده',
        phone: r.contact.phone || 'ثبت نشده',
        savedAt: r.contact.savedAt || r.submittedAt,
        answers: r.answers || {}
      }));
  }, [responses]);

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
            date: r.submittedAt,
            contactName: r.contact?.fullName || null
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

  const handleCopyPhone = (phoneNumber, idx) => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhoneIdx(idx);
    setTimeout(() => setCopiedPhoneIdx(null), 2000);
  };

  const handleCopyAllPhones = () => {
    const phoneList = leads.map(l => l.phone).filter(p => p !== 'ثبت نشده').join('\n');
    navigator.clipboard.writeText(phoneList);
    setCopiedAllPhones(true);
    setTimeout(() => setCopiedAllPhones(false), 2500);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatusMsg({ type: 'error', text: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatusMsg({ type: 'error', text: 'تکرار رمز عبور با رمز جدید مطابقت ندارد.' });
      return;
    }

    try {
      await securityService.changePassword(newPassword);
      setPasswordStatusMsg({ type: 'success', text: 'رمز عبور مدیریت با موفقیت تغییر یافت.' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStatusMsg({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setPasswordStatusMsg({ type: 'error', text: err.message });
    }
  };

  const handleSaveTelegram = (e) => {
    e.preventDefault();
    surveyApi.saveTelegramConfig(telegramConfig);
    setTelegramSaved(true);
    setTimeout(() => {
      setTelegramSaved(false);
      setShowTelegramModal(false);
    }, 1500);
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

  // Filter leads
  const filteredLeads = leads.filter(l => 
    l.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
    l.phone.includes(contactSearch)
  );

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
            آمار تفکیکی پاسخ‌ها، نظرات و اطلاعات تماس محرمانه مخاطبان (رمزگذاری‌شده)
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            title="تغییر رمز عبور مدیریت"
            className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-rose-600" />
            <span>تغییر رمز</span>
          </button>

          <button
            onClick={() => setShowTelegramModal(true)}
            title="تنظیمات دریافت در تلگرام"
            className="px-3 py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-sky-600" />
            <span>اطلاع‌رسانی تلگرام</span>
          </button>

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
            <span>دانلود JSON</span>
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

          <button
            onClick={onLogout}
            title="خروج و قفل کردن پنل"
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition flex items-center gap-1"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>قفل پنل</span>
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
            <span className="text-xs font-bold text-slate-500">مخاطبان ثبت اطلاعات تماس (لید)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            {leads.length}
            <span className="text-xs font-normal text-slate-500 mr-2">شماره تماس</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">نظرات و پیشنهادات متنی</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-800 font-mono">
            {q10?.answeredCount || 0}
            <span className="text-xs font-normal text-slate-500 mr-2">دیدگاه</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-rose-200/80 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 text-sm font-bold transition whitespace-nowrap relative ${
            activeTab === 'stats' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          تحلیل آماری به تفکیک سوالات
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 text-sm font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'leads' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>اطلاعات تماس مخاطبان</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-1">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rawJson')}
          className={`pb-3 text-sm font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
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
                          {item.contactName && (
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              {item.contactName}
                            </span>
                          )}
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

      {/* TAB 2: Contact Leads */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 p-4 rounded-2xl border border-rose-100 shadow-sm">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="جستجو بر اساس نام یا شماره تماس..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {leads.length > 0 && (
              <button
                onClick={handleCopyAllPhones}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 flex items-center justify-center gap-1.5 transition"
              >
                {copiedAllPhones ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تمامی شماره‌ها کپی شدند!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی لیست شماره‌ها (جهت پیامک)</span>
                  </>
                )}
              </button>
            )}
          </div>

          {filteredLeads.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-sm border border-slate-200">
              {leads.length === 0 
                ? 'هنوز هیچ مخاطبی اطلاعات تماس خود را ثبت نکرده است.' 
                : 'موردی مطابق با جستجوی شما یافت نشد.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLeads.map((lead, idx) => (
                <div 
                  key={lead.id || idx}
                  className="glass-panel-luxury rounded-2xl p-5 shadow-sm border border-rose-100 hover:border-rose-300 transition"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-100 to-amber-100 flex items-center justify-center text-rose-700 font-bold text-sm">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">
                          {lead.fullName}
                        </h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lead.savedAt)}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      #{idx + 1}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold text-slate-800" dir="ltr">
                      <Phone className="w-3.5 h-3.5 text-rose-600" />
                      <span>{lead.phone}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopyPhone(lead.phone, idx)}
                        className="px-2 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold text-slate-600 flex items-center gap-1 transition"
                      >
                        {copiedPhoneIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">کپی شد</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>کپی</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`tel:${lead.phone}`}
                        className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                        title="تماس مستقیم"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-1 bg-white/70 p-2.5 rounded-xl border border-rose-50">
                    <p className="font-bold text-[10px] text-slate-400">گزیده‌ای از پاسخ‌های ثبت‌شده:</p>
                    {lead.answers.q1 && (
                      <p className="truncate">▫️ <strong>دغدغه اندام:</strong> {lead.answers.q1}</p>
                    )}
                    {lead.answers.q5 && (
                      <p className="truncate">▫️ <strong>دغدغه مو:</strong> {lead.answers.q5}</p>
                    )}
                    {lead.answers.q10 && (
                      <p className="truncate text-rose-700 font-medium">▫️ <strong>نظر کاربر:</strong> {lead.answers.q10}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Raw JSON View */}
      {activeTab === 'rawJson' && (
        <div className="glass-panel-luxury rounded-2xl p-5 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 font-mono">
              داده‌های امن ({responses.length} پاسخ ثبت‌شده)
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

      {/* Modal: Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-scale-up border border-rose-100">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-base text-slate-800">تغییر رمز عبور مدیریت</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              رمز جدید را وارد کنید. این رمز عبور در مرورگر شما رمزنگاری و ذخیره می‌شود.
            </p>

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">رمز عبور جدید:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="حداقل ۶ کاراکتر..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">تکرار رمز عبور جدید:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="تکرار رمز جدید..."
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-rose-400 outline-none"
                />
              </div>

              {passwordStatusMsg.text && (
                <div className={`p-2.5 rounded-xl text-xs font-bold ${
                  passwordStatusMsg.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordStatusMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] text-white font-bold text-xs shadow-sm hover:shadow transition"
              >
                ذخیره رمز عبور جدید
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Telegram Notifications */}
      {showTelegramModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-up border border-rose-100">
            <button
              onClick={() => setShowTelegramModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-sky-600" />
              <h3 className="font-extrabold text-base text-slate-800">دریافت فوری پاسخ‌ها در تلگرام</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              با تنظیم توکن ربات تلگرام و Chat ID خود، به محض ثبت پاسخ یا شماره تماس جدید توسط مخاطبان، یک پیام خصوصی فوری در تلگرام دریافت می‌کنید. اطلاعات کاملاً محرمانه مانده و در گیت‌هاب عمومی ذخیره نمی‌شود.
            </p>

            <form onSubmit={handleSaveTelegram} className="space-y-3.5 text-right">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Telegram Bot Token:</label>
                <input
                  type="text"
                  value={telegramConfig.botToken}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value.trim() })}
                  placeholder="مثال: 123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-400 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Telegram Chat ID (شناسه عددی شما):</label>
                <input
                  type="text"
                  value={telegramConfig.chatId}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value.trim() })}
                  placeholder="مثال: 987654321"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-sky-400 outline-none font-mono"
                />
              </div>

              {telegramSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  تنظیمات تلگرام با موفقیت ذخیره شد!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition"
              >
                ذخیره تنظیمات تلگرام
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
