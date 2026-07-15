import { create } from 'zustand';
import {
  fetchUsers as apiFetchUsers,
  createUserApi,
  updateUserStatusApi,
} from '../lib/api/users';
import {
  fetchCourses as apiFetchCourses,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from '../lib/api/courses';
import {
  fetchInstitutions as apiFetchInstitutions,
  createInstitutionApi,
  updateInstitutionApi,
  deleteInstitutionApi,
} from '../lib/api/institutions';
import { fetchEmployees as apiFetchEmployees } from '../lib/api/employees';
import {
  fetchModulesApi, createModuleApi, updateModuleApi, deleteModuleApi,
} from '../lib/api/modules';
import type { CourseModule } from '../lib/api/modules';
import {
  fetchLecturesApi, createLectureApi, updateLectureApi, deleteLectureApi,
} from '../lib/api/lectures';
import type { Lesson, CreateLessonPayload, UpdateLessonPayload } from '../lib/api/lectures';

//Shared types

export type ContentType  = 'LECTURE' | 'ASSIGNMENT';
export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type { CourseModule, Lesson, CreateLessonPayload, UpdateLessonPayload };

export type InstitutionStatus = 'ACTIVE' | 'INACTIVE';
export type CourseStatus      = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type AccountStatus     = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'REJECTED' | 'APPROVED';
export type UserRole          = 'student' | 'trainer' | 'technical head' | 'project head' | 'admin';

export interface Institution {
  id: number;
  name: string;
  city: string;
  address: string;
  coursesAssigned: number;
  employeesAssigned: number;
  studentsEnrolled: number;
  status: InstitutionStatus;
  createdAt: string;
}

export interface Course {
  id: number;
  name: string;
  description: string;
  status: CourseStatus;
  moduleCount: number;
  enrollments: number;
  createdAt: string;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  createdAt: string;
}

export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  designation: string;
  role: string;
  specialization: string;
  yearsOfExperience: number;
  institution: string;
  status: EmployeeStatus;
  joiningDate: string;
}

// ── Store type ────────────────────────────────────────────────────────────────

