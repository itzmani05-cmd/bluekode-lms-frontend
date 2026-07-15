import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight, BookOpen, Layers, RefreshCw, AlertTriangle, Search,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';
import { fetchCourses } from '../../lib/api/courses';
import type { Course } from '../../store/Admin';
import useDocumentTitle from '../../hooks/useDocumentTitle';

// ── Colour palette cycles for cards with no image ──────────────────────────────

const CARD_GRADIENTS = [
  'from-blue-600 to-sky-500',
  'from-indigo-600 to-violet-500',
  'from-teal-500 to-emerald-400',
  'from-slate-700 to-slate-900',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
];

const gradientFor = (id: number) => CARD_GRADIENTS[id % CARD_GRADIENTS.length];

// ── Card ─────────────────────────────────────────────────────────────────────

interface CourseDbCardProps {
  course:    Course;
  onLearn?:  () => void;
}

const CourseDbCard: React.FC<CourseDbCardProps> = ({ course, onLearn }) => {
  const initials = course.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm shadow-slate-900/5 hover:shadow-md hover:border-blue-500/20 transition-all duration-300 flex flex-col">
      {/* Thumbnail */}
      <div className={`h-36 bg-gradient-to-br ${gradientFor(course.id)} relative flex items-center justify-center overflow-hidden shrink-0`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <span className="relative text-4xl font-extrabold text-white/80 select-none tracking-tight">
          {initials}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
            {course.moduleCount} {course.moduleCount === 1 ? 'Module' : 'Modules'}
          </span>
          <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2">
            {course.name}
          </h3>
          {course.description && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2 font-medium leading-relaxed">
              {course.description}
            </p>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <Layers className="h-3 w-3" />
            <span>{course.moduleCount} modules</span>
          </div>
          <button
            onClick={onLearn}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            View Course
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

type StudentView = 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';

const MyCourse: React.FC<{ onViewChange?: (view: StudentView) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Course Library');
  const { courseSearchQuery: searchQuery, setCourseSearchQuery: setSearchQuery } = useStudentStore();

  const [courses,  setCourses]  = useState<Course[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCourses()
      .then((all) => {
        setCourses(all.filter((c) => c.status === 'ACTIVE'));
        setApiError(null);
      })
      .catch(() => setApiError('Could not load courses. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return courses;
    return courses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q),
    );
  }, [courses, searchQuery]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="courses" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="courses" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search courses by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
              />
            </div>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span onClick={() => onViewChange?.('dashboard')} className="hover:text-slate-600 cursor-pointer">
                    Home
                  </span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-blue-600">My Courses</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Course Library</h1>
                {!loading && !apiError && (
                  <p className="text-sm text-slate-500 mt-1">
                    {courses.length} course{courses.length !== 1 ? 's' : ''} available
                  </p>
                )}
              </div>
            </div>

            {/* Error */}
            {apiError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{apiError}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-24 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading courses...</span>
              </div>
            )}

            {/* Grid */}
            {!loading && !apiError && (
              <>
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
                    <p className="text-sm font-bold text-slate-400">
                      {searchQuery ? 'No courses match your search.' : 'No active courses available yet.'}
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
                    {filtered.map((course) => (
                      <CourseDbCard
                        key={course.id}
                        course={course}
                        onLearn={() => onViewChange?.('learning')}
                      />
                    ))}
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
