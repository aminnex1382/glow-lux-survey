import React, { useState, useMemo, useEffect } from 'react';
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
  Bell,
  Link2,
  Plus,
  Edit3,
  RotateCcw,
  Share2,
  UserCheck,
  CheckCircle2,
  Clock,
  Layers,
  Eye,
  Server,
  Database,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { surveyApi } from '../services/api';
import { securityService } from '../services/security';
import QuestionEditorModal from './QuestionEditorModal';
import UserAnswersModal from './UserAnswersModal';

export default function AdminDashboard({ 
  responses, 
  questions, 
  dataSource = 'local',
  onUpdateQuestions,
  onResetQuestions,
  onRefresh, 
  onBackToSurvey, 
  onLogout 
}) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'leads' | 'links' | 'questions' | 'rawJson'
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedPhoneIdx, setCopiedPhoneIdx] = useState(null);
  const [copiedAllPhones, setCopiedAllPhones] = useState(false);
  const [copiedLinkRef, setCopiedLinkRef] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);

  // Personalized Links State
  const [personalizedLinks, setPersonalizedLinks] = useState([]);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientNote, setNewRecipientNote] = useState('');
  const [linkCreateSuccess, setLinkCreateSuccess] = useState(null);

  // Question Editor Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatusMsg, setPasswordStatusMsg] = useState({ type: '', text: '' });

  // Telegram settings modal state
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState(surveyApi.getTelegramConfig());
  const [telegramSaved, setTelegramSaved] = useState(false);

  // Server & Backend API settings modal state
  const [showServerModal, setShowServerModal] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(surveyApi.getApiBaseUrl());
  const [serverPingResult, setServerPingResult] = useState(null);
  const [isPingingServer, setIsPingingServer] = useState(false);
  const [isSyncingPending, setIsSyncingPending] = useState(false);
  const [syncResultMsg, setSyncResultMsg] = useState('');

  // Load personalized links and telegram config from PHP backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const links = await surveyApi.fetchPersonalizedLinks();
      if (mounted) setPersonalizedLinks(links);

      const tg = await surveyApi.fetchTelegramConfig();
      if (mounted) setTelegramConfig(tg);
    })();
    return () => { mounted = false; };
  }, []);

  const totalParticipants = responses.length;

  // Filter respondents who provided contact info OR came from personalized link
  const leads = useMemo(() => {
    return responses
      .filter(r => (r.contact && (r.contact.fullName || r.contact.phone)) || r.metadata?.isPersonalized)
      .map(r => ({
        id: r.id,
        fullName: r.metadata?.recipientName || r.contact?.fullName || 'ثبت نشده',
        phone: r.contact?.phone || 'از طریق لینک اختصاصی (بدون دریافت شماره)',
        isPersonalized: !!r.metadata?.isPersonalized,
        refId: r.metadata?.refId || null,
        savedAt: r.contact?.savedAt || r.submittedAt,
        answers: r.answers || {}
      }));
  }, [responses]);

  // Compute analytics for all active questions
  const analytics = useMemo(() => {
    return (questions || []).map((q) => {
      if (q.type === 'choice') {
        const optionCounts = {};
        (q.options || []).forEach(opt => {
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

        const breakdown = (q.options || []).map(opt => {
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
            contactName: r.metadata?.recipientName || r.contact?.fullName || null
          }))
          .filter(item => item.text && item.text.trim().length > 0);

        return {
          ...q,
          answeredCount: textEntries.length,
          textEntries
        };
      }
    });
  }, [responses, questions]);

  // Handle Personalized Link Creation
  const handleCreatePersonalizedLink = async (e) => {
    e.preventDefault();
    if (!newRecipientName.trim()) {
      alert('لطفاً نام مخاطب را وارد کنید.');
      return;
    }

    const created = await surveyApi.createPersonalizedLink(newRecipientName, newRecipientNote);
    const updatedLinks = await surveyApi.fetchPersonalizedLinks();
    setPersonalizedLinks(updatedLinks);
    setNewRecipientName('');
    setNewRecipientNote('');
    setLinkCreateSuccess(created);
    setTimeout(() => setLinkCreateSuccess(null), 5000);
  };

  const getFullShareUrl = (linkObj) => {
    const origin = window.location.origin + window.location.pathname;
    const cleanOrigin = origin.replace(/\/+$/, '');
    const encodedName = encodeURIComponent(linkObj.recipientName);
    return `${cleanOrigin}/?name=${encodedName}&ref=${linkObj.id}`;
  };

  const handleCopyShareLink = (linkObj) => {
    const fullUrl = getFullShareUrl(linkObj);
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkRef(linkObj.id);
    setTimeout(() => setCopiedLinkRef(null), 2000);
  };

  const handleDeletePersonalizedLink = async (id) => {
    if (window.confirm('آیا مطمئن هستید که این لینک اختصاصی حذف شود؟')) {
      const updated = await surveyApi.deletePersonalizedLink(id);
      setPersonalizedLinks(updated);
    }
  };

  // Question Management
  const handleSaveQuestion = (questionData) => {
    if (editingQuestion) {
      // Edit existing
      const updated = questions.map(q => q.id === editingQuestion.id ? questionData : q);
      onUpdateQuestions(updated);
    } else {
      // Add new
      const updated = [...questions, questionData];
      onUpdateQuestions(updated);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId) => {
    if (questions.length <= 1) {
      alert('نظرسنجی باید حداقل ۱ سوال داشته باشد.');
      return;
    }
    if (window.confirm('آیا از حذف این سوال اطمینان دارید؟')) {
      const updated = questions.filter(q => q.id !== questionId);
      onUpdateQuestions(updated);
    }
  };

  const handleResetQuestionsToDefault = () => {
    if (window.confirm('آیا می‌خواهید تمامی سوالات و گزینه‌ها به حالت اولیه کارخانه بازگردانی شوند؟')) {
      onResetQuestions();
      alert('سوالات با موفقیت به حالت پیش‌فرض بازگشتند.');
    }
  };

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
    const phoneList = leads.map(l => l.phone).filter(p => !p.includes('لینک اختصاصی') && p !== 'ثبت نشده').join('\n');
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

  const handleSaveTelegram = async (e) => {
    e.preventDefault();
    await surveyApi.saveTelegramConfig(telegramConfig);
    setTelegramSaved(true);
    setTimeout(() => {
      setTelegramSaved(false);
      setShowTelegramModal(false);
    }, 1500);
  };

  const handleTestServerConnection = async (customUrl) => {
    if (typeof customUrl === 'string') {
      surveyApi.setApiBaseUrl(customUrl);
    }
    setIsPingingServer(true);
    const res = await surveyApi.pingServer();
    setServerPingResult(res);
    setIsPingingServer(false);
    if (res.online) {
      onRefresh();
    }
  };

  const handleSyncPendingData = async () => {
    setIsSyncingPending(true);
    setSyncResultMsg('');
    const result = await surveyApi.syncPendingToServer();
    setIsSyncingPending(false);
    setSyncResultMsg(`تعداد ${result.synced} پاسخ با موفقیت به دیتابیس ارسال شد. (${result.remaining} مورد باقیمانده)`);
    if (result.synced > 0) {
      onRefresh();
    }
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

  // Filter text responses
  const textQuestions = analytics.filter(q => q.type === 'text');

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
            <span>مدیریت و تحلیل پیشرفته نظرسنجی</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 font-bold">
              GLOW LUX
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            آمار پاسخ‌ها، ساخت لینک‌های اختصاصی افراد، ویرایش سوالات و ارسال مستقیم به تلگرام
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setApiUrlInput(surveyApi.getApiBaseUrl());
              setShowServerModal(true);
              handleTestServerConnection();
            }}
            title="وضعیت اتصال به سرور و دیتابیس MySQL"
            className={`px-3 py-2 rounded-xl text-xs font-bold border shadow-sm transition flex items-center gap-1.5 ${
              dataSource === 'server'
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            {dataSource === 'server' ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span>دیتابیس سرور (متصل)</span>
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5 text-amber-600" />
                <span>تنظیمات سرور و SSL</span>
              </>
            )}
          </button>

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
            title="تنظیمات دریافت کامل در تلگرام"
            className="px-3 py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-sm transition flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-sky-600" />
            <span>ارسال کامل به تلگرام</span>
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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
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
            <span className="text-xs font-bold text-slate-500">لینک‌های اختصاصی ساخته‌شده</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {personalizedLinks.length}
            <span className="text-xs font-normal text-slate-500 mr-2">مخاطب VIP</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">مخاطبان ثبت اطلاعات تماس</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
            {leads.length}
            <span className="text-xs font-normal text-slate-500 mr-2">لید و شماره</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-sm border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">تعداد سوالات فعال</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 font-mono">
            {questions.length}
            <span className="text-xs font-normal text-slate-500 mr-2">سوال</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-rose-200/80 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition whitespace-nowrap relative ${
            activeTab === 'stats' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          تحلیل آماری به تفکیک سوالات
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'links' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Link2 className="w-4 h-4 text-emerald-600" />
          <span>سازنده لینک‌های اختصاصی</span>
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-1">
            {personalizedLinks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'questions' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Edit3 className="w-4 h-4 text-rose-500" />
          <span>مدیریت سوالات و جواب‌ها</span>
          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-1">
            {questions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'leads' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Phone className="w-4 h-4 text-amber-500" />
          <span>اطلاعات تماس و لیدها</span>
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full mr-1">
            {leads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rawJson')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold transition whitespace-nowrap relative flex items-center gap-1.5 ${
            activeTab === 'rawJson' 
              ? 'text-rose-700 border-b-2 border-rose-600' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>مشاهده JSON</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: Statistical Breakdown */}
      {/* ========================================================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {analytics.map((q, idx) => {
            if (q.type === 'choice') {
              return (
                <div 
                  key={q.id || idx}
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

            // Text Question
            return (
              <div 
                key={q.id || idx}
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

                {q.textEntries.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                    هنوز نظر متنی برای این سوال ثبت نشده است.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.textEntries
                      .filter(item => item.text.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((item, fIdx) => (
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
                              <button
                                type="button"
                                onClick={() => {
                                  const r = responses.find(res => res.id === item.id);
                                  if (r) {
                                    setSelectedLeadForDetail({
                                      id: r.id,
                                      fullName: item.contactName,
                                      phone: r.contact?.phone || (r.metadata?.isPersonalized ? 'مخاطب لینک اختصاصی' : 'ثبت نشده'),
                                      isPersonalized: !!r.metadata?.isPersonalized,
                                      refId: r.metadata?.refId || null,
                                      savedAt: r.submittedAt,
                                      answers: r.answers || {}
                                    });
                                  }
                                }}
                                className="text-amber-800 font-bold bg-amber-50 hover:bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 text-[11px] flex items-center gap-1 transition cursor-pointer"
                                title="مشاهده تمام پاسخ‌های این فرد"
                              >
                                <Eye className="w-3 h-3 text-amber-600" />
                                <span>{item.contactName}</span>
                              </button>
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

      {/* ========================================================= */}
      {/* TAB 2: Personalized VIP Links Generator & Tracker */}
      {/* ========================================================= */}
      {activeTab === 'links' && (
        <div className="space-y-6">
          {/* Creator Box */}
          <div className="glass-panel-luxury rounded-3xl p-6 shadow-sm border border-emerald-100 text-right">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-slate-800">
                ایجاد لینک اختصاصی برای افراد خاص (VIP)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              با ایجاد لینک اختصاصی، وقتی مخاطب مورد نظر (مثلاً خانم/آقای فلانی) لینک را باز کند، سیستم دقیقاً می‌داند که چه کسی به سوالات پاسخ داده است. در پایان نیز <strong>به هیچ‌وجه از او نام یا شماره تماس گرفته نمی‌شود</strong> و با پیام تشکر اختصاصی همراهی می‌گردد.
            </p>

            <form onSubmit={handleCreatePersonalizedLink} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نام و نام خانوادگی مخاطب:
                </label>
                <input
                  type="text"
                  value={newRecipientName}
                  onChange={(e) => setNewRecipientName(e.target.value)}
                  placeholder="مثال: خانم سمیرا محمدی"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توضیح یا یادداشت (اختیاری):
                </label>
                <input
                  type="text"
                  value={newRecipientNote}
                  onChange={(e) => setNewRecipientNote(e.target.value)}
                  placeholder="مثال: مشتری قدیمی تلگرام / مشاور VIP"
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-400 outline-none"
                />
              </div>

              <div className="sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>ساخت لینک اختصاصی</span>
                </button>
              </div>
            </form>

            {linkCreateSuccess && (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    لینک اختصاصی برای <strong>{linkCreateSuccess.recipientName}</strong> با موفقیت ساخته شد!
                  </span>
                </div>
                <button
                  onClick={() => handleCopyShareLink(linkCreateSuccess)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی لینک اختصاصی</span>
                </button>
              </div>
            )}
          </div>

          {/* Links List */}
          <div className="space-y-3">
            <h4 className="text-sm font-extrabold text-slate-800 flex items-center justify-between">
              <span>فهرست لینک‌های اختصاصی فعال ({personalizedLinks.length}):</span>
            </h4>

            {personalizedLinks.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-xs sm:text-sm border border-slate-200">
                هنوز هیچ لینک اختصاصی ایجاد نکرده‌اید. با وارد کردن نام در کادر بالا، اولین لینک اختصاصی را بسازید.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {personalizedLinks.map((link) => {
                  const shareUrl = getFullShareUrl(link);
                  const isCopied = copiedLinkRef === link.id;

                  // Check if this link has an associated answer in responses
                  const matchedResponse = responses.find(r => r.metadata?.refId === link.id);
                  const isAnswered = link.isAnswered || !!matchedResponse;

                  return (
                    <div 
                      key={link.id}
                      className="glass-panel-luxury rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 hover:border-emerald-200 transition text-right"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800">
                              {link.recipientName}
                            </h4>
                            <span className="text-[10px] text-slate-400">
                              ایجاد شده در: {formatDate(link.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        {isAnswered ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>پاسخ داد</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-500" />
                            <span>در انتظار پاسخ</span>
                          </span>
                        )}
                      </div>

                      {link.note && (
                        <p className="text-xs text-slate-500 mb-3 bg-white/60 p-2 rounded-xl border border-slate-100">
                          📝 {link.note}
                        </p>
                      )}

                      {/* URL Box and Copy */}
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 mb-3">
                        <input
                          type="text"
                          readOnly
                          value={shareUrl}
                          className="text-[11px] text-slate-600 bg-transparent outline-none w-full font-mono truncate"
                          dir="ltr"
                        />
                        <button
                          onClick={() => handleCopyShareLink(link)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 flex-shrink-0 ${
                            isCopied 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'کپی شد' : 'کپی'}</span>
                        </button>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <a
                            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`سلام ${link.recipientName} عزیز، نظرسنجی اختصاصی شما آماده است:`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sky-600 hover:text-sky-800 text-[11px] font-bold flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>ارسال در تلگرام</span>
                          </a>

                          {matchedResponse && (
                            <button
                              onClick={() => {
                                setSelectedLeadForDetail({
                                  id: matchedResponse.id,
                                  fullName: link.recipientName,
                                  phone: 'مخاطب لینک اختصاصی (بدون دریافت شماره)',
                                  isPersonalized: true,
                                  refId: link.id,
                                  savedAt: matchedResponse.submittedAt,
                                  answers: matchedResponse.answers || {}
                                });
                              }}
                              className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 text-[11px] font-bold flex items-center gap-1"
                              title="مشاهده تمام پاسخ‌های این مخاطب"
                            >
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>مشاهده پاسخ‌ها</span>
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeletePersonalizedLink(link.id)}
                          className="text-red-500 hover:text-red-700 text-[11px] font-semibold flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: Dynamic Question & Answer Editor */}
      {/* ========================================================= */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 p-4 rounded-2xl border border-rose-100 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
                مدیریت زنده سوالات و گزینه‌ها
              </h3>
              <p className="text-xs text-slate-500">
                می‌توانید صورت هر سوال را تغییر دهید، گزینه‌ها را کم یا زیاد کنید یا سوال جدید اضافه فرمایید.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  setEditingQuestion(null);
                  setIsQuestionModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] text-white text-xs font-bold shadow-sm hover:shadow transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن سوال جدید</span>
              </button>

              <button
                onClick={handleResetQuestionsToDefault}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center gap-1.5"
                title="بازگشت به ۱۰ سوال اولیه پیش‌فرض"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">بازنشانی پیش‌فرض</span>
              </button>
            </div>
          </div>

          {/* Questions Cards List */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div 
                key={q.id || idx}
                className="glass-panel-luxury rounded-2xl p-5 shadow-sm border border-slate-200 hover:border-rose-200 transition text-right"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 font-bold font-mono text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      {q.section}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {q.type === 'choice' ? 'چندگزینه‌ای' : 'تشریحی (تایپی)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingQuestion(q);
                        setIsQuestionModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                      <span>ویرایش</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      disabled={questions.length <= 1}
                      className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-slate-200 transition disabled:opacity-30"
                      title="حذف سوال"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-sm font-extrabold text-slate-800 mb-3">
                  {q.question}
                </h4>

                {/* Options display */}
                {q.type === 'choice' && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => (
                      <div 
                        key={optIdx}
                        className="px-3 py-2 rounded-xl bg-white/70 border border-slate-200 text-xs text-slate-700 flex items-center gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center font-mono">
                          {optIdx + 1}
                        </span>
                        <span className="font-medium">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'text' && (
                  <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs text-purple-800">
                    ✍️ کادر ورودی متن باز (مخاطب متن دلخواه خود را تایپ می‌کند)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: Contact Leads & VIP Responses */}
      {/* ========================================================= */}
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
                ? 'هنوز هیچ مخاطبی اطلاعات تماس یا پاسخ ثبت نکرده است.' 
                : 'موردی مطابق با جستجوی شما یافت نشد.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredLeads.map((lead, idx) => {
                // Calculate how many answers this lead has
                const answeredCount = Object.keys(lead.answers || {}).filter(k => {
                  const val = lead.answers[k];
                  return val !== undefined && val !== null && val.toString().trim().length > 0;
                }).length;

                return (
                  <div 
                    key={lead.id || idx}
                    className={`glass-panel-luxury rounded-2xl p-5 shadow-sm border transition ${
                      lead.isPersonalized ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-rose-100 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition hover:scale-105 active:scale-95 ${
                            lead.isPersonalized 
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                              : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                          }`}
                          title="مشاهده پاسخ‌ها"
                        >
                          {lead.isPersonalized ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedLeadForDetail(lead)}
                              className="text-right hover:text-rose-600 transition flex items-center gap-1.5 group focus:outline-none"
                              title="کلیک کنید تا تمام جواب‌های این فرد را ببینید"
                            >
                              <h4 className="text-sm font-extrabold text-slate-800 group-hover:text-rose-600 transition-colors">
                                {lead.fullName}
                              </h4>
                              <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                            </button>
                            {lead.isPersonalized && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                💎 اختصاصی
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(lead.savedAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {answeredCount} پاسخ
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          #{idx + 1}
                        </span>
                      </div>
                    </div>

                    {/* Phone action box */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono font-bold text-slate-800" dir="ltr">
                        <Phone className="w-3.5 h-3.5 text-rose-600" />
                        <span>{lead.phone}</span>
                      </div>

                      {!lead.isPersonalized && lead.phone !== 'ثبت نشده' && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
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
                      )}
                    </div>

                    {/* Prominent CTA button to view all answers */}
                    <button
                      type="button"
                      onClick={() => setSelectedLeadForDetail(lead)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-rose-50 via-pink-50 to-rose-50 hover:from-rose-100 hover:to-pink-100 border border-rose-200/90 text-rose-800 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.99] group"
                    >
                      <Eye className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition-transform" />
                      <span>مشاهده پاسخ‌های {lead.fullName} (تمام سوالات)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: Raw JSON View */}
      {/* ========================================================= */}
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

      {/* Question Editor Modal */}
      <QuestionEditorModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
      />

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
              رمز جدید را وارد کنید. این رمز عبور در مرورگر شما به صورت امن ذخیره می‌شود.
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
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-up border border-rose-100 text-right">
            <button
              onClick={() => setShowTelegramModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-sky-600" />
              <h3 className="font-extrabold text-base text-slate-800">ارسال کامل تمام پاسخ‌ها به تلگرام</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              با تنظیم ربات تلگرام، به محض ثبت پاسخ، <strong>تمام سوالات و جواب‌های تک‌تک بخش‌ها به همراه مشخصات فرد یا لینک اختصاصی</strong> مستقیماً به تلگرام شخصی شما فوروارد می‌شود.
            </p>

            <form onSubmit={handleSaveTelegram} className="space-y-3.5">
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
                <label className="block text-xs font-bold text-slate-600 mb-1">Telegram Chat ID (شناسه چت یا اکانت شما):</label>
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
      {/* Modal: Server & Database Connection Settings */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-up border border-rose-100 text-right">
            <button
              onClick={() => setShowServerModal(false)}
              className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-rose-600" />
              <h3 className="font-extrabold text-base text-slate-800">اتصال به بک‌اند PHP و دیتابیس MySQL</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              تنظیم آدرس دامنه سرور بک‌اند و بررسی وضعیت گواهی SSL و همگام‌سازی پاسخ‌ها:
            </p>

            {/* Live Ping Status Card */}
            <div className={`p-3.5 rounded-2xl border mb-4 text-xs ${
              isPingingServer 
                ? 'bg-slate-50 border-slate-200 text-slate-600'
                : serverPingResult?.online 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {isPingingServer ? (
                <div className="flex items-center gap-2 font-bold">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
                  <span>در حال تست ارتباط با سرور...</span>
                </div>
              ) : serverPingResult?.online ? (
                <div className="space-y-1">
                  <div className="font-extrabold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اتصال به سرور و دیتابیس برقرار است!</span>
                  </div>
                  <p className="text-[11px]">
                    نسخه PHP: <code className="font-mono font-bold">{serverPingResult.phpVersion}</code> | جداول فعال: <code className="font-mono font-bold">{serverPingResult.tablesCount}</code>
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>عدم دسترسی مستقیم به بک‌اند</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {serverPingResult?.error || 'سرور پاسخ نداد. پاسخ‌ها به صورت امن در حافظه محلی ذخیره می‌شوند تا زمان اتصال همگام‌سازی شوند.'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">آدرس API بک‌اند:</label>
                <input
                  type="text"
                  value={apiUrlInput}
                  onChange={(e) => setApiUrlInput(e.target.value)}
                  placeholder="http://185.211.57.7/~torqyrai/api"
                  dir="ltr"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTestServerConnection(apiUrlInput)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#e54576] to-[#b76e79] text-white font-bold text-xs shadow-sm transition"
                >
                  ذخیره آدرس و تست اتصال
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const def = 'http://185.211.57.7/~torqyrai/api';
                    setApiUrlInput(def);
                    handleTestServerConnection(def);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  پیش‌فرض
                </button>
              </div>

              {/* Pending offline sync section */}
              {surveyApi.getPendingSyncCount() > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    disabled={isSyncingPending}
                    onClick={handleSyncPendingData}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4" />
                    <span>
                      {isSyncingPending 
                        ? 'در حال ارسال...' 
                        : `همگام‌سازی ${surveyApi.getPendingSyncCount()} پاسخ ذخیره شده با دیتابیس`}
                    </span>
                  </button>
                </div>
              )}

              {syncResultMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {syncResultMsg}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                <strong>نکته اتصال با IP بدون دامنه:</strong> چون گیت‌هاب پیجز روی HTTPS است و آی‌پی هاست گواهی SSL معتبر ندارد (Self-signed)، مرورگرها به‌طور پیش‌فرض درخواست سمت IP را محدود می‌کنند. در صورت عدم اتصال از روی گیت‌هاب، داده‌ها امن در حافظه ذخیره می‌شوند؛ همچنین اگر فایل‌های خروجی بیلد (<code>dist</code>) را مستقیماً در <code>http://185.211.57.7/~torqyrai/</code> قرار دهید، بدون هیچ محدودیت SSL مستقیماً به دیتابیس متصل می‌شود.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Answers Detail Modal */}
      <UserAnswersModal
        isOpen={!!selectedLeadForDetail}
        onClose={() => setSelectedLeadForDetail(null)}
        lead={selectedLeadForDetail}
        questions={questions}
      />
    </div>
  );
}
