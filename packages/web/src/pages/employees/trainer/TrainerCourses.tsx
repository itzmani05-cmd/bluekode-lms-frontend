import React, { useEffect, useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, ClipboardList,
  FileText, AlertTriangle, RefreshCw,
} from 'lucide-react';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { useAppStore } from '../../../store/login';
import { fetchMyEmployeeProfile } from '../../../lib/api/employees';
import { fetchAssignmentsByTrainerApi } from '../../../lib/api/trainerAssignments';
import { fetchCourseByIdApi, type CourseDetail } from '../../../lib/api/courses';
import { fetchModulesApi } from '../../../lib/api/modules';
import { fetchLecturesApi, type Lesson } from '../../../lib/api/lectures';
import type { CourseStatus } from '../../../store/Admin';

interface TrainerModule {
  module_id:    number;
  module_name:  string;
  module_order: number;
  lectures:     Lesson[];
}

interface TrainerCourse extends CourseDetail {
  modules: TrainerModule[];
}

type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

const courseStatusCfg: Record<CourseStatus, { label: string; className: string }> = {
  DRAFT:    { label: 'Draft',    className: 'bg-slate-100 text-slate-500 border-slate-200'     },
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-400 border-slate-200'     },
};

const assignmentStatusCfg: Record<AssignmentStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Draft',     className: 'bg-slate-100 text-slate-500 border-slate-200'     },
  PUBLISHED: { label: 'Published', className: 'bg-blue-50 text-blue-600 border-blue-100'         },
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED:  { label: 'Archived',  className: 'bg-slate-100 text-slate-400 border-slate-200'     },
  CLOSED:    { label: 'Closed',    className: 'bg-slate-50 text-slate-400 border-slate-200'      },
};

