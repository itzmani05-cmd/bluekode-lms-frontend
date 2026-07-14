import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock } from 'lucide-react';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

type EnrollmentStatus  = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ProgressStatus    = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
type ContentType       = 'LECTURE' | 'ASSIGNMENT';

interface LectureProgress {
  lecture_id: number;
  title: string;
  content_type: ContentType;
  progress_status: ProgressStatus;
}

interface Student {
  student_id: number;
  student_name: string;
  email: string;
  institution: string;
  department: string;
  course_name: string;
  enrollment_status: EnrollmentStatus;
  completion_percentage: number;
  assigned_date: string;
  lectures: LectureProgress[];
}

const students: Student[] = [
  {
    student_id: 1, student_name: 'Arjun Mehta',    email: 'arjun@nexus.edu',   institution: 'Nexus Institute',  department: 'Computer Science', course_name: 'Cybersecurity Essentials', enrollment_status: 'IN_PROGRESS', completion_percentage: 65,  assigned_date: 'Jun 01, 2026',
    lectures: [
      { lecture_id: 1, title: 'Intro to Cybersecurity',     content_type: 'LECTURE',    progress_status: 'COMPLETED'   },
      { lecture_id: 2, title: 'Threat Landscape',           content_type: 'LECTURE',    progress_status: 'COMPLETED'   },
      { lecture_id: 3, title: 'Security Audit Case Study',  content_type: 'ASSIGNMENT', progress_status: 'IN_PROGRESS' },
      { lecture_id: 4, title: 'Compliance Framework Essay', content_type: 'ASSIGNMENT', progress_status: 'NOT_STARTED' },
    ],
  },
  {
    student_id: 2, student_name: 'Kavya Reddy',    email: 'kavya@synergy.edu',  institution: 'Synergy College',  department: 'Information Tech',  course_name: 'Cloud Infrastructure',     enrollment_status: 'IN_PROGRESS', completion_percentage: 42,  assigned_date: 'Jun 05, 2026',
    lectures: [
      { lecture_id: 5, title: 'Cloud Basics',               content_type: 'LECTURE',    progress_status: 'COMPLETED'   },
      { lecture_id: 6, title: 'Network Topology Design',    content_type: 'ASSIGNMENT', progress_status: 'IN_PROGRESS' },
      { lecture_id: 7, title: 'Load Balancer Config',       content_type: 'ASSIGNMENT', progress_status: 'NOT_STARTED' },
    ],
  },
  {
    student_id: 3, student_name: 'Meera Krishnan', email: 'meera@nexus.edu',    institution: 'Nexus Institute',  department: 'Computer Science', course_name: 'DevOps Fundamentals',      enrollment_status: 'COMPLETED',   completion_percentage: 100, assigned_date: 'May 10, 2026',
    lectures: [
      { lecture_id: 8,  title: 'DevOps Overview',           content_type: 'LECTURE',    progress_status: 'COMPLETED'   },
      { lecture_id: 9,  title: 'CI/CD Pipeline Setup',      content_type: 'ASSIGNMENT', progress_status: 'COMPLETED'   },
      { lecture_id: 10, title: 'Docker Containerisation',   content_type: 'ASSIGNMENT', progress_status: 'COMPLETED'   },
    ],
  },
  {
    student_id: 4, student_name: 'Rohan Kapoor',   email: 'rohan@pioneer.edu',  institution: 'Pioneer Training', department: 'Networking',        course_name: 'Cybersecurity Essentials', enrollment_status: 'IN_PROGRESS', completion_percentage: 30,  assigned_date: 'Jun 10, 2026',
    lectures: [
      { lecture_id: 1, title: 'Intro to Cybersecurity',     content_type: 'LECTURE',    progress_status: 'COMPLETED'   },
      { lecture_id: 2, title: 'Threat Landscape',           content_type: 'LECTURE',    progress_status: 'IN_PROGRESS' },
      { lecture_id: 3, title: 'Security Audit Case Study',  content_type: 'ASSIGNMENT', progress_status: 'NOT_STARTED' },
      { lecture_id: 4, title: 'Compliance Framework Essay', content_type: 'ASSIGNMENT', progress_status: 'NOT_STARTED' },
    ],
  },
  {
    student_id: 5, student_name: 'Aditya Singh',   email: 'aditya@techcorp.edu', institution: 'TechCorp Academy', department: 'Cloud Computing',  course_name: 'Cloud Infrastructure',     enrollment_status: 'ASSIGNED',    completion_percentage: 0,   assigned_date: 'Jul 01, 2026',
    lectures: [
      { lecture_id: 5, title: 'Cloud Basics',               content_type: 'LECTURE',    progress_status: 'NOT_STARTED' },
      { lecture_id: 6, title: 'Network Topology Design',    content_type: 'ASSIGNMENT', progress_status: 'NOT_STARTED' },
      { lecture_id: 7, title: 'Load Balancer Config',       content_type: 'ASSIGNMENT', progress_status: 'NOT_STARTED' },
    ],
  },
  {
    student_id: 6, student_name: 'Priya Nair',     email: 'priya@synergy.edu',  institution: 'Synergy College',  department: 'Information Tech',  course_name: 'DevOps Fundamentals',      enrollment_status: 'COMPLETED',   completion_percentage: 100, assigned_date: 'May 15, 2026',
    lectures: [
      { lecture_id: 8,  title: 'DevOps Overview',           content_type: 'LECTURE',    progress_status: 'COMPLETED'   },
      { lecture_id: 9,  title: 'CI/CD Pipeline Setup',      content_type: 'ASSIGNMENT', progress_status: 'COMPLETED'   },
      { lecture_id: 10, title: 'Docker Containerisation',   content_type: 'ASSIGNMENT', progress_status: 'COMPLETED'   },
    ],
  },
];

