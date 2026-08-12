import React, { useEffect, useState } from 'react';
import {
  ClipboardList, Clock, CheckCircle2, RefreshCcw,
  BookOpen, TrendingUp, ChevronRight,
  Star, Users, RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../../../store/login';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { fetchMyEmployeeProfile } from '../../../lib/api/employees';
import {
  fetchTrainerStudentSubmissionsApi,
  fetchAccessibleStudentsApi,
} from '../../../lib/api/trainerAssignments';
import type { TrainerStudentSubmission, AccessibleStudent } from '../../../lib/api/trainerAssignments';

type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED';
type EnrollmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const submissionCfg: Record<SubmissionStatus, { label: string; className: string; Icon: React.ElementType }> = {
  SUBMITTED:             { label: 'Submitted',    className: 'bg-blue-50 text-blue-600 border-blue-100',          Icon: ClipboardList },
  UNDER_REVIEW:          { label: 'Under Review', className: 'bg-amber-50 text-amber-600 border-amber-100',       Icon: Clock         },
  REVIEWED:              { label: 'Reviewed',     className: 'bg-emerald-50 text-emerald-600 border-emerald-100', Icon: CheckCircle2  },
  RESUBMISSION_REQUIRED: { label: 'Resubmission', className: 'bg-red-50 text-red-600 border-red-100',             Icon: RefreshCcw    },
};

const enrollmentCfg: Record<EnrollmentStatus, { label: string; dot: string }> = {
  ASSIGNED:    { label: 'Assigned',    dot: 'bg-amber-400'   },
  IN_PROGRESS: { label: 'In Progress', dot: 'bg-blue-500'    },
  COMPLETED:   { label: 'Completed',   dot: 'bg-emerald-500' },
  CANCELLED:   { label: 'Cancelled',   dot: 'bg-slate-400'   },
};

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const diffHrs = (Date.now() - date.getTime()) / (1000 * 60 * 60);
  if (diffHrs < 1)  return 'Just now';
  if (diffHrs < 24) return `${Math.floor(diffHrs)} hr${Math.floor(diffHrs) > 1 ? 's' : ''} ago`;
  if (diffHrs < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  iconClass: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtext, iconClass, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-slate-900/5 flex items-start gap-4 hover:border-emerald-200 hover:shadow-md transition-all duration-200 text-left w-full"
  >
    <div className={`p-3 rounded-xl border ${iconClass}`}>{icon}</div>
    <div>
      <p className="text-2xl font-extrabold text-[#001D6E] tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
        <TrendingUp className="h-2.5 w-2.5" />{subtext}
      </p>
    </div>
  </button>
);

const RowSkeleton = () => (
  <div className="py-3.5 flex items-center gap-3 animate-pulse">
    <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="h-2.5 bg-slate-100 rounded w-32" />
      <div className="h-2 bg-slate-100 rounded w-48" />
    </div>
    <div className="h-5 w-16 bg-slate-100 rounded-full" />
  </div>
);

interface TrainerDashboardProps {
  onViewChange?: (view: TrainerViewType) => void;
  activeTab?: TrainerViewType;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onViewChange, activeTab = 'trainer-dashboard' }) => {
  useDocumentTitle('Dashboard');
  const { currentUser } = useAppStore();

  const [submissions, setSubmissions] = useState<TrainerStudentSubmission[]>([]);
  const [students,    setStudents]    = useState<AccessibleStudent[]>([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    fetchMyEmployeeProfile(currentUser.user_id)
      .then((profile) =>
        Promise.all([
          fetchTrainerStudentSubmissionsApi(profile.id),
          fetchAccessibleStudentsApi(profile.id),
        ]),
      )
      .then(([subs, studs]) => {
        setSubmissions(subs);
        setStudents(studs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentUser?.user_id]);

  const emailName   = currentUser?.email ? currentUser.email.split('@')[0] : 'Trainer';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  const pendingReviews = submissions.filter(
    (s) => s.submission_status === 'SUBMITTED' || s.submission_status === 'UNDER_REVIEW',
  ).length;

  const totalReviewed      = submissions.filter((s) => s.submission_status === 'REVIEWED').length;
  const reviewedWithMarks  = submissions.filter((s) => s.marks_obtained !== null && (s.max_marks ?? 0) > 0);
  const avgScore           = reviewedWithMarks.length > 0
    ? reviewedWithMarks.reduce((sum, s) => sum + (s.marks_obtained! / s.max_marks!) * 100, 0) / reviewedWithMarks.length
    : 0;

  const inProgressCount = students.filter((s) => s.student.enrollment?.status === 'IN_PROGRESS').length;

  const recentSubs = [...submissions]
    .sort((a, b) => {
      if (!a.submitted_at) return 1;
      if (!b.submitted_at) return -1;
      return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
    })
    .slice(0, 5);

  const topStudents = [...students]
    .sort((a, b) => {
      const pa = parseFloat(a.student.enrollment?.completionPercentage ?? '0');
      const pb = parseFloat(b.student.enrollment?.completionPercentage ?? '0');
      return pb - pa;
    })
    .slice(0, 5);

  const enrollmentStats = [
    { label: 'Assigned',    count: students.filter((s) => (s.student.enrollment?.status ?? 'ASSIGNED') === 'ASSIGNED').length,    barColor: 'bg-amber-500',   textColor: 'text-amber-600',   cardBg: 'bg-amber-50'   },
    { label: 'In Progress', count: students.filter((s) => s.student.enrollment?.status === 'IN_PROGRESS').length, barColor: 'bg-blue-600',    textColor: 'text-blue-600',    cardBg: 'bg-blue-50'    },
    { label: 'Completed',   count: students.filter((s) => s.student.enrollment?.status === 'COMPLETED').length,   barColor: 'bg-emerald-500', textColor: 'text-emerald-600', cardBg: 'bg-emerald-50' },
    { label: 'Cancelled',   count: students.filter((s) => s.student.enrollment?.status === 'CANCELLED').length,   barColor: 'bg-slate-400',   textColor: 'text-slate-500',   cardBg: 'bg-slate-100'  },
  ];
  const totalEnrollments = students.length || 1;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab={activeTab} onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab={activeTab} onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-8">

            {/* Search */}
            <div className="relative max-w-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students, submissions, assignments..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all"
              />
            </div>

            {/* Welcome */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001D6E] tracking-tight">Welcome back, {displayName}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {loading ? 'Loading your data…' : (
                  <>
                    You have{' '}
                    <span className="font-bold text-amber-600">{pendingReviews} submission{pendingReviews !== 1 ? 's' : ''} pending review</span> and{' '}
                    <span className="font-bold text-blue-600">{students.length} student{students.length !== 1 ? 's' : ''} assigned</span> to you.
                  </>
                )}
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<ClipboardList className="h-5 w-5" />}
                label="Pending Reviews"
                value={loading ? '…' : String(pendingReviews)}
                subtext="Needs attention"
                iconClass="bg-amber-50 text-amber-600 border-amber-100"
                onClick={() => onViewChange?.('trainer-submissions')}
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="My Students"
                value={loading ? '…' : String(students.length)}
                subtext={loading ? '' : `${inProgressCount} in progress`}
                iconClass="bg-blue-50 text-blue-600 border-blue-100"
                onClick={() => onViewChange?.('trainer-students')}
              />
              <StatCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Total Submissions"
                value={loading ? '…' : String(submissions.length)}
                subtext={loading ? '' : `${totalReviewed} reviewed`}
                iconClass="bg-emerald-50 text-emerald-600 border-emerald-100"
                onClick={() => onViewChange?.('trainer-submissions')}
              />
              <StatCard
                icon={<Star className="h-5 w-5" />}
                label="Avg. Score Given"
                value={loading ? '…' : avgScore > 0 ? `${Math.round(avgScore)}%` : '—'}
                subtext={loading ? '' : `${reviewedWithMarks.length} graded`}
                iconClass="bg-indigo-50 text-indigo-600 border-indigo-100"
              />
            </div>

            {/* Submissions + Student Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Recent Submissions */}
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-[#001D6E] text-base">Recent Submissions</h3>
                  <button
                    onClick={() => onViewChange?.('trainer-submissions')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {loading ? (
                  <div className="divide-y divide-slate-100">
                    {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
                  </div>
                ) : recentSubs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                    <ClipboardList className="h-7 w-7 mb-2" />
                    <p className="text-xs font-semibold text-slate-400">No submissions yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentSubs.map((sub) => {
                      const cfg        = submissionCfg[sub.submission_status as SubmissionStatus] ?? submissionCfg.SUBMITTED;
                      const StatusIcon = cfg.Icon;
                      return (
                        <div key={sub.submission_id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-start gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-bold text-[10px] flex items-center justify-center shrink-0">
                              {sub.student_name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{sub.student_name}</p>
                              <p className="text-[10px] text-slate-400 font-semibold truncate">{sub.assignment_title}</p>
                              {sub.attempt_no > 1 && (
                                <p className="text-[9px] font-bold text-orange-500 mt-0.5">Attempt #{sub.attempt_no}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border flex items-center gap-1 ${cfg.className}`}>
                              <StatusIcon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{formatRelativeDate(sub.submitted_at)}</span>
                            {sub.marks_obtained !== null && (
                              <span className="text-[9px] font-extrabold text-emerald-600">{sub.marks_obtained} pts</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* My Students */}
              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-[#001D6E] text-base">My Students</h3>
                  <button
                    onClick={() => onViewChange?.('trainer-students')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>

                {loading ? (
                  <div className="divide-y divide-slate-100">
                    {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
                  </div>
                ) : topStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                    <Users className="h-7 w-7 mb-2" />
                    <p className="text-xs font-semibold text-slate-400">No students assigned yet.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {topStudents.map((s) => {
                      const status = (s.student.enrollment?.status ?? 'ASSIGNED') as EnrollmentStatus;
                      const cfg    = enrollmentCfg[status] ?? enrollmentCfg.ASSIGNED;
                      const pct    = parseFloat(s.student.enrollment?.completionPercentage ?? '0');
                      return (
                        <div key={`${s.student.profileId}-${s.course.id}`} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                              {s.student.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{s.student.fullName}</p>
                              <p className="text-[10px] text-slate-400 font-semibold truncate">{s.course.name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                <span className="text-[9px] font-bold text-slate-500">{cfg.label}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0 min-w-[52px]">
                            <span className="text-xs font-extrabold text-[#001D6E]">{pct.toFixed(0)}%</span>
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Enrollment Overview */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[#001D6E] text-base">Enrollment Overview</h3>
                {loading && <RefreshCw className="h-3.5 w-3.5 text-slate-300 animate-spin" />}
                {!loading && (
                  <button
                    onClick={() => onViewChange?.('trainer-students')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                  >
                    <span>View Students</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {enrollmentStats.map((stat) => (
                  <div key={stat.label} className={`${stat.cardBg} rounded-xl p-4`}>
                    <p className={`text-2xl font-extrabold ${stat.textColor}`}>{loading ? '…' : stat.count}</p>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">{stat.label}</p>
                    <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.barColor} rounded-full transition-all`}
                        style={{ width: loading ? '0%' : `${Math.round((stat.count / totalEnrollments) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      {loading ? '—' : `${Math.round((stat.count / totalEnrollments) * 100)}% of total`}
                    </p>
                  </div>
                ))}
              </div>
            </section>


          </main>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
