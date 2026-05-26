import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Compass,
  FileText,
  Briefcase,
  Brain,
  TrendingUp,
  User,
  GraduationCap,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Play,
  ArrowRight,
  RotateCcw,
  Plus,
  Loader2,
  Copy,
  Check,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { sampleProfiles, SampleProfileItem } from './components/SampleProfiles';
import {
  UserProfile,
  AcademicYear,
  ChatMessage,
  CareerPathSuggestion,
  ResumeDefect,
  JobMatch,
  InterviewQuestionEvaluation,
  MockInterview
} from './types';

// Default empty profile
const DEFAULT_PROFILE: UserProfile = {
  major: "Business Administration",
  year: "Junior",
  experience: "Junior analyst intern at local retail shop for 4 months. Coordinated class presentation on marketing strategies.",
  strengths: "Statistical projection, MS Excel formulation, public presentations, fast team synthesizer.",
  intentions: "Seeking corporate internship roles in operations, marketing, or general business analytics."
};

export default function App() {
  // Navigation & Primary state
  const [activeTab, setActiveTab] = useState<'profile' | 'career' | 'resume' | 'interview' | 'chat'>('profile');
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Resume state
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeDefects, setResumeDefects] = useState<ResumeDefect[] | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatch[] | null>(null);

  // Career paths state
  const [careerSuggestions, setCareerSuggestions] = useState<CareerPathSuggestion[] | null>(null);
  const [activeCareerPathDetail, setActiveCareerPathDetail] = useState<number | null>(null);

  // Interview state
  const [mockInterview, setMockInterview] = useState<MockInterview>({
    active: false,
    jobTitle: '',
    company: '',
    currentQuestionIndex: 0,
    questions: [],
    evaluations: [],
    finished: false
  });
  const [interviewJobInput, setInterviewJobInput] = useState<string>('');
  const [interviewCompanyInput, setInterviewCompanyInput] = useState<string>('');
  const [currentAnswerInput, setCurrentAnswerInput] = useState<string>('');

  // General Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am your AI University Career Advisor. How can I help you today? I can help analyze your major, review your resume for formatting defects, match you to jobs, or run a fully graded Mock Interview session. To get the best results, start by updating your profile or loading one of our sophomore/senior demo cases!",
      module: 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Loading/Spinner indicators
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isAnalyzingCareer, setIsAnalyzingCareer] = useState(false);
  const [isAuditingResume, setIsAuditingResume] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState(false);
  const [isCreatingSummary, setIsCreatingSummary] = useState(false);
  const [isSendingChatMessage, setIsSendingChatMessage] = useState(false);

  // API error indicator
  const [apiError, setApiError] = useState<string | null>(null);

  // Success notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load state from localStorage on boot
  useEffect(() => {
    const savedProfile = localStorage.getItem('career_advisor_profile');
    const savedCareer = localStorage.getItem('career_advisor_suggestions');
    const savedResumeText = localStorage.getItem('career_advisor_resume_text');
    const savedDefects = localStorage.getItem('career_advisor_resume_defects');
    const savedMatches = localStorage.getItem('career_advisor_job_matches');
    const savedChat = localStorage.getItem('career_advisor_chat_messages');
    const savedInterview = localStorage.getItem('career_advisor_interview');

    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedCareer) setCareerSuggestions(JSON.parse(savedCareer));
    if (savedResumeText) setResumeText(savedResumeText);
    if (savedDefects) setResumeDefects(JSON.parse(savedDefects));
    if (savedMatches) setJobMatches(JSON.parse(savedMatches));
    if (savedChat) setChatMessages(JSON.parse(savedChat));
    if (savedInterview) setMockInterview(JSON.parse(savedInterview));
  }, []);

  // Sync state functions
  const saveProfileToLocalStorage = (newProfile: UserProfile) => {
    localStorage.setItem('career_advisor_profile', JSON.stringify(newProfile));
    showToast("Advisor database updated with new academic stats!");
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const clearPersistence = () => {
    localStorage.clear();
    setProfile(DEFAULT_PROFILE);
    setResumeText('');
    setResumeDefects(null);
    setJobMatches(null);
    setCareerSuggestions(null);
    setActiveCareerPathDetail(null);
    setMockInterview({
      active: false,
      jobTitle: '',
      company: '',
      currentQuestionIndex: 0,
      questions: [],
      evaluations: [],
      finished: false
    });
    setChatMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Advisor memory reset successfully. Your student profile, interview simulations, and resume suggestions have been cleared.",
        module: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    showToast("All stored academic sessions purged.");
  };

  // Preset demo profile loader
  const handleLoadSample = (sample: SampleProfileItem) => {
    setProfile(sample.profile);
    setResumeText(sample.resumeText);
    localStorage.setItem('career_advisor_profile', JSON.stringify(sample.profile));
    localStorage.setItem('career_advisor_resume_text', sample.resumeText);

    // Reset old stats to match sample
    setResumeDefects(null);
    setJobMatches(null);
    setCareerSuggestions(null);
    setActiveCareerPathDetail(null);
    setMockInterview({
      active: false,
      jobTitle: '',
      company: '',
      currentQuestionIndex: 0,
      questions: [],
      evaluations: [],
      finished: false
    });

    showToast(`Loaded ${sample.name}'s Academic Data.`);
    setActiveTab('profile');
  };

  // -------------------------------------------------------------
  // API Call: Career Path Prediction
  // -------------------------------------------------------------
  const handleAnalyzeCareerPaths = async () => {
    setIsAnalyzingCareer(true);
    setApiError(null);
    try {
      const response = await fetch('/api/career/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed call to career analyze API.');
      }

      const paths = await response.json();
      setCareerSuggestions(paths);
      localStorage.setItem('career_advisor_suggestions', JSON.stringify(paths));
      setActiveCareerPathDetail(0); // auto select first
      showToast("Personalized Career Path matrix generated!");
    } catch (err: any) {
      setApiError(err.message || 'System encountered error.');
    } finally {
      setIsAnalyzingCareer(false);
    }
  };

  // -------------------------------------------------------------
  // API Call: Resume Auditor & Job Matcher
  // -------------------------------------------------------------
  const handleAuditeResume = async () => {
    if (!resumeText.trim()) {
      setApiError("Please type or paste some resume text first, or click a Sample Profile from the sidebar.");
      return;
    }

    setIsAuditingResume(true);
    setApiError(null);
    try {
      const response = await fetch('/api/resume/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, resumeText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to review resume.');
      }

      const result = await response.json();
      setResumeDefects(result.defects || []);
      setJobMatches(result.jobMatches || []);

      localStorage.setItem('career_advisor_resume_text', resumeText);
      localStorage.setItem('career_advisor_resume_defects', JSON.stringify(result.defects));
      localStorage.setItem('career_advisor_job_matches', JSON.stringify(result.jobMatches));

      // Prep mock interview values with first matched job automatically if exists
      if (result.jobMatches && result.jobMatches.length > 0) {
        setInterviewJobInput(result.jobMatches[0].title);
        setInterviewCompanyInput(result.jobMatches[0].company || 'Fictional Co.');
      }

      showToast("Resume parsed & structural defects indexed successfully!");
    } catch (err: any) {
      setApiError(err.message || 'Error occurred during resume audit.');
    } finally {
      setIsAuditingResume(false);
    }
  };

  // -------------------------------------------------------------
  // API Calls: Interview Simulator
  // -------------------------------------------------------------
  const handleStartMockInterview = async () => {
    if (!interviewJobInput.trim()) {
      setApiError("Please fill out what job role you want to interview for.");
      return;
    }

    setIsStartingInterview(true);
    setApiError(null);
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          jobTitle: interviewJobInput,
          companyName: interviewCompanyInput || 'Dream Target Firm'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed starting mock interview.');
      }

      const result = await response.json();
      const initialInt: MockInterview = {
        active: true,
        jobTitle: result.jobTitle,
        company: result.company || 'Dream Target Firm',
        currentQuestionIndex: 0,
        questions: result.questions || [],
        evaluations: [],
        finished: false
      };

      setMockInterview(initialInt);
      localStorage.setItem('career_advisor_interview', JSON.stringify(initialInt));
      setCurrentAnswerInput('');
      showToast("Mock Interview started! The recruiter is waiting.");
    } catch (err: any) {
      setApiError(err.message || 'Could not instantiate mock interview.');
    } finally {
      setIsStartingInterview(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!currentAnswerInput.trim()) {
      setApiError("Your answer cannot be blank. Tell the supervisor your experience!");
      return;
    }

    setIsEvaluatingAnswer(true);
    setApiError(null);
    try {
      const currentQuestion = mockInterview.questions[mockInterview.currentQuestionIndex];
      const response = await fetch('/api/interview/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion,
          userAnswer: currentAnswerInput,
          profile,
          jobTitle: mockInterview.jobTitle
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Recruiter failed to evaluate response.');
      }

      const evaluationResult = await response.json();
      const newEvaluation: InterviewQuestionEvaluation = {
        question: currentQuestion,
        userAnswer: currentAnswerInput,
        rating: evaluationResult.rating,
        feedback: evaluationResult.feedback,
        idealAnswer: evaluationResult.idealAnswer
      };

      const updatedEvaluations = [...mockInterview.evaluations, newEvaluation];
      const nextIndex = mockInterview.currentQuestionIndex + 1;
      const isFinished = nextIndex >= mockInterview.questions.length;

      let updatedInt: MockInterview = {
        ...mockInterview,
        evaluations: updatedEvaluations,
        currentQuestionIndex: nextIndex,
        finished: isFinished
      };

      if (isFinished) {
        // Trigger composite score and summary right away!
        setIsCreatingSummary(true);
        const summResponse = await fetch('/api/interview/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            evaluations: updatedEvaluations,
            jobTitle: mockInterview.jobTitle,
            companyName: mockInterview.company,
            profile
          }),
        });

        if (summResponse.ok) {
          const summaryData = await summResponse.json();
          updatedInt.overallScore = summaryData.overallScore;
          updatedInt.overallSummary = summaryData.overallSummary;
        }
        setIsCreatingSummary(false);
      }

      setMockInterview(updatedInt);
      localStorage.setItem('career_advisor_interview', JSON.stringify(updatedInt));
      setCurrentAnswerInput('');
      showToast(isFinished ? "Interview complete! Report compiling." : "Answer graded. Next question loaded.");
    } catch (err: any) {
      setApiError(err.message || 'Error communicating evaluation results from target recruiter.');
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  const handleResetInterview = () => {
    const freshInt = {
      active: false,
      jobTitle: '',
      company: '',
      currentQuestionIndex: 0,
      questions: [],
      evaluations: [],
      finished: false
    };
    setMockInterview(freshInt);
    localStorage.removeItem('career_advisor_interview');
    showToast("Interview simulator reset. Ready for next simulation.");
  };

  // -------------------------------------------------------------
  // API Call: General Q&A Chat
  // -------------------------------------------------------------
  const handleSendChatMessage = async (presetPrompt?: string) => {
    const textToSend = presetPrompt || chatInput;
    if (!textToSend.trim()) return;

    // Push student message instantly
    const studentMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      module: 'general',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, studentMsg];
    setChatMessages(updatedMessages);
    if (!presetPrompt) setChatInput('');
    setIsSendingChatMessage(true);
    setApiError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          messages: updatedMessages.slice(-8), // send last 8 messages for context to optimize speed
          module: 'general'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Advisor terminal offline.');
      }

      const data = await response.json();
      const advisorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        module: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalMessages = [...updatedMessages, advisorMsg];
      setChatMessages(finalMessages);
      localStorage.setItem('career_advisor_chat_messages', JSON.stringify(finalMessages));
    } catch (err: any) {
      setApiError(err.message || 'Failed connecting to Advisor brain.');
    } finally {
      setIsSendingChatMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg border border-emerald-400 font-medium flex items-center gap-2"
          >
            <CheckCircle2 size={18} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {apiError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 flex flex-col gap-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle size={36} className="shrink-0" />
                <h3 className="text-xl font-bold font-sans">Advisor Server Notification</h3>
              </div>
              <p className="text-slate-600 font-sans text-sm">{apiError}</p>
              <button
                id="close-error-btn"
                onClick={() => setApiError(null)}
                className="w-full mt-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition"
              >
                Acknowledge and Continue
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 text-white p-2.5 rounded-xl">
              <GraduationCap size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-sans tracking-tight">AI Career Advisor Agent</h1>
                <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-1.5 py-0.5 rounded-full font-mono">
                  Final Project MVP
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">Graduation Milestones & Undergraduate Strategy Tracker</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-persistence-btn"
              onClick={clearPersistence}
              title="Reset state memory"
              className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
            >
              <RotateCcw size={16} />
            </button>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline border-l border-slate-200 pl-3">
              Server API Status: <span className="text-emerald-500 font-semibold">● ACTIVE</span>
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT & SIDEBAR SPLIT */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* LEFT COMPACT SIDEBAR: User Active Profile Snapshot & Presets */}
        <aside id="sidebar-presets" className="w-full md:w-80 shrink-0 flex flex-col gap-6">
          
          {/* PROFILE SNAPSHOT CARD */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-indigo-600" />
                <h2 className="font-bold text-slate-800 text-sm">Advisor Sandbox Context</h2>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
                {profile.year}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-xs">
              <div>
                <span className="text-slate-400 block font-mono font-semibold uppercase tracking-wider text-[10px]">Student Major</span>
                <span className="text-slate-900 font-medium">{profile.major || 'None loaded'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono font-semibold uppercase tracking-wider text-[10px]">Target Intentions</span>
                <span className="text-slate-700 block line-clamp-2 italic">"{profile.intentions || 'None specified'}"</span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono font-semibold uppercase tracking-wider text-[10px]">Skills Strength</span>
                <span className="text-indigo-900 truncate block font-medium">
                  {profile.strengths ? profile.strengths : 'Add tags in config'}
                </span>
              </div>
            </div>

            <button
              id="quick-goto-profile-btn"
              onClick={() => setActiveTab('profile')}
              className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/50 py-2 rounded-xl transition font-medium cursor-pointer"
            >
              Configure Student Profile
            </button>
          </div>

          {/* PRESENTS SELECTOR MODULE */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400">
                <Sparkles size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Academic Case Studies</h3>
              </div>
              <h4 className="text-sm font-semibold text-white mt-1">Instant Demo Profiles</h4>
              <p className="text-xs text-slate-400 mt-1">Reviewers: Select a student below to instantly trigger complex simulation outcomes.</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {sampleProfiles.map((item, index) => (
                <button
                  id={`sample-profile-${index}`}
                  key={item.name}
                  onClick={() => handleLoadSample(item)}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 hover:translate-x-1 transition text-left cursor-pointer group border border-transparent hover:border-slate-700"
                >
                  <span className="text-2xl pt-0.5 bg-slate-700 rounded-lg p-1 group-hover:bg-indigo-900 transition">{item.avatar}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white text-xs group-hover:text-indigo-300 transition">{item.name}</span>
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300">{item.role}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* UNIVERSITY MILESTONE CHECKBOX */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col gap-3 font-sans">
            <h3 className="font-bold text-xs text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" />
              <span>Graduation Readiness Tracker</span>
            </h3>
            <ul className="text-xs text-slate-600 flex flex-col gap-2">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-sm">✔</span>
                <span>Resume audit report drafted</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={careerSuggestions ? "text-emerald-500 font-mono text-sm" : "text-slate-300 font-mono text-sm"}>
                  {careerSuggestions ? "✔" : "○"}
                </span>
                <span>Personalized Career Roadmaps reviewed</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={mockInterview.evaluations.length > 0 ? "text-emerald-500 font-mono text-sm" : "text-slate-300 font-mono text-sm"}>
                  {mockInterview.evaluations.length > 0 ? "✔" : "○"}
                </span>
                <span>Active STAR simulation passed</span>
              </li>
              <li className="flex items-center gap-2">
                <span className={chatMessages.length > 1 ? "text-emerald-500 font-mono text-sm" : "text-slate-300 font-mono text-sm"}>
                  {chatMessages.length > 1 ? "✔" : "○"}
                </span>
                <span>Ask-Advisor open consultation initialized</span>
              </li>
            </ul>
          </div>

        </aside>

        {/* RIGHT MAIN VIEWPORT PANEL */}
        <main id="main-portfolio-dashboard" className="flex-grow flex flex-col md:min-w-0 bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
          
          {/* TOP PRIMARY NAVIGATION TABS */}
          <div className="bg-slate-50 border-b border-slate-200 flex overflow-x-auto scrollbar-none shrink-0">
            <button
              id="tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 py-4 px-5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 hover:bg-slate-100/50 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <User size={16} />
              <span>Academic Setup</span>
            </button>
            <button
              id="tab-career"
              onClick={() => setActiveTab('career')}
              className={`flex items-center gap-2 py-4 px-5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 hover:bg-slate-100/50 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'career'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <Compass size={16} />
              <span>Career Analysis</span>
            </button>
            <button
              id="tab-resume"
              onClick={() => setActiveTab('resume')}
              className={`flex items-center gap-2 py-4 px-5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 hover:bg-slate-100/50 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'resume'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <FileText size={16} />
              <span>Resume Suggestions</span>
              {resumeDefects && resumeDefects.length > 0 && (
                <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {resumeDefects.length}
                </span>
              )}
            </button>
            <button
              id="tab-interview"
              onClick={() => setActiveTab('interview')}
              className={`flex items-center gap-2 py-4 px-5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 hover:bg-slate-100/50 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'interview'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <Briefcase size={16} />
              <span>Interview Simulation</span>
              {mockInterview.active && !mockInterview.finished && (
                <span className="text-[10px] bg-indigo-600 text-white font-bold p-1 rounded-full w-2 h-2 shrink-0 animate-pulse" />
              )}
            </button>
            <button
              id="tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 py-4 px-5 font-sans text-xs font-semibold uppercase tracking-wider border-b-2 hover:bg-slate-100/50 transition whitespace-nowrap cursor-pointer ${
                activeTab === 'chat'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-600'
              }`}
            >
              <MessageSquare size={16} />
              <span>Q&A Chat Advisor</span>
            </button>
          </div>

          {/* VIEWPORT AREA RESPONDING TO STATE ACTIVE TAB */}
          <div className="flex-1 p-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: ACADEMIC PROFILE CONFIGURATION */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Academic Profile Builder</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Configure your major, personal experience, skills, and target intentions to enable deep context-aware advisor reviews.
                    </p>
                  </div>

                  {/* FORM FIELDS */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">College Major</label>
                      <input
                        type="text"
                        value={profile.major}
                        onChange={(e) => setProfile({ ...profile, major: e.target.value })}
                        placeholder="e.g., Finance & Quantitative Analytics"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Current Academic Year</label>
                      <select
                        value={profile.year}
                        onChange={(e) => setProfile({ ...profile, year: e.target.value as AcademicYear })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                      >
                        <option value="Freshman">Freshman (1st Year)</option>
                        <option value="Sophomore">Sophomore (2nd Year)</option>
                        <option value="Junior">Junior (3rd Year)</option>
                        <option value="Senior">Senior (4th Year)</option>
                        <option value="Sub-grad">Postgraduate / Masters</option>
                        <option value="Fresh Graduate">Fresh Graduate (Alumnus)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center justify-between">
                        <span>Personal Experience & Key Coursework</span>
                        <span className="text-[10px] text-slate-400 font-normal">Projects, internships, campus clubs</span>
                      </label>
                      <textarea
                        value={profile.experience}
                        onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                        placeholder="Write projects, homework achievements, or team roles you completed..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:focus:border-indigo-500 transition text-sm text-slate-700 leading-relaxed"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center justify-between">
                        <span>Key Talents & hard skills</span>
                        <span className="text-[10px] text-slate-400 font-normal">Software, languages, soft-skills</span>
                      </label>
                      <input
                        type="text"
                        value={profile.strengths}
                        onChange={(e) => setProfile({ ...profile, strengths: e.target.value })}
                        placeholder="e.g., Python, Figma, financial analysis, public presentations"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wide text-slate-500 flex items-center justify-between">
                        <span>Career Goals & Role Preferences</span>
                        <span className="text-[10px] text-slate-400 font-normal">Target industries, ideal companies</span>
                      </label>
                      <input
                        type="text"
                        value={profile.intentions}
                        onChange={(e) => setProfile({ ...profile, intentions: e.target.value })}
                        placeholder="e.g., Tech Product Management, Biotech laboratories sales, corporate operations"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
                    <button
                      id="save-profile-btn"
                      onClick={() => {
                        saveProfileToLocalStorage(profile);
                        setActiveTab('career');
                      }}
                      className="bg-indigo-600 text-white font-semibold font-sans px-6 py-2.5 rounded-xl hover:bg-indigo-700 hover:shadow-md active:bg-indigo-800 transition text-sm cursor-pointer"
                    >
                      Save Profile & Analyze Career Paths
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PORTFOLIO CAREER PATH SUGGESTIONS */}
              {activeTab === 'career' && (
                <motion.div
                  key="career-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight flex items-center gap-2">
                        <Compass className="text-indigo-600" />
                        <span>Predictive Career Planning Roadmap</span>
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        AI-powered matching matrix analyzing industry stats, required skills, and growth indicators.
                      </p>
                    </div>

                    <button
                      id="trigger-career-analyze-btn"
                      onClick={handleAnalyzeCareerPaths}
                      disabled={isAnalyzingCareer}
                      className="bg-indigo-600 text-white font-sans font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition text-xs shrink-0 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isAnalyzingCareer ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Generating roadmap...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>Run Personalized Roadmap</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* EMPTY STATE */}
                  {!careerSuggestions ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 bg-slate-50">
                      <div className="bg-white p-3.5 rounded-full shadow-xs border border-slate-100">
                        <Compass size={32} className="text-slate-400" />
                      </div>
                      <div className="max-w-md">
                        <h3 className="font-sans font-bold text-slate-800 text-base">Roadmap Not Formulated Yet</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Click the matching command in the top right to query Gemini AI. It evaluates your current major ({profile.major}) and aspirations and proposes 3 tailored directions.
                        </p>
                      </div>
                      <button
                        id="empty-trigger-career-btn"
                        onClick={handleAnalyzeCareerPaths}
                        disabled={isAnalyzingCareer}
                        className="bg-indigo-600 text-white font-sans font-semibold text-xs py-2 px-5 rounded-xl mt-1 hover:bg-indigo-700 transition cursor-pointer"
                      >
                        Launch Advisor Calculation
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: suggestions list */}
                      <div className="lg:col-span-5 flex flex-col gap-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-1">Suitable Career Paths</h3>
                        {careerSuggestions.map((pathItem, index) => (
                          <button
                            id={`career-suggestion-item-${index}`}
                            key={pathItem.title}
                            onClick={() => setActiveCareerPathDetail(index)}
                            className={`w-full text-left p-4 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                              activeCareerPathDetail === index
                                ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                                : 'bg-white hover:bg-slate-100/55 border-slate-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-900 text-sm leading-tight group-hover:text-indigo-600">
                                {pathItem.title}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                pathItem.matchScore > 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                Match: {pathItem.matchScore}%
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-normal">
                              {pathItem.description}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                              <span>Outlook: {pathItem.marketOutlook}</span>
                              <span className="font-semibold text-slate-600">{pathItem.salaryRange}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Right: Path detailed roadmap view */}
                      {activeCareerPathDetail !== null && careerSuggestions[activeCareerPathDetail] && (
                        <div className="lg:col-span-7 bg-white border border-indigo-100 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
                          {(() => {
                            const selectedPath = careerSuggestions[activeCareerPathDetail];
                            return (
                              <>
                                <div className="border-b border-slate-100 pb-3 flex justify-between items-start gap-4">
                                  <div>
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                                      Curated Path Overview
                                    </span>
                                    <h4 className="text-base font-bold text-slate-900 mt-1">{selectedPath.title}</h4>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] block text-slate-400 font-mono font-semibold uppercase">Est. Base Salary</span>
                                    <span className="text-sm font-bold text-indigo-600 font-sans">{selectedPath.salaryRange}</span>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                                    <Info size={14} className="text-indigo-600" />
                                    <span>AI Placement Analysis</span>
                                  </span>
                                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                                    {selectedPath.description}
                                  </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  
                                  {/* Required Skills */}
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                                      <TrendingUp size={14} className="text-indigo-600" />
                                      <span>Core Skills Target Map</span>
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {selectedPath.requiredSkills.map((sk: string) => (
                                        <span key={sk} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium border border-slate-200">
                                          {sk}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Advised certificates */}
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                                      <Award size={14} className="text-indigo-600" />
                                      <span>Target Certifications</span>
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 font-mono">
                                      {selectedPath.recommendedCertifications.map((crt: string) => (
                                        <span key={crt} className="text-[10px] bg-indigo-50/50 text-indigo-700 px-2 py-1 rounded-md font-semibold border border-indigo-100">
                                          {crt}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                </div>

                                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Industry Outlook:</span>
                                    <span className={`font-semibold ${
                                      selectedPath.marketOutlook === 'Increasingly Growing' ? 'text-emerald-600' : 'text-amber-600'
                                    }`}>{selectedPath.marketOutlook}</span>
                                  </div>

                                  <button
                                    id="career-start-interview-shortcut-btn"
                                    onClick={() => {
                                      setInterviewJobInput(selectedPath.title);
                                      setInterviewCompanyInput("Tech Industry Hub");
                                      setActiveTab('interview');
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                                  >
                                    <span>Configure Mock Interview</span>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}

                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB 3: RESUME CRITICS & OPINION ENGINE */}
              {activeTab === 'resume' && (
                <motion.div
                  key="resume-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Interactive Resume Revision Engine</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Paste details of your college resume. The parser indexes grammatical gaps, passive action-verbs, and structural omissions.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left panel: input text block */}
                    <div className="lg:col-span-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Resume Plain Text</label>
                        <button
                          id="resume-paste-sample-btn"
                          disabled={isAuditingResume}
                          onClick={() => {
                            // Find corresponding resume from samples if names align
                            const currentSample = sampleProfiles.find(s => s.profile.major === profile.major) || sampleProfiles[0];
                            setResumeText(currentSample.resumeText);
                            showToast("Loaded matching template resume.");
                          }}
                          className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer font-medium"
                        >
                          Fill Sample Template Resume
                        </button>
                      </div>

                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste whole Resume text here... Include education, experience bullets, and skill catalogs."
                        rows={14}
                        className="w-full px-3 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px] leading-relaxed text-slate-700 bg-slate-50 focus:bg-white transition"
                      />

                      <button
                        id="audit-resume-api-btn"
                        onClick={handleAuditeResume}
                        disabled={isAuditingResume}
                        className="w-full bg-slate-950 text-white font-sans font-semibold py-3 rounded-xl hover:bg-indigo-600 hover:shadow active:bg-indigo-700 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isAuditingResume ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Recruiter reviewing resume...</span>
                          </>
                        ) : (
                          <>
                            <FileText size={14} />
                            <span>Index Defects & Match Jobs</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Right Panel: Output report */}
                    <div className="lg:col-span-7 flex flex-col gap-5">
                      
                      {/* Gaps / Defects Card */}
                      <div className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="border-b border-slate-100 pb-2.5 flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Resume Defects Audit</span>
                          {resumeDefects && (
                            <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full font-mono">
                              {resumeDefects.length} Issues Flagged
                            </span>
                          )}
                        </div>

                        {!resumeDefects ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            No review run yet. Provide raw text inside the left canvas and launch calculation.
                          </div>
                        ) : resumeDefects.length === 0 ? (
                          <div className="py-8 text-center text-emerald-600 text-xs flex flex-col items-center gap-2 font-medium">
                            <CheckCircle2 size={24} />
                            <span>No defects found! Your student resume is outstanding.</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
                            {resumeDefects.map((defectItem, index) => (
                              <div
                                key={index}
                                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2 shadow-2xs font-sans text-xs"
                              >
                                <div className="flex justify-between items-center">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded ${
                                    defectItem.severity === 'high'
                                      ? 'bg-red-100 text-red-700'
                                      : defectItem.severity === 'medium'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-indigo-100 text-indigo-700'
                                  }`}>
                                    {defectItem.severity} severity deviation
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">Issue #{index + 1}</span>
                                </div>

                                <div className="text-slate-700">
                                  <strong className="text-red-700 uppercase tracking-wide text-[9px] block font-mono">Issue:</strong>
                                  <p className="mt-0.5">{defectItem.issue}</p>
                                </div>

                                <div className="p-2 border-l-2 border-indigo-500 bg-indigo-50/20 text-slate-600 italic">
                                  <strong className="text-indigo-800 text-[9px] block font-mono not-italic uppercase tracking-wide">Original phrasing:</strong>
                                  "{defectItem.originalText}"
                                </div>

                                <div className="py-2.5 px-3 bg-emerald-50 rounded-lg text-emerald-900 leading-relaxed">
                                  <strong className="text-emerald-800 text-[9px] block font-mono uppercase tracking-wide font-bold">Suggested Revision:</strong>
                                  {defectItem.suggestion}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Job Matching Matrix */}
                      <div className="border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5 font-mono">
                          Target Compatible Positions
                        </span>

                        {!jobMatches ? (
                          <div className="py-12 text-center text-slate-400 text-xs">
                            Run resume analysis to identify aligned recruiting mandates.
                          </div>
                        ) : jobMatches.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No direct matches generated. Adjust intentions parameters on setup page.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3.5">
                            {jobMatches.map((jItem, index) => (
                              <div
                                key={index}
                                className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 bg-white shadow-3xs flex flex-col gap-2"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div>
                                    <h4 className="font-bold text-slate-900 text-sm font-sans">{jItem.title}</h4>
                                    <span className="text-xs text-slate-400 mt-0.5 block">{jItem.company}</span>
                                  </div>
                                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold font-sans">
                                    {jItem.compatibility}% Fit
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 leading-normal font-sans">
                                  {jItem.keyFit}
                                </p>

                                <div className="flex flex-col gap-1.5 pt-2 text-xs">
                                  <span className="font-bold text-slate-700 flex items-center gap-1 font-sans">
                                    <TrendingUp size={12} className="text-indigo-600" />
                                    <span>Gaps to Fill Before Applying:</span>
                                  </span>
                                  <ul className="text-slate-500 grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4 list-disc text-[11px] leading-relaxed">
                                    {jItem.gapsToBridge.map((g, idx) => (
                                      <li key={idx} className="truncate">{g}</li>
                                    ))}
                                  </ul>
                                </div>

                                <div className="mt-2.5 p-2 bg-indigo-50/50 text-[11px] rounded-lg text-indigo-900 border border-indigo-100/30 flex gap-2">
                                  <span className="font-bold text-amber-700">💡 Tip:</span>
                                  <span>{jItem.applicationTip}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB 4: JOB MOCK INTERVIEW SIMULATOR */}
              {activeTab === 'interview' && (
                <motion.div
                  key="interview-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Interactive STAR Interview Simulator</h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Simulate actual recruiter queries. Type answers step-by-step to get detailed feedback reviews and a final report card!
                    </p>
                  </div>

                  {/* ACTIVE SIMULATION DISPLAY FLOW */}
                  {mockInterview.active ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left Block: Active Chat Query */}
                      <div className="lg:col-span-7 flex flex-col gap-5">
                        
                        {/* Simulation Progress Ribbon */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-col gap-2.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-sans">
                              Targetting: <strong>{mockInterview.jobTitle}</strong> at {mockInterview.company}
                            </span>
                            <span className="text-[10px] uppercase font-mono font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                              Question {mockInterview.currentQuestionIndex + 1} of {mockInterview.questions.length}
                            </span>
                          </div>

                          {/* Progress Dots Bar */}
                          <div className="flex gap-1.5">
                            {mockInterview.questions.map((_: string, idx: number) => {
                              const isPast = idx < mockInterview.currentQuestionIndex;
                              const isActive = idx === mockInterview.currentQuestionIndex;
                              return (
                                <div
                                  key={idx}
                                  className={`h-2 flex-grow rounded-md transition-all ${
                                    isPast
                                      ? 'bg-indigo-600'
                                      : isActive
                                      ? 'bg-indigo-400 ring-2 ring-indigo-500/30'
                                      : 'bg-slate-200'
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* INTERVIEW METADATA STATUS */}
                        {mockInterview.finished ? (
                          <div className="bg-white border rounded-2xl p-6 flex flex-col gap-6 items-center text-center">
                            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-full border border-emerald-200/50">
                              <Award size={48} className="animate-bounce" />
                            </div>

                            <div className="max-w-md">
                              <span className="text-xs uppercase tracking-widest font-mono text-slate-400 block font-semibold">
                                Recruitment Simulation Complete
                              </span>
                              <h3 className="text-2xl font-bold text-slate-900 mt-1">STAR Performance Scorecard</h3>
                              <div className="flex items-center justify-center gap-1.5 mt-3">
                                <span className="text-5xl font-extrabold text-indigo-600 font-sans">
                                  {mockInterview.overallScore || '...'}
                                </span>
                                <span className="text-slate-400 font-bold font-sans text-xl">/ 100</span>
                              </div>
                            </div>

                            {isCreatingSummary ? (
                              <div className="flex flex-col items-center gap-1.5 p-4 text-xs text-indigo-600">
                                <Loader2 size={24} className="animate-spin" />
                                <span>Recruiter finalizing summary scorecard...</span>
                              </div>
                            ) : (
                              <div className="text-left w-full max-w-xl bg-slate-50 border border-slate-200/50 p-5 rounded-2xl flex flex-col gap-3 font-sans">
                                <span className="text-xs font-bold uppercase font-mono text-indigo-700">Recruiter Feedback Overview:</span>
                                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                  {mockInterview.overallSummary}
                                </p>
                              </div>
                            )}

                            <button
                              id="restart-interview-session-btn"
                              onClick={handleResetInterview}
                              className="bg-indigo-600 text-white font-sans font-semibold text-xs px-6 py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <RotateCcw size={14} />
                              <span>Simulate Another Interview</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            
                            {/* RECIPROCAL RECRUITER SPEECH SYSTEM */}
                            <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800 flex items-start gap-4">
                              <span className="text-3xl bg-slate-800 p-2 rounded-xl shrink-0">👔</span>
                              <div className="flex-1">
                                <span className="text-[10px] text-slate-400 font-mono font-semibold uppercase tracking-wider block">Lead Interview Specialist</span>
                                <p className="font-bold text-sm text-white mt-1 leading-relaxed">
                                  "{mockInterview.questions[mockInterview.currentQuestionIndex]}"
                                </p>
                              </div>
                            </div>

                            {/* User Answer Field Area */}
                            <div className="flex flex-col gap-2.5">
                              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                                <span>Provide Your Candidate Answer</span>
                                <span className="text-[10px] text-slate-400 font-normal">Use the STAR method: Situation, Task, Action, Result</span>
                              </label>

                              <textarea
                                value={currentAnswerInput}
                                onChange={(e) => setCurrentAnswerInput(e.target.value)}
                                placeholder="State specific problems you encountered, your action role, and quantitative outcomes..."
                                rows={6}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-sans text-sm text-slate-700 bg-slate-50 focus:bg-white focus:shadow-xs transition"
                              />

                              <div className="flex justify-between items-center mt-1">
                                <div className="text-[10px] text-slate-400 leading-normal flex items-center gap-2">
                                  <span>Word Count: <strong>{currentAnswerInput.length > 0 ? currentAnswerInput.split(/\s+/).filter(Boolean).length : 0}</strong> words</span>
                                </div>

                                <button
                                  id="submit-answer-mock-btn"
                                  onClick={handleEvaluateAnswer}
                                  disabled={isEvaluatingAnswer}
                                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-sans font-bold hover:bg-slate-950 hover:shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {isEvaluatingAnswer ? (
                                    <>
                                      <Loader2 size={12} className="animate-spin" />
                                      <span>Assessing...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>Submit Response</span>
                                      <ArrowRight size={14} />
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                          </div>
                        )}

                      </div>

                      {/* Right Block: Response Evaluation Log Dashboard */}
                      <div className="lg:col-span-5 flex flex-col gap-4">
                        <span className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono">Simulated Answer Outcomes</span>
                        
                        {mockInterview.evaluations.length === 0 ? (
                          <div className="border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 leading-normal">
                            Submit your reaction answer to the current recruiter inquiry. Ratings, metric defects, and high-scoring alternatives will render here.
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4 overflow-y-auto max-h-160 pr-1">
                            {mockInterview.evaluations.map((ev, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-slate-200/80 p-4 bg-white flex flex-col gap-3 font-sans text-xs"
                              >
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span className="font-bold text-slate-900">Response Evaluation #{index + 1}</span>
                                  <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                                    ev.rating > 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    Score: {ev.rating}/100
                                  </span>
                                </div>

                                <div className="text-slate-500 font-mono text-[10px] leading-relaxed">
                                  <strong>Question:</strong> "{ev.question}"
                                </div>

                                <div className="text-[11px] text-slate-600">
                                  <strong>Your Answer:</strong> "{ev.userAnswer}"
                                </div>

                                <div className="p-3 bg-indigo-50/40 rounded-xl leading-relaxed text-indigo-950 font-sans">
                                  <strong className="text-indigo-800 text-[9px] uppercase tracking-wide font-mono block mb-1">Advisor Critique:</strong>
                                  <p className="whitespace-pre-line">{ev.feedback}</p>
                                </div>

                                <div className="p-3 bg-emerald-50 rounded-xl leading-relaxed text-emerald-950 font-sans border border-emerald-100/50">
                                  <strong className="text-emerald-800 text-[9px] uppercase tracking-wide font-mono block mb-1">Alternative Star Response:</strong>
                                  <p className="whitespace-pre-line text-[11px] font-medium leading-relaxed italic">"{ev.idealAnswer}"</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* SIMULATION INCEPTION CARD CONFIGS */
                    <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 font-sans">
                      <div className="text-center flex flex-col items-center justify-center gap-2">
                        <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 shrink-0 border border-indigo-100">
                          <Brain size={32} />
                        </div>
                        <h3 className="font-bold text-slate-950 text-base leading-tight mt-2">Simulate Recruiter Inquiries</h3>
                        <p className="text-xs text-slate-400">
                          Configure targeted placement options. High-fidelity inquiries will challenge performance STAR models.
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Target Job Title</label>
                          <input
                            type="text"
                            value={interviewJobInput}
                            onChange={(e) => setInterviewJobInput(e.target.value)}
                            placeholder="e.g., Associate Software Engineer"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Target Employer Name (Optional)</label>
                          <input
                            type="text"
                            value={interviewCompanyInput}
                            onChange={(e) => setInterviewCompanyInput(e.target.value)}
                            placeholder="e.g., Stripe, McKinsey, General Hospital"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-4 flex gap-2">
                        <button
                          id="trigger-start-interview-btn"
                          disabled={isStartingInterview}
                          onClick={handleStartMockInterview}
                          className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-600 transition text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isStartingInterview ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Drafting Interview Script...</span>
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              <span>Initialize Real-time Simulation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}

              {/* TAB 5: OPEN CAREER CONSULT COMPANION */}
              {activeTab === 'chat' && (
                <motion.div
                  key="chat-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-140"
                >
                  <div className="border-b border-slate-100 pb-3 h-14 shrink-0 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">Q&A Chat Assistant</h2>
                      <p className="text-[11px] text-slate-400">Ask the advisor about salary, internships, or letter copy.</p>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-mono font-semibold">Ready to Consult</span>
                  </div>

                  {/* MESSAGES VIEW CONTAINER */}
                  <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
                    {chatMessages.map((msg, index) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div
                          key={msg.id || index}
                          className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                        >
                          <span className={`p-1.5 rounded-lg text-lg select-none ${isUser ? 'bg-indigo-100' : 'bg-slate-200'}`}>
                            {isUser ? '🧑' : '🎓'}
                          </span>
                          <div className={`max-w-xl flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                            <div className={`p-4 rounded-2xl text-xs leading-relaxed leading-normal font-sans shadow-3xs border ${
                              isUser
                                ? 'bg-indigo-600 text-white border-indigo-700 rounded-tr-none'
                                : 'bg-slate-50 text-slate-800 border-slate-100 rounded-tl-none whitespace-pre-wrap'
                            }`}>
                              <p className="font-sans leading-relaxed">{msg.content}</p>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono">{msg.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}

                    {isSendingChatMessage && (
                      <div className="flex items-start gap-3">
                        <span className="p-1.5 rounded-lg text-lg bg-slate-200">🎓</span>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-indigo-600 text-xs shadow-3xs rounded-tl-none font-sans">
                          <Loader2 size={14} className="animate-spin" />
                          <span>Advisor processing consultation response...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRESET CHAT PROMPTS PILLS ROUTING */}
                  <div className="py-2.5 overflow-x-auto scrollbar-none flex gap-2 border-t border-slate-100 shrink-0">
                    <button
                      id="suggest-projects-pill"
                      onClick={() => handleSendChatMessage("What are 3 interesting portfolio project initiatives I should build as a CS major?")}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer font-medium"
                    >
                      💡 Suggest coding projects
                    </button>
                    <button
                      id="explain-gpa-pill"
                      onClick={() => handleSendChatMessage("How should a graduating senior address a low college GPA (less than 3.0) on resumes?")}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer font-medium"
                    >
                      📝 Explaining minor GPA gaps
                    </button>
                    <button
                      id="linkedin-connection-pill"
                      onClick={() => handleSendChatMessage("Help me write an invitation cold connection message for a senior VP over on LinkedIn.")}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition shrink-0 cursor-pointer font-medium"
                    >
                      🔗 Build cold email templates
                    </button>
                  </div>

                  {/* CHAT INPUT AREA */}
                  <div className="pt-3 border-t border-slate-100 shrink-0 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendChatMessage();
                      }}
                      placeholder="Ask me anything: formatting, target networking strategies, salary hacks..."
                      className="flex-grow px-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      id="chat-send-msg-btn"
                      onClick={() => handleSendChatMessage()}
                      disabled={isSendingChatMessage || !chatInput.trim()}
                      className="bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-900 transition flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      Send Consult
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* BOTTOM QUICK FOOTER FAQ INFO */}
          <footer className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex justify-between items-center text-[11px] text-slate-400 font-sans">
            <span className="truncate">© {new Date().getFullYear()} University Final Project Registry. All rights reserved.</span>
            <div className="flex gap-4">
              <span>Class: CS-481 Graduation Seminar</span>
              <span>Professor: Dept. Evaluation Board</span>
            </div>
          </footer>

        </main>

      </div>
    </div>
  );
}
