export type AcademicYear = 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Sub-grad' | 'Fresh Graduate';

export interface UserProfile {
  major: string;
  year: AcademicYear;
  experience: string; // Projects, internships, coursework
  strengths: string;  // Skills, certificates, language
  intentions: string;  // Role preferences, target industries
}

export type ChatModule = 'general' | 'career' | 'resume' | 'job' | 'interview';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  module: ChatModule;
  timestamp: string;
}

export interface CareerPathSuggestion {
  title: string;
  matchScore: number; // 0-100
  description: string;
  requiredSkills: string[];
  recommendedCertifications: string[];
  salaryRange: string;
  marketOutlook: 'Increasingly Growing' | 'Highly Stable' | 'Evolving / Shifting';
}

export interface ResumeDefect {
  severity: 'high' | 'medium' | 'low';
  originalText: string;
  issue: string;
  suggestion: string;
}

export interface JobMatch {
  title: string;
  company: string;
  compatibility: number; // 0-100
  keyFit: string;
  gapsToBridge: string[];
  applicationTip: string;
}

export interface InterviewQuestionEvaluation {
  question: string;
  userAnswer: string;
  rating: number; // 0-100
  feedback: string;
  idealAnswer: string;
}

export interface MockInterview {
  active: boolean;
  jobTitle: string;
  company: string;
  currentQuestionIndex: number;
  questions: string[];
  evaluations: InterviewQuestionEvaluation[];
  finished: boolean;
  overallScore?: number;
  overallSummary?: string;
}

export interface SessionData {
  id: string;
  name: string;
  profile: UserProfile | null;
  messages: ChatMessage[];
  careerSuggestions: CareerPathSuggestion[] | null;
  resumeDefects: ResumeDefect[] | null;
  jobMatches: JobMatch[] | null;
  mockInterview: MockInterview | null;
  lastUpdated: string;
}
