import React from 'react';
import { 
  Check, 
  Play, 
  MessageSquare, 
  CheckCircle2,
  ChevronRight,
  Shield,
  BookOpen,
  FileText
} from 'lucide-react';
import { useAppStore } from '../../store/login';
import Header from "../../components/layout/Header";
import Sidebar from "../../components/layout/Sidebar";
import useDocumentTitle from '../../hooks/useDocumentTitle';

export const StudentDashboard: React.FC<{ onViewChange?: (view: 'dashboard' | 'courses' | 'assignments') => void }> = ({ onViewChange }) => {
  useDocumentTitle('Dashboard');
  const { currentUser } = useAppStore();
  
  const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Sarah';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  const CircularProgress = ({ percentage, title, subtitle }: { percentage: number; title: string; subtitle: string }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-300">
        <div className="relative flex items-center justify-center">
          <svg className="w-14 h-14 transform -rotate-90">
            <circle cx="28" cy="28" r={radius} className="text-slate-100" strokeWidth="5" stroke="currentColor" fill="transparent" />
            <circle cx="28" cy="28" r={radius} className="text-blue-600" strokeWidth="5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
          </svg>
          <span className="absolute text-[10px] font-bold text-slate-800">{percentage}%</span>
        </div>
        <div>
          <h4 className="font-bold text-sm text-slate-900 leading-tight">{title}</h4>
          <p className="text-[10px] text-slate-400 font-semibold tracking-wider mt-0.5">{subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="dashboard" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="dashboard" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="relative max-w-xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses, assignments, activities..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Welcome back, {displayName}</h1>
              <p className="text-sm text-slate-500 mt-1">You have 2 upcoming deadlines this week.</p>
            </div>
          </div>

          <div className="space-y-8">

            {/* ── Full Width: Active Enrollments ── */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[#001D6E] text-base">Active Enrollments</h3>
                <button
                  onClick={() => onViewChange?.('courses')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 rounded-2xl hover:border-blue-100 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">Advanced Data Security &amp; Compliance</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-semibold">Module 4: Encryption Standards</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">PROGRESS</span>
                        <span className="text-[10px] font-extrabold text-[#001D6E] shrink-0">65%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-100 rounded-2xl hover:border-blue-100 transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">Cloud Infrastructure Admin</h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-semibold">Module 1: Getting Started</p>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: '12%' }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 shrink-0">PROGRESS</span>
                        <span className="text-[10px] font-extrabold text-[#001D6E] shrink-0">12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 50/50 Row: Assignments + Recent Activities ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Assignments */}
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-[#001D6E] text-base">Assignments</h3>
                  <button
                    onClick={() => onViewChange?.('assignments')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 hover:text-blue-600 cursor-pointer">Security Audit Case Study</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Course: Advanced Data Security</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-red-50 text-red-600 border border-red-100 shrink-0 uppercase tracking-wider">
                      Due Tomorrow
                    </span>
                  </div>

                  <div className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 hover:text-blue-600 cursor-pointer">Compliance Essay</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Score: 92/100 • 2 days ago</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0 uppercase tracking-wider flex items-center gap-1">
                      <Check className="h-2.5 w-2.5" />
                      Graded
                    </span>
                  </div>

                  <div className="py-4 first:pt-0 last:pb-0 flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 hover:text-blue-600 cursor-pointer">Network Topology Quiz</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">Course: Cloud Infrastructure Administration</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 shrink-0 uppercase tracking-wider">
                      In Review
                    </span>
                  </div>
                </div>
              </section>

              {/* Recent Activities */}
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
                <h3 className="font-extrabold text-[#001D6E] text-base mb-5">Recent Activities</h3>

                <div className="relative border-l border-slate-100 ml-4 space-y-6">
                  <div className="relative pl-6">
                    <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white border border-blue-700 shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">Completed Lecture: Symmetric vs Asymmetric Encryption</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">2 hours ago</span>
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-[#001D6E] text-white flex items-center justify-center ring-4 ring-white shadow-sm">
                      <Play className="h-2.5 w-2.5 ml-0.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">Started Module: Encryption Standards</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Yesterday, 4:30 PM</span>
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white shadow-sm">
                      <FileText className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">Submitted: Compliance Essay Draft</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Oct 24, 2023</span>
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white shadow-sm">
                      <MessageSquare className="h-3 w-3" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">Forum Post: Replied to "Network Security Basics"</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Oct 23, 2023</span>
                    </div>
                  </div>

                  <div className="relative pl-6">
                    <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center ring-4 ring-white shadow-sm">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">Quiz Completed: Introduction to Cloud</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Oct 22, 2023</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
