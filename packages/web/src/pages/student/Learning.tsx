import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  BookOpen,
  Clock,
  Globe,
  Paperclip,
  Send,
  X,
  FileText,
  AlertCircle,
  CheckCircle,
  Award,
  Download,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import useDocumentTitle from '../../hooks/useDocumentTitle';

type ViewType = 'dashboard' | 'courses' | 'assignments' | 'learning';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration: string;
  status: 'completed' | 'active' | 'locked';
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  completedCount: number;
  totalCount: number;
  isOpen: boolean;
}

const typeIcon = (type: Lesson['type'], status: Lesson['status']) => {
  if (status === 'locked') return <Lock className="h-3 w-3 text-slate-400" />;
  if (status === 'completed') return <CheckCircle2 className="h-3 w-3 text-blue-600" />;
  const icons: Record<Lesson['type'], React.ReactNode> = {
    video:      <div className="h-2 w-2 rounded-full bg-blue-600" />,
    reading:    <div className="h-2 w-2 rounded-full bg-indigo-400" />,
    quiz:       <div className="h-2 w-2 rounded-full bg-amber-500" />,
    assignment: <div className="h-2 w-2 rounded-full bg-emerald-500" />,
  };
  return icons[type];
};

export const Learning: React.FC<{ onViewChange?: (view: ViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Learning');
  const [submissionText, setSubmissionText]     = useState('');
  const [attachedFiles, setAttachedFiles]       = useState<string[]>([]);
  const [submitted, setSubmitted]               = useState(false);

  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Module 1: Foundations of Leadership',
      completedCount: 4,
      totalCount: 4,
      isOpen: false,
      lessons: [
        { id: '1-1', title: 'Introduction to Leadership',         type: 'video',      duration: '18 min',  status: 'completed' },
        { id: '1-2', title: 'Leadership Styles Overview',         type: 'reading',    duration: '25 min',  status: 'completed' },
        { id: '1-3', title: 'Module 1 Quiz',                      type: 'quiz',       duration: '10 Q',    status: 'completed' },
        { id: '1-4', title: 'Self-Assessment Essay',              type: 'assignment', duration: 'Submit',  status: 'completed' },
      ],
    },
    {
      id: '2',
      title: 'Module 2: Organizational Psychology',
      completedCount: 3,
      totalCount: 3,
      isOpen: false,
      lessons: [
        { id: '2-1', title: 'Behavioral Dynamics',                type: 'video',      duration: '22 min',  status: 'completed' },
        { id: '2-2', title: 'Case Study: Team Cohesion',          type: 'reading',    duration: '30 min',  status: 'completed' },
        { id: '2-3', title: 'Org Psychology Assessment',          type: 'quiz',       duration: '8 Q',     status: 'completed' },
      ],
    },
    {
      id: '3',
      title: 'Module 3: Conflict Resolution',
      completedCount: 1,
      totalCount: 4,
      isOpen: true,
      lessons: [
        { id: '3-1', title: 'Identifying Core Conflicts',         type: 'video',      duration: '15 min',  status: 'completed' },
        { id: '3-2', title: 'Navigating High-Stakes Negotiations', type: 'assignment', duration: 'Submit', status: 'active' },
        { id: '3-3', title: 'Mediation Strategies Seminar',       type: 'reading',    duration: '45 min',  status: 'locked' },
        { id: '3-4', title: 'Module 3 Assessment',                type: 'quiz',       duration: '10 Q',    status: 'locked' },
      ],
    },
    {
      id: '4',
      title: 'Module 4: Strategic Scaling',
      completedCount: 0,
      totalCount: 5,
      isOpen: false,
      lessons: [
        { id: '4-1', title: 'Scaling Frameworks',                 type: 'video',      duration: '28 min',  status: 'locked' },
        { id: '4-2', title: 'Operational Efficiency',             type: 'reading',    duration: '35 min',  status: 'locked' },
        { id: '4-3', title: 'Growth Strategy Paper',              type: 'assignment', duration: 'Submit',  status: 'locked' },
        { id: '4-4', title: 'Scaling Assessment',                 type: 'quiz',       duration: '12 Q',    status: 'locked' },
        { id: '4-5', title: 'Final Leadership Project',           type: 'assignment', duration: 'Submit',  status: 'locked' },
      ],
    },
  ]);

  const totalLessons    = modules.reduce((s, m) => s + m.totalCount, 0);
  const completedLessons = modules.reduce((s, m) => s + m.completedCount, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);
  const courseCompleted = overallProgress === 100;

  const toggleModule = (id: string) =>
    setModules(prev => prev.map(m => m.id === id ? { ...m, isOpen: !m.isOpen } : m));

  const handleFileAttach = () => {
    const fakeFiles = ['conflict_analysis.pdf', 'negotiation_notes.docx', 'research_data.xlsx'];
    const unused = fakeFiles.filter(f => !attachedFiles.includes(f));
    if (unused.length) setAttachedFiles(prev => [...prev, unused[0]]);
  };

  const handleSubmit = () => {
    if (submissionText.trim() || attachedFiles.length) setSubmitted(true);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="courses" onViewChange={onViewChange as (view: 'dashboard' | 'courses' | 'assignments') => void} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="courses" onViewChange={onViewChange as (view: 'dashboard' | 'courses' | 'assignments') => void} />

        {/* ── Main content ── */}
        <div className="flex-1 flex overflow-hidden min-w-0">

          {/* ── Left: Assignment Submission Panel ── */}
          <main className="flex-1 overflow-y-auto">

            {/* Breadcrumb */}
            <div className="px-8 pt-6 pb-2">
              <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span onClick={() => onViewChange?.('courses')} className="hover:text-slate-600 cursor-pointer">My Courses</span>
                <ChevronRight className="h-3 w-3" />
                <span className="hover:text-slate-600 cursor-pointer">Strategic Leadership Practicum</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600">Module 3: Conflict Resolution</span>
              </nav>
            </div>

            <div className="px-8 pb-8 space-y-6">

              {/* ── Assignment Submission Box ── */}
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm shadow-slate-900/5">

                {/* Header banner */}
                <div className="bg-gradient-to-br from-[#001D6E] via-blue-800 to-blue-700 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-[10px] font-extrabold text-white/90 uppercase tracking-wider">
                        Assignment
                      </span>
                      <span className="px-2.5 py-1 bg-red-500/80 border border-red-400/30 rounded-lg text-[10px] font-extrabold text-white uppercase tracking-wider">
                        Due: Nov 10, 2023
                      </span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-white leading-snug">
                      Navigating High-Stakes Negotiations
                    </h1>
                    <div className="flex items-center gap-5 mt-3 text-white/70 text-xs font-semibold flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Dr. Evelyn Vance</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Est. 2 Hours</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        <span>English, Spanish</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Submission Area */}
                <div className="p-6 space-y-6">
                  <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed space-y-3">
                    <p className="text-sm">
                      In this assignment, you will dissect the anatomy of high-stakes corporate negotiations.
                      Understanding the psychological triggers and structural imbalances present during mergers,
                      major acquisitions, or critical vendor disputes is paramount for senior leadership.
                    </p>
                    <p className="text-sm">
                      Apply Dr. Vance's <strong className="text-slate-800">'Tri-Axis Approach'</strong> to de-escalation
                      and value creation. Identify hidden stakeholder interests, anchor expectations effectively without
                      alienating counterparts, and maintain composure under extreme pressure.
                    </p>
                  </div>

                  {/* Submission panel */}
                  {!submitted ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Your Submission
                        </span>
                        <div className="h-px flex-1 bg-slate-100" />
                      </div>

                      <textarea
                        value={submissionText}
                        onChange={e => setSubmissionText(e.target.value)}
                        placeholder="Write your assignment response here... Describe how you would apply the Tri-Axis Approach in a real-world negotiation scenario."
                        rows={8}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all leading-relaxed"
                      />

                      {/* Attached files */}
                      {attachedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {attachedFiles.map(file => (
                            <div key={file} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-semibold text-blue-700">
                              <FileText className="h-3.5 w-3.5 text-blue-500" />
                              <span>{file}</span>
                              <button
                                onClick={() => setAttachedFiles(prev => prev.filter(f => f !== file))}
                                className="text-blue-400 hover:text-blue-700 ml-1"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={handleFileAttach}
                          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                          <Paperclip className="h-3.5 w-3.5" />
                          Attach File
                        </button>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-semibold text-slate-400">
                            {submissionText.length} / 5000 chars
                          </span>
                          <button
                            onClick={handleSubmit}
                            disabled={!submissionText.trim() && !attachedFiles.length}
                            className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:shadow-none"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Submit Assignment
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Success state */
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                      <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-800">Assignment Submitted Successfully!</h4>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                          Your submission is under review. You'll receive feedback from Dr. Vance within 3–5 business days.
                        </p>
                        <button
                          onClick={() => setSubmitted(false)}
                          className="mt-3 text-xs font-bold text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                        >
                          Edit & Resubmit
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Guidelines */}
                  <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-800 space-y-1">
                      <p className="font-extrabold">Submission Guidelines</p>
                      <ul className="list-disc list-inside space-y-0.5 font-medium opacity-90">
                        <li>Minimum 500 words for full credit</li>
                        <li>Accepted formats: PDF, DOCX, TXT</li>
                        <li>Maximum file size: 10 MB per attachment</li>
                        <li>Late submissions incur a 10% penalty per day</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* ── Right: Course Curriculum ── */}
          <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-sm text-[#001D6E]">Course Curriculum</h2>

              {/* Progress bar */}
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>{overallProgress}% Completed</span>
                  <span>{completedLessons}/{totalLessons} Lessons</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Modules */}
            <div className="flex-1 divide-y divide-slate-100">
              {modules.map(mod => (
                <div key={mod.id}>
                  {/* Module header */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-start justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-extrabold leading-snug ${mod.isOpen ? 'text-[#001D6E]' : 'text-slate-700'}`}>
                        {mod.title}
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {mod.completedCount} / {mod.totalCount} Lessons
                      </p>
                    </div>
                    {mod.isOpen
                      ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    }
                  </button>

                  {/* Lessons */}
                  {mod.isOpen && (
                    <div className="pb-2">
                      {mod.lessons.map(lesson => (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                            lesson.status === 'active'
                              ? 'bg-blue-50 border-l-2 border-blue-600'
                              : lesson.status === 'locked'
                              ? 'opacity-50 cursor-default'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="shrink-0 flex items-center justify-center w-4">
                            {typeIcon(lesson.type, lesson.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold leading-tight truncate ${
                              lesson.status === 'active' ? 'text-blue-700 font-bold' : 'text-slate-700'
                            }`}>
                              {lesson.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5 capitalize">
                              {lesson.type === 'assignment' ? 'Assignment' : lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                              {' • '}{lesson.duration}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Certificate Section ── */}
            <div className={`mx-3 mb-4 mt-2 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
              courseCompleted
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                : 'border-dashed border-slate-200 bg-slate-50/60 opacity-70'
            }`}>
              {/* Header strip */}
              <div className={`px-4 py-3 flex items-center gap-2.5 ${
                courseCompleted ? 'bg-emerald-500/10' : 'bg-transparent'
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  courseCompleted ? 'bg-emerald-100' : 'bg-slate-200'
                }`}>
                  {courseCompleted
                    ? <Award className="h-4 w-4 text-emerald-600" />
                    : <Lock className="h-3.5 w-3.5 text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-extrabold ${
                    courseCompleted ? 'text-emerald-800' : 'text-slate-400'
                  }`}>
                    Course Certificate
                  </p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${
                    courseCompleted ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {courseCompleted ? 'Ready to download!' : 'Complete all modules to unlock'}
                  </p>
                </div>
                {courseCompleted && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                )}
              </div>

              {/* Download button — only shown when completed */}
              {courseCompleted ? (
                <div className="px-4 pb-4">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/25 mt-2">
                    <Download className="h-3.5 w-3.5" />
                    Download Certificate
                  </button>
                </div>
              ) : (
                <div className="px-4 pb-4 pt-1">
                  <div className="w-full flex items-center justify-center gap-2 py-2 bg-slate-200/60 text-slate-400 text-xs font-bold rounded-xl">
                    <Lock className="h-3 w-3" />
                    Locked
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Learning;
