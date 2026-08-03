import React from 'react';
import {
  ClipboardList, Clock, CheckCircle2, RefreshCcw,
  GraduationCap, BookOpen, TrendingUp, ChevronRight,
  Eye, Star, AlertTriangle, Users,
} from 'lucide-react';
import { useAppStore } from '../../../store/login';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

// ── Types derived from schema ─────────────────────────────────────────────────

type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED';
type EnrollmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type ContentType      = 'LECTURE' | 'ASSIGNMENT';
type AssignmentStatus = 'PUBLISHED' | 'ACTIVE' | 'ARCHIVED' | 'DRAFT' | 'CLOSED';

interface Submission {
  submission_id: number;
  student_name: string;
  course_name: string;
  assignment_title: string;
  submission_status: SubmissionStatus;
  attempt_no: number;
  submitted_at: string;
  marks_obtained: number | null;
}

interface StudentProgress {
  student_id: number;
  student_name: string;
  institution: string;
  course_name: string;
  enrollment_status: EnrollmentStatus;
  completion_percentage: number;
}

interface Assignment {
  lecture_id: number;
  title: string;
  course_name: string;
  module_name: string;
  content_type: ContentType;
  assignment_status: AssignmentStatus;
  due_date: string;
  max_marks: number;
  submissions_count: number;
  pending_review_count: number;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const recentSubmissions: Submission[] = [
  { submission_id: 1, student_name: 'Arjun Mehta',    course_name: 'Cybersecurity Essentials', assignment_title: 'Security Audit Case Study',  submission_status: 'SUBMITTED',             attempt_no: 1, submitted_at: '2 hrs ago',  marks_obtained: null },
  { submission_id: 2, student_name: 'Kavya Reddy',    course_name: 'Cloud Infrastructure',     assignment_title: 'Network Topology Design',    submission_status: 'UNDER_REVIEW',          attempt_no: 1, submitted_at: '4 hrs ago',  marks_obtained: null },
  { submission_id: 3, student_name: 'Meera Krishnan', course_name: 'DevOps Fundamentals',      assignment_title: 'CI/CD Pipeline Setup',       submission_status: 'REVIEWED',              attempt_no: 1, submitted_at: 'Yesterday',  marks_obtained: 88   },
  { submission_id: 4, student_name: 'Rohan Kapoor',   course_name: 'Cybersecurity Essentials', assignment_title: 'Compliance Framework Essay', submission_status: 'RESUBMISSION_REQUIRED', attempt_no: 2, submitted_at: 'Jul 04',     marks_obtained: null },
  { submission_id: 5, student_name: 'Aditya Singh',   course_name: 'Cloud Infrastructure',     assignment_title: 'Load Balancer Config',       submission_status: 'SUBMITTED',             attempt_no: 1, submitted_at: 'Jul 03',     marks_obtained: null },
  { submission_id: 6, student_name: 'Priya Nair',     course_name: 'DevOps Fundamentals',      assignment_title: 'Docker Containerisation',    submission_status: 'REVIEWED',              attempt_no: 1, submitted_at: 'Jul 02',     marks_obtained: 92   },
];

const studentProgress: StudentProgress[] = [
  { student_id: 1, student_name: 'Arjun Mehta',    institution: 'Nexus Institute',  course_name: 'Cybersecurity Essentials', enrollment_status: 'IN_PROGRESS', completion_percentage: 65  },
  { student_id: 2, student_name: 'Kavya Reddy',    institution: 'Synergy College',  course_name: 'Cloud Infrastructure',     enrollment_status: 'IN_PROGRESS', completion_percentage: 42  },
  { student_id: 3, student_name: 'Meera Krishnan', institution: 'Nexus Institute',  course_name: 'DevOps Fundamentals',      enrollment_status: 'COMPLETED',   completion_percentage: 100 },
  { student_id: 4, student_name: 'Rohan Kapoor',   institution: 'Pioneer Training', course_name: 'Cybersecurity Essentials', enrollment_status: 'IN_PROGRESS', completion_percentage: 30  },
  { student_id: 5, student_name: 'Aditya Singh',   institution: 'TechCorp Academy', course_name: 'Cloud Infrastructure',     enrollment_status: 'ASSIGNED',    completion_percentage: 0   },
  { student_id: 6, student_name: 'Priya Nair',     institution: 'Synergy College',  course_name: 'DevOps Fundamentals',      enrollment_status: 'COMPLETED',   completion_percentage: 100 },
];

const assignments: Assignment[] = [
  { lecture_id: 1, title: 'Security Audit Case Study',  course_name: 'Cybersecurity Essentials', module_name: 'Module 3: Auditing',  content_type: 'ASSIGNMENT', assignment_status: 'ACTIVE',     due_date: 'Jul 12, 2026', max_marks: 100, submissions_count: 8,  pending_review_count: 3 },
  { lecture_id: 2, title: 'Network Topology Design',    course_name: 'Cloud Infrastructure',     module_name: 'Module 2: Networking', content_type: 'ASSIGNMENT', assignment_status: 'ACTIVE',     due_date: 'Jul 15, 2026', max_marks: 80,  submissions_count: 6,  pending_review_count: 2 },
  { lecture_id: 3, title: 'CI/CD Pipeline Setup',       course_name: 'DevOps Fundamentals',      module_name: 'Module 4: Pipelines', content_type: 'ASSIGNMENT', assignment_status: 'CLOSED',     due_date: 'Jul 01, 2026', max_marks: 100, submissions_count: 12, pending_review_count: 0 },
  { lecture_id: 4, title: 'Docker Containerisation',    course_name: 'DevOps Fundamentals',      module_name: 'Module 5: Containers', content_type: 'ASSIGNMENT', assignment_status: 'PUBLISHED',  due_date: 'Jul 20, 2026', max_marks: 90,  submissions_count: 2,  pending_review_count: 0 },
];

const enrollmentStats = [
  { label: 'Assigned',    count: 8,   barColor: 'bg-amber-500',   textColor: 'text-amber-600',   cardBg: 'bg-amber-50'   },
  { label: 'In Progress', count: 24,  barColor: 'bg-blue-600',    textColor: 'text-blue-600',    cardBg: 'bg-blue-50'    },
  { label: 'Completed',   count: 18,  barColor: 'bg-emerald-500', textColor: 'text-emerald-600', cardBg: 'bg-emerald-50' },
  { label: 'Cancelled',   count: 2,   barColor: 'bg-slate-400',   textColor: 'text-slate-500',   cardBg: 'bg-slate-100'  },
];
const totalEnrollments = enrollmentStats.reduce((s, e) => s + e.count, 0);

// ── Config maps ───────────────────────────────────────────────────────────────

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

const assignmentStatusCfg: Record<AssignmentStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Draft',     className: 'bg-slate-100 text-slate-500 border-slate-200'     },
  PUBLISHED: { label: 'Published', className: 'bg-blue-50 text-blue-600 border-blue-100'         },
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED:  { label: 'Archived',  className: 'bg-slate-100 text-slate-400 border-slate-200'     },
  CLOSED:    { label: 'Closed',    className: 'bg-slate-50 text-slate-400 border-slate-200'      },
};

