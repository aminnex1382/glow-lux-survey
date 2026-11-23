import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import QuestionWizard from './components/QuestionWizard';
import CompletionView from './components/CompletionView';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { 
  SURVEY_INFO, 
  getDynamicQuestions, 
  saveDynamicQuestions, 
  resetDynamicQuestions 
} from './data/questions';
import { surveyApi } from './services/api';
import { securityService } from './services/security';
import { Heart } from 'lucide-react';

// Helper to extract personalized recipient from URL parameters
function parsePersonalizedParams() {
  try {
    // Check search params from URL: ?name=...&ref=...
    const urlParams = new URLSearchParams(window.location.search);
    let name = urlParams.get('name');
    let refId = urlParams.get('ref') || '';

    // Also check hash for parameters: #/?name=...&ref=...
    const hash = window.location.hash || '';
    if (!name && hash.includes('?')) {
      const hashParams = new URLSearchParams(hash.substring(hash.indexOf('?')));
      name = hashParams.get('name');
      refId = hashParams.get('ref') || refId;
    }

    if (name && name.trim()) {
      return {
        name: decodeURIComponent(name.trim()),
        refId: refId.trim()
      };
    }
  } catch (e) {
    console.warn('Failed to parse personalized link params:', e);
  }
  return null;
}

export default function App() {
  // Check if current URL slug is the secret admin path
  const checkIsAdminSlug = () => {
    const hash = (window.location.hash || '').toLowerCase();
    const pathname = (window.location.pathname || '').toLowerCase();
    const search = (window.location.search || '').toLowerCase();

    // Accepted secret slugs: #/admin, #admin, #/glow-admin, #/stats, or ?admin=true
    return (
      hash === '#/admin' ||
      hash === '#admin' ||
      hash === '#/glow-admin' ||
      hash === '#/stats' ||
      pathname.endsWith('/admin') ||
      pathname.endsWith('/glow-admin') ||
      search.includes('admin')
    );
  };

  const [isAdminMode, setIsAdminMode] = useState(checkIsAdminSlug);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(securityService.isAuthenticated());
  const [surveyStep, setSurveyStep] = useState('welcome'); // 'welcome' | 'wizard' | 'completed'
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState(getDynamicQuestions);
  const [personalizedUser, setPersonalizedUser] = useState(parsePersonalizedParams);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState(null);

  // Sync with URL hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminMode(checkIsAdminSlug());
      setPersonalizedUser(parsePersonalizedParams());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const loadResponses = useCallback(async () => {
    const result = await surveyApi.fetchResponses();
    setResponses(result.data || []);
  }, []);

  useEffect(() => {
    loadResponses();
  }, [loadResponses]);

  // Dynamic Question management handlers
  const handleUpdateQuestions = (newQuestions) => {
    saveDynamicQuestions(newQuestions);
    setQuestions(newQuestions);
  };

  const handleResetQuestions = () => {
    const defaults = resetDynamicQuestions();
    setQuestions(defaults);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleStartSurvey = () => {
    setAnswers({});
    setSurveyStep('wizard');
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    try {
      const metadata = personalizedUser ? {
        isPersonalized: true,
        recipientName: personalizedUser.name,
        refId: personalizedUser.refId
      } : null;

      const res = await surveyApi.submitResponse(answers, null, metadata, questions);
      if (res?.savedItem?.id) {
        setLastSubmittedId(res.savedItem.id);
      }
      await loadResponses();
      setSurveyStep('completed');
    } catch (err) {
      alert('خطا در ثبت پاسخ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveContact = async (contactData) => {
    await surveyApi.saveContactInfo(lastSubmittedId, contactData, questions);
    await loadResponses();
  };

  const handleResetSurvey = () => {
    setAnswers({});
    setLastSubmittedId(null);
    setSurveyStep('wizard');
  };

  const handleExitAdmin = () => {
    window.location.hash = '';
    setIsAdminMode(false);
  };

  const handleAdminLogout = () => {
    securityService.setAuthenticated(false);
    setIsAdminAuthenticated(false);
    handleExitAdmin();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={isAdminMode ? 'admin' : 'survey'}
        onExitAdmin={handleExitAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {isAdminMode ? (
          // Admin View: Protected by Password Gate
          !isAdminAuthenticated ? (
            <AdminLogin
              onLoginSuccess={() => setIsAdminAuthenticated(true)}
              onBackToSurvey={handleExitAdmin}
            />
          ) : (
            <AdminDashboard
              responses={responses}
              questions={questions}
              onUpdateQuestions={handleUpdateQuestions}
              onResetQuestions={handleResetQuestions}
              onRefresh={loadResponses}
              onBackToSurvey={handleExitAdmin}
              onLogout={handleAdminLogout}
            />
          )
        ) : (
          // Regular or Personalized Visitor Flow
          <>
            {surveyStep === 'welcome' && (
              <WelcomeView 
                onStart={handleStartSurvey}
                personalizedUser={personalizedUser}
              />
            )}

            {surveyStep === 'wizard' && (
              <QuestionWizard
                questions={questions}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmitSurvey}
                isSubmitting={isSubmitting}
              />
            )}

            {surveyStep === 'completed' && (
              <CompletionView 
                onReset={handleResetSurvey} 
                onSaveContact={handleSaveContact}
                personalizedUser={personalizedUser}
              />
            )}
          </>
        )}
      </main>

      {/* Luxury Footer */}
      <footer className="border-t border-rose-100/80 bg-white/60 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700">{SURVEY_INFO.channelName}</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              GLOW LUX
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a 
              href={`tel:${SURVEY_INFO.contactPhone}`}
              className="text-slate-600 hover:text-rose-600 font-mono font-bold transition"
            >
              📞 {SURVEY_INFO.contactPhoneDisplay}
            </a>
            <span className="text-slate-300">|</span>
            <a 
              href={SURVEY_INFO.contactIdLink}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:text-sky-800 font-mono font-bold transition"
            >
              💬 {SURVEY_INFO.contactId}
            </a>
          </div>

          <div className="text-[11px] text-slate-400">
            تمامی حقوق برای کانال راز زیبایی ماندگار محفوظ است
          </div>
        </div>
      </footer>
    </div>
  );
}
