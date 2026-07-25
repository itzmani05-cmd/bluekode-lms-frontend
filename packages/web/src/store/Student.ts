import { create } from 'zustand';
import { fetchMyStudentProfile } from '../lib/api/studentProfile';
import { fetchStudentEnrollments } from '../lib/api/enrollments';
import type { StudentEnrollment } from '../lib/api/enrollments';
import { fetchModulesApi } from '../lib/api/modules';
import { fetchLecturesApi } from '../lib/api/lectures';
import { fetchEnrollmentProgress, markLectureCompleteApi } from '../lib/api/progress';
import { fetchEnrollmentSubmissions, createSubmissionApi } from '../lib/api/submissions';
import type { CourseModule } from '../lib/api/modules';
import type { Lesson } from '../lib/api/lectures';
import type { LectureProgress } from '../lib/api/progress';
import type { LectureSubmission, CreateSubmissionPayload } from '../lib/api/submissions';

export type { StudentEnrollment };

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

interface EnrollmentState {
  studentProfileId:     number | null;
  enrollments:          StudentEnrollment[];
  enrollmentsLoading:   boolean;
  enrollmentsError:     string | null;
  selectedCourseId:     number | null;
  selectedEnrollmentId: number | null;
  modulesCache:         Record<number, CourseModule[]>;
  lecturesCache:        Record<number, Lesson[]>;
  progressCache:        Record<number, LectureProgress[]>;
  submissionsCache:     Record<number, LectureSubmission[]>;

  fetchEnrollments:        (userId: number) => Promise<void>;
  setSelectedCourse:       (courseId: number, enrollmentId: number) => void;
  fetchModulesForCourse:   (courseId: number) => Promise<CourseModule[]>;
  fetchLecturesForModule:  (moduleId: number) => Promise<Lesson[]>;
  fetchProgressForEnrollment: (enrollmentId: number) => Promise<LectureProgress[]>;
  markLectureViewed:       (enrollmentId: number, lectureId: number) => Promise<void>;
  fetchSubmissionsForEnrollment: (enrollmentId: number) => Promise<LectureSubmission[]>;
  submitAssignment:        (enrollmentId: number, lectureId: number, payload: CreateSubmissionPayload) => Promise<void>;
  resetStudentStore:       () => void;
}

type StudentState = CoursesState & AssignmentsState & EnrollmentState;

const initialEnrollmentState = {
  studentProfileId:     null,
  enrollments:          [],
  enrollmentsLoading:   false,
  enrollmentsError:     null,
  selectedCourseId:     null,
  selectedEnrollmentId: null,
  modulesCache:         {},
  lecturesCache:        {},
  progressCache:        {},
  submissionsCache:     {},
};

export const useStudentStore = create<StudentState>((set, get) => ({
  courseSearchQuery: '',
  courseActiveTab: 'all',
  setCourseSearchQuery: (query) => set({ courseSearchQuery: query }),
  setCourseActiveTab:  (tab)   => set({ courseActiveTab: tab }),

  assignmentSearchQuery: '',
  assignmentStatusFilter: 'all',
  setAssignmentSearchQuery:  (query)  => set({ assignmentSearchQuery: query }),
  setAssignmentStatusFilter: (filter) => set({ assignmentStatusFilter: filter }),

  ...initialEnrollmentState,

  fetchEnrollments: async (userId) => {
    if (get().enrollmentsLoading) return;
    set({ enrollmentsLoading: true, enrollmentsError: null });
    try {
      const profile     = await fetchMyStudentProfile(userId);
      const enrollments = await fetchStudentEnrollments(profile.student_profile_id);
      set({ studentProfileId: profile.student_profile_id, enrollments, enrollmentsLoading: false });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const msg =
        status === 404
          ? 'Your student profile has not been set up yet. Please contact your administrator.'
          : 'Failed to load your enrollments. Please try again later.';
      set({ enrollmentsError: msg, enrollmentsLoading: false });
    }
  },

  setSelectedCourse: (courseId, enrollmentId) =>
    set({ selectedCourseId: courseId, selectedEnrollmentId: enrollmentId }),

  fetchModulesForCourse: async (courseId) => {
    const cached = get().modulesCache[courseId];
    if (cached) return cached;
    const modules = await fetchModulesApi(courseId);
    set((s) => ({ modulesCache: { ...s.modulesCache, [courseId]: modules } }));
    return modules;
  },

  fetchLecturesForModule: async (moduleId) => {
    const cached = get().lecturesCache[moduleId];
    if (cached) return cached;
    const lectures = await fetchLecturesApi(moduleId);
    set((s) => ({ lecturesCache: { ...s.lecturesCache, [moduleId]: lectures } }));
    return lectures;
  },

  fetchProgressForEnrollment: async (enrollmentId) => {
    const cached = get().progressCache[enrollmentId];
    if (cached) return cached;
    const progress = await fetchEnrollmentProgress(enrollmentId);
    set((s) => ({ progressCache: { ...s.progressCache, [enrollmentId]: progress } }));
    return progress;
  },

  markLectureViewed: async (enrollmentId, lectureId) => {
    const result = await markLectureCompleteApi(enrollmentId, lectureId);
    set((s) => {
      const existing = s.progressCache[enrollmentId] ?? [];
      const withoutLecture = existing.filter((p) => p.lectureId !== lectureId);
      return {
        progressCache: {
          ...s.progressCache,
          [enrollmentId]: [...withoutLecture, result.progress],
        },
        enrollments: s.enrollments.map((e) =>
          e.enrollmentId === enrollmentId ? result.enrollment : e,
        ),
      };
    });
  },

  fetchSubmissionsForEnrollment: async (enrollmentId) => {
    const cached = get().submissionsCache[enrollmentId];
    if (cached) return cached;
    const submissions = await fetchEnrollmentSubmissions(enrollmentId);
    set((s) => ({ submissionsCache: { ...s.submissionsCache, [enrollmentId]: submissions } }));
    return submissions;
  },

  submitAssignment: async (enrollmentId, lectureId, payload) => {
    const submission = await createSubmissionApi(enrollmentId, lectureId, payload);
    set((s) => {
      const existing = s.submissionsCache[enrollmentId] ?? [];
      const withoutLecture = existing.filter((sub) => sub.lectureId !== lectureId);
      return {
        submissionsCache: {
          ...s.submissionsCache,
          [enrollmentId]: [...withoutLecture, submission],
        },
      };
    });
  },

  resetStudentStore: () => set({ ...initialEnrollmentState }),
}));
