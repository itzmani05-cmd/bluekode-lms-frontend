import React, { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronUp, ClipboardList,
  FileText, AlertTriangle, CheckCircle2, Clock, Archive,
} from 'lucide-react';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';

type CourseStatus     = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
type LectureStatus    = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
type ContentType      = 'LECTURE' | 'ASSIGNMENT';

interface Lecture {
  lecture_id: number;
  title: string;
  content_type: ContentType;
  lecture_status: LectureStatus;
  assignment_status: AssignmentStatus | null;
  due_date: string | null;
  max_marks: number | null;
  estimated_duration_minutes: number | null;
  submissions_count: number;
  pending_review_count: number;
}

interface Module {
  module_id: number;
  module_name: string;
  module_order: number;
  lectures: Lecture[];
}

interface Course {
  course_id: number;
  course_name: string;
  status: CourseStatus;
  description: string;
  enrolled_students: number;
  modules: Module[];
}

const courses: Course[] = [
  {
    course_id: 1, course_name: 'Cybersecurity Essentials', status: 'ACTIVE',
    description: 'Covers threat landscapes, auditing, and compliance frameworks.',
    enrolled_students: 18,
    modules: [
      {
        module_id: 1, module_name: 'Module 1: Foundations', module_order: 1,
        lectures: [
          { lecture_id: 1, title: 'Intro to Cybersecurity',    content_type: 'LECTURE',    lecture_status: 'PUBLISHED', assignment_status: null,        due_date: null,           max_marks: null, estimated_duration_minutes: 45, submissions_count: 0, pending_review_count: 0 },
          { lecture_id: 2, title: 'Threat Landscape Overview', content_type: 'LECTURE',    lecture_status: 'PUBLISHED', assignment_status: null,        due_date: null,           max_marks: null, estimated_duration_minutes: 40, submissions_count: 0, pending_review_count: 0 },
        ],
      },
      {
        module_id: 2, module_name: 'Module 3: Auditing', module_order: 2,
        lectures: [
          { lecture_id: 3, title: 'Security Audit Case Study',  content_type: 'ASSIGNMENT', lecture_status: 'PUBLISHED', assignment_status: 'ACTIVE',    due_date: 'Jul 12, 2026', max_marks: 100,  estimated_duration_minutes: null, submissions_count: 8,  pending_review_count: 3 },
          { lecture_id: 4, title: 'Compliance Framework Essay', content_type: 'ASSIGNMENT', lecture_status: 'PUBLISHED', assignment_status: 'ACTIVE',    due_date: 'Jul 18, 2026', max_marks: 100,  estimated_duration_minutes: null, submissions_count: 4,  pending_review_count: 1 },
        ],
      },
    ],
  },
  {
    course_id: 2, course_name: 'Cloud Infrastructure', status: 'ACTIVE',
    description: 'Networking fundamentals, load balancing, and cloud architecture.',
    enrolled_students: 14,
    modules: [
      {
        module_id: 3, module_name: 'Module 1: Cloud Basics', module_order: 1,
        lectures: [
          { lecture_id: 5, title: 'Cloud Fundamentals', content_type: 'LECTURE', lecture_status: 'PUBLISHED', assignment_status: null, due_date: null, max_marks: null, estimated_duration_minutes: 50, submissions_count: 0, pending_review_count: 0 },
        ],
      },
      {
        module_id: 4, module_name: 'Module 2: Networking', module_order: 2,
        lectures: [
          { lecture_id: 6, title: 'Network Topology Design', content_type: 'ASSIGNMENT', lecture_status: 'PUBLISHED', assignment_status: 'ACTIVE',   due_date: 'Jul 15, 2026', max_marks: 80, estimated_duration_minutes: null, submissions_count: 6, pending_review_count: 2 },
          { lecture_id: 7, title: 'Load Balancer Config',    content_type: 'ASSIGNMENT', lecture_status: 'PUBLISHED', assignment_status: 'PUBLISHED', due_date: 'Jul 22, 2026', max_marks: 80, estimated_duration_minutes: null, submissions_count: 2, pending_review_count: 0 },
        ],
      },
    ],
  },
  {
    course_id: 3, course_name: 'DevOps Fundamentals', status: 'ACTIVE',
    description: 'CI/CD pipelines, containerisation, and DevOps culture.',
    enrolled_students: 20,
    modules: [
      {
        module_id: 5, module_name: 'Module 1: DevOps Overview', module_order: 1,
        lectures: [
          { lecture_id: 8, title: 'DevOps Culture & Practices', content_type: 'LECTURE', lecture_status: 'PUBLISHED', assignment_status: null, due_date: null, max_marks: null, estimated_duration_minutes: 35, submissions_count: 0, pending_review_count: 0 },
        ],
      },
      {
        module_id: 6, module_name: 'Module 4: Pipelines', module_order: 2,
        lectures: [
          { lecture_id: 9, title: 'CI/CD Pipeline Setup', content_type: 'ASSIGNMENT', lecture_status: 'PUBLISHED', assignment_status: 'CLOSED', due_date: 'Jul 01, 2026', max_marks: 100, estimated_duration_minutes: null, submissions_count: 12, pending_review_count: 0 },
        ],
      },
      {
        module_id: 7, module_name: 'Module 5: Containers', module_order: 3,
        lectures: [
          { lecture_id: 10, title: 'Docker Containerisation', content_type: 'ASSIGNMENT', lecture_status: 'PUBLISHED', assignment_status: 'CLOSED', due_date: 'Jul 08, 2026', max_marks: 90, estimated_duration_minutes: null, submissions_count: 18, pending_review_count: 0 },
        ],
      },
    ],
  },
];

