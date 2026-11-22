import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import QuestionWizard from './components/QuestionWizard';
import CompletionView from './components/CompletionView';
import AdminDashboard from './components/AdminDashboard';
import { QUESTIONS, SURVEY_INFO } from './data/questions';
import { surveyApi } from './services/api';
import { Heart } from 'lucide-react';

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
  const [surveyStep, setSurveyStep] = useState('welcome'); // 'welcome' | 'wizard' | 'completed'
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with URL hash changes (when user manually types the slug into the address bar)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminMode(checkIsAdminSlug());
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
      await surveyApi.submitResponse(answers);
      await loadResponses();
      setSurveyStep('completed');
    } catch (err) {
      alert('خطا در ثبت پاسخ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSurvey = () => {
    setAnswers({});
    setSurveyStep('wizard');
  };

  const handleExitAdmin = () => {
    // Clear admin hash and return to normal site
    window.location.hash = '';
    setIsAdminMode(false);
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
          // Admin Dashboard is ONLY rendered when secret slug is typed in the URL
          <AdminDashboard
            responses={responses}
            onRefresh={loadResponses}
            onBackToSurvey={handleExitAdmin}
          />
        ) : (
          // Regular visitors flow: No admin buttons, completely clean
          <>
            {surveyStep === 'welcome' && (
              <WelcomeView onStart={handleStartSurvey} />
            )}

            {surveyStep === 'wizard' && (
              <QuestionWizard
                questions={QUESTIONS}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleSubmitSurvey}
                isSubmitting={isSubmitting}
              />
            )}

            {surveyStep === 'completed' && (
              <CompletionView onReset={handleResetSurvey} />
            )}
          </>
        )}
      </main>

      {/* Luxury Footer (Clean and without any admin links) */}
      <footer className="border-t border-rose-100/80 bg-white/60 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700">{SURVEY_INFO.channelName}</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              GLOW LUX
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>طراحی شده با عشق و ظرافت برای جامعه زیبایی و سلامتی</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>

          <div className="text-[11px] text-slate-400">
            تمامی حقوق برای کانال راز زیبایی ماندگار محفوظ است
          </div>
        </div>
      </footer>
    </div>
  );
}
