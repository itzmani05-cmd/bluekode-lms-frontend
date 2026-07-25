import React, { useEffect, useMemo, useState } from 'react';
import {
  Users, Building2, BookOpen, Plus, Trash2, X,
  RefreshCw, AlertTriangle, Search, GraduationCap,
  UserCheck,
} from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { TrainerAssignmentSummary } from '../../../store/Admin';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = (err?: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400
   focus:outline-none focus:ring-2 transition-all
   ${err ? 'border-red-300 focus:ring-red-400/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'}`;

const labelCls = 'text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5';

type AssignmentType = 'STUDENT' | 'INSTITUTION';

const typeCfg: Record<AssignmentType, { label: string; cls: string; Icon: React.ElementType }> = {
  STUDENT:     { label: 'Student',     cls: 'bg-indigo-50 text-indigo-700 border-indigo-100',   Icon: Users      },
  INSTITUTION: { label: 'Institution', cls: 'bg-teal-50   text-teal-700   border-teal-100',     Icon: Building2  },
};

// ── Create Modal ──────────────────────────────────────────────────────────────

interface CreateModalProps { onClose: () => void }

const CreateModal: React.FC<CreateModalProps> = ({ onClose }) => {
  const {
    employees, courses, institutions, studentProfiles,
    createTrainerAssignment, isLoading, error,
    fetchEmployees, fetchCourses, fetchInstitutions, fetchStudentProfiles,
  } = useAdminStore();

  const [trainerId,        setTrainerId]        = useState('');
  const [courseId,         setCourseId]         = useState('');
  const [assignmentType,   setAssignmentType]   = useState<AssignmentType>('STUDENT');
  const [institutionId,    setInstitutionId]    = useState('');
  const [studentSearch,    setStudentSearch]    = useState('');
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [localError,       setLocalError]       = useState('');
  const [saving,           setSaving]           = useState(false);

  useEffect(() => {
    if (employees.length === 0)        fetchEmployees();
    if (courses.length === 0)          fetchCourses();
    if (institutions.length === 0)     fetchInstitutions();
    if (studentProfiles.length === 0)  fetchStudentProfiles();
  }, []);

  const trainerEmployees = useMemo(
    () => employees.filter((e) => e.role.toLowerCase() === 'trainer'),
    [employees],
  );

  const activeCourses = useMemo(
    () => courses.filter((c) => c.status === 'ACTIVE'),
    [courses],
  );

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase();
    return studentProfiles.filter((s) => {
      if (!q) return true;
      const name = `${s.fullName}`.toLowerCase();
      return name.includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [studentProfiles, studentSearch]);

  const toggleStudent = (id: number) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!trainerId)  { setLocalError('Please select a trainer.'); return; }
    if (!courseId)   { setLocalError('Please select a course.'); return; }
    if (assignmentType === 'STUDENT' && selectedStudents.length === 0) {
      setLocalError('Please select at least one student.');
      return;
    }
    if (assignmentType === 'INSTITUTION' && !institutionId) {
      setLocalError('Please select an institution.');
      return;
    }

    setSaving(true);
    try {
      if (assignmentType === 'STUDENT') {
        for (const studentProfileId of selectedStudents) {
          await createTrainerAssignment({
            trainerEmployeeProfileId: Number(trainerId),
            courseId: Number(courseId),
            assignmentType: 'STUDENT',
            studentProfileId,
          });
        }
      } else {
        await createTrainerAssignment({
          trainerEmployeeProfileId: Number(trainerId),
          courseId: Number(courseId),
          assignmentType: 'INSTITUTION',
          institutionId: Number(institutionId),
        });
      }
      onClose();
    } catch (err) {
      const msg = (err as Error).message;
      setLocalError(msg.includes('already exists') ? 'One or more assignments already exist for this trainer and course.' : msg);
    } finally {
      setSaving(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg relative max-h-[90vh] flex flex-col">
        <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-2xl" />

        <div className="px-6 pt-6 pb-3 flex items-center justify-between shrink-0">
          <h2 className="text-base font-extrabold text-[#001D6E]">New Trainer Assignment</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
          {displayError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="font-semibold">{displayError}</p>
            </div>
          )}

          {/* Trainer */}
          <div>
            <label className={labelCls}>Trainer *</label>
            <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className={inputCls()}>
              <option value="">Select trainer...</option>
              {trainerEmployees.map((e) => (
                <option key={e.id} value={e.id}>{e.fullName} — {e.email}</option>
              ))}
            </select>
            {trainerEmployees.length === 0 && (
              <p className="text-[10px] text-amber-500 font-semibold mt-1">
                No trainers found. Create an employee with Trainer role first.
              </p>
            )}
          </div>

          {/* Course */}
          <div>
            <label className={labelCls}>Course *</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={inputCls()}>
              <option value="">Select course...</option>
              {activeCourses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Assignment Type */}
          <div>
            <label className={labelCls}>Assignment Type *</label>
            <div className="grid grid-cols-2 gap-3">
              {(['STUDENT', 'INSTITUTION'] as AssignmentType[]).map((t) => {
                const cfg = typeCfg[t];
                const active = assignmentType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setAssignmentType(t); setSelectedStudents([]); setInstitutionId(''); }}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all
                      ${active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'}`}
                  >
                    <cfg.Icon className="h-4 w-4" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic selector */}
          {assignmentType === 'INSTITUTION' && (
            <div>
              <label className={labelCls}>Institution *</label>
              <select value={institutionId} onChange={(e) => setInstitutionId(e.target.value)} className={inputCls()}>
                <option value="">Select institution...</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}{i.city ? ` — ${i.city}` : ''}</option>
                ))}
              </select>
              {institutionId && (
                <p className="text-[10px] text-teal-600 font-semibold mt-1">
                  Trainer will see all students enrolled in this institution for the selected course.
                </p>
              )}
            </div>
          )}

          {assignmentType === 'STUDENT' && (
            <div>
              <label className={labelCls}>
                Students * <span className="text-blue-500 normal-case font-semibold">({selectedStudents.length} selected)</span>
              </label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10"
                />
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold p-4 text-center">No students found.</p>
                ) : filteredStudents.map((s) => {
                  const checked = selectedStudents.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 border-b border-slate-50 last:border-0
                        ${checked ? 'bg-blue-50/60' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStudent(s.id)}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20 cursor-pointer"
                      />
                      <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                        {s.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{s.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-semibold truncate">{s.email}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 pb-2 shrink-0">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={saving || isLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl transition-colors"
            >
              {saving ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving...</> : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Modal ──────────────────────────────────────────────────────────────

interface DeleteModalProps {
  assignment: TrainerAssignmentSummary;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ assignment, onClose }) => {
  const { deleteTrainerAssignment } = useAdminStore();
  const [deleting,   setDeleting]   = useState(false);
  const [localError, setLocalError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteTrainerAssignment(assignment.trainer_assignment_id);
      onClose();
    } catch (e) {
      setLocalError((e as Error).message ?? 'Failed to remove assignment.');
      setDeleting(false);
    }
  };

  const trainerName = `${assignment.trainer.user.full_name} ${assignment.trainer.user.last_name}`.trim();
  const target = assignment.assignment_type === 'STUDENT'
    ? `${assignment.studentProfile?.user.full_name} ${assignment.studentProfile?.user.last_name}`.trim()
    : assignment.institution?.institution_name ?? '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-red-500 rounded-t-2xl" />
        <div className="p-6">
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <Trash2 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">Remove Assignment</h2>
          <p className="text-xs text-slate-500 font-semibold mt-1.5">
            Remove <span className="text-slate-800">{trainerName}</span>'s{' '}
            {assignment.assignment_type === 'STUDENT' ? 'student' : 'institution'} assignment to{' '}
            <span className="text-slate-800">{target}</span> for{' '}
            <span className="text-slate-800">{assignment.course.course_name}</span>?
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
              {deleting ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Removing...</> : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

const AdminTrainerAssignments: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Trainer Assignments');

  const {
    trainerAssignments, isLoading, error,
    trainerAssignmentSearchQuery, trainerAssignmentTypeFilter,
    setTrainerAssignmentSearchQuery, setTrainerAssignmentTypeFilter,
    fetchTrainerAssignments,
  } = useAdminStore();

  const [showCreate, setShowCreate] = useState(false);
  const [delTarget,  setDelTarget]  = useState<TrainerAssignmentSummary | null>(null);

  useEffect(() => {
    fetchTrainerAssignments();
  }, []);

  const filtered = useMemo(() => {
    const q = trainerAssignmentSearchQuery.toLowerCase();
    return trainerAssignments.filter((a) => {
      const trainerName = `${a.trainer.user.full_name} ${a.trainer.user.last_name}`.toLowerCase();
      const courseName  = a.course.course_name.toLowerCase();
      const target = a.assignment_type === 'STUDENT'
        ? `${a.studentProfile?.user.full_name ?? ''} ${a.studentProfile?.user.last_name ?? ''}`.toLowerCase()
        : (a.institution?.institution_name ?? '').toLowerCase();

      const matchSearch = !q || trainerName.includes(q) || courseName.includes(q) || target.includes(q);
      const matchType   = trainerAssignmentTypeFilter === 'all' || a.assignment_type === trainerAssignmentTypeFilter;
      return matchSearch && matchType;
    });
  }, [trainerAssignments, trainerAssignmentSearchQuery, trainerAssignmentTypeFilter]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-trainer-assignments" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-trainer-assignments" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            {/* Page Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span><span className="text-slate-300">/</span>
                  <span className="text-blue-600">Trainer Assignments</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Trainer Assignments</h1>
                <p className="text-sm text-slate-500 mt-1">
                  {trainerAssignments.length} assignment{trainerAssignments.length !== 1 ? 's' : ''} across all trainers.
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" /> New Assignment
              </button>
            </div>

            {/* Type summary chips */}
            <div className="flex gap-3 flex-wrap">
              {(['STUDENT', 'INSTITUTION'] as AssignmentType[]).map((t) => {
                const cfg   = typeCfg[t];
                const count = trainerAssignments.filter((a) => a.assignment_type === t).length;
                return (
                  <div key={t} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-extrabold ${cfg.cls}`}>
                    <cfg.Icon className="h-3 w-3" />
                    {cfg.label} Assignments: {count}
                  </div>
                );
              })}
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={trainerAssignmentSearchQuery}
                    onChange={(e) => setTrainerAssignmentSearchQuery(e.target.value)}
                    placeholder="Search trainer, course, student..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                  />
                </div>
                <select
                  value={trainerAssignmentTypeFilter}
                  onChange={(e) => setTrainerAssignmentTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 transition-all"
                >
                  <option value="all">All Types</option>
                  <option value="STUDENT">Student</option>
                  <option value="INSTITUTION">Institution</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Trainer</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Course</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Assigned To</th>
                      <th className="py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center">
                          <RefreshCw className="h-5 w-5 animate-spin text-slate-300 mx-auto" />
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <UserCheck className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-sm text-slate-400 font-semibold">
                            {trainerAssignmentSearchQuery || trainerAssignmentTypeFilter !== 'all'
                              ? 'No assignments match your filters.'
                              : 'No trainer assignments yet. Click "New Assignment" to create one.'}
                          </p>
                        </td>
                      </tr>
                    ) : filtered.map((a) => {
                      const trainerName = `${a.trainer.user.full_name} ${a.trainer.user.last_name}`.trim();
                      const cfg = typeCfg[a.assignment_type as AssignmentType];

                      const assignedToName = a.assignment_type === 'STUDENT'
                        ? `${a.studentProfile?.user.full_name ?? ''} ${a.studentProfile?.user.last_name ?? ''}`.trim()
                        : a.institution?.institution_name ?? '—';
                      const assignedToSub = a.assignment_type === 'STUDENT'
                        ? a.studentProfile?.user.email ?? ''
                        : a.studentProfile?.institution?.institution_name ?? '';

                      return (
                        <tr key={a.trainer_assignment_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {trainerName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{trainerName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{a.trainer.user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="h-3 w-3 text-slate-300 shrink-0" />
                              <p className="text-xs font-semibold text-slate-700">{a.course.course_name}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${cfg.cls}`}>
                              <cfg.Icon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              {a.assignment_type === 'STUDENT'
                                ? <GraduationCap className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                                : <Building2 className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                              }
                              <div>
                                <p className="text-xs font-semibold text-slate-800">{assignedToName}</p>
                                {assignedToSub && (
                                  <p className="text-[10px] text-slate-400 font-semibold">{assignedToSub}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => setDelTarget(a)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove assignment"
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
                  Showing {filtered.length} of {trainerAssignments.length} assignment{trainerAssignments.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

          </main>
        </div>
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {delTarget  && <DeleteModal assignment={delTarget} onClose={() => setDelTarget(null)} />}
    </div>
  );
};

export default AdminTrainerAssignments;
