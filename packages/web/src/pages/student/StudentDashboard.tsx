import React, { useEffect } from 'react';
import {
  BookOpen,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/login';
import { useStudentStore } from '../../store/Student';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import useDocumentTitle from '../../hooks/useDocumentTitle';

type StudentView = 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';

const CARD_GRADIENTS = [
  'from-blue-600 to-sky-500',
  'from-indigo-600 to-violet-500',
  'from-teal-500 to-emerald-400',
  'from-slate-700 to-slate-900',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
];
const gradientFor = (id: number) => CARD_GRADIENTS[id % CARD_GRADIENTS.length];

export const StudentDashboard: React.FC<{ onViewChange?: (view: StudentView) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Dashboard');
  const { currentUser } = useAppStore();
  const {
    enrollments,
    enrollmentsLoading,
    enrollmentsError,
    fetchEnrollments,
    setSelectedCourse,
  } = useStudentStore();


  const displayName = currentUser?.email
    ? (() => { const n = currentUser.email.split('@')[0]; return n.charAt(0).toUpperCase() + n.slice(1); })()
    : 'Student';

  useEffect(() => {
    if (currentUser?.user_id && enrollments.length === 0 && !enrollmentsLoading && !enrollmentsError) {
      fetchEnrollments(currentUser.user_id);
    }
  }, [currentUser?.user_id]);

  const activeEnrollments = enrollments.filter(
    (e) => e.enrollmentStatus === 'IN_PROGRESS' || e.enrollmentStatus === 'ASSIGNED',
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="dashboard" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="dashboard" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-8">

            {/* Search */}
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

            {/* Welcome */}
            <div>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">
                Welcome back, {displayName}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {enrollmentsLoading
                  ? 'Loading your courses...'
                  : `You have ${activeEnrollments.length} active course${activeEnrollments.length !== 1 ? 's' : ''}.`}
              </p>
            </div>

            {/* Active Enrollments */}
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

              {/* Error */}
              {enrollmentsError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-semibold">{enrollmentsError}</p>
                </div>
              )}

              {/* Loading */}
              {enrollmentsLoading && (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm font-semibold">Loading enrollments...</span>
                </div>
              )}

              {/* Empty */}
              {!enrollmentsLoading && !enrollmentsError && activeEnrollments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <BookOpen className="h-8 w-8 text-slate-200 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No active courses yet.</p>
                  <p className="text-xs text-slate-400 mt-1">Contact your admin to get enrolled in a course.</p>
                </div>
              )}

              {/* Enrollment cards */}
              {!enrollmentsLoading && !enrollmentsError && activeEnrollments.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeEnrollments.map((enrollment) => {
                    const pct = Math.round(enrollment.completionPercentage);
                    const initials = enrollment.courseName
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase();

                    return (
                      <div
                        key={enrollment.enrollmentId}
                        className="p-4 border border-slate-100 rounded-2xl hover:border-blue-100 hover:shadow-sm transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          setSelectedCourse(enrollment.courseId, enrollment.enrollmentId);
                          onViewChange?.('learning');
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientFor(enrollment.courseId)} shrink-0`}>
                            <span className="text-sm font-extrabold text-white select-none">{initials}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 leading-tight line-clamp-2">
                              {enrollment.courseName}
                            </h4>
                            <div className="mt-1 flex items-center gap-1.5">
                              <Layers className="h-3 w-3 text-slate-400" />
                              <span className="text-[10px] text-slate-400 font-semibold capitalize">
                                {enrollment.enrollmentStatus.toLowerCase().replace('_', ' ')}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 shrink-0">PROGRESS</span>
                              <span className="text-[10px] font-extrabold text-[#001D6E] shrink-0">{pct}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Summary stats */}
            {!enrollmentsLoading && enrollments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Total Enrolled',
                    value: enrollments.length,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                  },
                  {
                    label: 'In Progress',
                    value: enrollments.filter((e) => e.enrollmentStatus === 'IN_PROGRESS').length,
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                  },
                  {
                    label: 'Completed',
                    value: enrollments.filter((e) => e.enrollmentStatus === 'COMPLETED').length,
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm"
                  >
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.bg} mb-3`}>
                      <span className={`text-lg font-extrabold ${stat.color}`}>{stat.value}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
