import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Layers, Users, Plus, Pencil, X, Trash2, Settings2 } from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { Course, CourseStatus } from '../../../store/Admin';
import { courseSchema, courseStatusValues, type CourseFields } from '../../../schemas/courseSchema';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useAppStore } from '../../../store/login';
import { canManageCourses } from '../../../lib/permissions';

const statusCfg: Record<CourseStatus, { label: string; className: string }> = {
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  DRAFT:    { label: 'Draft',    className: 'bg-amber-50 text-amber-700 border-amber-100'       },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-600 border-slate-200'      },
};

const statusColorOn: Record<CourseStatus, string> = {
  ACTIVE:   'bg-emerald-600 text-white border-emerald-600',
  DRAFT:    'bg-amber-500 text-white border-amber-500',
  ARCHIVED: 'bg-slate-600 text-white border-slate-600',
};
const statusColorOff: Record<CourseStatus, string> = {
  ACTIVE:   'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700',
  DRAFT:    'border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700',
  ARCHIVED: 'border-slate-200 text-slate-600 hover:border-slate-400',
};

const courseGradients = [
  'from-blue-600 to-sky-500', 'from-indigo-600 to-blue-500', 'from-emerald-600 to-teal-500',
  'from-purple-600 to-indigo-500', 'from-amber-500 to-orange-500', 'from-rose-500 to-pink-500',
  'from-teal-600 to-cyan-500', 'from-slate-600 to-slate-500',
];

const filterTabs = [
  { key: 'all', label: 'All' }, { key: 'ACTIVE', label: 'Active' },
  { key: 'DRAFT', label: 'Draft' }, { key: 'ARCHIVED', label: 'Archived' },
];

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

// ── Status toggle (controlled by RHF setValue) ────────────────────────────────

