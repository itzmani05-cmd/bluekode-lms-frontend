import React, { useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Lock,
  BookOpen,
  Clock,
  Send,
  FileText,
  AlertCircle,
  CheckCircle,
  Award,
  Download,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import type { CourseModule } from '../../lib/api/modules';
import type { Lesson } from '../../lib/api/lectures';
import type { LectureProgress } from '../../lib/api/progress';
import type { LectureSubmission } from '../../lib/api/submissions';

type ViewType = 'dashboard' | 'courses' | 'assignments' | 'learning';

interface DbModule extends CourseModule {
  lessons: Lesson[];
  isOpen: boolean;
}

export const Learning: React.FC<{ onViewChange?: (view: ViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Learning');

  const {
    selectedCourseId,
    selectedEnrollmentId,
    enrollments,
    fetchModulesForCourse,
    fetchLecturesForModule,
    fetchProgressForEnrollment,
    markLectureViewed,
    fetchSubmissionsForEnrollment,
    submitAssignment,
  } = useStudentStore();

  const [modules, setModules]             = useState<DbModule[]>([]);
  const [loadingCurriculum, setLoading]   = useState(false);
  const [curriculumError, setCurrError]   = useState<string | null>(null);
  const [selectedLesson, setSelected]     = useState<Lesson | null>(null);
  const [progress, setProgress]           = useState<LectureProgress[]>([]);
  const [marking, setMarking]             = useState(false);
  const [submissions, setSubmissions]     = useState<LectureSubmission[]>([]);

  // Submission form state
  const [submissionText, setSubmissionText] = useState('');
  const [showForm, setShowForm]             = useState(false);
  const [submitting, setSubmitting]         = useState(false);

  const enrollment = enrollments.find((e) => e.courseId === selectedCourseId);
  const courseName = enrollment?.courseName ?? 'Course';

  // Flat, ordered list of published lessons across modules — drives sequential unlocking
  const orderedLessons = modules
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((m) =>
      m.lessons
        .filter((l) => l.status === 'PUBLISHED')
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );

  const viewedIds = new Set(
    progress.filter((p) => p.status === 'COMPLETED').map((p) => p.lectureId),
  );

  const isLocked = (lesson: Lesson) => {
    if (lesson.status === 'DRAFT') return true;
    const index = orderedLessons.findIndex((l) => l.id === lesson.id);
    if (index <= 0) return false;
    return !viewedIds.has(orderedLessons[index - 1].id);
  };

  useEffect(() => {
    if (!selectedCourseId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setCurrError(null);
      setSelected(null);
      setProgress([]);
      setSubmissions([]);
      setSubmissionText('');

      try {
        const mods = await fetchModulesForCourse(selectedCourseId);
        const dbModules: DbModule[] = [];

        for (const mod of mods) {
          const lectures = await fetchLecturesForModule(mod.id);
          dbModules.push({ ...mod, lessons: lectures, isOpen: dbModules.length === 0 });
        }

        const [lessonProgress, lessonSubmissions] = selectedEnrollmentId
          ? await Promise.all([
              fetchProgressForEnrollment(selectedEnrollmentId),
              fetchSubmissionsForEnrollment(selectedEnrollmentId),
            ])
          : [[], []];

        if (!cancelled) {
          setModules(dbModules);
          setProgress(lessonProgress);
          setSubmissions(lessonSubmissions);

          const viewed = new Set(
            lessonProgress.filter((p) => p.status === 'COMPLETED').map((p) => p.lectureId),
          );
          const ordered = dbModules
            .slice()
            .sort((a, b) => a.order - b.order)
            .flatMap((m) =>
              m.lessons
                .filter((l) => l.status === 'PUBLISHED')
                .slice()
                .sort((a, b) => a.displayOrder - b.displayOrder),
            );
          // Resume at the first not-yet-viewed lesson, falling back to the very first lesson
          const resumeLesson = ordered.find((l) => !viewed.has(l.id)) ?? ordered[0];
          if (resumeLesson) setSelected(resumeLesson);
        }
      } catch {
        if (!cancelled) setCurrError('Failed to load course curriculum.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedCourseId, selectedEnrollmentId]);

  const toggleModule = (id: number) =>
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, isOpen: !m.isOpen } : m)));

  const totalLessons     = modules.reduce((s, m) => s + m.lessons.length, 0);
  const overallProgress  = totalLessons > 0
    ? Math.round((enrollment?.completionPercentage ?? 0))
    : 0;
  const courseCompleted  = overallProgress === 100;

  const selectedIndex = selectedLesson
    ? orderedLessons.findIndex((l) => l.id === selectedLesson.id)
    : -1;
  const nextLesson = selectedIndex >= 0 ? orderedLessons[selectedIndex + 1] ?? null : null;
  const selectedViewed = selectedLesson ? viewedIds.has(selectedLesson.id) : false;
  const currentSubmission = selectedLesson
    ? submissions.find((s) => s.lectureId === selectedLesson.id) ?? null
    : null;

  // Reset the submission form when switching lessons (render-time reset, not an effect —
  // see https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  const [formResetForLessonId, setFormResetForLessonId] = useState<number | null>(null);
  if (selectedLesson && formResetForLessonId !== selectedLesson.id) {
    setFormResetForLessonId(selectedLesson.id);
    setShowForm(false);
    setSubmissionText('');
  }

  const handleMarkViewed = async () => {
    if (!selectedLesson || !selectedEnrollmentId || marking) return;
    setMarking(true);
    try {
      await markLectureViewed(selectedEnrollmentId, selectedLesson.id);
      const updated = await fetchProgressForEnrollment(selectedEnrollmentId);
      setProgress(updated);
    } catch {
      setCurrError('Failed to mark lesson as viewed. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedLesson || !selectedEnrollmentId || submitting) return;
    if (!submissionText.trim()) return;
    setSubmitting(true);
    try {
      await submitAssignment(selectedEnrollmentId, selectedLesson.id, {
        remarks: submissionText.trim() || undefined,
      });
      const updated = await fetchSubmissionsForEnrollment(selectedEnrollmentId);
      setSubmissions(updated);
      setShowForm(false);
      setSubmissionText('');
    } catch {
      setCurrError('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // No course selected
  if (!selectedCourseId) {
    return (
      <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
        <Header activeTab="courses" onViewChange={onViewChange as (view: 'dashboard' | 'courses' | 'assignments') => void} />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar activeTab="courses" onViewChange={onViewChange as (view: 'dashboard' | 'courses' | 'assignments') => void} />
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">No course selected.</p>
              <button
                onClick={() => onViewChange?.('courses')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Go to My Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="courses" onViewChange={onViewChange as (view: 'dashboard' | 'courses' | 'assignments') => void} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="courses" onViewChange={onViewChange as (view: 'dashboard' | 'courses' | 'assignments') => void} />

        <div className="flex-1 flex overflow-hidden min-w-0">

          {/* ── Main content ── */}
          <main className="flex-1 overflow-y-auto">

            {/* Breadcrumb */}
            <div className="px-8 pt-6 pb-2">
              <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span
                  onClick={() => onViewChange?.('courses')}
                  className="hover:text-slate-600 cursor-pointer"
                >
                  My Courses
                </span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600 truncate max-w-[200px]">{courseName}</span>
              </nav>
            </div>

            <div className="px-8 pb-8 space-y-6">

              {/* Loading */}
              {loadingCurriculum && (
                <div className="flex items-center justify-center py-24 text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm font-semibold">Loading curriculum...</span>
                </div>
              )}

              {/* Error */}
              {curriculumError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-semibold">{curriculumError}</p>
                </div>
              )}

              {/* Empty */}
              {!loadingCurriculum && !curriculumError && modules.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <BookOpen className="h-10 w-10 text-slate-200 mb-3" />
                  <p className="text-sm font-bold text-slate-400">No content available yet.</p>
                </div>
              )}

              {/* Lesson content */}
              {!loadingCurriculum && selectedLesson && (
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm shadow-slate-900/5">

                  {/* Header banner */}
                  <div className="bg-gradient-to-br from-[#001D6E] via-blue-800 to-blue-700 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-[10px] font-extrabold text-white/90 uppercase tracking-wider">
                          {selectedLesson.contentType === 'ASSIGNMENT' ? 'Assignment' : selectedLesson.contentType === 'TASK' ? 'Task' : 'Lecture'}
                        </span>
                        {selectedLesson.dueDate && (
                          <span className="px-2.5 py-1 bg-red-500/80 border border-red-400/30 rounded-lg text-[10px] font-extrabold text-white uppercase tracking-wider">
                            Due: {new Date(selectedLesson.dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                        {selectedLesson.maxMarks && (
                          <span className="px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-[10px] font-extrabold text-white/90 uppercase tracking-wider">
                            {selectedLesson.maxMarks} Marks
                          </span>
                        )}
                      </div>
                      <h1 className="text-2xl font-extrabold text-white leading-snug">
                        {selectedLesson.title}
                      </h1>
                      <div className="flex items-center gap-5 mt-3 text-white/70 text-xs font-semibold flex-wrap">
                        {selectedLesson.estimatedDurationMinutes && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{selectedLesson.estimatedDurationMinutes} min</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>{courseName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="p-6 space-y-6">

                    {/* Description */}
                    {selectedLesson.description && (
                      <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed">
                        <p className="text-sm">{selectedLesson.description}</p>
                      </div>
                    )}

                    {/* Lesson content */}
                    {selectedLesson.content && (
                      <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                        <p className="text-sm">{selectedLesson.content}</p>
                      </div>
                    )}

                    {/* PDF link (not applicable to assignments) */}
                    {selectedLesson.pdfUrl && selectedLesson.contentType !== 'ASSIGNMENT' && (
                      <a
                        href={selectedLesson.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
                      >
                        <FileText className="h-4 w-4" />
                        Open PDF
                        <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
                      </a>
                    )}

                    {/* Assignment submission form */}
                    {selectedLesson.contentType === 'ASSIGNMENT' && (
                      <>
                        {(!currentSubmission || showForm) ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-slate-100" />
                              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                                {currentSubmission ? `Resubmission (Attempt #${currentSubmission.attemptNo + 1})` : 'Your Submission'}
                              </span>
                              <div className="h-px flex-1 bg-slate-100" />
                            </div>

                            <textarea
                              value={submissionText}
                              onChange={(e) => setSubmissionText(e.target.value)}
                              placeholder="Write your assignment response here..."
                              rows={8}
                              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all leading-relaxed"
                            />

                            <div className="flex items-center justify-end pt-2">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-semibold text-slate-400">
                                  {submissionText.length} / 5000 chars
                                </span>
                                <button
                                  onClick={handleSubmit}
                                  disabled={submitting || !submissionText.trim()}
                                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20 disabled:shadow-none"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  {submitting ? 'Submitting...' : 'Submit Assignment'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : currentSubmission.status === 'RESUBMISSION_REQUIRED' ? (
                          <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-2 bg-red-100 rounded-xl shrink-0">
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-red-800">
                                Resubmission Required (Attempt #{currentSubmission.attemptNo})
                              </h4>
                              {(currentSubmission.trainerFeedback || currentSubmission.remarks) && (
                                <p className="text-xs text-red-600 mt-1 font-medium">
                                  {currentSubmission.trainerFeedback ?? currentSubmission.remarks}
                                </p>
                              )}
                              <button
                                onClick={() => setShowForm(true)}
                                className="mt-3 text-xs font-bold text-red-700 hover:text-red-900 underline underline-offset-2"
                              >
                                Resubmit
                              </button>
                            </div>
                          </div>
                        ) : currentSubmission.status === 'REVIEWED' ? (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-2 bg-emerald-100 rounded-xl shrink-0">
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-emerald-800">
                                Reviewed{currentSubmission.marksObtained !== null && selectedLesson.maxMarks
                                  ? ` — ${currentSubmission.marksObtained}/${selectedLesson.maxMarks}`
                                  : ''}
                              </h4>
                              {currentSubmission.trainerFeedback && (
                                <p className="text-xs text-emerald-600 mt-1 font-medium">
                                  {currentSubmission.trainerFeedback}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-2 bg-blue-100 rounded-xl shrink-0">
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-sm text-blue-800">
                                Assignment Submitted! (Attempt #{currentSubmission.attemptNo})
                              </h4>
                              <p className="text-xs text-blue-600 mt-1 font-medium">
                                Your submission is under review. You'll receive feedback shortly.
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Mark as viewed / continue */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      {selectedViewed ? (
                        <>
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-xs font-bold">Viewed</span>
                          </div>
                          {nextLesson && (
                            <button
                              onClick={() => setSelected(nextLesson)}
                              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
                            >
                              Next Lesson
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={handleMarkViewed}
                          disabled={marking}
                          className="ml-auto flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-blue-500/20"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          {marking ? 'Saving...' : 'Mark as Viewed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ── Right: Course Curriculum ── */}
          <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-white border-l border-slate-200 overflow-y-auto">
            <div className="p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h2 className="font-extrabold text-sm text-[#001D6E] truncate">{courseName}</h2>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>{overallProgress}% Completed</span>
                  <span>{viewedIds.size}/{totalLessons} Lessons</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {loadingCurriculum && (
              <div className="flex items-center justify-center py-8 text-slate-400">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span className="text-xs font-semibold">Loading...</span>
              </div>
            )}

            {/* Modules list */}
            <div className="flex-1 divide-y divide-slate-100">
              {modules.map((mod) => {
                const publishedInModule = mod.lessons
                  .filter((l) => l.status === 'PUBLISHED')
                  .sort((a, b) => a.displayOrder - b.displayOrder);
                const moduleLocked = publishedInModule.length > 0 && isLocked(publishedInModule[0]);

                return (
                  <div key={mod.id}>
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-start justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-extrabold leading-snug ${mod.isOpen ? 'text-[#001D6E]' : 'text-slate-700'}`}>
                            {mod.name}
                          </p>
                          {moduleLocked && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
                              <Lock className="h-2.5 w-2.5" />
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          {mod.lessons.length} Lesson{mod.lessons.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {mod.isOpen
                        ? <ChevronUp className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        : <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                      }
                    </button>

                    {mod.isOpen && (
                      <div className="pb-2">
                        {mod.lessons.map((lesson) => {
                          const isActive = selectedLesson?.id === lesson.id;
                          const locked   = isLocked(lesson);
                          const viewed   = viewedIds.has(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => { if (!locked) setSelected(lesson); }}
                              disabled={locked}
                              className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                                isActive
                                  ? 'bg-blue-50 border-l-2 border-blue-600'
                                  : locked
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="shrink-0 flex items-center justify-center w-4">
                                {locked
                                  ? <Lock className="h-3 w-3 text-slate-400" />
                                  : viewed
                                  ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                  : lesson.contentType === 'ASSIGNMENT'
                                  ? <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                  : <div className="h-2 w-2 rounded-full bg-blue-600" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold leading-tight truncate ${
                                  isActive ? 'text-blue-700 font-bold' : 'text-slate-700'
                                }`}>
                                  {lesson.title}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                  {lesson.contentType === 'ASSIGNMENT' ? 'Assignment' : lesson.contentType === 'TASK' ? 'Task' : 'Lecture'}
                                  {lesson.estimatedDurationMinutes
                                    ? ` • ${lesson.estimatedDurationMinutes} min`
                                    : ''}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Certificate */}
            <div className={`mx-3 mb-4 mt-2 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${
              courseCompleted
                ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50'
                : 'border-dashed border-slate-200 bg-slate-50/60 opacity-70'
            }`}>
              <div className={`px-4 py-3 flex items-center gap-2.5 ${courseCompleted ? 'bg-emerald-500/10' : 'bg-transparent'}`}>
                <div className={`p-1.5 rounded-lg ${courseCompleted ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                  {courseCompleted
                    ? <Award className="h-4 w-4 text-emerald-600" />
                    : <Lock className="h-3.5 w-3.5 text-slate-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-extrabold ${courseCompleted ? 'text-emerald-800' : 'text-slate-400'}`}>
                    Course Certificate
                  </p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${courseCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {courseCompleted ? 'Ready to download!' : 'Complete all modules to unlock'}
                  </p>
                </div>
              </div>
              {courseCompleted ? (
                <div className="px-4 pb-4">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-emerald-500/25 mt-2">
                    <Download className="h-3.5 w-3.5" />
                    Download Certificate
                  </button>
                </div>
              ) : (
                <div className="px-4 pb-4 pt-1">
                  <div className="w-full flex items-center justify-center gap-2 py-2 bg-slate-200/60 text-slate-400 text-xs font-bold rounded-xl">
                    <Lock className="h-3 w-3" />
                    Locked
                  </div>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default Learning;