const enrollmentCfg: Record<EnrollmentStatus, { label: string; className: string }> = {
  ASSIGNED:    { label: 'Assigned',    className: 'bg-amber-50 text-amber-600 border-amber-100'     },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-blue-600 border-blue-100'         },
  COMPLETED:   { label: 'Completed',   className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-slate-100 text-slate-400 border-slate-200'    },
};

const progressIconCfg: Record<ProgressStatus, { Icon: React.ElementType; className: string }> = {
  NOT_STARTED: { Icon: Circle,       className: 'text-slate-300'   },
  IN_PROGRESS: { Icon: Clock,        className: 'text-blue-500'    },
  COMPLETED:   { Icon: CheckCircle2, className: 'text-emerald-500' },
};

const courses = ['All Courses', 'Cybersecurity Essentials', 'Cloud Infrastructure', 'DevOps Fundamentals'];

const TrainerStudents: React.FC<{ onViewChange?: (view: TrainerViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('My Students');
  const [search, setSearch]         = useState('');
  const [courseFilter, setCourse]   = useState('All Courses');
  const [statusFilter, setStatus]   = useState<'ALL' | EnrollmentStatus>('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = students.filter((s) => {
    const matchesCourse  = courseFilter === 'All Courses' || s.course_name === courseFilter;
    const matchesStatus  = statusFilter === 'ALL' || s.enrollment_status === statusFilter;
    const matchesSearch  = search === '' ||
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.institution.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-students" onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-students" onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">My Students</h1>
              <p className="text-sm text-slate-500 mt-1">Track enrollment status and per-lecture progress for each student.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search student or institution..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all"
                />
              </div>
              <select
                value={courseFilter}
                onChange={(e) => setCourse(e.target.value)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all"
              >
                {courses.map((c) => <option key={c}>{c}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatus(e.target.value as 'ALL' | EnrollmentStatus)}
                className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Summary chips */}
            <div className="flex gap-3 flex-wrap">
              {(['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as EnrollmentStatus[]).map((s) => {
                const cfg   = enrollmentCfg[s];
                const count = students.filter(st => st.enrollment_status === s).length;
                return (
                  <div key={s} className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold ${cfg.className}`}>
                    {cfg.label}: {count}
                  </div>
                );
              })}
            </div>

            {/* Students List */}
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-sm font-semibold shadow-sm">
                  No students match your filters.
                </div>
              ) : filtered.map((student) => {
                const cfg       = enrollmentCfg[student.enrollment_status];
                const isOpen    = expandedId === student.student_id;
                const completed = student.lectures.filter(l => l.progress_status === 'COMPLETED').length;

                return (
                  <div key={student.student_id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                    {/* Row */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : student.student_id)}
                      className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-extrabold text-sm flex items-center justify-center shrink-0">
                        {student.student_name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-extrabold text-slate-900">{student.student_name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${cfg.className}`}>{cfg.label}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold mt-0.5 truncate">
                          {student.institution} · {student.department} · {student.course_name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 min-w-[80px]">
                        <span className="text-sm font-extrabold text-[#001D6E]">{student.completion_percentage}%</span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${student.completion_percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${student.completion_percentage}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold">{completed}/{student.lectures.length} done</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                    </button>

                    {/* Expanded: lecture progress */}
                    {isOpen && (
                      <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50/50">
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Lecture & Assignment Progress</p>
                        <div className="space-y-2">
                          {student.lectures.map((lec) => {
                            const { Icon, className } = progressIconCfg[lec.progress_status];
                            return (
                              <div key={lec.lecture_id} className="flex items-center gap-3">
                                <Icon className={`h-4 w-4 shrink-0 ${className}`} />
                                <span className="text-xs font-semibold text-slate-700 flex-1">{lec.title}</span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border
                                  ${lec.content_type === 'ASSIGNMENT'
                                    ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}
                                >
                                  {lec.content_type === 'ASSIGNMENT' ? 'Assignment' : 'Lecture'}
                                </span>
                                <span className={`text-[9px] font-extrabold w-20 text-right
                                  ${lec.progress_status === 'COMPLETED'   ? 'text-emerald-600' :
                                    lec.progress_status === 'IN_PROGRESS' ? 'text-blue-600'    : 'text-slate-400'}`}
                                >
                                  {lec.progress_status === 'NOT_STARTED' ? 'Not Started' :
                                   lec.progress_status === 'IN_PROGRESS' ? 'In Progress'  : 'Completed'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-4 text-[10px] text-slate-400 font-semibold">
                          Enrolled: {student.assigned_date} · Email: {student.email}
                        </div>
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

export default TrainerStudents;
