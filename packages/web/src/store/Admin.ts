import { create } from 'zustand';

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

// ── Seed data ─────────────────────────────────────────────────────────────────

const seedInstitutions: Institution[] = [
  { id: 1, name: 'TechCorp Academy',       city: 'Bengaluru', address: '45 MG Road, Bengaluru',      coursesAssigned: 8, employeesAssigned: 5, studentsEnrolled: 94, status: 'ACTIVE',   createdAt: 'Jan 10, 2024' },
  { id: 2, name: 'Nexus Institute',         city: 'Mumbai',    address: '12 Bandra West, Mumbai',     coursesAssigned: 5, employeesAssigned: 3, studentsEnrolled: 62, status: 'ACTIVE',   createdAt: 'Feb 05, 2024' },
  { id: 3, name: 'Synergy College',         city: 'Chennai',   address: '88 Anna Salai, Chennai',     coursesAssigned: 3, employeesAssigned: 2, studentsEnrolled: 28, status: 'INACTIVE', createdAt: 'Mar 15, 2024' },
  { id: 4, name: 'Pioneer Training Center', city: 'Hyderabad', address: '7 Hitech City, Hyderabad',   coursesAssigned: 6, employeesAssigned: 4, studentsEnrolled: 57, status: 'ACTIVE',   createdAt: 'Apr 01, 2024' },
  { id: 5, name: 'Apex Skill Hub',          city: 'Pune',      address: '23 Hinjewadi Phase 2, Pune', coursesAssigned: 4, employeesAssigned: 3, studentsEnrolled: 41, status: 'ACTIVE',   createdAt: 'Apr 28, 2024' },
  { id: 6, name: 'Catalyst Institute',      city: 'Kolkata',   address: '55 Salt Lake City, Kolkata', coursesAssigned: 2, employeesAssigned: 1, studentsEnrolled: 18, status: 'INACTIVE', createdAt: 'May 20, 2024' },
];

const seedCourses: Course[] = [
  { id: 1, name: 'Advanced Data Security & Compliance',  description: 'Encryption, auditing, and regulatory frameworks.',   status: 'ACTIVE',   moduleCount: 6, enrollments: 124, createdAt: 'Jan 15, 2024' },
  { id: 2, name: 'Cloud Infrastructure Administration',  description: 'AWS, Azure, GCP fundamentals and best practices.',   status: 'ACTIVE',   moduleCount: 8, enrollments: 98,  createdAt: 'Feb 01, 2024' },
  { id: 3, name: 'DevOps Fundamentals',                  description: 'CI/CD pipelines, Docker, and Kubernetes basics.',    status: 'DRAFT',    moduleCount: 4, enrollments: 0,   createdAt: 'Jun 10, 2024' },
  { id: 4, name: 'Network Security Essentials',          description: 'Firewalls, VPNs, intrusion detection systems.',      status: 'ACTIVE',   moduleCount: 5, enrollments: 67,  createdAt: 'Mar 05, 2024' },
  { id: 5, name: 'Agile Project Management',             description: 'Scrum, Kanban, and agile delivery frameworks.',      status: 'ARCHIVED', moduleCount: 7, enrollments: 203, createdAt: 'Oct 12, 2023' },
  { id: 6, name: 'React Frontend Development',           description: 'React 18, TypeScript, Tailwind CSS deep dive.',      status: 'DRAFT',    moduleCount: 3, enrollments: 0,   createdAt: 'Jul 01, 2024' },
  { id: 7, name: 'Python for Data Analysis',             description: 'Pandas, NumPy, data visualisation with Matplotlib.', status: 'ACTIVE',   moduleCount: 9, enrollments: 154, createdAt: 'Apr 20, 2024' },
  { id: 8, name: 'Ethical Hacking & Penetration Testing',description: 'OWASP Top 10, Kali Linux, vulnerability scanning.',  status: 'ARCHIVED', moduleCount: 6, enrollments: 89,  createdAt: 'Nov 03, 2023' },
];