const courseStatusCfg: Record<CourseStatus, { label: string; className: string }> = {
  DRAFT:    { label: 'Draft',    className: 'bg-slate-100 text-slate-500 border-slate-200'     },
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-400 border-slate-200'     },
};

const assignmentStatusCfg: Record<AssignmentStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Draft',     className: 'bg-slate-100 text-slate-500 border-slate-200'      },
  PUBLISHED: { label: 'Published', className: 'bg-blue-50 text-blue-600 border-blue-100'          },
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700 border-emerald-100'  },
  ARCHIVED:  { label: 'Archived',  className: 'bg-slate-100 text-slate-400 border-slate-200'      },
  CLOSED:    { label: 'Closed',    className: 'bg-slate-50 text-slate-400 border-slate-200'       },
};

const TrainerCourses: React.FC<{ onViewChange?: (view: TrainerViewType) => void }> = ({ onViewChange }) => {
  const [expandedCourse, setExpandedCourse] = useState<number | null>(1);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const totalPending = courses.flatMap(c => c.modules.flatMap(m => m.lectures))
    .reduce((acc, l) => acc + l.pending_review_count, 0);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-courses" onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-courses" onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">My Courses</h1>
                <p className="text-sm text-slate-500 mt-1">View modules, lectures, and assignments for each course you teach.</p>
              </div>
              {totalPending > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {totalPending} assignments pending review
                </div>
              )}
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#001D6E]">{courses.length}</p>
                  <p className="text-[10px] font-bold text-slate-500">Active Courses</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#001D6E]">
                    {courses.flatMap(c => c.modules.flatMap(m => m.lectures)).filter(l => l.content_type === 'ASSIGNMENT').length}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">Total Assignments</p>
                </div>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-[#001D6E]">
                    {courses.reduce((acc, c) => acc + c.enrolled_students, 0)}
                  </p>
                  <p className="text-[10px] font-bold text-slate-500">Enrolled Students</p>
                </div>
              </div>
            </div>

            {/* Course cards */}
            <div className="space-y-4">
              {courses.map((course) => {
                const isCourseOpen    = expandedCourse === course.course_id;
                const courseCfg       = courseStatusCfg[course.status];
                const totalAssignments = course.modules.flatMap(m => m.lectures).filter(l => l.content_type === 'ASSIGNMENT').length;
                const pendingInCourse  = course.modules.flatMap(m => m.lectures).reduce((a, l) => a + l.pending_review_count, 0);

                return (
                  <div key={course.course_id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    {/* Course header */}
                    <button
                      onClick={() => setExpandedCourse(isCourseOpen ? null : course.course_id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="p-2.5 bg-[#001D6E]/5 border border-[#001D6E]/10 rounded-xl text-[#001D6E] shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-extrabold text-slate-900">{course.course_name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${courseCfg.className}`}>{courseCfg.label}</span>
                          {pendingInCourse > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold border bg-amber-50 text-amber-600 border-amber-100 flex items-center gap-1">
                              <AlertTriangle className="h-2.5 w-2.5" />{pendingInCourse} pending
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{course.description}</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0 text-center">
                        <div>
                          <p className="text-sm font-extrabold text-[#001D6E]">{course.modules.length}</p>
                          <p className="text-[9px] font-bold text-slate-400">Modules</p>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-[#001D6E]">{totalAssignments}</p>
                          <p className="text-[9px] font-bold text-slate-400">Assignments</p>
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-[#001D6E]">{course.enrolled_students}</p>
                          <p className="text-[9px] font-bold text-slate-400">Students</p>
                        </div>
                        {isCourseOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Modules */}
                    {isCourseOpen && (
                      <div className="border-t border-slate-100 divide-y divide-slate-100">
                        {course.modules.map((mod) => {
                          const isModOpen = expandedModule === mod.module_id;
                          return (
                            <div key={mod.module_id}>
                              <button
                                onClick={() => setExpandedModule(isModOpen ? null : mod.module_id)}
                                className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-slate-50/50 transition-colors bg-slate-50/30"
                              >
                                <span className="text-xs font-extrabold text-slate-700 flex-1">{mod.module_name}</span>
                                <span className="text-[10px] font-semibold text-slate-400">{mod.lectures.length} item{mod.lectures.length !== 1 ? 's' : ''}</span>
                                {isModOpen ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                              </button>

                              {/* Lectures / Assignments */}
                              {isModOpen && (
                                <div className="divide-y divide-slate-50">
                                  {mod.lectures.map((lec) => {
                                    const isAssignment = lec.content_type === 'ASSIGNMENT';
                                    const asCfg = lec.assignment_status ? assignmentStatusCfg[lec.assignment_status] : null;
                                    return (
                                      <div key={lec.lecture_id} className="flex items-center gap-4 px-8 py-3.5">
                                        <div className={`p-1.5 rounded-lg shrink-0 ${isAssignment ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                          {isAssignment ? <ClipboardList className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-slate-800">{lec.title}</p>
                                          <p className="text-[10px] text-slate-400 font-semibold">
                                            {isAssignment
                                              ? `Due: ${lec.due_date} · Max: ${lec.max_marks} marks`
                                              : `${lec.estimated_duration_minutes} min`
                                            }
                                          </p>
                                        </div>
                                        {isAssignment && asCfg && (
                                          <>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${asCfg.className}`}>
                                              {asCfg.label}
                                            </span>
                                            <div className="flex items-center gap-3 shrink-0 text-right">
                                              <div className="text-center">
                                                <p className="text-xs font-extrabold text-slate-700">{lec.submissions_count}</p>
                                                <p className="text-[9px] font-bold text-slate-400">Submitted</p>
                                              </div>
                                              {lec.pending_review_count > 0 ? (
                                                <div className="flex items-center gap-1 text-amber-600">
                                                  <AlertTriangle className="h-3.5 w-3.5" />
                                                  <div className="text-center">
                                                    <p className="text-xs font-extrabold">{lec.pending_review_count}</p>
                                                    <p className="text-[9px] font-bold text-amber-500">Pending</p>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-1 text-emerald-500">
                                                  {lec.assignment_status === 'CLOSED'
                                                    ? <Archive className="h-3.5 w-3.5" />
                                                    : <Clock className="h-3.5 w-3.5" />
                                                  }
                                                  <p className="text-[9px] font-bold">
                                                    {lec.assignment_status === 'CLOSED' ? 'Closed' : 'Open'}
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                          </>
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

          </main>
        </div>
      </div>
    </div>
  );
};

export default TrainerCourses;
