import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WelcomeView from './components/WelcomeView';
import QuestionWizard from './components/QuestionWizard';
import CompletionView from './components/CompletionView';
import AdminDashboard from './components/AdminDashboard';
import { QUESTIONS, SURVEY_INFO } from './data/questions';
import { surveyApi } from './services/api';
import { Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome' | 'wizard' | 'completed' | 'admin'
  const [answers, setAnswers] = useState({});
  const [responses, setResponses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataSource, setDataSource] = useState('loading');

  const loadResponses = async () => {
    const result = await surveyApi.fetchResponses();
    setResponses(result.data || []);
    setDataSource(result.source);
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleStartSurvey = () => {
    setAnswers({});
    setCurrentView('wizard');
  };

  const handleSubmitSurvey = async () => {
    setIsSubmitting(true);
    try {
      await surveyApi.submitResponse(answers);
      await loadResponses();
      setCurrentView('completed');
    } catch (err) {
      alert('خطا در ثبت پاسخ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetSurvey = () => {
    setAnswers({});
    setCurrentView('wizard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setView={setCurrentView}
        responseCount={responses.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {currentView === 'welcome' && (
          <WelcomeView
            onStart={handleStartSurvey}
            onOpenAdmin={() => setCurrentView('admin')}
            responseCount={responses.length}
          />
        )}

        {currentView === 'wizard' && (
          <QuestionWizard
            questions={QUESTIONS}
            answers={answers}
            onAnswerChange={handleAnswerChange}
            onSubmit={handleSubmitSurvey}
            isSubmitting={isSubmitting}
          />
        )}

        {currentView === 'completed' && (
          <CompletionView
            onReset={handleResetSurvey}
            onOpenAdmin={() => setCurrentView('admin')}
          />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            responses={responses}
            onRefresh={loadResponses}
            onBackToSurvey={() => setCurrentView('welcome')}
          />
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

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>طراحی شده با عشق و ظرافت برای جامعه زیبایی و سلامتی</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setCurrentView('admin')}
              className="text-rose-600 hover:underline font-semibold"
            >
              داشبورد نتایج ({responses.length})
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">نسخه ۱.۰</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
