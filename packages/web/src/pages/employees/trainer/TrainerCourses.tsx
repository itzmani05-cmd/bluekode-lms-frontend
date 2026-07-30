import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BookOpen, ChevronDown, ChevronUp, ClipboardList,
  FileText, ListTodo, AlertTriangle, RefreshCw,
  Plus, Pencil, Trash2, X,
} from 'lucide-react';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import ConfirmDialog from '../../../components/ConfirmDialog';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { useAppStore } from '../../../store/login';
import { fetchMyEmployeeProfile } from '../../../lib/api/employees';
import { fetchAssignmentsByTrainerApi } from '../../../lib/api/trainerAssignments';
import {
  fetchCourses, fetchCourseByIdApi, createCourseApi, updateCourseApi, deleteCourseApi, type CourseDetail,
} from '../../../lib/api/courses';
import {
  fetchModulesApi, createModuleApi, updateModuleApi, deleteModuleApi,
} from '../../../lib/api/modules';
import {
  fetchLecturesApi, createLectureApi, updateLectureApi, deleteLectureApi,
  type Lesson, type CreateLessonPayload, type UpdateLessonPayload,
} from '../../../lib/api/lectures';
import { lectureSchema, contentTypeValues, lessonStatusValues, type LectureFields } from '../../../schemas/lectureSchema';
import { moduleSchema, type ModuleFields } from '../../../schemas/moduleSchema';
import { courseSchema, courseStatusValues, type CourseFields } from '../../../schemas/courseSchema';
import { canManageCourses } from '../../../lib/permissions';
import type { CourseStatus } from '../../../store/Admin';

interface TrainerModule {
  module_id:          number;
  course_id:          number;
  module_name:        string;
  module_description: string;
  module_order:       number;
  lectures:           Lesson[];
}

interface TrainerCourse extends CourseDetail {
  modules: TrainerModule[];
}

type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';

const courseStatusCfg: Record<CourseStatus, { label: string; className: string }> = {
  DRAFT:    { label: 'Draft',    className: 'bg-slate-100 text-slate-500 border-slate-200'     },
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED: { label: 'Archived', className: 'bg-slate-100 text-slate-400 border-slate-200'     },
};

