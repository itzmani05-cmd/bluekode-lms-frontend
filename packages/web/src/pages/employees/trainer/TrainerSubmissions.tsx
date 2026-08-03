import React, { useEffect, useState } from 'react';
import {
  ClipboardList, Clock, CheckCircle2, RefreshCcw,
  Search, ChevronRight, X, Star, RefreshCw, AlertTriangle,
} from 'lucide-react';
import TrainerHeader from '../../../components/layout/TrainerHeader';
import TrainerSidebar from '../../../components/layout/TrainerSidebar';
import type { TrainerViewType } from '../../../components/layout/TrainerSidebar';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { useAppStore } from '../../../store/login';
import { fetchMyEmployeeProfile } from '../../../lib/api/employees';
import { fetchTrainerStudentSubmissionsApi, type TrainerStudentSubmission, type TrainerSubmissionStatus } from '../../../lib/api/trainerAssignments';
import { reviewSubmissionApi } from '../../../lib/api/submissions';

const statusCfg: Record<TrainerSubmissionStatus, { label: string; className: string; Icon: React.ElementType }> = {
  SUBMITTED:             { label: 'Submitted',    className: 'bg-blue-50 text-blue-600 border-blue-100',          Icon: ClipboardList },
  UNDER_REVIEW:          { label: 'Under Review', className: 'bg-amber-50 text-amber-600 border-amber-100',       Icon: Clock         },
  REVIEWED:              { label: 'Reviewed',     className: 'bg-emerald-50 text-emerald-600 border-emerald-100', Icon: CheckCircle2  },
  RESUBMISSION_REQUIRED: { label: 'Resubmission', className: 'bg-red-50 text-red-600 border-red-100',             Icon: RefreshCcw    },
};

const filterTabs: { key: 'ALL' | TrainerSubmissionStatus; label: string }[] = [
  { key: 'ALL',                   label: 'All'          },
  { key: 'SUBMITTED',             label: 'Submitted'    },
  { key: 'UNDER_REVIEW',          label: 'Under Review' },
  { key: 'REVIEWED',              label: 'Reviewed'     },
  { key: 'RESUBMISSION_REQUIRED', label: 'Resubmission' },
];

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface ReviewPanelProps {
  submission: TrainerStudentSubmission;
  onClose:    () => void;
  onSaved:    (updated: TrainerStudentSubmission) => void;
}