type AdminState = {
  // Loading / error
  isLoading: boolean;
  error:     string | null;

  // UI filters
  userSearchQuery:          string;
  userStatusFilter:         string;
  institutionSearchQuery:   string;
  courseSearchQuery:        string;
  courseStatusFilter:       string;
  studentSearchQuery:       string;
  studentFormStatusFilter:  string;
  studentEnrollmentFilter:  string;
  employeeSearchQuery:      string;
  employeeStatusFilter:     string;

  // Data
  institutions:    Institution[];
  courses:         Course[];
  users:           AdminUser[];
  employees:       Employee[];
  selectedCourseId: number | null;
  modules:         CourseModule[];
  lessons:         Record<number, Lesson[]>;
  modulesLoading:  boolean;

  // Filter setters
  setUserSearchQuery:         (q: string) => void;
  setUserStatusFilter:        (f: string) => void;
  setInstitutionSearchQuery:  (q: string) => void;
  setCourseSearchQuery:       (q: string) => void;
  setCourseStatusFilter:      (f: string) => void;
  setStudentSearchQuery:      (q: string) => void;
  setStudentFormStatusFilter: (f: string) => void;
  setStudentEnrollmentFilter: (f: string) => void;
  setEmployeeSearchQuery:     (q: string) => void;
  setEmployeeStatusFilter:    (f: string) => void;

  setSelectedCourseId: (id: number | null) => void;

  // Fetch actions
  fetchInstitutions: () => Promise<void>;
  fetchCourses:      () => Promise<void>;
  fetchUsers:        () => Promise<void>;
  fetchEmployees:    () => Promise<void>;
  fetchModules:      (courseId: number) => Promise<void>;
  fetchLessons:      (moduleId: number) => Promise<void>;

  // Module actions
  addModule:    (courseId: number, name: string, description?: string) => Promise<void>;
  updateModule: (id: number, name: string, description?: string) => Promise<void>;
  deleteModule: (id: number) => Promise<void>;

  // Lesson actions
  addLesson:    (moduleId: number, payload: CreateLessonPayload) => Promise<void>;
  updateLesson: (id: number, moduleId: number, payload: UpdateLessonPayload) => Promise<void>;
  deleteLesson: (id: number, moduleId: number) => Promise<void>;

  // Institution actions
  addInstitution:    (inst: Omit<Institution, 'id' | 'coursesAssigned' | 'employeesAssigned' | 'studentsEnrolled' | 'status' | 'createdAt'>) => Promise<void>;
  updateInstitution: (updated: Institution) => Promise<void>;
  deleteInstitution: (id: number) => Promise<void>;

  // Course actions
  addCourse:    (course: Omit<Course, 'id' | 'moduleCount' | 'enrollments' | 'createdAt'>) => Promise<void>;
  updateCourse: (updated: Course) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;

  // User actions
  addUser:          (email: string, role: UserRole, fullName: string, password: string) => Promise<void>;
  updateUserStatus: (id: number, status: AccountStatus) => Promise<void>;
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminState>((set, get) => ({
  isLoading: false,
  error:     null,

  // UI filters
  userSearchQuery:          '',
  userStatusFilter:         'all',
  institutionSearchQuery:   '',
  courseSearchQuery:        '',
  courseStatusFilter:       'all',
  studentSearchQuery:       '',
  studentFormStatusFilter:  'all',
  studentEnrollmentFilter:  'all',
  employeeSearchQuery:      '',
  employeeStatusFilter:     'all',

  // Data (empty — populated by fetch actions)
  institutions:     [],
  courses:          [],
  users:            [],
  employees:        [],
  selectedCourseId: null,
  modules:          [],
  lessons:          {},
  modulesLoading:   false,

  // Filter setters
  setUserSearchQuery:         (userSearchQuery)         => set({ userSearchQuery }),
  setUserStatusFilter:        (userStatusFilter)        => set({ userStatusFilter }),
  setInstitutionSearchQuery:  (institutionSearchQuery)  => set({ institutionSearchQuery }),
  setCourseSearchQuery:       (courseSearchQuery)       => set({ courseSearchQuery }),
  setCourseStatusFilter:      (courseStatusFilter)      => set({ courseStatusFilter }),
  setStudentSearchQuery:      (studentSearchQuery)      => set({ studentSearchQuery }),
  setStudentFormStatusFilter: (studentFormStatusFilter) => set({ studentFormStatusFilter }),
  setStudentEnrollmentFilter: (studentEnrollmentFilter) => set({ studentEnrollmentFilter }),
  setEmployeeSearchQuery:     (employeeSearchQuery)     => set({ employeeSearchQuery }),
  setEmployeeStatusFilter:    (employeeStatusFilter)    => set({ employeeStatusFilter }),

  // ── Fetch actions ────────────────────────────────────────────────────────────

  fetchInstitutions: async () => {
    set({ isLoading: true, error: null });
    try {
      const institutions = await apiFetchInstitutions();
      set({ institutions, isLoading: false });
    } catch {
      set({ error: 'Failed to load institutions.', isLoading: false });
    }
  },

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const courses = await apiFetchCourses();
      set({ courses, isLoading: false });
    } catch {
      set({ error: 'Failed to load courses.', isLoading: false });
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await apiFetchUsers();
      set({ users, isLoading: false });
    } catch {
      set({ error: 'Failed to load users.', isLoading: false });
    }
  },

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      const employees = await apiFetchEmployees();
      set({ employees, isLoading: false });
    } catch (err) {
      console.error('[fetchEmployees]', err);
      set({ error: 'Failed to load employees.', isLoading: false });
    }
  },

  setSelectedCourseId: (selectedCourseId) => set({ selectedCourseId, modules: [], lessons: {} }),

  fetchModules: async (courseId) => {
    set({ modulesLoading: true });
    try {
      const modules = await fetchModulesApi(courseId);
      set({ modules, modulesLoading: false });
    } catch (err) {
      console.error('[fetchModules]', err);
      set({ modulesLoading: false });
    }
  },

  fetchLessons: async (moduleId) => {
    try {
      const lessons = await fetchLecturesApi(moduleId);
      set((s) => ({ lessons: { ...s.lessons, [moduleId]: lessons } }));
    } catch (err) {
      console.error('[fetchLessons]', err);
    }
  },

  addModule: async (courseId, name, description) => {
    await createModuleApi(courseId, name, description);
    const modules = await fetchModulesApi(courseId);
    set({ modules });
  },

  updateModule: async (id, name, description) => {
    await updateModuleApi(id, name, description);
    const courseId = (get() as AdminState).selectedCourseId!;
    const modules  = await fetchModulesApi(courseId);
    set({ modules });
  },

  deleteModule: async (id) => {
    await deleteModuleApi(id);
    set((s) => {
      const lessons = { ...s.lessons };
      delete lessons[id];
      return { modules: s.modules.filter((m) => m.id !== id), lessons };
    });
  },

  addLesson: async (moduleId, payload) => {
    await createLectureApi(moduleId, payload);
    const lessons = await fetchLecturesApi(moduleId);
    set((s) => ({ lessons: { ...s.lessons, [moduleId]: lessons } }));
    // refresh module list so lectureCount updates
    const courseId = (get() as AdminState).selectedCourseId!;
    const modules  = await fetchModulesApi(courseId);
    set({ modules });
  },

  updateLesson: async (id, moduleId, payload) => {
    await updateLectureApi(id, payload);
    const lessons = await fetchLecturesApi(moduleId);
    set((s) => ({ lessons: { ...s.lessons, [moduleId]: lessons } }));
  },

  deleteLesson: async (id, moduleId) => {
    await deleteLectureApi(id);
    set((s) => ({
      lessons: { ...s.lessons, [moduleId]: (s.lessons[moduleId] ?? []).filter((l) => l.id !== id) },
    }));
    const courseId = (get() as AdminState).selectedCourseId!;
    const modules  = await fetchModulesApi(courseId);
    set({ modules });
  },

  // ── Institution actions ───────────────────────────────────────────────────────

  addInstitution: async (fields) => {
    try {
      await createInstitutionApi(fields.name, fields.address, fields.city);
      const institutions = await apiFetchInstitutions();
      set({ institutions, error: null });
    } catch {
      set({ error: 'Failed to create institution.' });
    }
  },

  updateInstitution: async (updated) => {
    try {
      await updateInstitutionApi(updated.id, updated.name, updated.address, updated.city);
      const institutions = await apiFetchInstitutions();
      set({ institutions, error: null });
    } catch {
      set({ error: 'Failed to update institution.' });
    }
  },

  deleteInstitution: async (id) => {
    try {
      await deleteInstitutionApi(id);
      set((s) => ({ institutions: s.institutions.filter((i) => i.id !== id), error: null }));
    } catch {
      set({ error: 'Failed to delete institution.' });
    }
  },

  // ── Course actions ────────────────────────────────────────────────────────────

  addCourse: async (fields) => {
    try {
      await createCourseApi(fields.name, fields.description, fields.status);
      const courses = await apiFetchCourses();
      set({ courses, error: null });
    } catch {
      set({ error: 'Failed to create course.' });
    }
  },

  updateCourse: async (updated) => {
    try {
      await updateCourseApi(updated.id, updated.name, updated.description, updated.status);
      const courses = await apiFetchCourses();
      set({ courses, error: null });
    } catch {
      set({ error: 'Failed to update course.' });
    }
  },

  deleteCourse: async (id) => {
    try {
      await deleteCourseApi(id);
      set((s) => ({ courses: s.courses.filter((c) => c.id !== id), error: null }));
    } catch {
      set({ error: 'Failed to delete course.' });
    }
  },

  // ── User actions ──────────────────────────────────────────────────────────────

  addUser: async (email, role, fullName, password) => {
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ') || '-';
    try {
      await createUserApi(email, password, firstName, lastName, role);
      const users = await apiFetchUsers();
      set({ users, error: null });
    } catch (e) {
      const message =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Failed to create user.';
      set({ error: message });
      throw new Error(message);
    }
  },

  updateUserStatus: async (id, status) => {
    // Optimistic update
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, accountStatus: status } : u)) }));
    try {
      await updateUserStatusApi(id, status);
    } catch {
      // Revert optimistic update by re-fetching
      await get().fetchUsers();
      set({ error: 'Failed to update user status.' });
    }
  },
}));
