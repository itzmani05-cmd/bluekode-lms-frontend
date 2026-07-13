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

// ── Shared types ──────────────────────────────────────────────────────────────

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
  institutions: Institution[];
  courses:      Course[];
  users:        AdminUser[];

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

  // Fetch actions
  fetchInstitutions: () => Promise<void>;
  fetchCourses:      () => Promise<void>;
  fetchUsers:        () => Promise<void>;

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
  institutions: [],
  courses:      [],
  users:        [],

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

  addUser: async (email, _role, fullName, password) => {
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ') || '-';
    try {
      await createUserApi(email, password, firstName, lastName);
      const users = await apiFetchUsers();
      set({ users, error: null });
    } catch {
      set({ error: 'Failed to create user.' });
      throw new Error('Failed to create user.');
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
