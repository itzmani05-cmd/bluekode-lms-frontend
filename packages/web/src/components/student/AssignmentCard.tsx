import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';

export type Assignment = {
  id: string;
  attempt: number;
  title: string;
  dueDateLabel: string;
  dueStatus?: 'overdue' | 'upcoming' | 'submitted';
  status: 'resubmission-required' | 'not-submitted' | 'under-review' | 'reviewed';
  statusText: string;
  resubmissionReason?: string;
  trainerFeedback?: {
    text: string;
    remarks: string;
  };
  score?: string;
};

interface AssignmentCardProps {
  assignment: Assignment;
}

const statusBadgeClass: Record<Assignment['status'], string> = {
  'resubmission-required': 'bg-red-50 text-red-600 border-red-100',
  'not-submitted':         'bg-slate-50 text-slate-500 border-slate-200',
  'under-review':          'bg-amber-50 text-amber-600 border-amber-100',
  'reviewed':              'bg-blue-50 text-blue-700 border-blue-100',
};



const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  return (
    <div
      className={`bg-white border ${
        assignment.status === 'resubmission-required'
          ? 'border-l-4 border-l-red-500 border-slate-200'
          : 'border-slate-200'
      } rounded-2xl p-6 shadow-sm shadow-slate-900/5 hover:shadow-md hover:border-blue-500/20 transition-all duration-300 flex flex-col md:flex-row justify-between gap-6`}
    >
      {/* Left: details */}
      <div className="flex-1 space-y-3.5">
        {/* Attempt badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-bold tracking-wider">
            ATTEMPT #{assignment.attempt}
          </span>
        </div>

        <h3 className="font-extrabold text-lg text-slate-950 leading-snug">
          {assignment.title}
        </h3>

        {/* Due date */}
        <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className={assignment.dueStatus === 'overdue' ? 'text-red-500 font-bold' : ''}>
              {assignment.dueDateLabel}
            </span>
          </div>
        </div>

        {/* Resubmission reason */}
        {assignment.status === 'resubmission-required' && assignment.resubmissionReason && (
          <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 flex items-start gap-2.5 text-xs text-red-800 max-w-2xl">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <span className="font-extrabold block">Resubmission Reason:</span>
              <p className="mt-0.5 font-medium leading-relaxed opacity-95">
                {assignment.resubmissionReason}
              </p>
            </div>
          </div>
        )}

        {/* Trainer feedback */}
        {assignment.status === 'reviewed' && assignment.trainerFeedback && (
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2 text-xs text-slate-700 max-w-2xl">
            <div>
              <span className="font-bold text-slate-800">Trainer Feedback:</span>
              <p className="mt-1 font-medium leading-relaxed italic text-slate-600">
                &ldquo;{assignment.trainerFeedback.text}&rdquo;
              </p>
            </div>
            <div className="mt-1 pt-1.5 border-t border-slate-200/50">
              <span className="font-bold text-slate-800">Remarks:</span>
              <p className="mt-0.5 font-medium leading-relaxed text-slate-600">
                {assignment.trainerFeedback.remarks}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Right: status badge only */}
      <div className="flex flex-col md:items-end justify-start min-w-[160px] shrink-0">
        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider border self-start md:self-end ${statusBadgeClass[assignment.status]}`}>
          {assignment.statusText}
        </span>
      </div>
    </div>
  );
};

export default AssignmentCard;
