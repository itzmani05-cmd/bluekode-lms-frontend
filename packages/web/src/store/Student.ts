import { create } from 'zustand';

interface CoursesState {
  courseSearchQuery: string;
  courseActiveTab: 'all' | 'in-progress' | 'completed';
  setCourseSearchQuery: (query: string) => void;
  setCourseActiveTab: (tab: 'all' | 'in-progress' | 'completed') => void;
}

interface AssignmentsState {
  assignmentSearchQuery: string;
  assignmentStatusFilter: string;
  setAssignmentSearchQuery: (query: string) => void;
  setAssignmentStatusFilter: (filter: string) => void;
}

type StudentState = CoursesState & AssignmentsState;

export const useStudentStore = create<StudentState>((set) => ({
  
  courseSearchQuery: '',
  courseActiveTab: 'all',
  setCourseSearchQuery: (query) => set({ courseSearchQuery: query }),
  setCourseActiveTab: (tab) => set({ courseActiveTab: tab }),

  assignmentSearchQuery: '',
  assignmentStatusFilter: 'all',
  setAssignmentSearchQuery: (query) => set({ assignmentSearchQuery: query }),
  setAssignmentStatusFilter: (filter) => set({ assignmentStatusFilter: filter }),


}));