const TrainerCourses: React.FC<{ onViewChange?: (view: TrainerViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('My Courses');
  const { currentUser } = useAppStore();

  const [courses,        setCourses]        = useState<TrainerCourse[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    setFetchError(null);

    fetchMyEmployeeProfile(currentUser.user_id)
      .then(async (profile) => {
        const assignments = await fetchAssignmentsByTrainerApi(profile.id);

        // Deduplicate courses from trainer assignments
        const courseMap = new Map<number, number>();
        for (const a of assignments) {
          courseMap.set(a.course.course_id, a.course.course_id);
        }
        const uniqueCourseIds = Array.from(courseMap.keys());

        // Fetch detail + modules for every unique course in parallel
        const coursesData = await Promise.all(
          uniqueCourseIds.map(async (courseId) => {
            const [detail, modules] = await Promise.all([
              fetchCourseByIdApi(courseId),
              fetchModulesApi(courseId),
            ]);

            const sortedModules = [...modules].sort((a, b) => a.order - b.order);

            const modulesWithLectures: TrainerModule[] = await Promise.all(
              sortedModules.map(async (mod) => ({
                module_id:    mod.id,
                module_name:  mod.name,
                module_order: mod.order,
                lectures:     await fetchLecturesApi(mod.id),
              })),
            );

            return { ...detail, modules: modulesWithLectures };
          }),
        );

        setCourses(coursesData);
        if (coursesData.length > 0) setExpandedCourse(coursesData[0].id);
      })
      .catch(() => setFetchError('Could not load your courses. Please try again.'))
      .finally(() => setLoading(false));
  }, [currentUser?.user_id]);

  const allLectures      = courses.flatMap((c) => c.modules.flatMap((m) => m.lectures));
  const totalAssignments = allLectures.filter((l) => l.contentType === 'ASSIGNMENT').length;
  const totalEnrolled    = courses.reduce((acc, c) => acc + c.enrollments, 0);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-courses" onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-courses" onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">My Courses</h1>
              <p className="text-sm text-slate-500 mt-1">View modules, lectures, and assignments for each course you teach.</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading your courses...</span>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{fetchError}</p>
              </div>
            )}

            {!loading && !fetchError && (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#001D6E]">{courses.length}</p>
                      <p className="text-[10px] font-bold text-slate-500">Courses</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#001D6E]">{totalAssignments}</p>
                      <p className="text-[10px] font-bold text-slate-500">Total Assignments</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#001D6E]">{totalEnrolled}</p>
                      <p className="text-[10px] font-bold text-slate-500">Enrolled Students</p>
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {courses.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm">
                    <BookOpen className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-semibold">No courses linked to your student assignments.</p>
                    <p className="text-xs text-slate-300 font-semibold mt-1">Contact your administrator to get student assignments.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => {
                      const isCourseOpen  = expandedCourse === course.id;
                      const courseCfg     = courseStatusCfg[course.status];
                      const courseAssignments = course.modules
                        .flatMap((m) => m.lectures)
                        .filter((l) => l.contentType === 'ASSIGNMENT').length;

                      return (
                        <div key={course.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                          {/* Course header */}
                          <button
                            onClick={() => setExpandedCourse(isCourseOpen ? null : course.id)}
                            className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="p-2.5 bg-[#001D6E]/5 border border-[#001D6E]/10 rounded-xl text-[#001D6E] shrink-0">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-extrabold text-slate-900">{course.name}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${courseCfg.className}`}>
                                  {courseCfg.label}
                                </span>
                              </div>
                              {course.description && (
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5 truncate">{course.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-6 shrink-0 text-center">
                              <div>
                                <p className="text-sm font-extrabold text-[#001D6E]">{course.modules.length}</p>
                                <p className="text-[9px] font-bold text-slate-400">Modules</p>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#001D6E]">{courseAssignments}</p>
                                <p className="text-[9px] font-bold text-slate-400">Assignments</p>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#001D6E]">{course.enrollments}</p>
                                <p className="text-[9px] font-bold text-slate-400">Students</p>
                              </div>
                              {isCourseOpen
                                ? <ChevronUp className="h-4 w-4 text-slate-400" />
                                : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>

                          {/* Modules */}
                          {isCourseOpen && (
                            <div className="border-t border-slate-100 divide-y divide-slate-100">
                              {course.modules.length === 0 ? (
                                <p className="px-6 py-4 text-xs text-slate-400 font-semibold">No modules in this course yet.</p>
                              ) : course.modules.map((mod) => {
                                const isModOpen = expandedModule === mod.module_id;
                                return (
                                  <div key={mod.module_id}>
                                    <button
                                      onClick={() => setExpandedModule(isModOpen ? null : mod.module_id)}
                                      className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-slate-50/50 transition-colors bg-slate-50/30"
                                    >
                                      <span className="text-xs font-extrabold text-slate-700 flex-1">{mod.module_name}</span>
                                      <span className="text-[10px] font-semibold text-slate-400">
                                        {mod.lectures.length} item{mod.lectures.length !== 1 ? 's' : ''}
                                      </span>
                                      {isModOpen
                                        ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                                        : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                                    </button>

                                    {/* Lectures / Assignments */}
                                    {isModOpen && (
                                      <div className="divide-y divide-slate-50">
                                        {mod.lectures.length === 0 ? (
                                          <p className="px-8 py-3 text-xs text-slate-400 font-semibold">No lectures yet.</p>
                                        ) : mod.lectures.map((lec) => {
                                          const isAssignment = lec.contentType === 'ASSIGNMENT';
                                          const asCfg = lec.assignmentStatus
                                            ? assignmentStatusCfg[lec.assignmentStatus as AssignmentStatus]
                                            : null;
                                          return (
                                            <div key={lec.id} className="flex items-center gap-4 px-8 py-3.5">
                                              <div className={`p-1.5 rounded-lg shrink-0 ${isAssignment ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                                {isAssignment
                                                  ? <ClipboardList className="h-3.5 w-3.5" />
                                                  : <FileText className="h-3.5 w-3.5" />}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800">{lec.title}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">
                                                  {isAssignment
                                                    ? `Max: ${lec.maxMarks ?? '—'} marks`
                                                    : `${lec.estimatedDurationMinutes ?? '—'} min`}
                                                </p>
                                              </div>
                                              {asCfg && (
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${asCfg.className}`}>
                                                  {asCfg.label}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
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

export default TrainerCourses;
