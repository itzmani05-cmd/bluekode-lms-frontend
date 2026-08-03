import React, { useEffect, useState } from 'react';
import { ChevronRight, Filter, RefreshCw, AlertTriangle, FileText } from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';
import { useAppStore } from '../../store/login';
import AssignmentCard from '../../components/student/AssignmentCard';
import type { Assignment } from '../../components/student/AssignmentCard';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import type { LectureSubmission } from '../../lib/api/submissions';

type StudentView = 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';

const formatDueLabel = (dueDate: string): string =>
  `Due: ${new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;

const getDueStatus = (dueDate: string | null): Assignment['dueStatus'] => {
  if (!dueDate) return undefined;
  const now = new Date();
  const due = new Date(dueDate);
  return due < now ? 'overdue' : 'upcoming';
};

const mapSubmissionStatus = (
  submission: LectureSubmission | undefined,
  maxMarks: number | null,
): Pick<Assignment, 'status' | 'statusText' | 'score' | 'trainerFeedback' | 'resubmissionReason'> => {
  if (!submission) return { status: 'not-submitted', statusText: 'NOT SUBMITTED' };

  switch (submission.status) {
    case 'REVIEWED':
      return {
        status: 'reviewed',
        statusText: 'REVIEWED',
        score: submission.marksObtained !== null && maxMarks ? `${submission.marksObtained}/${maxMarks}` : undefined,
        trainerFeedback: submission.trainerFeedback
          ? { text: submission.trainerFeedback, remarks: submission.remarks ?? '' }
          : undefined,
      };
    case 'RESUBMISSION_REQUIRED':
      return {
        status: 'resubmission-required',
        statusText: 'RESUBMISSION REQUIRED',
        resubmissionReason: submission.trainerFeedback ?? submission.remarks ?? undefined,
      };
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    default:
      return { status: 'under-review', statusText: 'UNDER REVIEW' };
  }
};

export const Assignments: React.FC<{ onViewChange?: (view: StudentView) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Assignments');
  const { currentUser } = useAppStore();
  const {
    assignmentSearchQuery: searchQuery,
    assignmentStatusFilter: statusFilter,
    setAssignmentSearchQuery: setSearchQuery,
    setAssignmentStatusFilter: setStatusFilter,
    enrollments,
    enrollmentsLoading,
    enrollmentsError,
    fetchEnrollments,
    fetchModulesForCourse,
    fetchLecturesForModule,
    fetchSubmissionsForEnrollment,
  } = useStudentStore();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Ensure enrollments are loaded
  useEffect(() => {
    if (currentUser?.user_id && enrollments.length === 0 && !enrollmentsLoading && !enrollmentsError) {
      fetchEnrollments(currentUser.user_id);
    }
  }, [currentUser?.user_id]);

  // Fetch assignment lectures from all enrolled courses
  useEffect(() => {
    if (enrollments.length === 0) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const collected: Assignment[] = [];

        for (const enrollment of enrollments) {
          const [mods, submissions] = await Promise.all([
            fetchModulesForCourse(enrollment.courseId),
            fetchSubmissionsForEnrollment(enrollment.enrollmentId),
          ]);
          const submissionByLecture = new Map(submissions.map((s) => [s.lectureId, s]));

          for (const mod of mods) {
            const lectures = await fetchLecturesForModule(mod.id);
            const assignmentLectures = lectures.filter(
              (l) => l.contentType === 'ASSIGNMENT' && l.status === 'PUBLISHED',
            );
            for (const lec of assignmentLectures) {
              const submission = submissionByLecture.get(lec.id);
              collected.push({
                id:           `${lec.id}`,
                attempt:      submission?.attemptNo ?? 1,
                title:        lec.title,
                dueDateLabel: lec.dueDate ? formatDueLabel(lec.dueDate) : 'No due date',
                dueStatus:    getDueStatus(lec.dueDate),
                ...mapSubmissionStatus(submission, lec.maxMarks),
              });
            }
          }
        }

        setAssignments(collected);
      } catch {
        setError('Failed to load assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [enrollments.length]);

  const filtered = assignments.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isLoading = enrollmentsLoading || loading;

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="assignments" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="assignments" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">

            {/* Search */}
            <div className="relative max-w-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
              />
            </div>

            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <span onClick={() => onViewChange?.('dashboard')} className="hover:text-slate-600 cursor-pointer">
                    Home
                  </span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-blue-600">Assignments</span>
                </nav>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001D6E] tracking-tight">Assignments</h1>
                {!isLoading && !error && (
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} across your enrolled courses.
                  </p>
                )}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-slate-400 pointer-events-none">
                    <Filter className="h-3.5 w-3.5" />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 bg-white focus:outline-none focus:border-blue-500 appearance-none shadow-sm cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="resubmission-required">Resubmission Required</option>
                    <option value="not-submitted">Not Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-500" />
                </div>
              </div>
            </div>

            {/* Error */}
            {(error || enrollmentsError) && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="font-semibold">{enrollmentsError ?? error}</p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-24 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading assignments...</span>
              </div>
            )}

            {/* Empty */}
            {!isLoading && !error && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <FileText className="h-10 w-10 text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-400">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No assignments match your filters.'
                    : 'No assignments found in your enrolled courses.'}
                </p>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="mt-3 text-xs font-bold text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Assignment cards */}
            {!isLoading && !error && filtered.length > 0 && (
              <div className="space-y-4 pt-2">
                {filtered.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
