import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronDown, ChevronRight, Plus, Pencil, Trash2, X,
  BookOpen, FileText, ClipboardList, ArrowLeft, Layers,
} from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { CourseModule, Lesson, CreateLessonPayload, UpdateLessonPayload } from '../../../store/Admin';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { moduleSchema, type ModuleFields } from '../../../schemas/moduleSchema';
import { lectureSchema, contentTypeValues, lessonStatusValues, type LectureFields } from '../../../schemas/lectureSchema';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls = (err: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

const statusCfg: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'bg-amber-50 text-amber-700 border-amber-100'       },
  PUBLISHED: { label: 'Published', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED:  { label: 'Archived',  cls: 'bg-slate-100 text-slate-600 border-slate-200'      },
};

const statusOnCls: Record<string, string> = {
  DRAFT:     'bg-amber-500 text-white border-amber-500',
  PUBLISHED: 'bg-emerald-600 text-white border-emerald-600',
  ARCHIVED:  'bg-slate-600 text-white border-slate-600',
};
const statusOffCls: Record<string, string> = {
  DRAFT:     'border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700',
  PUBLISHED: 'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700',
  ARCHIVED:  'border-slate-200 text-slate-600 hover:border-slate-400',
};

// ── Module Modals ─────────────────────────────────────────────────────────────

