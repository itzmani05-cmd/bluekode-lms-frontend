import React, { useEffect, useMemo, useState } from 'react';
import {
  GraduationCap, Pencil, Trash2, X, RefreshCw, AlertTriangle, Building2, BookOpen,
} from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { AdminStudentProfile, StudentFormStatus } from '../../../store/Admin';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

// ── Types ─────────────────────────────────────────────────────────────────────

const FORM_STATUSES: StudentFormStatus[] = ['PENDING', 'SUBMITTED', 'VERIFIED'];

const formStatusCfg: Record<StudentFormStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Pending',   cls: 'bg-amber-50  text-amber-700  border-amber-100'       },
  SUBMITTED: { label: 'Submitted', cls: 'bg-blue-50   text-blue-700   border-blue-100'        },
  VERIFIED:  { label: 'Verified',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100'   },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-300 focus:ring-red-400/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

const labelCls = 'text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5';

// ── Create Modal ──────────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ onClose }) => {
  const { users, institutions, createStudentProfile, isLoading, error } = useAdminStore();

  const studentUsers = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users],
  );

  const [userId,       setUserId]       = useState('');
  const [instId,       setInstId]       = useState('');
  const [department,   setDepartment]   = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [localError,   setLocalError]   = useState('');
  const [saving,       setSaving]       = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId)  { setLocalError('Please select a student user.'); return; }
    if (!instId)  { setLocalError('Please select an institution.');  return; }
    setLocalError('');
    setSaving(true);
    try {
      await createStudentProfile(
        Number(userId),
        Number(instId),
        department || undefined,
        academicYear ? Number(academicYear) : undefined,
      );
      onClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setLocalError(msg ?? 'Failed to create student profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-2xl" />

        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h2 className="text-base font-extrabold text-[#001D6E]">Add Student Profile</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {displayError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-semibold">{displayError}</p>
            </div>
          )}

          {/* Student user */}
          <div>
            <label className={labelCls}>Student User *</label>
            <select value={userId} onChange={(e) => setUserId(e.target.value)} className={inputCls()}>
              <option value="">Select student user...</option>
              {studentUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} — {u.email}
                </option>
              ))}
            </select>
            {studentUsers.length === 0 && (
              <p className="text-[10px] text-amber-500 font-semibold mt-1">No student-role users found. Create a user with the Student role first.</p>
            )}
          </div>

          {/* Institution */}
          <div>
            <label className={labelCls}>Institution *</label>
            <select value={instId} onChange={(e) => setInstId(e.target.value)} className={inputCls()}>
              <option value="">Select institution...</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}{i.city ? ` — ${i.city}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className={labelCls}>Department</label>
            <input
              type="text" value={department} placeholder="e.g. Computer Science"
              onChange={(e) => setDepartment(e.target.value)} className={inputCls()}
            />
          </div>

          {/* Graduating Year */}
          <div>
            <label className={labelCls}>Graduating Year</label>
            <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={inputCls()}>
              <option value="">Select graduating year...</option>
              {Array.from({ length: 9 }, (_, i) => new Date().getFullYear() + 4 - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={saving || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...</> : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Edit Modal ────────────────────────────────────────────────────────────────

interface EditModalProps {
  profile: AdminStudentProfile;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ profile, onClose }) => {
  const { institutions, updateStudentProfile, error } = useAdminStore();

  const [instId,       setInstId]       = useState(String(profile.institutionId));
  const [department,   setDepartment]   = useState(profile.department ?? '');
  const [academicYear, setAcademicYear] = useState(profile.academicYear ? String(profile.academicYear) : '');
  const [formStatus,   setFormStatus]   = useState<StudentFormStatus>(profile.formStatus);
  const [saving,       setSaving]       = useState(false);
  const [localError,   setLocalError]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setSaving(true);
    try {
      await updateStudentProfile(profile.id, {
        institutionId: Number(instId),
        department:    department || undefined,
        academicYear:  academicYear ? Number(academicYear) : undefined,
        formStatus,
      });
      onClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setLocalError(msg ?? 'Failed to update student profile.');
    } finally {
      setSaving(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-2xl" />

        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#001D6E]">Edit Student Profile</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{profile.fullName} · {profile.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {displayError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-semibold">{displayError}</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Institution</label>
            <select value={instId} onChange={(e) => setInstId(e.target.value)} className={inputCls()}>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}{i.city ? ` — ${i.city}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Department</label>
            <input
              type="text" value={department} placeholder="e.g. Computer Science"
              onChange={(e) => setDepartment(e.target.value)} className={inputCls()}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Graduating Year</label>
              <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={inputCls()}>
                <option value="">Not set</option>
                {Array.from({ length: 9 }, (_, i) => new Date().getFullYear() + 4 - i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Form Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as StudentFormStatus)}
                className={inputCls()}
              >
                {FORM_STATUSES.map((s) => (
                  <option key={s} value={s}>{formStatusCfg[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────

interface DeleteModalProps {
  profile: AdminStudentProfile;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ profile, onClose }) => {
  const { deleteStudentProfile } = useAdminStore();
  const [deleting,   setDeleting]   = useState(false);
  const [localError, setLocalError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudentProfile(profile.id);
      onClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setLocalError(msg ?? 'Failed to delete student profile.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-red-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <Trash2 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Delete Student Profile</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1.5">
            This will permanently delete <span className="text-slate-800">{profile.fullName}</span>'s profile. Students with existing course enrollments cannot be deleted.
          </p>
          {localError && (
            <div className="flex items-start gap-2 p-3 mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-semibold">{localError}</p>
            </div>
          )}
          <div className="flex gap-3 mt-5">
            <button onClick={onClose} className="flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleDelete} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-xl transition-colors"
            >
              {deleting ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Deleting...</> : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Assign Course Modal ───────────────────────────────────────────────────────

interface AssignCourseModalProps {
  profile: AdminStudentProfile;
  onClose: () => void;
}

const AssignCourseModal: React.FC<AssignCourseModalProps> = ({ profile, onClose }) => {
  const { courses, assignCourseToStudent, fetchCourses } = useAdminStore();

  const [courseId,    setCourseId]    = useState('');
  const [saving,      setSaving]      = useState(false);
  const [localError,  setLocalError]  = useState('');
  const [success,     setSuccess]     = useState(false);

  useEffect(() => {
    if (courses.length === 0) fetchCourses();
  }, []);

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status === 'ACTIVE'),
    [courses],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { setLocalError('Please select a course.'); return; }
    setLocalError('');
    setSaving(true);
    try {
      await assignCourseToStudent(profile.id, Number(courseId));
      setSuccess(true);
      setCourseId('');
    } catch (e) {
      const msg = (e as Error).message;
      setLocalError(
        msg.toLowerCase().includes('already')
          ? 'This student is already enrolled in that course.'
          : msg,
      );
    } finally {
      setSaving(false);
    }
  };

  const name = [profile.fullName, profile.lastName].filter(Boolean).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500 rounded-t-2xl" />

        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#001D6E]">Assign Course</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{name} · {profile.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {localError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-semibold">{localError}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs">
              <BookOpen className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-semibold">Course assigned successfully! You can assign another or close.</p>
            </div>
          )}

          <div>
            <label className={labelCls}>Course *</label>
            <select
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setSuccess(false); setLocalError(''); }}
              className={inputCls()}
            >
              <option value="">Select a course...</option>
              {activeCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {activeCourses.length === 0 && (
              <p className="text-[10px] text-amber-500 font-semibold mt-1">
                No active courses found. Create and activate a course first.
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2 pb-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              type="submit" disabled={saving || !courseId}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Assigning...</> : 'Assign Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminStudents: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Students');

  const {
    studentProfiles, institutions, users, isLoading, error,
    studentSearchQuery, studentFormStatusFilter,
    setStudentSearchQuery, setStudentFormStatusFilter,
    fetchStudentProfiles, fetchInstitutions, fetchUsers,
  } = useAdminStore();

  const [showCreate,         setShowCreate]         = useState(false);
  const [editTarget,         setEditTarget]         = useState<AdminStudentProfile | null>(null);
  const [delTarget,          setDelTarget]          = useState<AdminStudentProfile | null>(null);
  const [assignTarget,       setAssignTarget]       = useState<AdminStudentProfile | null>(null);
  const [institutionFilter,  setInstitutionFilter]  = useState('all');

  useEffect(() => {
    fetchStudentProfiles();
    if (institutions.length === 0) fetchInstitutions();
    if (users.length === 0)        fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = studentSearchQuery.toLowerCase();
    return studentProfiles.filter((p) => {
      const name = [p.fullName, p.lastName].filter(Boolean).join(' ').toLowerCase();
      const matchSearch = !q
        || name.includes(q)
        || p.email.toLowerCase().includes(q)
        || (p.department ?? '').toLowerCase().includes(q)
        || p.institutionName.toLowerCase().includes(q);
      const matchForm        = studentFormStatusFilter === 'all' || p.formStatus === studentFormStatusFilter;
      const matchInstitution = institutionFilter === 'all' || p.institutionId === Number(institutionFilter);
      return matchSearch && matchForm && matchInstitution;
    });
  }, [studentProfiles, studentSearchQuery, studentFormStatusFilter, institutionFilter]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-students" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-students" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            {/* Page Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span><span className="text-slate-300">/</span>
                  <span className="text-blue-600">Students</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Students</h1>
                <p className="text-sm text-slate-500 mt-1">{studentProfiles.length} student profile{studentProfiles.length !== 1 ? 's' : ''} in the system.</p>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {/* Table card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-900/5 overflow-hidden">

              {/* Filters */}
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  <input
                    type="text" value={studentSearchQuery} onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search by name, email, department..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                  />
                </div>
                <select
                  value={studentFormStatusFilter}
                  onChange={(e) => setStudentFormStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                >
                  <option value="all">All Form Status</option>
                  {FORM_STATUSES.map((s) => (
                    <option key={s} value={s}>{formStatusCfg[s].label}</option>
                  ))}
                </select>
                <select
                  value={institutionFilter}
                  onChange={(e) => setInstitutionFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                >
                  <option value="all">All Institutions</option>
                  {institutions.map((i) => (
                    <option key={i.id} value={i.id}>{i.name}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Student</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Institution</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Department</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Graduating Year</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Form Status</th>
                      <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center">
                          <RefreshCw className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center">
                          <GraduationCap className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 font-semibold">
                            {studentSearchQuery || studentFormStatusFilter !== 'all'
                              ? 'No students match your filters.'
                              : 'No student profiles found.'}
                          </p>
                        </td>
                      </tr>
                    ) : filtered.map((p) => {
                      const fCfg = formStatusCfg[p.formStatus];
                      const name = [p.fullName, p.lastName].filter(Boolean).join(' ');
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{p.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3 w-3 text-slate-300 shrink-0" />
                              <p className="text-xs font-semibold text-slate-700">{p.institutionName}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 hidden lg:table-cell">
                            <p className="text-xs font-semibold text-slate-600">{p.department ?? <span className="text-slate-300 italic">—</span>}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center hidden lg:table-cell">
                            {p.academicYear ? (
                              <div className="flex items-center justify-center gap-1">
                                <GraduationCap className="h-3 w-3 text-slate-400" />
                                <span className="text-xs font-bold text-slate-700">{p.academicYear}</span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${fCfg.cls}`}>
                              {fCfg.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setAssignTarget(p)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Assign Course"
                              >
                                <BookOpen className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditTarget(p)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDelTarget(p)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold">
                  Showing {filtered.length} of {studentProfiles.length} student{studentProfiles.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>

      {showCreate   && <CreateModal     onClose={() => setShowCreate(false)} />}
      {editTarget   && <EditModal       profile={editTarget}   onClose={() => setEditTarget(null)} />}
      {delTarget    && <DeleteModal     profile={delTarget}    onClose={() => setDelTarget(null)} />}
      {assignTarget && <AssignCourseModal profile={assignTarget} onClose={() => setAssignTarget(null)} />}
    </div>
  );
};

export default AdminStudents;