const seedUsers: AdminUser[] = [
  { id: 1,  fullName: 'Arjun Mehta',    email: 'arjun.mehta@techcorp.in',    role: 'student',        accountStatus: 'ACTIVE',   createdAt: 'Jun 12, 2024' },
  { id: 2,  fullName: 'Priya Sharma',   email: 'priya.sharma@bluekode.in',   role: 'trainer',        accountStatus: 'ACTIVE',   createdAt: 'May 08, 2024' },
  { id: 3,  fullName: 'Kavya Reddy',    email: 'kavya.reddy@nexus.in',       role: 'student',        accountStatus: 'PENDING',  createdAt: 'Jul 01, 2024' },
  { id: 4,  fullName: 'Rohan Kapoor',   email: 'rohan.kapoor@synergy.in',    role: 'student',        accountStatus: 'PENDING',  createdAt: 'Jul 02, 2024' },
  { id: 5,  fullName: 'Sneha Nair',     email: 'sneha.nair@bluekode.in',     role: 'trainer',        accountStatus: 'INACTIVE', createdAt: 'Apr 15, 2024' },
  { id: 6,  fullName: 'Dev Patel',      email: 'dev.patel@nexus.in',         role: 'student',        accountStatus: 'REJECTED', createdAt: 'Jun 28, 2024' },
  { id: 7,  fullName: 'Meera Krishnan', email: 'meera.k@techcorp.in',        role: 'student',        accountStatus: 'ACTIVE',   createdAt: 'Mar 20, 2024' },
  { id: 8,  fullName: 'Vikram Joshi',   email: 'vikram.joshi@bluekode.in',   role: 'technical head', accountStatus: 'ACTIVE',   createdAt: 'Feb 10, 2024' },
  { id: 9,  fullName: 'Nisha Verma',    email: 'nisha.v@pioneer.in',         role: 'student',        accountStatus: 'PENDING',  createdAt: 'Jul 03, 2024' },
  { id: 10, fullName: 'Rajesh Kumar',   email: 'rajesh.k@bluekode.in',       role: 'project head',   accountStatus: 'ACTIVE',   createdAt: 'Jan 05, 2024' },
];

// ── Store type ────────────────────────────────────────────────────────────────

type AdminState = {
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

  // Institution actions
  addInstitution:    (inst: Omit<Institution, 'id' | 'coursesAssigned' | 'employeesAssigned' | 'studentsEnrolled' | 'status' | 'createdAt'>) => void;
  updateInstitution: (updated: Institution) => void;
  deleteInstitution: (id: number) => void;

  // Course actions
  addCourse:    (course: Omit<Course, 'id' | 'moduleCount' | 'enrollments' | 'createdAt'>) => void;
  updateCourse: (updated: Course) => void;
  deleteCourse: (id: number) => void;

  // User actions
  addUser:          (email: string, role: UserRole, fullName: string) => void;
  updateUserStatus: (id: number, status: AccountStatus) => void;
};

// ── Store ─────────────────────────────────────────────────────────────────────

export const useAdminStore = create<AdminState>((set) => ({
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

  // Data
  institutions: seedInstitutions,
  courses:      seedCourses,
  users:        seedUsers,

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

  // Institution actions
  addInstitution: (fields) =>
    set((s) => ({
      institutions: [
        ...s.institutions,
        {
          ...fields,
          id:                Date.now(),
          coursesAssigned:   0,
          employeesAssigned: 0,
          studentsEnrolled:  0,
          status:            'ACTIVE' as InstitutionStatus,
          createdAt:         new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
      ],
    })),
  updateInstitution: (updated) =>
    set((s) => ({ institutions: s.institutions.map((i) => (i.id === updated.id ? updated : i)) })),
  deleteInstitution: (id) =>
    set((s) => ({ institutions: s.institutions.filter((i) => i.id !== id) })),

  // Course actions
  addCourse: (fields) =>
    set((s) => ({
      courses: [
        ...s.courses,
        {
          ...fields,
          id:          Date.now(),
          moduleCount: 0,
          enrollments: 0,
          createdAt:   new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
      ],
    })),
  updateCourse: (updated) =>
    set((s) => ({ courses: s.courses.map((c) => (c.id === updated.id ? updated : c)) })),
  deleteCourse: (id) =>
    set((s) => ({ courses: s.courses.filter((c) => c.id !== id) })),

  // User actions
  addUser: (email, role, fullName) =>
    set((s) => ({
      users: [
        ...s.users,
        {
          id:            Date.now(),
          fullName,
          email,
          role,
          accountStatus: 'ACTIVE' as AccountStatus,
          createdAt:     new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        },
      ],
    })),
  updateUserStatus: (id, status) =>
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, accountStatus: status } : u)) })),
}));