const ModuleModal: React.FC<{
  courseId: number;
  module?: CourseModule;
  onClose: () => void;
}> = ({ courseId, module, onClose }) => {
  const { addModule, updateModule, deleteModule } = useAdminStore();
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ModuleFields>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { name: module?.name ?? '', description: module?.description ?? '' },
  });

  const onSubmit = (data: ModuleFields) => {
    setConfirm({
      msg: module ? `Update "${module.name}"?` : `Add module "${data.name}"?`,
      fn: async () => {
        if (module) await updateModule(module.id, data.name, data.description);
        else        await addModule(courseId, data.name, data.description);
        onClose();
      },
    });
  };

  const handleDelete = () => {
    setConfirm({
      msg: `Delete "${module!.name}"? All lessons inside will also be removed.`,
      fn: async () => { await deleteModule(module!.id); onClose(); },
    });
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog message={confirm.msg} onConfirm={confirm.fn} onCancel={() => setConfirm(null)} />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">{module ? 'Edit Module' : 'New Module'}</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {module ? 'Update module details or delete it.' : 'Add a new module to this course.'}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Module Name</label>
              <input {...register('name')} placeholder="e.g. Introduction to React" className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Description <span className="text-slate-300">(optional)</span></label>
              <textarea {...register('description')} rows={2} placeholder="Brief overview of this module..."
                className={`${inputCls(false)} resize-none`} />
            </div>
            <div className="flex items-center justify-between pt-1">
              {module ? (
                <button type="button" onClick={handleDelete}
                  className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5">
                  {module ? <><Pencil className="h-3.5 w-3.5" /> Update</> : <><Plus className="h-3.5 w-3.5" /> Add Module</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── Lesson Modal ──────────────────────────────────────────────────────────────

const LessonModal: React.FC<{
  moduleId: number;
  lesson?: Lesson;
  onClose: () => void;
}> = ({ moduleId, lesson, onClose }) => {
  const { addLesson, updateLesson, deleteLesson } = useAdminStore();
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<LectureFields>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title:                    lesson?.title ?? '',
      contentType:              lesson?.contentType ?? 'LECTURE',
      status:                   lesson?.status ?? 'DRAFT',
      description:              lesson?.description ?? '',
      estimatedDurationMinutes: lesson?.estimatedDurationMinutes ?? null,
      dueDate:                  lesson?.dueDate ?? null,
      maxMarks:                 lesson?.maxMarks ?? null,
    },
  });

  const contentType = watch('contentType');

  const onSubmit = (data: LectureFields) => {
    setConfirm({
      msg: lesson ? `Update "${lesson.title}"?` : `Add lesson "${data.title}"?`,
      fn: async () => {
        if (lesson) {
          const payload: UpdateLessonPayload = {
            contentType:              data.contentType,
            title:                    data.title,
            description:              data.description,
            lectureStatus:            data.status,
            estimatedDurationMinutes: data.contentType === 'LECTURE'    ? (data.estimatedDurationMinutes ?? null) : null,
            dueDate:                  data.contentType === 'ASSIGNMENT' ? (data.dueDate ?? null) : null,
            maxMarks:                 data.contentType === 'ASSIGNMENT' ? (data.maxMarks ?? null) : null,
          };
          await updateLesson(lesson.id, moduleId, payload);
        } else {
          const payload: CreateLessonPayload = {
            contentType:  data.contentType,
            title:        data.title,
            description:  data.description,
            lectureStatus: data.status,
            ...(data.contentType === 'LECTURE'    && data.estimatedDurationMinutes ? { estimatedDurationMinutes: data.estimatedDurationMinutes } : {}),
            ...(data.contentType === 'ASSIGNMENT' && data.dueDate  ? { dueDate: data.dueDate }   : {}),
            ...(data.contentType === 'ASSIGNMENT' && data.maxMarks !== null ? { maxMarks: data.maxMarks ?? undefined } : {}),
          };
          await addLesson(moduleId, payload);
        }
        onClose();
      },
    });
  };

  const handleDelete = () => {
    setConfirm({
      msg: `Delete "${lesson!.title}"?`,
      fn: async () => { await deleteLesson(lesson!.id, moduleId); onClose(); },
    });
  };

  return (
    <>
      {confirm && (
        <ConfirmDialog message={confirm.msg} onConfirm={confirm.fn} onCancel={() => setConfirm(null)} />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">{lesson ? 'Edit Lesson' : 'New Lesson'}</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {lesson ? 'Update lesson details or delete it.' : 'Add a new lesson to this module.'}
              </p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">

            {/* Type toggle */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Type</label>
              <Controller
                control={control}
                name="contentType"
                render={({ field }) => (
                  <div className="flex gap-2">
                    {contentTypeValues.map((t) => (
                      <button key={t} type="button" onClick={() => field.onChange(t)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border rounded-xl transition-all ${
                          field.value === t
                            ? 'bg-[#001D6E] text-white border-[#001D6E]'
                            : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                        }`}>
                        {t === 'LECTURE' ? <FileText className="h-3.5 w-3.5" /> : <ClipboardList className="h-3.5 w-3.5" />}
                        {t.charAt(0) + t.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Title</label>
              <input {...register('title')} placeholder="e.g. Introduction to Components" className={inputCls(!!errors.title)} />
              {errors.title && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Description <span className="text-slate-300">(optional)</span></label>
              <textarea {...register('description')} rows={2} placeholder="Brief overview..."
                className={`${inputCls(false)} resize-none`} />
            </div>

            {/* Status */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <div className="flex gap-2">
                    {lessonStatusValues.map((s) => (
                      <button key={s} type="button" onClick={() => field.onChange(s)}
                        className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all ${
                          field.value === s ? statusOnCls[s] : statusOffCls[s]
                        }`}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Conditional: LECTURE → duration */}
            {contentType === 'LECTURE' && (
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Duration (minutes) <span className="text-slate-300">(optional)</span></label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 45"
                  className={inputCls(false)}
                  value={watch('estimatedDurationMinutes') ?? ''}
                  onChange={(e) => setValue('estimatedDurationMinutes', e.target.value ? Number(e.target.value) : null)}
                />
              </div>
            )}

            {/* Conditional: ASSIGNMENT → due date + max marks */}
            {contentType === 'ASSIGNMENT' && (
              <>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Due Date <span className="text-slate-300">(optional)</span></label>
                  <input type="date" {...register('dueDate')} className={inputCls(false)} />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Max Marks <span className="text-slate-300">(optional)</span></label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 100"
                    className={inputCls(false)}
                    value={watch('maxMarks') ?? ''}
                    onChange={(e) => setValue('maxMarks', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between pt-1">
              {lesson ? (
                <button type="button" onClick={handleDelete}
                  className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5">
                  {lesson ? <><Pencil className="h-3.5 w-3.5" /> Update</> : <><Plus className="h-3.5 w-3.5" /> Add Lesson</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── Module Row ────────────────────────────────────────────────────────────────

const ModuleRow: React.FC<{ mod: CourseModule; index: number }> = ({ mod, index }) => {
  const { lessons, fetchLessons } = useAdminStore();
  const [expanded, setExpanded]       = useState(false);
  const [editModule, setEditModule]   = useState(false);
  const [addLesson, setAddLesson]     = useState(false);
  const [editLesson, setEditLesson]   = useState<Lesson | null>(null);

  const modLessons = lessons[mod.id] ?? [];
  const loaded     = mod.id in lessons;

  const toggle = () => {
    if (!expanded && !loaded) fetchLessons(mod.id);
    setExpanded((v) => !v);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      {/* Module header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white hover:bg-slate-50/50 transition-colors">
        <button onClick={toggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          <div className="shrink-0 text-slate-400">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
          <div className="h-8 w-8 rounded-xl bg-[#001D6E]/10 text-[#001D6E] font-extrabold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{mod.name}</p>
            {mod.description && (
              <p className="text-[11px] text-slate-400 font-semibold truncate mt-0.5">{mod.description}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <Layers className="h-3 w-3" />
            {mod.lectureCount} lesson{mod.lectureCount !== 1 ? 's' : ''}
          </div>
          <button onClick={() => setEditModule(true)}
            className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1">
            <Pencil className="h-3 w-3" /> Edit
          </button>
        </div>
      </div>

      {/* Lessons panel */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 space-y-3">
          {modLessons.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold text-center py-4">No lessons yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">#</th>
                  <th className="text-left pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Lesson</th>
                  <th className="text-left pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="text-left pb-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modLessons.map((lesson, li) => {
                  const sCfg = statusCfg[lesson.status];
                  return (
                    <tr key={lesson.id} className="hover:bg-white transition-colors">
                      <td className="py-2.5 pr-3 text-[11px] font-bold text-slate-400">{li + 1}</td>
                      <td className="py-2.5 pr-4">
                        <p className="text-xs font-bold text-slate-800">{lesson.title}</p>
                        {lesson.description && (
                          <p className="text-[10px] text-slate-400 font-semibold truncate max-w-xs mt-0.5">{lesson.description}</p>
                        )}
                      </td>
                      <td className="py-2.5 pr-4 hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${
                          lesson.contentType === 'ASSIGNMENT'
                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {lesson.contentType === 'ASSIGNMENT' ? 'Assignment' : 'Lecture'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${sCfg.cls}`}>
                          {sCfg.label}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => setEditLesson(lesson)}
                          className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1 ml-auto">
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          <button onClick={() => setAddLesson(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Lesson
          </button>
        </div>
      )}

      {editModule  && <ModuleModal courseId={mod.courseId} module={mod} onClose={() => setEditModule(false)} />}
      {addLesson   && <LessonModal moduleId={mod.id} onClose={() => setAddLesson(false)} />}
      {editLesson  && <LessonModal moduleId={mod.id} lesson={editLesson} onClose={() => setEditLesson(null)} />}
    </div>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminCourseDetail: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  const { selectedCourseId, courses, modules, modulesLoading, fetchModules } = useAdminStore();
  const [showAddModule, setShowAddModule] = useState(false);

  const course = courses.find((c) => c.id === selectedCourseId);
  useDocumentTitle(course ? `${course.name} — Modules` : 'Course Modules');

  useEffect(() => {
    if (selectedCourseId) fetchModules(selectedCourseId);
  }, [selectedCourseId]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-course-detail" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-course-detail" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            {/* Breadcrumb + header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span>
                  <span className="text-slate-300">/</span>
                  <button
                    onClick={() => onViewChange?.('admin-courses')}
                    className="hover:text-blue-500 transition-colors"
                  >
                    Courses
                  </button>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-600 truncate max-w-[200px]">{course?.name ?? '—'}</span>
                </nav>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onViewChange?.('admin-courses')}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                    title="Back to Courses"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">{course?.name ?? 'Course'}</h1>
                    {course?.description && (
                      <p className="text-sm text-slate-500 mt-1">{course.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowAddModule(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors shrink-0"
              >
                <Plus className="h-4 w-4" /> New Module
              </button>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <BookOpen className="h-4 w-4 text-[#001D6E]" />
                <span className="text-sm font-bold text-[#001D6E]">{modules.length}</span>
                <span className="text-xs text-slate-500 font-semibold">modules</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                <Layers className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">{modules.reduce((s, m) => s + m.lectureCount, 0)}</span>
                <span className="text-xs text-slate-500 font-semibold">total lessons</span>
              </div>
            </div>

            {/* Module list */}
            {modulesLoading ? (
              <p className="text-sm text-slate-400 font-semibold text-center py-12">Loading modules...</p>
            ) : modules.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
                <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">No modules yet.</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Click "New Module" to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod, i) => (
                  <ModuleRow key={mod.id} mod={mod} index={i} />
                ))}
              </div>
            )}

          </main>
        </div>
      </div>

      {showAddModule && selectedCourseId && (
        <ModuleModal courseId={selectedCourseId} onClose={() => setShowAddModule(false)} />
      )}
    </div>
  );
};

export default AdminCourseDetail;
