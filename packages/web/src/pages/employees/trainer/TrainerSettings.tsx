import React, { useEffect, useState } from 'react';
import {
  User, Mail, Briefcase, Award, Calendar, GraduationCap, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../../../store/login';
import { fetchMyEmployeeProfile } from '../../../lib/api/employees';
import type { Employee } from '../../../store/Admin';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

interface Props {
  onViewChange?: (view: TrainerViewType) => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number | null | undefined }> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <span className="mt-0.5 h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
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

const TrainerSettings: React.FC<Props> = ({ onViewChange }) => {
  useDocumentTitle('Settings');
  const { currentUser } = useAppStore();

  const [profile, setProfile]       = useState<Employee | null>(null);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    fetchMyEmployeeProfile(currentUser.user_id)
      .then(setProfile)
      .catch((err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        // 404 just means no profile row yet — show basic info silently
        if (status !== 404) {
          setFetchError('Could not load employee profile. Please try again later.');
        }
      })
      .finally(() => setLoading(false));
  }, [currentUser?.user_id]);

  const emailFallback = currentUser?.email?.split('@')[0] ?? '';
  const displayName = profile?.fullName || (emailFallback.charAt(0).toUpperCase() + emailFallback.slice(1));
  const initials = displayName.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-settings" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-settings" onViewChange={onViewChange} />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">

            <div>
              <h1 className="text-2xl font-extrabold text-[#001D6E] tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Your account and professional profile.</p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading profile...</span>
              </div>
            )}

            {!loading && fetchError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{fetchError}</p>
              </div>
            )}

            {!loading && !fetchError && (
              <>
                {/* Avatar + name banner */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6 flex items-center gap-5">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-700 text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-emerald-100 shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-[#001D6E] leading-tight truncate">
                      {displayName || '—'}
                    </h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5 truncate">
                      {currentUser?.email}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <GraduationCap className="h-3 w-3" />
                        {profile?.role ?? 'Trainer'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personal info card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Personal Information</h3>
                  <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={displayName || null} />
                  <InfoRow icon={<Mail className="h-4 w-4" />} label="Email"     value={currentUser?.email} />
                </div>

                {/* Professional info card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Professional Details</h3>
                  {!profile && !fetchError && (
                    <p className="text-xs text-amber-600 font-semibold bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-2 mt-2">
                      Professional profile not set up yet. Contact your administrator.
                    </p>
                  )}
                  <InfoRow icon={<Briefcase className="h-4 w-4" />}     label="Designation"       value={profile?.designationRaw ?? null} />
                  <InfoRow icon={<Award className="h-4 w-4" />}         label="Specialization"    value={profile?.specializationRaw ?? null} />
                  <InfoRow icon={<GraduationCap className="h-4 w-4" />} label="Years of Experience" value={profile?.yearsOfExperience || null} />
                  <InfoRow icon={<Calendar className="h-4 w-4" />}      label="Joining Date"      value={profile?.joiningDate !== '—' ? profile?.joiningDate : null} />
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

export default TrainerSettings;
