import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import emailjs from '@emailjs/browser';
import { UserCheck, XCircle, UserX, Plus, X, Copy, CheckCheck, Mail, RefreshCw, AlertTriangle, Send } from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { AccountStatus, AdminUser } from '../../../store/Admin';
import { useAppStore } from '../../../store/login';
import { createUserSchema, type CreateUserFields } from '../../../schemas/userSchema';
import ConfirmDialog from '../../../components/ConfirmDialog';

const statusCfg: Record<AccountStatus, { label: string; className: string }> = {
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  PENDING:  { label: 'Pending',  className: 'bg-amber-50 text-amber-700 border-amber-100'       },
  INACTIVE: { label: 'Inactive', className: 'bg-slate-100 text-slate-600 border-slate-200'      },
  REJECTED: { label: 'Rejected', className: 'bg-red-50 text-red-600 border-red-100'             },
};

const roleCfg: Record<AdminUser['role'], string> = {
  'student':        'bg-blue-50 text-blue-700 border-blue-100',
  'trainer':        'bg-indigo-50 text-indigo-700 border-indigo-100',
  'technical head': 'bg-purple-50 text-purple-700 border-purple-100',
  'project head':   'bg-teal-50 text-teal-700 border-teal-100',
  'admin':          'bg-[#001D6E]/10 text-[#001D6E] border-[#001D6E]/10',
};

const filterTabs = [
  { key: 'all',      label: 'All'      },
  { key: 'ACTIVE',   label: 'Active'   },
  { key: 'PENDING',  label: 'Pending'  },
  { key: 'INACTIVE', label: 'Inactive' },
  { key: 'REJECTED', label: 'Rejected' },
];

const roleOptions = [
  { value: 'student',        label: 'Student'        },
  { value: 'trainer',        label: 'Trainer'        },
  { value: 'technical head', label: 'Technical Head' },
  { value: 'project head',   label: 'Project Head'   },
  { value: 'admin',          label: 'Admin'          },
] as const;

// ── Create User Modal ─────────────────────────────────────────────────────────

const CreateUserModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { createUser } = useAppStore();
  const { addUser }    = useAdminStore();

  const [isSending, setIsSending] = useState(false);
  const [created, setCreated]     = useState<{ email: string; password: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sendError, setSendError] = useState('');
  const [copied, setCopied]       = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateUserFields>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'student' },
  });

  const onSubmit = async (data: CreateUserFields) => {
    setSendError('');
    setIsSending(true);
    const password = createUser(data.email, data.role);
    addUser(data.email, data.role, data.email.split('@')[0]);

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        { to_email: data.email, password, role: data.role, login_url: window.location.origin },
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY },
      );
      setEmailSent(true);
    } catch {
      setSendError('Account created but email could not be sent. Copy the credentials manually.');
    } finally {
      setIsSending(false);
      setCreated({ email: data.email, password });
    }
  };

  const handleCopy = () => {
    if (!created) return;
    navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-[#001D6E] text-base">Create User Account</h2>
            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Credentials will be auto-generated and emailed to the user.</p>
          </div>
          <button onClick={onClose} disabled={isSending} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!created ? (
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="user@company.com"
                  disabled={isSending}
                  className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all disabled:bg-slate-50 disabled:opacity-60
                    ${errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Role</label>
              <select
                {...register('role')}
                disabled={isSending}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all disabled:opacity-60"
              >
                {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-blue-700 font-semibold flex items-start gap-2">
              <Send className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              A secure password will be auto-generated and sent directly to the user's email.
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} disabled={isSending} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-40">Cancel</button>
              <button type="submit" disabled={isSending} className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSending ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Sending...</> : <><Plus className="h-3.5 w-3.5" /> Create & Send</>}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 space-y-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto border ${emailSent ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
              {emailSent ? <CheckCheck className="h-6 w-6 text-emerald-600" /> : <AlertTriangle className="h-6 w-6 text-amber-600" />}
            </div>
            <div className="text-center">
              <p className="font-extrabold text-slate-900 text-sm">Account Created</p>
              {emailSent
                ? <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Credentials emailed to <span className="font-extrabold">{created.email}</span></p>
                : <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{sendError}</p>
              }
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email</span>
                <span className="text-xs font-bold text-slate-800">{created.email}</span>
              </div>
              <div className="border-t border-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Password</span>
                <span className="text-xs font-bold text-slate-800 font-mono tracking-wider">{created.password}</span>
              </div>
              <div className="border-t border-slate-200" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role</span>
                <span className="text-xs font-bold text-slate-800 capitalize">{watch('role')}</span>
              </div>
            </div>
            <button onClick={handleCopy} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border transition-all ${copied ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
              {copied ? <><CheckCheck className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Credentials</>}
            </button>
            <button onClick={onClose} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminUsers: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  const { users, userSearchQuery, userStatusFilter, setUserSearchQuery, setUserStatusFilter, updateUserStatus } = useAdminStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const changeStatus = (id: number, status: AccountStatus, message: string) => {
    setConfirm({
      message,
      onConfirm: () => { updateUserStatus(id, status); setConfirm(null); },
    });
  };

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus = userStatusFilter === 'all' || u.accountStatus === userStatusFilter;
      const q = userSearchQuery.toLowerCase();
      return matchesStatus && (!q || u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    });
  }, [userSearchQuery, userStatusFilter, users]);

  const counts = useMemo(() => ({
    all:      users.length,
    ACTIVE:   users.filter(u => u.accountStatus === 'ACTIVE').length,
    PENDING:  users.filter(u => u.accountStatus === 'PENDING').length,
    INACTIVE: users.filter(u => u.accountStatus === 'INACTIVE').length,
    REJECTED: users.filter(u => u.accountStatus === 'REJECTED').length,
  }), [users]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-users" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-users" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span><span className="text-slate-300">/</span><span className="text-blue-600">Users</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">{users.length} users registered across all institutions.</p>
              </div>
              <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors shrink-0">
                <Plus className="h-4 w-4" /> Create User
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-900/5 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {filterTabs.map((tab) => {
                    const count = counts[tab.key as keyof typeof counts];
                    const isActive = userStatusFilter === tab.key;
                    return (
                      <button key={tab.key} onClick={() => setUserStatusFilter(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${isActive ? 'bg-[#001D6E] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                      >
                        {tab.label}
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                  <input type="text" value={userSearchQuery} onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Registered</th>
                      <th className="text-right py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="py-12 text-center text-sm text-slate-400 font-semibold">No users match your search.</td></tr>
                    ) : filtered.map((user) => {
                      const sCfg = statusCfg[user.accountStatus];
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-bold text-xs flex items-center justify-center shrink-0">
                                {user.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border capitalize ${roleCfg[user.role]}`}>{user.role}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${sCfg.className}`}>{sCfg.label}</span>
                          </td>
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            <span className="text-[11px] text-slate-500 font-semibold">{user.createdAt}</span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center justify-end gap-2">
                              {user.accountStatus === 'PENDING' && (
                                <button onClick={() => changeStatus(user.id, 'ACTIVE', `Approve ${user.fullName}'s account?`)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />Approve
                                </button>
                              )}
                              {user.accountStatus === 'PENDING' && (
                                <button onClick={() => changeStatus(user.id, 'REJECTED', `Reject ${user.fullName}'s account?`)} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-[10px] font-extrabold border border-red-100 hover:bg-red-100 transition-colors flex items-center gap-1">
                                  <XCircle className="h-3 w-3" />Reject
                                </button>
                              )}
                              {user.accountStatus === 'ACTIVE' && (
                                <button onClick={() => changeStatus(user.id, 'INACTIVE', `Deactivate ${user.fullName}'s account?`)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1">
                                  <UserX className="h-3 w-3" />Deactivate
                                </button>
                              )}
                              {user.accountStatus === 'INACTIVE' && (
                                <button onClick={() => changeStatus(user.id, 'ACTIVE', `Activate ${user.fullName}'s account?`)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1">
                                  <UserCheck className="h-3 w-3" />Activate
                                </button>
                              )}
                              {(user.accountStatus === 'REJECTED' || user.accountStatus === 'APPROVED') && (
                                <span className="text-[10px] text-slate-400 font-semibold px-2">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 font-semibold">Showing {filtered.length} of {users.length} users</p>
              </div>
            </div>

          </main>
        </div>
      </div>

      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} />}

      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