const ReviewPanel: React.FC<ReviewPanelProps> = ({ submission, onClose, onSaved }) => {
  const [marks,    setMarks]    = useState<string>(submission.marks_obtained?.toString() ?? '');
  const [feedback, setFeedback] = useState<string>(submission.trainer_feedback ?? '');
  const [status,   setStatus]   = useState<'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED'>(
    submission.submission_status === 'SUBMITTED' ? 'UNDER_REVIEW' : submission.submission_status as 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED',
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await reviewSubmissionApi(submission.submission_id, {
        submission_status: status,
        marks_obtained:    marks !== '' ? Number(marks) : undefined,
        trainer_feedback:  feedback.trim() || undefined,
      });
      onSaved({
        ...submission,
        submission_status: status,
        marks_obtained:    marks !== '' ? Number(marks) : null,
        trainer_feedback:  feedback.trim() || null,
      });
      onClose();
    } catch {
      setError('Failed to save review. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200">
        <div className="flex justify-between items-start p-6 border-b border-slate-100">
          <div>
            <h2 className="font-extrabold text-[#001D6E] text-base">{submission.assignment_title}</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {submission.student_name} · {submission.course_name}
            </p>
            {submission.attempt_no > 1 && (
              <span className="text-[9px] font-bold text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-2 py-0.5 mt-1 inline-block">
                Attempt #{submission.attempt_no}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{error}
            </div>
          )}

          {submission.remarks && (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 font-semibold">
              <p className="font-extrabold mb-0.5 text-slate-500 uppercase tracking-wider text-[10px]">Student Remarks</p>
              <p>{submission.remarks}</p>
            </div>
          )}

          {submission.submission_url && (
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Submission Link</p>
              <a
                href={submission.submission_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 underline-offset-2 hover:underline"
              >
                <ChevronRight className="h-3 w-3" /> View Submission
              </a>
            </div>
          )}

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
              Marks{submission.max_marks !== null && (
                <span className="normal-case font-semibold"> / {submission.max_marks}</span>
              )}
            </label>
            <input
              type="number"
              min={0}
              max={submission.max_marks ?? undefined}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder={submission.max_marks !== null ? `0 – ${submission.max_marks}` : 'Enter marks'}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Feedback</label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Write feedback for the student..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 resize-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Update Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED')}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all bg-white"
            >
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="REVIEWED">Reviewed</option>
              <option value="RESUBMISSION_REQUIRED">Resubmission Required</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Star className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TrainerSubmissions: React.FC<{ onViewChange?: (view: TrainerViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Submissions');
  const { currentUser } = useAppStore();

  const [submissions,   setSubmissions]   = useState<TrainerStudentSubmission[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [fetchError,    setFetchError]    = useState<string | null>(null);
  const [activeFilter,  setActiveFilter]  = useState<'ALL' | TrainerSubmissionStatus>('ALL');
  const [search,        setSearch]        = useState('');
  const [selected,      setSelected]      = useState<TrainerStudentSubmission | null>(null);

  useEffect(() => {
    if (!currentUser?.user_id) return;
    setLoading(true);
    setFetchError(null);

    fetchMyEmployeeProfile(currentUser.user_id)
      .then((profile) => fetchTrainerStudentSubmissionsApi(profile.id))
      .then(setSubmissions)
      .catch(() => setFetchError('Could not load submissions. Please try again.'))
      .finally(() => setLoading(false));
  }, [currentUser?.user_id]);

  const filtered = submissions.filter((s) => {
    const matchesFilter = activeFilter === 'ALL' || s.submission_status === activeFilter;
    const matchesSearch = search === '' ||
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.assignment_title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSaved = (updated: TrainerStudentSubmission) => {
    setSubmissions((prev) =>
      prev.map((s) => s.submission_id === updated.submission_id ? updated : s),
    );
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <TrainerHeader activeTab="trainer-submissions" onViewChange={onViewChange} />

      <div className="flex-1 flex overflow-hidden">
        <TrainerSidebar activeTab="trainer-submissions" onViewChange={onViewChange} />

        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001D6E] tracking-tight">Submissions</h1>
              <p className="text-sm text-slate-500 mt-1">Review, grade, and give feedback on student assignments.</p>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-semibold">Loading submissions...</span>
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
                {/* Search + Filter tabs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search student or assignment..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-sm transition-all"
                    />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {filterTabs.map((tab) => {
                      const count = tab.key === 'ALL'
                        ? submissions.length
                        : submissions.filter((s) => s.submission_status === tab.key).length;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => setActiveFilter(tab.key)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5
                            ${activeFilter === tab.key
                              ? 'bg-[#001D6E] text-white border-[#001D6E]'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          {tab.label}
                          <span className={`text-[9px] font-extrabold rounded-full px-1.5 py-0.5 ${activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="text-left px-5 py-3.5">Student</th>
                          <th className="text-left px-4 py-3.5">Assignment</th>
                          <th className="text-left px-4 py-3.5">Course</th>
                          <th className="text-center px-4 py-3.5">Attempt</th>
                          <th className="text-center px-4 py-3.5">Marks</th>
                          <th className="text-left px-4 py-3.5">Submitted</th>
                          <th className="text-left px-4 py-3.5">Status</th>
                          <th className="text-center px-4 py-3.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400 text-sm font-semibold">
                              {submissions.length === 0
                                ? 'No submissions yet from your assigned students.'
                                : 'No submissions match your filter.'}
                            </td>
                          </tr>
                        ) : filtered.map((sub) => {
                          const cfg        = statusCfg[sub.submission_status];
                          const StatusIcon = cfg.Icon;
                          return (
                            <tr key={sub.submission_id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-7 w-7 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                    {sub.student_name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-slate-900 whitespace-nowrap">{sub.student_name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <p className="font-semibold text-slate-800 truncate max-w-[160px]">{sub.assignment_title}</p>
                                <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[160px]">{sub.module_name}</p>
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-semibold text-slate-600 whitespace-nowrap">{sub.course_name}</span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                {sub.attempt_no > 1 ? (
                                  <span className="font-bold text-orange-600">#{sub.attempt_no}</span>
                                ) : (
                                  <span className="font-semibold text-slate-500">#{sub.attempt_no}</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                {sub.marks_obtained !== null ? (
                                  <span className="font-extrabold text-emerald-600">
                                    {sub.marks_obtained}{sub.max_marks !== null ? `/${sub.max_marks}` : ''}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-bold">—</span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-semibold text-slate-500 whitespace-nowrap">
                                  {formatDate(sub.submitted_at)}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${cfg.className}`}>
                                  <StatusIcon className="h-2.5 w-2.5" />{cfg.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => setSelected(sub)}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-extrabold hover:bg-emerald-100 transition-colors whitespace-nowrap"
                                >
                                  {sub.submission_status === 'REVIEWED' ? 'View' : 'Review'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </main>
        </div>
      </div>

      {selected && (
        <ReviewPanel
          submission={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default TrainerSubmissions;