const assignmentStatusCfg: Record<AssignmentStatus, { label: string; className: string }> = {
  DRAFT:     { label: 'Draft',     className: 'bg-slate-100 text-slate-500 border-slate-200'     },
  PUBLISHED: { label: 'Published', className: 'bg-blue-50 text-blue-600 border-blue-100'         },
  ACTIVE:    { label: 'Active',    className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED:  { label: 'Archived',  className: 'bg-slate-100 text-slate-400 border-slate-200'     },
  CLOSED:    { label: 'Closed',    className: 'bg-slate-50 text-slate-400 border-slate-200'      },
};

const lessonTypeCfg: Record<string, { label: string; icon: React.ElementType; badgeCls: string; iconCls: string }> = {
  LECTURE:    { label: 'Lecture',    icon: FileText,      badgeCls: 'bg-blue-50 text-blue-700 border-blue-100',     iconCls: 'bg-slate-100 text-slate-500' },
  TASK:       { label: 'Task',       icon: ListTodo,      badgeCls: 'bg-amber-50 text-amber-700 border-amber-100', iconCls: 'bg-amber-50 text-amber-600'  },
  ASSIGNMENT: { label: 'Assignment', icon: ClipboardList, badgeCls: 'bg-indigo-50 text-indigo-600 border-indigo-100', iconCls: 'bg-indigo-50 text-indigo-600' },
};

const inputCls = (err: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    err ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

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

const courseStatusOnCls: Record<CourseStatus, string> = {
  DRAFT:    'bg-amber-500 text-white border-amber-500',
  ACTIVE:   'bg-emerald-600 text-white border-emerald-600',
  ARCHIVED: 'bg-slate-600 text-white border-slate-600',
};
const courseStatusOffCls: Record<CourseStatus, string> = {
  DRAFT:    'border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700',
  ACTIVE:   'border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700',
  ARCHIVED: 'border-slate-200 text-slate-600 hover:border-slate-400',
};

// ── Course Modal ──────────────────────────────────────────────────────────────

const CourseModal: React.FC<{
  course?: TrainerCourse;
  onClose: () => void;
  onCreated: (course: TrainerCourse) => void;
  onUpdated: (id: number, fields: CourseFields) => void;
  onDeleted: (id: number) => void;
}> = ({ course, onClose, onCreated, onUpdated, onDeleted }) => {
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [saving, setSaving]   = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CourseFields>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name:        course?.name ?? '',
      description: course?.description ?? '',
      status:      course?.status ?? 'DRAFT',
    },
  });

  const onSubmit = (data: CourseFields) => {
    setConfirm({
      msg: course ? `Update "${course.name}"?` : `Create course "${data.name}"?`,
      fn: async () => {
        setSaving(true);
        try {
          if (course) {
            await updateCourseApi(course.id, data.name, data.description, data.status);
            onUpdated(course.id, data);
          } else {
            const created = await createCourseApi(data.name, data.description, data.status);
            onCreated({ ...created, modules: [] });
          }
          onClose();
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleDelete = () => {
    setConfirm({
      msg: `Delete "${course!.name}"? All modules and lessons inside will also be removed.`,
      fn: async () => {
        setSaving(true);
        try {
          await deleteCourseApi(course!.id);
          onDeleted(course!.id);
          onClose();
        } finally {
          setSaving(false);
        }
      },
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
              <h2 className="font-extrabold text-[#001D6E] text-base">{course ? 'Edit Course' : 'New Course'}</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                {course ? 'Update course details or delete it.' : 'Create a new course you will teach.'}
              </p>
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
              <textarea {...register('description')} rows={3} placeholder="Brief overview of what this course covers..."
                className={`${inputCls(!!errors.description)} resize-none`} />
              {errors.description && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Status</label>
              <div className="flex gap-2">
                {courseStatusValues.map((s) => (
                  <button key={s} type="button" onClick={() => setValue('status', s)}
                    className={`flex-1 py-2 text-xs font-bold border rounded-xl transition-all ${
                      watch('status') === s ? courseStatusOnCls[s] : courseStatusOffCls[s]
                    }`}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              {course ? (
                <button type="button" onClick={handleDelete} disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  {course ? <><Pencil className="h-3.5 w-3.5" /> Update</> : <><Plus className="h-3.5 w-3.5" /> Add Course</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

// ── Module Modal ──────────────────────────────────────────────────────────────

const ModuleModal: React.FC<{
  courseId: number;
  module?: TrainerModule;
  onClose: () => void;
  onSaved: (courseId: number) => Promise<void> | void;
}> = ({ courseId, module, onClose, onSaved }) => {
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [saving, setSaving]   = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ModuleFields>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { name: module?.module_name ?? '', description: module?.module_description ?? '' },
  });

  const onSubmit = (data: ModuleFields) => {
    setConfirm({
      msg: module ? `Update "${module.module_name}"?` : `Add module "${data.name}"?`,
      fn: async () => {
        setSaving(true);
        try {
          if (module) await updateModuleApi(module.module_id, data.name, data.description);
          else        await createModuleApi(courseId, data.name, data.description);
          await onSaved(courseId);
          onClose();
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleDelete = () => {
    setConfirm({
      msg: `Delete "${module!.module_name}"? All lessons inside will also be removed.`,
      fn: async () => {
        setSaving(true);
        try {
          await deleteModuleApi(module!.module_id);
          await onSaved(courseId);
          onClose();
        } finally {
          setSaving(false);
        }
      },
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
                <button type="button" onClick={handleDelete} disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50">
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
  onSaved: (moduleId: number) => Promise<void> | void;
}> = ({ moduleId, lesson, onClose, onSaved }) => {
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [saving, setSaving]   = useState(false);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm<LectureFields>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title:                    lesson?.title ?? '',
      contentType:              lesson?.contentType ?? 'LECTURE',
      status:                   lesson?.status ?? 'DRAFT',
      description:              lesson?.description ?? '',
      content:                  lesson?.content ?? '',
      pdfUrl:                   lesson?.pdfUrl ?? '',
      dueDate:                  lesson?.dueDate ?? '',
      estimatedDurationMinutes: lesson?.estimatedDurationMinutes ?? null,
      maxMarks:                 lesson?.maxMarks ?? null,
    },
  });

  const contentType  = watch('contentType');
  const isAssignment = contentType === 'ASSIGNMENT';
  const cfg = lessonTypeCfg[contentType];

  const onSubmit = (data: LectureFields) => {
    setConfirm({
      msg: lesson ? `Update "${lesson.title}"?` : `Add ${cfg.label.toLowerCase()} "${data.title}"?`,
      fn: async () => {
        setSaving(true);
        try {
          if (lesson) {
            const payload: UpdateLessonPayload = {
              contentType:              data.contentType,
              title:                    data.title,
              description:              data.description,
              content:                  data.content,
              lectureStatus:            data.status,
              pdfUrl:                   isAssignment ? null : (data.pdfUrl || null),
              estimatedDurationMinutes: !isAssignment ? (data.estimatedDurationMinutes ?? null) : null,
              dueDate:                  isAssignment ? (data.dueDate || null) : null,
              maxMarks:                 isAssignment ? (data.maxMarks ?? null) : null,
            };
            await updateLectureApi(lesson.id, payload);
          } else {
            const payload: CreateLessonPayload = {
              contentType:   data.contentType,
              title:         data.title,
              description:   data.description,
              content:       data.content,
              lectureStatus: data.status,
              ...(!isAssignment && data.pdfUrl ? { pdfUrl: data.pdfUrl } : {}),
              ...(!isAssignment && data.estimatedDurationMinutes ? { estimatedDurationMinutes: data.estimatedDurationMinutes } : {}),
              ...(isAssignment && data.dueDate ? { dueDate: data.dueDate } : {}),
              ...(isAssignment && data.maxMarks !== null ? { maxMarks: data.maxMarks ?? undefined } : {}),
            };
            await createLectureApi(moduleId, payload);
          }
          await onSaved(moduleId);
          onClose();
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleDelete = () => {
    setConfirm({
      msg: `Delete "${lesson!.title}"?`,
      fn: async () => {
        setSaving(true);
        try {
          await deleteLectureApi(lesson!.id);
          await onSaved(moduleId);
          onClose();
        } finally {
          setSaving(false);
        }
      },
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
                {lesson ? 'Update this lesson\'s content or delete it.' : 'Add a lecture, task or assignment to this module.'}
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
                    {contentTypeValues.map((t) => {
                      const Icon = lessonTypeCfg[t].icon;
                      return (
                        <button key={t} type="button" onClick={() => field.onChange(t)}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold border rounded-xl transition-all ${
                            field.value === t
                              ? 'bg-[#001D6E] text-white border-[#001D6E]'
                              : 'border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700'
                          }`}>
                          <Icon className="h-3.5 w-3.5" />
                          {lessonTypeCfg[t].label}
                        </button>
                      );
                    })}
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

            {/* Short summary */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Summary <span className="text-slate-300">(optional)</span></label>
              <textarea {...register('description')} rows={2} placeholder="Brief overview shown in lists..."
                className={`${inputCls(false)} resize-none`} />
            </div>

            {/* Lesson content */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Content</label>
              <textarea {...register('content')} rows={6} placeholder="Write the full lesson content students will see..."
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

            {/* Conditional: LECTURE / TASK → duration + attachment link */}
            {!isAssignment && (
              <>
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
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Attachment Link <span className="text-slate-300">(optional)</span></label>
                  <input {...register('pdfUrl')} placeholder="https://... (PDF or resource link)" className={inputCls(false)} />
                </div>
              </>
            )}

            {/* Conditional: ASSIGNMENT → due date + max marks (no attachment) */}
            {isAssignment && (
              <div className="grid grid-cols-2 gap-3">
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
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              {lesson ? (
                <button type="button" onClick={handleDelete} disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              ) : <div />}
              <div className="flex gap-2">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50">
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

// ── Page ──────────────────────────────────────────────────────────────────────

const TrainerCourses: React.FC<{ onViewChange?: (view: TrainerViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('My Courses');
  const { currentUser } = useAppStore();
  const canManage = canManageCourses(currentUser?.email);

  const [courses,        setCourses]        = useState<TrainerCourse[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [fetchError,     setFetchError]     = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const [addLessonModuleId, setAddLessonModuleId] = useState<number | null>(null);
  const [editLesson,        setEditLesson]        = useState<Lesson | null>(null);

  const [showAddCourse, setShowAddCourse]           = useState(false);
  const [editingCourse, setEditingCourse]           = useState<TrainerCourse | null>(null);
  const [addModuleCourseId, setAddModuleCourseId]   = useState<number | null>(null);
  const [editModule,        setEditModule]          = useState<TrainerModule | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    setFetchError(null);

    const buildModules = async (courseId: number): Promise<TrainerModule[]> => {
      const modules = await fetchModulesApi(courseId);
      const sorted  = [...modules].sort((a, b) => a.order - b.order);
      return Promise.all(
        sorted.map(async (mod) => ({
          module_id:          mod.id,
          course_id:          courseId,
          module_name:        mod.name,
          module_description: mod.description,
          module_order:       mod.order,
          lectures:           await fetchLecturesApi(mod.id),
        })),
      );
    };

    if (canManage) {
      // trainer@company.com sees every course in the system
      fetchCourses()
        .then(async (all) => {
          const coursesData = await Promise.all(
            all.map(async (course) => ({ ...course, modules: await buildModules(course.id) })),
          );
          setCourses(coursesData);
          if (coursesData.length > 0) setExpandedCourse(coursesData[0].id);
        })
        .catch(() => setFetchError('Could not load courses. Please try again.'))
        .finally(() => setLoading(false));
    } else {
      fetchMyEmployeeProfile(currentUser.user_id)
        .then(async (profile) => {
          const assignments = await fetchAssignmentsByTrainerApi(profile.id);

          const courseMap = new Map<number, number>();
          for (const a of assignments) courseMap.set(a.course.course_id, a.course.course_id);
          const uniqueCourseIds = Array.from(courseMap.keys());

          const coursesData = await Promise.all(
            uniqueCourseIds.map(async (courseId) => {
              const detail = await fetchCourseByIdApi(courseId);
              return { ...detail, modules: await buildModules(courseId) };
            }),
          );

          setCourses(coursesData);
          if (coursesData.length > 0) setExpandedCourse(coursesData[0].id);
        })
        .catch(() => setFetchError('Could not load your courses. Please try again.'))
        .finally(() => setLoading(false));
    }
  }, [currentUser?.user_id]);

  const refreshModuleLectures = async (moduleId: number) => {
    const lectures = await fetchLecturesApi(moduleId);
    setCourses((prev) => prev.map((course) => ({
      ...course,
      modules: course.modules.map((mod) =>
        mod.module_id === moduleId ? { ...mod, lectures } : mod,
      ),
    })));
  };

  const refreshCourseModules = async (courseId: number) => {
    const modules = await fetchModulesApi(courseId);
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);
    const modulesWithLectures: TrainerModule[] = await Promise.all(
      sortedModules.map(async (mod) => ({
        module_id:          mod.id,
        course_id:          courseId,
        module_name:        mod.name,
        module_description: mod.description,
        module_order:       mod.order,
        lectures:           await fetchLecturesApi(mod.id),
      })),
    );
    setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, modules: modulesWithLectures } : c)));
  };

  const handleCourseCreated = (course: TrainerCourse) => {
    setCourses((prev) => [course, ...prev]);
    setExpandedCourse(course.id);
  };

  const handleCourseUpdated = (id: number, fields: CourseFields) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
  };

  const handleCourseDeleted = (id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setExpandedCourse((prev) => (prev === id ? null : prev));
  };

  const allLectures      = courses.flatMap((c) => c.modules.flatMap((m) => m.lectures));
  const totalAssignments = allLectures.filter((l) => l.contentType === 'ASSIGNMENT').length;
  const totalEnrolled    = courses.reduce((acc, c) => acc + c.enrollments, 0);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-courses" onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-courses" onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">My Courses</h1>
                <p className="text-sm text-slate-500 mt-1">Add, edit or remove courses, modules and lesson content you teach.</p>
              </div>
              {canManage && (
                <button
                  onClick={() => setShowAddCourse(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors shrink-0"
                >
                  <Plus className="h-4 w-4" /> New Course
                </button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading your courses...</span>
              </div>
            )}

            {/* Error */}
            {!loading && fetchError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{fetchError}</p>
              </div>
            )}

            {!loading && !fetchError && (
              <>
                {/* Summary row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#001D6E]">{courses.length}</p>
                      <p className="text-[10px] font-bold text-slate-500">Courses</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#001D6E]">{totalAssignments}</p>
                      <p className="text-[10px] font-bold text-slate-500">Total Assignments</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-[#001D6E]">{totalEnrolled}</p>
                      <p className="text-[10px] font-bold text-slate-500">Enrolled Students</p>
                    </div>
                  </div>
                </div>

                {/* Empty state */}
                {courses.length === 0 ? (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-sm">
                    <BookOpen className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-semibold">No courses yet.</p>
                    <p className="text-xs text-slate-300 font-semibold mt-1">
                      {canManage
                        ? 'Click "New Course" to create one, or contact your administrator to get existing courses assigned to you.'
                        : 'Contact your administrator to get courses assigned to you.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course) => {
                      const isCourseOpen  = expandedCourse === course.id;
                      const courseCfg     = courseStatusCfg[course.status];
                      const courseAssignments = course.modules
                        .flatMap((m) => m.lectures)
                        .filter((l) => l.contentType === 'ASSIGNMENT').length;

                      return (
                        <div key={course.id} className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                          {/* Course header */}
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setExpandedCourse(isCourseOpen ? null : course.id)}
                            onKeyDown={(e) => { if (e.key === 'Enter') setExpandedCourse(isCourseOpen ? null : course.id); }}
                            className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
                          >
                            <div className="p-2.5 bg-[#001D6E]/5 border border-[#001D6E]/10 rounded-xl text-[#001D6E] shrink-0">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-extrabold text-slate-900">{course.name}</p>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${courseCfg.className}`}>
                                  {courseCfg.label}
                                </span>
                              </div>
                              {course.description && (
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5 truncate">{course.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-6 shrink-0 text-center">
                              <div>
                                <p className="text-sm font-extrabold text-[#001D6E]">{course.modules.length}</p>
                                <p className="text-[9px] font-bold text-slate-400">Modules</p>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#001D6E]">{courseAssignments}</p>
                                <p className="text-[9px] font-bold text-slate-400">Assignments</p>
                              </div>
                              <div>
                                <p className="text-sm font-extrabold text-[#001D6E]">{course.enrollments}</p>
                                <p className="text-[9px] font-bold text-slate-400">Students</p>
                              </div>
                              {canManage && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingCourse(course); }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1"
                                >
                                  <Pencil className="h-3 w-3" /> Edit
                                </button>
                              )}
                              {isCourseOpen
                                ? <ChevronUp className="h-4 w-4 text-slate-400" />
                                : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </div>

                          {/* Modules */}
                          {isCourseOpen && (
                            <div className="border-t border-slate-100 divide-y divide-slate-100">
                              {canManage && (
                                <div className="px-6 py-3 bg-slate-50/30 flex justify-end">
                                  <button
                                    onClick={() => setAddModuleCourseId(course.id)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                  >
                                    <Plus className="h-3.5 w-3.5" /> New Module
                                  </button>
                                </div>
                              )}
                              {course.modules.length === 0 ? (
                                <p className="px-6 py-4 text-xs text-slate-400 font-semibold">No modules in this course yet.</p>
                              ) : course.modules.map((mod) => {
                                const isModOpen = expandedModule === mod.module_id;
                                return (
                                  <div key={mod.module_id}>
                                    <div
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => setExpandedModule(isModOpen ? null : mod.module_id)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') setExpandedModule(isModOpen ? null : mod.module_id); }}
                                      className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-slate-50/50 transition-colors bg-slate-50/30 cursor-pointer"
                                    >
                                      <span className="text-xs font-extrabold text-slate-700 flex-1">{mod.module_name}</span>
                                      <span className="text-[10px] font-semibold text-slate-400">
                                        {mod.lectures.length} item{mod.lectures.length !== 1 ? 's' : ''}
                                      </span>
                                      {canManage && (
                                        <button
                                          onClick={(e) => { e.stopPropagation(); setEditModule(mod); }}
                                          className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1"
                                        >
                                          <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                      )}
                                      {isModOpen
                                        ? <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                                        : <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
                                    </div>

                                    {/* Lectures / Tasks / Assignments */}
                                    {isModOpen && (
                                      <div className="divide-y divide-slate-50">
                                        {mod.lectures.length === 0 ? (
                                          <p className="px-8 py-3 text-xs text-slate-400 font-semibold">No lessons yet.</p>
                                        ) : mod.lectures.map((lec) => {
                                          const typeCfg = lessonTypeCfg[lec.contentType] ?? lessonTypeCfg.LECTURE;
                                          const Icon = typeCfg.icon;
                                          const asCfg = lec.assignmentStatus
                                            ? assignmentStatusCfg[lec.assignmentStatus as AssignmentStatus]
                                            : null;
                                          return (
                                            <div key={lec.id} className="flex items-center gap-4 px-8 py-3.5">
                                              <div className={`p-1.5 rounded-lg shrink-0 ${typeCfg.iconCls}`}>
                                                <Icon className="h-3.5 w-3.5" />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800">{lec.title}</p>
                                                <p className="text-[10px] text-slate-400 font-semibold">
                                                  {lec.contentType === 'ASSIGNMENT'
                                                    ? `Max: ${lec.maxMarks ?? '—'} marks`
                                                    : `${lec.estimatedDurationMinutes ?? '—'} min`}
                                                </p>
                                              </div>
                                              {asCfg && (
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${asCfg.className}`}>
                                                  {asCfg.label}
                                                </span>
                                              )}
                                              {canManage && (
                                                <button
                                                  onClick={() => setEditLesson(lec)}
                                                  className="px-2.5 py-1 rounded-lg bg-white text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1 shrink-0"
                                                >
                                                  <Pencil className="h-3 w-3" /> Edit
                                                </button>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {isModOpen && canManage && (
                                      <div className="px-8 py-3 bg-slate-50/20">
                                        <button
                                          onClick={() => setAddLessonModuleId(mod.module_id)}
                                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                        >
                                          <Plus className="h-3.5 w-3.5" /> Add Lesson
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

          </main>
        </div>
      </div>

      {showAddCourse && (
        <CourseModal
          onCreated={handleCourseCreated}
          onUpdated={handleCourseUpdated}
          onDeleted={handleCourseDeleted}
          onClose={() => setShowAddCourse(false)}
        />
      )}
      {editingCourse && (
        <CourseModal
          course={editingCourse}
          onCreated={handleCourseCreated}
          onUpdated={handleCourseUpdated}
          onDeleted={handleCourseDeleted}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {addModuleCourseId !== null && (
        <ModuleModal
          courseId={addModuleCourseId}
          onSaved={refreshCourseModules}
          onClose={() => setAddModuleCourseId(null)}
        />
      )}
      {editModule && (
        <ModuleModal
          courseId={editModule.course_id}
          module={editModule}
          onSaved={refreshCourseModules}
          onClose={() => setEditModule(null)}
        />
      )}

      {addLessonModuleId !== null && (
        <LessonModal
          moduleId={addLessonModuleId}
          onSaved={refreshModuleLectures}
          onClose={() => setAddLessonModuleId(null)}
        />
      )}
      {editLesson && (
        <LessonModal
          moduleId={editLesson.moduleId}
          lesson={editLesson}
          onSaved={refreshModuleLectures}
          onClose={() => setEditLesson(null)}
        />
      )}
    </div>
  );
};

export default TrainerCourses;
