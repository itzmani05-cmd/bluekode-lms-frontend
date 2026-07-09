import React from 'react';
import {
  Users, Building2, BookOpen, AlertCircle, ChevronRight,
  ClipboardList, UserCheck, Clock, CheckCircle2, RefreshCcw,
  XCircle, TrendingUp,
} from 'lucide-react';
import { useAppStore } from '../../../store/login';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';

type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED';

interface RecentSubmission {
  id: number;
  studentName: string;
  assignmentTitle: string;
  status: SubmissionStatus;
  submittedAt: string;
}

interface PendingUser {
  id: number;
  fullName: string;
  institution: string;
  role: string;
}

const recentSubmissions: RecentSubmission[] = [
  { id: 1, studentName: 'Arjun Mehta',    assignmentTitle: 'Security Audit Case Study',   status: 'SUBMITTED',              submittedAt: '2 hrs ago'  },
  { id: 2, studentName: 'Kavya Reddy',    assignmentTitle: 'Network Topology Design',      status: 'UNDER_REVIEW',           submittedAt: '4 hrs ago'  },
  { id: 3, studentName: 'Meera Krishnan', assignmentTitle: 'CI/CD Pipeline Setup',         status: 'REVIEWED',               submittedAt: 'Yesterday'  },
  { id: 4, studentName: 'Rohan Kapoor',   assignmentTitle: 'Compliance Framework Essay',   status: 'RESUBMISSION_REQUIRED',  submittedAt: 'Jul 04'     },
  { id: 5, studentName: 'Aditya Singh',   assignmentTitle: 'Sprint Planning Exercise',     status: 'SUBMITTED',              submittedAt: 'Jul 03'     },
];

const pendingUsers: PendingUser[] = [
  { id: 1, fullName: 'Kavya Reddy',  institution: 'Nexus Institute',  role: 'Student' },
  { id: 2, fullName: 'Rohan Kapoor', institution: 'Synergy College',  role: 'Student' },
  { id: 3, fullName: 'Nisha Verma',  institution: 'Pioneer Training', role: 'Student' },
  { id: 4, fullName: 'Suresh Babu',  institution: 'TechCorp Academy', role: 'Trainer' },
];

const enrollmentStats = [
  { label: 'Assigned',    count: 42,  barColor: 'bg-amber-500',   textColor: 'text-amber-600',   cardBg: 'bg-amber-50'   },
  { label: 'In Progress', count: 124, barColor: 'bg-blue-600',    textColor: 'text-blue-600',    cardBg: 'bg-blue-50'    },
  { label: 'Completed',   count: 203, barColor: 'bg-emerald-500', textColor: 'text-emerald-600', cardBg: 'bg-emerald-50' },
  { label: 'Cancelled',   count: 11,  barColor: 'bg-slate-400',   textColor: 'text-slate-500',   cardBg: 'bg-slate-100'  },
];
const totalEnrollments = enrollmentStats.reduce((s, e) => s + e.count, 0);

const submissionCfg: Record<SubmissionStatus, { label: string; className: string; Icon: React.ElementType }> = {
  SUBMITTED:             { label: 'Submitted',    className: 'bg-blue-50 text-blue-600 border-blue-100',         Icon: ClipboardList },
  UNDER_REVIEW:          { label: 'Under Review', className: 'bg-amber-50 text-amber-600 border-amber-100',      Icon: Clock         },
  REVIEWED:              { label: 'Reviewed',     className: 'bg-emerald-50 text-emerald-600 border-emerald-100',Icon: CheckCircle2  },
  RESUBMISSION_REQUIRED: { label: 'Resubmission', className: 'bg-red-50 text-red-600 border-red-100',            Icon: RefreshCcw    },
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  iconClass: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, iconClass, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-slate-900/5 flex items-start gap-4 hover:border-blue-200 hover:shadow-md transition-all duration-200 text-left w-full"
  >
    <div className={`p-3 rounded-xl border ${iconClass}`}>{icon}</div>
    <div>
      <p className="text-2xl font-extrabold text-[#001D6E] tracking-tight">{value}</p>
      <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-0.5">
        <TrendingUp className="h-2.5 w-2.5" />{trend}
      </p>
    </div>
  </button>
);

const AdminDashboard: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  const { currentUser } = useAppStore();
  const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Admin';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-dashboard" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-dashboard" onViewChange={onViewChange} />
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
                placeholder="Search users, institutions, courses..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
              />
            </div>

            {/* Welcome */}
            <div>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Welcome back, {displayName}</h1>
              <p className="text-sm text-slate-500 mt-1">
                You have{' '}
                <span className="font-bold text-amber-600">4 pending approvals</span> and{' '}
                <span className="font-bold text-blue-600">5 new submissions</span> today.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<Users className="h-5 w-5" />}       label="Total Users"       value="247" trend="+12 this month"  iconClass="bg-blue-50 text-blue-600 border-blue-100"          onClick={() => onViewChange?.('admin-users')}        />
              <StatCard icon={<Building2 className="h-5 w-5" />}   label="Institutions"      value="12"  trend="8 active"        iconClass="bg-indigo-50 text-indigo-600 border-indigo-100"    onClick={() => onViewChange?.('admin-institutions')} />
              <StatCard icon={<BookOpen className="h-5 w-5" />}    label="Active Courses"    value="34"  trend="6 in draft"      iconClass="bg-emerald-50 text-emerald-600 border-emerald-100" onClick={() => onViewChange?.('admin-courses')}      />
              <StatCard icon={<AlertCircle className="h-5 w-5" />} label="Pending Approvals" value="4"   trend="Action required" iconClass="bg-amber-50 text-amber-600 border-amber-100"       onClick={() => onViewChange?.('admin-users')}        />
            </div>

            {/* Submissions + Pending Approvals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-[#001D6E] text-base">Recent Submissions</h3>
                  <span className="text-[10px] font-bold text-white bg-blue-600 rounded-full px-2 py-0.5">{recentSubmissions.length}</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {recentSubmissions.map((sub) => {
                    const cfg = submissionCfg[sub.status];
                    const StatusIcon = cfg.Icon;
                    return (
                      <div key={sub.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-start gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {sub.studentName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{sub.studentName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold truncate">{sub.assignmentTitle}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border flex items-center gap-1 ${cfg.className}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{sub.submittedAt}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-extrabold text-[#001D6E] text-base">Pending Approvals</h3>
                  <button
                    onClick={() => onViewChange?.('admin-users')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="py-3.5 first:pt-0 last:pb-0 flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-amber-100">
                          {user.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold truncate">{user.institution} · {user.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />Approve
                        </button>
                        <button className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-extrabold border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors flex items-center gap-1">
                          <XCircle className="h-3 w-3" />Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Enrollment Overview */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[#001D6E] text-base">Enrollment Overview</h3>
                <button
                  onClick={() => onViewChange?.('admin-students')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
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

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
