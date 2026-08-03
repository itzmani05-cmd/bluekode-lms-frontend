import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, Building2, BookOpen, Calendar,
  GraduationCap, BadgeCheck, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../../store/login';
import { fetchMyStudentProfile } from '../../lib/api/studentProfile';
import type { StudentProfileData } from '../../lib/api/studentProfile';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import useDocumentTitle from '../../hooks/useDocumentTitle';

type StudentView = 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';

interface Props {
  onViewChange?: (view: StudentView) => void;
}

/* ── Small display row ── */
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number | null | undefined }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <span className="mt-0.5 h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
        {value ?? <span className="text-slate-300 italic">Not set</span>}
      </p>
    </div>
  </div>
);

const STATUS_STYLES: Record<string, string> = {
  SUBMITTED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PENDING:   'bg-amber-50  text-amber-700  border-amber-100',
  DRAFT:     'bg-slate-50  text-slate-600  border-slate-100',
};

const StudentSettings: React.FC<Props> = ({ onViewChange }) => {
  useDocumentTitle('Settings');
  const { currentUser } = useAppStore();

  const [profile, setProfile]       = useState<StudentProfileData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    fetchMyStudentProfile(currentUser.user_id)
      .then(setProfile)
      .catch((err) => {
        const status = err?.response?.status;
        // 404 just means no profile row yet — show basic info silently
        if (status !== 404) {
          setFetchError('Could not load academic profile. Please try again later.');
        }
      })
      .finally(() => setLoading(false));
  }, [currentUser?.user_id]);

  const emailFallback = currentUser?.email?.split('@')[0] ?? '';
  const fullName = profile
    ? [profile.user.full_name, profile.user.last_name].filter(Boolean).join(' ') || emailFallback
    : emailFallback;

  const initials = fullName.slice(0, 2).toUpperCase() || '??';

  const academicYearLabel = profile?.academic_year ? String(profile.academic_year) : null;

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="settings" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="settings" onViewChange={onViewChange} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Page title */}
            <div>
              <h1 className="text-2xl font-extrabold text-[#001D6E] tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Your account and academic profile.</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading profile...</span>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{fetchError}</p>
              </div>
            )}

            {/* Content */}
            {!loading && !fetchError && (
              <>
                {/* Avatar + name banner */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6 flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-blue-100 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-[#001D6E] leading-tight truncate">
                      {fullName || '—'}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">
                      {currentUser?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                        <GraduationCap className="h-3 w-3" />
                        Student
                      </span>
                      {profile?.form_status && (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full border ${STATUS_STYLES[profile.form_status] ?? STATUS_STYLES.DRAFT}`}>
                          <BadgeCheck className="h-3 w-3" />
                          {profile.form_status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal info card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Personal Information</h3>
                  <InfoRow icon={<User className="h-4 w-4" />}      label="Full Name"  value={fullName || null} />
                  <InfoRow icon={<Mail className="h-4 w-4" />}      label="Email"      value={currentUser?.email} />
                  <InfoRow icon={<Phone className="h-4 w-4" />}     label="Phone"      value={null} />
                  <InfoRow icon={<Calendar className="h-4 w-4" />}  label="Member Since" value={joinedDate} />
                </div>

                {/* Academic info card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Academic Details</h3>
                  {!profile && !fetchError && (
                    <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2 mt-2">
                      Academic profile not set up yet. Contact your administrator.
                    </p>
                  )}
                  <InfoRow
                    icon={<Building2 className="h-4 w-4" />}
                    label="Institution"
                    value={profile?.institution?.institution_name ?? null}
                  />
                  <InfoRow
                    icon={<BookOpen className="h-4 w-4" />}
                    label="Department"
                    value={profile?.department ?? null}
                  />
                  <InfoRow
                    icon={<GraduationCap className="h-4 w-4" />}
                    label="Graduating Year"
                    value={academicYearLabel}
                  />
                </div>

                {/* Account card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Account</h3>
                  <div className="flex items-center justify-between gap-4 py-2">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Password</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">Change your account password.</p>
                    </div>
                    <button
                      disabled
                      title="Coming soon"
                      className="px-4 py-2 text-xs font-bold text-slate-400 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentSettings;
