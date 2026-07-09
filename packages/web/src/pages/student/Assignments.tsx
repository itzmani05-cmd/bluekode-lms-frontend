import React from 'react';
import {
  ChevronRight,
  Filter
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';
import AssignmentCard from '../../components/student/AssignmentCard';
import type { Assignment } from '../../components/student/AssignmentCard';



export const Assignments: React.FC<{ onViewChange?: (view: 'dashboard' | 'courses' | 'assignments') => void }> = ({ onViewChange }) => {
  const { assignmentSearchQuery: searchQuery, assignmentStatusFilter: statusFilter, setAssignmentSearchQuery: setSearchQuery, setAssignmentStatusFilter: setStatusFilter } = useStudentStore();

  const assignmentsList: Assignment[] = [
    {
      id: '1',
      attempt: 1,
      title: 'Q3 Enterprise Strategy Paper',
      dueDateLabel: 'Due: Oct 28, 2023 (Overdue)',
      dueStatus: 'overdue',
      status: 'resubmission-required',
      statusText: 'RESUBMISSION REQUIRED',
      resubmissionReason: 'Analysis of market competitors lacks specific data points from the Q2 report. Please revise section 3.2.',
    },
    {
      id: '2',
      attempt: 1,
      title: 'Financial Modeling Capstone',
      dueDateLabel: 'Due: Nov 15, 2023',
      dueStatus: 'upcoming',
      status: 'not-submitted',
      statusText: 'NOT SUBMITTED',
    },
    {
      id: '3',
      attempt: 1,
      title: 'API Documentation Draft',
      dueDateLabel: 'Submitted: Nov 02, 2023',
      dueStatus: 'submitted',
      status: 'under-review',
      statusText: 'UNDER REVIEW',
    },
    {
      id: '4',
      attempt: 1,
      title: 'Team Dynamics Analysis',
      dueDateLabel: 'Reviewed: Oct 20, 2023',
      dueStatus: 'submitted',
      status: 'reviewed',
      statusText: 'REVIEWED',
      score: '94 / 100',
      trainerFeedback: {
        text: 'Excellent application of the Belbin Team Roles theory to your case study. Your analysis of the conflict resolution phase was particularly insightful.',
        remarks: 'Keep up the high standard of academic writing.'
      },
    }
  ];

  const filteredAssignments = assignmentsList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="assignments" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="assignments" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span onClick={() => onViewChange?.('dashboard')} className="hover:text-slate-600 cursor-pointer">Home</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600">Assignments</span>
              </nav>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Assignments</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">Review, submit, and track feedback for all your active coursework.</p>
            </div>
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
          <div className="space-y-4 pt-2">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
              />
            ))}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default Assignments;