interface StatusToggleProps {
  value: CourseStatus;
  onChange: (v: CourseStatus) => void;
}
const StatusToggle: React.FC<StatusToggleProps> = ({ value, onChange }) => (
  <div className="flex gap-2">
    {courseStatusValues.map((opt) => (
      <button
        key={opt}
        type="button"
        onClick={() => onChange(opt)}
        className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all ${
          value === opt ? statusColorOn[opt] : statusColorOff[opt]
        }`}
      >
        {opt.charAt(0) + opt.slice(1).toLowerCase()}
      </button>
    ))}
  </div>
);

// ── Add Course Modal ──────────────────────────────────────────────────────────

interface AddModalProps { onClose: () => void }

const AddCourseModal: React.FC<AddModalProps> = ({ onClose }) => {
  const { addCourse } = useAdminStore();
  const [pending, setPending] = useState<CourseFields | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CourseFields>({
    resolver: zodResolver(courseSchema),
    defaultValues: { status: 'DRAFT' },
  });

  const onSubmit = (data: CourseFields) => setPending(data);

  const handleConfirm = () => {
    if (pending) addCourse(pending);
    onClose();
  };

  return (
    <React.Fragment>
      {pending && (
        <ConfirmDialog
          message={`Are you sure you want to add "${pending.name}" as a new course?`}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">New Course</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Fill in the details to create a new course.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Course Name</label>
              <input {...register('name')} placeholder="e.g. React Frontend Development" className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
              <textarea {...register('description')} placeholder="Brief overview of what this course covers..." rows={3}
                className={`${inputCls(!!errors.description)} resize-none`} />
              {errors.description && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
              <StatusToggle value={watch('status')} onChange={(v) => setValue('status', v)} />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

// ── Edit Course Modal ─────────────────────────────────────────────────────────

interface EditModalProps { course: Course; onClose: () => void }

const EditCourseModal: React.FC<EditModalProps> = ({ course, onClose }) => {
  const { updateCourse, deleteCourse } = useAdminStore();
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CourseFields>({
    resolver: zodResolver(courseSchema),
    defaultValues: { name: course.name, description: course.description, status: course.status },
  });

  const onSubmit = (data: CourseFields) => {
    setConfirm({
      message: `Are you sure you want to update "${course.name}"?`,
      onConfirm: () => { updateCourse({ ...course, ...data }); onClose(); },
    });
  };

  const handleDelete = () => {
    setConfirm({
      message: `Are you sure you want to delete "${course.name}"? This cannot be undone.`,
      onConfirm: () => { deleteCourse(course.id); onClose(); },
    });
  };

  return (
    <React.Fragment>
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">Edit Course</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Update the details or delete this course.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Course Name</label>
              <input {...register('name')} className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Description</label>
              <textarea {...register('description')} rows={3} className={`${inputCls(!!errors.description)} resize-none`} />
              {errors.description && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
              <StatusToggle value={watch('status')} onChange={(v) => setValue('status', v)} />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminCourses: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Courses');
  const { courses, isLoading, fetchCourses, setSelectedCourseId, courseSearchQuery, courseStatusFilter, setCourseSearchQuery, setCourseStatusFilter } = useAdminStore();
  const { currentUser } = useAppStore();
  const canManage = canManageCourses(currentUser?.email);
  const [showAddModal, setShowModal] = useState(false);
  const [editingCourse, setEditing]  = useState<Course | null>(null);

  useEffect(() => { fetchCourses(); }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesStatus = courseStatusFilter === 'all' || c.status === courseStatusFilter;
      const q = courseSearchQuery.toLowerCase();
      return matchesStatus && (!q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    });
  }, [courseSearchQuery, courseStatusFilter, courses]);

  const counts = useMemo(() => ({
    all:      courses.length,
    ACTIVE:   courses.filter(c => c.status === 'ACTIVE').length,
    DRAFT:    courses.filter(c => c.status === 'DRAFT').length,
    ARCHIVED: courses.filter(c => c.status === 'ARCHIVED').length,
  }), [courses]);

  const totalEnrollments = useMemo(() => courses.reduce((s, c) => s + c.enrollments, 0), [courses]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-courses" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-courses" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span><span className="text-slate-300">/</span><span className="text-blue-600">Courses</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Courses</h1>
                <p className="text-sm text-slate-500 mt-1">{courses.length} courses · {totalEnrollments} total enrollments.</p>
              </div>
              {canManage && (
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors shrink-0">
                  <Plus className="h-4 w-4" /> New Course
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Active',   value: counts.ACTIVE,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                { label: 'Draft',    value: counts.DRAFT,    color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100'     },
                { label: 'Archived', value: counts.ARCHIVED, color: 'text-slate-500',   bg: 'bg-slate-100 border-slate-200'    },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl p-4 border ${s.bg} flex items-center gap-3`}>
                  <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs font-bold text-slate-600">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-900/5 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {filterTabs.map((tab) => {
                    const count = counts[tab.key as keyof typeof counts];
                    const isActive = courseStatusFilter === tab.key;
                    return (
                      <button key={tab.key} onClick={() => setCourseStatusFilter(tab.key)}
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
                  <input type="text" value={courseSearchQuery} onChange={(e) => setCourseSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all w-52"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Course</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Modules</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enrollments</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                      <th className="text-right py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400 font-semibold">Loading courses...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={6} className="py-12 text-center text-sm text-slate-400 font-semibold">No courses match your search.</td></tr>
                    ) : filtered.map((course, idx) => {
                      const sCfg = statusCfg[course.status];
                      return (
                        <tr key={course.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${courseGradients[idx % courseGradients.length]} flex items-center justify-center shrink-0`}>
                                <BookOpen className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{course.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate max-w-xs">{course.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${sCfg.className}`}>{sCfg.label}</span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Layers className="h-3 w-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">{course.moduleCount}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Users className="h-3 w-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">{course.enrollments}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <span className="text-[11px] text-slate-500 font-semibold">{course.createdAt}</span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setSelectedCourseId(course.id); onViewChange?.('admin-course-detail'); }}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1"
                              >
                                <Settings2 className="h-3 w-3" />Manage
                              </button>
                              {canManage && (
                                <button onClick={() => setEditing(course)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1">
                                  <Pencil className="h-3 w-3" />Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold">Showing {filtered.length} of {courses.length} courses</p>
              </div>
            </div>

          </main>
        </div>
      </div>

      {showAddModal  && <AddCourseModal  onClose={() => setShowModal(false)} />}
      {editingCourse && <EditCourseModal course={editingCourse} onClose={() => setEditing(null)} />}
    </div>
  );
};

export default AdminCourses;