// ── Sub-components ────────────────────────────────────────────────────────────

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

// ── Main Component ────────────────────────────────────────────────────────────

interface TrainerDashboardProps {
  onViewChange?: (view: TrainerViewType) => void;
  activeTab?: TrainerViewType;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ onViewChange, activeTab = 'trainer-dashboard' }) => {
  useDocumentTitle('Dashboard');
  const { currentUser } = useAppStore();
  const emailName    = currentUser?.email ? currentUser.email.split('@')[0] : 'Trainer';
  const displayName  = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  const pendingReviews = recentSubmissions.filter(
    s => s.submission_status === 'SUBMITTED' || s.submission_status === 'UNDER_REVIEW'
  ).length;

  const totalReviewed = recentSubmissions.filter(s => s.submission_status === 'REVIEWED').length;
  const avgMarks      = recentSubmissions
    .filter(s => s.marks_obtained !== null)
    .reduce((acc, s, _, arr) => acc + (s.marks_obtained ?? 0) / arr.length, 0);

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
                You have{' '}
                <span className="font-bold text-amber-600">{pendingReviews} submissions pending review</span> and{' '}
                <span className="font-bold text-blue-600">{assignments.filter(a => a.assignment_status === 'ACTIVE').length} active assignments</span> today.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<ClipboardList className="h-5 w-5" />}
                label="Pending Reviews"
                value={String(pendingReviews)}
                subtext="Needs attention"
                iconClass="bg-amber-50 text-amber-600 border-amber-100"
                onClick={() => onViewChange?.('trainer-submissions')}
              />
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="My Students"
                value={String(studentProgress.length)}
                subtext={`${studentProgress.filter(s => s.enrollment_status === 'IN_PROGRESS').length} in progress`}
                iconClass="bg-blue-50 text-blue-600 border-blue-100"
                onClick={() => onViewChange?.('trainer-students')}
              />
              <StatCard
                icon={<BookOpen className="h-5 w-5" />}
                label="Active Assignments"
                value={String(assignments.filter(a => a.assignment_status === 'ACTIVE').length)}
                subtext={`${assignments.filter(a => a.assignment_status === 'CLOSED').length} closed this month`}
                iconClass="bg-emerald-50 text-emerald-600 border-emerald-100"
                onClick={() => onViewChange?.('trainer-courses')}
              />
              <StatCard
                icon={<Star className="h-5 w-5" />}
                label="Avg. Score Given"
                value={avgMarks > 0 ? `${Math.round(avgMarks)}%` : '—'}
                subtext={`${totalReviewed} reviewed total`}
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
                <div className="divide-y divide-slate-100">
                  {recentSubmissions.map((sub) => {
                    const cfg       = submissionCfg[sub.submission_status];
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
                          <span className="text-[10px] text-slate-400 font-semibold">{sub.submitted_at}</span>
                          {sub.marks_obtained !== null && (
                            <span className="text-[9px] font-extrabold text-emerald-600">{sub.marks_obtained} pts</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                <div className="divide-y divide-slate-100">
                  {studentProgress.map((sp) => {
                    const cfg = enrollmentCfg[sp.enrollment_status];
                    return (
                      <div key={sp.student_id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
                            {sp.student_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{sp.student_name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">{sp.course_name}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                              <span className="text-[9px] font-bold text-slate-500">{cfg.label}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 min-w-[52px]">
                          <span className="text-xs font-extrabold text-[#001D6E]">{sp.completion_percentage}%</span>
                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${sp.completion_percentage === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                              style={{ width: `${sp.completion_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Enrollment Overview */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[#001D6E] text-base">Enrollment Overview</h3>
                <button
                  onClick={() => onViewChange?.('trainer-students')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                  <span>View Students</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {enrollmentStats.map((stat) => (
                  <div key={stat.label} className={`${stat.cardBg} rounded-xl p-4`}>
                    <p className={`text-2xl font-extrabold ${stat.textColor}`}>{stat.count}</p>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">{stat.label}</p>
                    <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.barColor} rounded-full`}
                        style={{ width: `${Math.round((stat.count / totalEnrollments) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      {Math.round((stat.count / totalEnrollments) * 100)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* My Assignments */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[#001D6E] text-base">My Assignments</h3>
                <button
                  onClick={() => onViewChange?.('trainer-courses')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="text-left pb-3 pr-4">Assignment</th>
                      <th className="text-left pb-3 pr-4">Course / Module</th>
                      <th className="text-left pb-3 pr-4">Due Date</th>
                      <th className="text-center pb-3 pr-4">Max Marks</th>
                      <th className="text-center pb-3 pr-4">Submissions</th>
                      <th className="text-center pb-3 pr-4">Pending</th>
                      <th className="text-left pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assignments.map((a) => {
                      const statusCfg = assignmentStatusCfg[a.assignment_status];
                      return (
                        <tr key={a.lecture_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <p className="font-bold text-slate-900 whitespace-nowrap">{a.title}</p>
                          </td>
                          <td className="py-3.5 pr-4">
                            <p className="font-semibold text-slate-700 truncate max-w-[140px]">{a.course_name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[140px]">{a.module_name}</p>
                          </td>
                          <td className="py-3.5 pr-4">
                            <p className="font-semibold text-slate-700 whitespace-nowrap">{a.due_date}</p>
                          </td>
                          <td className="py-3.5 pr-4 text-center">
                            <span className="font-bold text-slate-700">{a.max_marks}</span>
                          </td>
                          <td className="py-3.5 pr-4 text-center">
                            <span className="font-bold text-slate-700">{a.submissions_count}</span>
                          </td>
                          <td className="py-3.5 pr-4 text-center">
                            {a.pending_review_count > 0 ? (
                              <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                {a.pending_review_count}
                              </span>
                            ) : (
                              <span className="font-bold text-emerald-500">—</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${statusCfg.className}`}>
                              {statusCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <h3 className="font-extrabold text-[#001D6E] text-base mb-5">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onViewChange?.('trainer-submissions')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  Review Pending ({pendingReviews})
                </button>
                <button
                  onClick={() => onViewChange?.('trainer-students')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
                >
                  <GraduationCap className="h-4 w-4" />
                  View All Students
                </button>
                <button
                  onClick={() => onViewChange?.('trainer-courses')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Manage Assignments
                </button>
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
