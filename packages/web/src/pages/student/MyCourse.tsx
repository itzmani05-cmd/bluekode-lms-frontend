import React, { useEffect, useMemo } from 'react';
import {
  ChevronRight, BookOpen, Layers, RefreshCw, AlertTriangle, Search,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';
import { useAppStore } from '../../store/login';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const CARD_GRADIENTS = [
  'from-blue-600 to-sky-500',
  'from-indigo-600 to-violet-500',
  'from-teal-500 to-emerald-400',
  'from-slate-700 to-slate-900',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
];
const gradientFor = (id: number) => CARD_GRADIENTS[id % CARD_GRADIENTS.length];

const STATUS_BADGE: Record<string, string> = {
  ASSIGNED:    'bg-slate-100 text-slate-600',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  COMPLETED:   'bg-emerald-50 text-emerald-700',
  CANCELLED:   'bg-red-50 text-red-600',
};

type StudentView = 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';

const MyCourse: React.FC<{ onViewChange?: (view: StudentView) => void }> = ({ onViewChange }) => {
  useDocumentTitle('My Courses');
  const { currentUser } = useAppStore();
  const {
    courseSearchQuery: searchQuery,
    setCourseSearchQuery: setSearchQuery,
    enrollments,
    enrollmentsLoading,
    enrollmentsError,
    fetchEnrollments,
    setSelectedCourse,
  } = useStudentStore();

  useEffect(() => {
    if (currentUser?.user_id && enrollments.length === 0 && !enrollmentsLoading && !enrollmentsError) {
      fetchEnrollments(currentUser.user_id);
    }
  }, [currentUser?.user_id]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter((e) => e.courseName.toLowerCase().includes(q));
  }, [enrollments, searchQuery]);

  const handleViewCourse = (courseId: number, enrollmentId: number) => {
    setSelectedCourse(courseId, enrollmentId);
    onViewChange?.('learning');
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="courses" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="courses" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
              />
            </div>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span
                    onClick={() => onViewChange?.('dashboard')}
                    className="hover:text-slate-600 cursor-pointer"
                  >
                    Home
                  </span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-blue-600">My Courses</span>
                </nav>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001D6E] tracking-tight">My Courses</h1>
                {!enrollmentsLoading && !enrollmentsError && (
                  <p className="text-sm text-slate-500 mt-1">
                    {enrollments.length} course{enrollments.length !== 1 ? 's' : ''} enrolled
                  </p>
                )}
              </div>
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
              <div className="flex items-center justify-center py-24 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading courses...</span>
              </div>
            )}

            {/* Grid */}
            {!enrollmentsLoading && !enrollmentsError && (
              <>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
                    <p className="text-sm font-bold text-slate-400">
                      {searchQuery
                        ? 'No courses match your search.'
                        : 'You are not enrolled in any courses yet.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {filtered.map((enrollment) => {
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
                          className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm shadow-slate-900/5 hover:shadow-md hover:border-blue-500/20 transition-all duration-300 flex flex-col"
                        >
                          {/* Thumbnail */}
                          <div
                            className={`h-36 bg-gradient-to-br ${gradientFor(enrollment.courseId)} relative flex items-center justify-center overflow-hidden shrink-0`}
                          >
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                            <span className="relative text-4xl font-extrabold text-white/80 select-none tracking-tight">
                              {initials}
                            </span>
                          </div>

                          {/* Body */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${STATUS_BADGE[enrollment.enrollmentStatus] ?? 'bg-slate-100 text-slate-600'}`}>
                                  {enrollment.enrollmentStatus.replace('_', ' ')}
                                </span>
                              </div>
                              <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
                                {enrollment.courseName}
                              </h3>
                            </div>

                            {/* Progress */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                                <span className="flex items-center gap-1">
                                  <Layers className="h-3 w-3" />
                                  Progress
                                </span>
                                <span className="text-[#001D6E]">{pct}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <button
                                onClick={() =>
                                  handleViewCourse(enrollment.courseId, enrollment.enrollmentId)
                                }
                                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                {pct === 100 ? 'Review Course' : pct > 0 ? 'Continue' : 'Start Course'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default MyCourse;
