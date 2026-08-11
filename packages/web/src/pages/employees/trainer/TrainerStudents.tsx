import React, { useEffect, useState } from 'react';
import { Search, ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, RefreshCw, AlertTriangle, Users, BookOpen, ClipboardList, ListChecks } from 'lucide-react';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { useAppStore } from '../../../store/login';
import { fetchMyEmployeeProfile } from '../../../lib/api/employees';
import { fetchAccessibleStudentsApi } from '../../../lib/api/trainerAssignments';
import type { AccessibleStudent } from '../../../lib/api/trainerAssignments';

type EnrollmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ProgressStatus   = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

const enrollmentCfg: Record<EnrollmentStatus, { label: string; className: string }> = {
  ASSIGNED:    { label: 'Assigned',    className: 'bg-amber-50 text-amber-600 border-amber-100'      },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-blue-600 border-blue-100'          },
  COMPLETED:   { label: 'Completed',   className: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-slate-100 text-slate-400 border-slate-200'     },
};

const progressIconCfg: Record<ProgressStatus, { Icon: React.ElementType; className: string }> = {
  NOT_STARTED: { Icon: Circle,       className: 'text-slate-300'   },
  IN_PROGRESS: { Icon: Clock,        className: 'text-blue-500'    },
  COMPLETED:   { Icon: CheckCircle2, className: 'text-emerald-500' },
};

const typeBadgeCls: Record<string, string> = {
  STUDENT:     'bg-indigo-50 text-indigo-700 border-indigo-100',
  INSTITUTION: 'bg-teal-50   text-teal-700   border-teal-100',
};

const TrainerStudents: React.FC<{ onViewChange?: (view: TrainerViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('My Students');
  const { currentUser } = useAppStore();

  const [students,     setStudents]     = useState<AccessibleStudent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [search,       setSearch]       = useState('');
  const [courseFilter, setCourse]       = useState('All Courses');
  const [statusFilter, setStatus]       = useState<'ALL' | EnrollmentStatus>('ALL');
  const [expandedKey,  setExpandedKey]  = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    fetchMyEmployeeProfile(currentUser.user_id)
      .then((profile) => fetchAccessibleStudentsApi(profile.id))
      .then(setStudents)
      .catch(() => setFetchError('Could not load your assigned students. Please try again.'))
      .finally(() => setLoading(false));
  }, [currentUser?.user_id]);

  const courseNames = ['All Courses', ...Array.from(new Set(students.map((s) => s.course.name)))];

  const filtered = students.filter((s) => {
    const matchesCourse  = courseFilter === 'All Courses' || s.course.name === courseFilter;
    const status         = (s.student.enrollment?.status ?? 'ASSIGNED') as EnrollmentStatus;
    const matchesStatus  = statusFilter === 'ALL' || status === statusFilter;
    const matchesSearch  = search === '' ||
      s.student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.student.institution.toLowerCase().includes(search.toLowerCase());
    return matchesCourse && matchesStatus && matchesSearch;
  });

  const statusCounts = (['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] as EnrollmentStatus[]).map((st) => ({
    status: st,
    count: students.filter((s) => (s.student.enrollment?.status ?? 'ASSIGNED') === st).length,
  }));

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-students" onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-students" onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001D6E] tracking-tight">My Students</h1>
              <p className="text-sm text-slate-500 mt-1">Track enrollment status and per-lecture progress for each assigned student.</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading your students...</span>
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
                    {courseNames.map((c) => <option key={c}>{c}</option>)}
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
                  {statusCounts.map(({ status, count }) => {
                    const cfg = enrollmentCfg[status];
                    return (
                      <div key={status} className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold ${cfg.className}`}>
                        {cfg.label}: {count}
                      </div>
                    );
                  })}
                </div>

                {/* Students List */}
                {students.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm">
                    <Users className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-semibold">No students assigned to you yet.</p>
                    <p className="text-xs text-slate-300 font-semibold mt-1">Contact your administrator to get student assignments.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.length === 0 ? (
                      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-400 text-sm font-semibold shadow-sm">
                        No students match your filters.
                      </div>
                    ) : filtered.map((s) => {
                      const rowKey     = `${s.student.profileId}-${s.course.id}`;
                      const status     = (s.student.enrollment?.status ?? 'ASSIGNED') as EnrollmentStatus;
                      const cfg        = enrollmentCfg[status];
                      const pct        = parseFloat(s.student.enrollment?.completionPercentage ?? '0');
                      const progresses = s.student.enrollment?.progresses ?? [];
                      const completed  = progresses.filter((p) => p.progressStatus === 'COMPLETED').length;
                      const isOpen     = expandedKey === rowKey;

                      return (
                        <div key={rowKey} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                          <button
                            onClick={() => setExpandedKey(isOpen ? null : rowKey)}
                            className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                          >
                            <div className="h-10 w-10 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-extrabold text-sm flex items-center justify-center shrink-0">
                              {s.student.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-extrabold text-slate-900">{s.student.fullName}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${cfg.className}`}>{cfg.label}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${typeBadgeCls[s.assignmentType]}`}>
                                  {s.assignmentType === 'STUDENT' ? 'Student Assignment' : 'Institution Assignment'}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-semibold mt-0.5 truncate">
                                {s.student.institution}
                                {s.student.department ? ` · ${s.student.department}` : ''}
                                {' · '}{s.course.name}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0 min-w-[80px]">
                              <span className="text-sm font-extrabold text-[#001D6E]">{pct.toFixed(0)}%</span>
                              <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[9px] text-slate-400 font-semibold">
                                {progresses.length > 0 ? `${completed}/${progresses.length} done` : 'No lectures'}
                              </span>
                            </div>
                            {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
                          </button>

                          {isOpen && (() => {
                            const lectures    = progresses.filter((p) => p.contentType === 'LECTURE');
                            const assignments = progresses.filter((p) => p.contentType === 'ASSIGNMENT');
                            const tasks       = progresses.filter((p) => p.contentType === 'TASK');

                            const totals = s.student.enrollment?.totalsByType;
                            const typeSections = [
                              { label: 'Lectures',    Icon: BookOpen,      items: lectures,    total: totals?.LECTURE    ?? lectures.length,    bar: 'bg-blue-500',    text: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
                              { label: 'Assignments', Icon: ClipboardList, items: assignments, total: totals?.ASSIGNMENT ?? assignments.length, bar: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
                              { label: 'Tasks',       Icon: ListChecks,    items: tasks,       total: totals?.TASK       ?? tasks.length,       bar: 'bg-amber-500',  text: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100'  },
                            ];

                            const contentTypeBadge: Record<string, string> = {
                              LECTURE:    'bg-blue-50 text-blue-600 border-blue-100',
                              ASSIGNMENT: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                              TASK:       'bg-amber-50 text-amber-600 border-amber-100',
                            };
                            const contentTypeLabel: Record<string, string> = {
                              LECTURE: 'Lecture', ASSIGNMENT: 'Assignment', TASK: 'Task',
                            };

                            return (
                              <div className="border-t border-slate-100 px-5 pb-5 pt-4 bg-slate-50/50">
                                {progresses.length === 0 ? (
                                  <p className="text-xs text-slate-400 font-semibold">No progress recorded yet.</p>
                                ) : (
                                  <>
                                    {/* Per-type summary bars */}
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">Progress Summary</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                                      {typeSections.map(({ label, Icon, items, total, bar, text, bg, border }) => {
                                        const done = items.filter((p) => p.progressStatus === 'COMPLETED').length;
                                        const pctType = total > 0 ? Math.round((done / total) * 100) : 0;
                                        return (
                                          <div key={label} className={`rounded-xl border ${border} ${bg} px-4 py-3`}>
                                            <div className="flex items-center gap-2 mb-2">
                                              <Icon className={`h-4 w-4 shrink-0 ${text}`} />
                                              <span className={`text-[11px] font-extrabold ${text}`}>{label}</span>
                                              <span className={`ml-auto text-sm font-extrabold ${text}`}>{pctType}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden mb-1.5">
                                              <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${pctType}%` }} />
                                            </div>
                                            <p className="text-[10px] font-semibold text-slate-500">
                                              {total === 0 ? 'None in course' : `${done} / ${total} completed`}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Detailed item list */}
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">All Items</p>
                                    <div className="space-y-2">
                                      {progresses.map((lec) => {
                                        const ps = lec.progressStatus as ProgressStatus;
                                        const { Icon, className } = progressIconCfg[ps] ?? progressIconCfg.NOT_STARTED;
                                        return (
                                          <div key={lec.lectureId} className="flex items-center gap-3">
                                            <Icon className={`h-4 w-4 shrink-0 ${className}`} />
                                            <span className="text-xs font-semibold text-slate-700 flex-1">{lec.title}</span>
                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${contentTypeBadge[lec.contentType] ?? 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                              {contentTypeLabel[lec.contentType] ?? lec.contentType}
                                            </span>
                                            <span className={`text-[9px] font-extrabold w-20 text-right
                                              ${ps === 'COMPLETED'   ? 'text-emerald-600' :
                                                ps === 'IN_PROGRESS' ? 'text-blue-600'    : 'text-slate-400'}`}
                                            >
                                              {ps === 'NOT_STARTED' ? 'Not Started' :
                                               ps === 'IN_PROGRESS' ? 'In Progress'  : 'Completed'}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                                {s.student.enrollment?.assignedDate && (
                                  <div className="mt-4 text-[10px] text-slate-400 font-semibold">
                                    Enrolled:{' '}
                                    {new Date(s.student.enrollment.assignedDate).toLocaleDateString('en-US', {
                                      month: 'short', day: 'numeric', year: 'numeric',
                                    })}
                                    {' · '}Email: {s.student.email}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
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

export default TrainerStudents;
