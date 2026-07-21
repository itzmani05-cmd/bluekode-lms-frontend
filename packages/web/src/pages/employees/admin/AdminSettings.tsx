import React from 'react';
import { User, Mail, ShieldCheck } from 'lucide-react';
import { useAppStore } from '../../../store/login';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

interface Props {
  onViewChange?: (view: AdminViewType) => void;
}

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

const AdminSettings: React.FC<Props> = ({ onViewChange }) => {
  useDocumentTitle('Settings');
  const { currentUser } = useAppStore();

  const emailFallback = currentUser?.email?.split('@')[0] ?? '';
  const displayName = emailFallback.charAt(0).toUpperCase() + emailFallback.slice(1);
  const initials = displayName.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-settings" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-settings" onViewChange={onViewChange} />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto space-y-6">

            <div>
              <h1 className="text-2xl font-extrabold text-[#001D6E] tracking-tight">Settings</h1>
              <p className="text-sm text-slate-500 mt-1">Your account details.</p>
            </div>

            {/* Avatar + name banner */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6 flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-[#001D6E] text-white font-extrabold text-xl flex items-center justify-center ring-4 ring-blue-100 shrink-0">
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
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <ShieldCheck className="h-3 w-3" />
                    Administrator
                  </span>
                </div>
              </div>
            </div>

            {/* Personal info card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-900/5 p-6">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Account Information</h3>
              <InfoRow icon={<User className="h-4 w-4" />} label="Name"  value={displayName || null} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={currentUser?.email} />
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

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
