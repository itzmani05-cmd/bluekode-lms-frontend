import React, { useMemo } from 'react';
import { GraduationCap } from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

type FormStatus       = 'PENDING' | 'SUBMITTED' | 'VERIFIED';
type EnrollmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Student {
  id: number;
  fullName: string;
  email: string;
  institution: string;
  department: string;
  academicYear: number;
  formStatus: FormStatus;
  enrollmentStatus: EnrollmentStatus;
}

const mockStudents: Student[] = [
  { id: 1,  fullName: 'Arjun Mehta',    email: 'arjun.mehta@techcorp.in',    institution: 'TechCorp Academy',       department: 'Computer Science',      academicYear: 2, formStatus: 'VERIFIED',  enrollmentStatus: 'IN_PROGRESS' },
  { id: 2,  fullName: 'Kavya Reddy',    email: 'kavya.reddy@nexus.in',       institution: 'Nexus Institute',        department: 'Information Technology', academicYear: 3, formStatus: 'SUBMITTED', enrollmentStatus: 'ASSIGNED'    },
  { id: 3,  fullName: 'Aditya Singh',   email: 'aditya.singh@pioneer.in',    institution: 'Pioneer Training Center',department: 'Electronics',           academicYear: 1, formStatus: 'PENDING',   enrollmentStatus: 'ASSIGNED'    },
  { id: 4,  fullName: 'Meera Krishnan', email: 'meera.k@techcorp.in',        institution: 'TechCorp Academy',       department: 'Cybersecurity',          academicYear: 2, formStatus: 'VERIFIED',  enrollmentStatus: 'COMPLETED'   },
  { id: 5,  fullName: 'Siddharth Rao',  email: 'sid.rao@nexus.in',           institution: 'Nexus Institute',        department: 'Data Science',           academicYear: 2, formStatus: 'VERIFIED',  enrollmentStatus: 'IN_PROGRESS' },
  { id: 6,  fullName: 'Pooja Menon',    email: 'pooja.m@synergy.in',         institution: 'Synergy College',        department: 'Computer Science',       academicYear: 1, formStatus: 'PENDING',   enrollmentStatus: 'ASSIGNED'    },
  { id: 7,  fullName: 'Dev Patel',      email: 'dev.patel@nexus.in',         institution: 'Nexus Institute',        department: 'Software Engineering',   academicYear: 3, formStatus: 'SUBMITTED', enrollmentStatus: 'CANCELLED'   },
  { id: 8,  fullName: 'Riya Shah',      email: 'riya.shah@apex.in',          institution: 'Apex Skill Hub',         department: 'Information Technology', academicYear: 2, formStatus: 'VERIFIED',  enrollmentStatus: 'COMPLETED'   },
  { id: 9,  fullName: 'Nisha Verma',    email: 'nisha.v@pioneer.in',         institution: 'Pioneer Training Center',department: 'Network Engineering',    academicYear: 1, formStatus: 'PENDING',   enrollmentStatus: 'ASSIGNED'    },
  { id: 10, fullName: 'Rahul Iyer',     email: 'rahul.iyer@techcorp.in',     institution: 'TechCorp Academy',       department: 'Cloud Computing',        academicYear: 3, formStatus: 'VERIFIED',  enrollmentStatus: 'IN_PROGRESS' },
];

const formStatusCfg: Record<FormStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Pending',   className: 'bg-amber-50 text-amber-700 border-amber-100'       },
  SUBMITTED: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border-blue-100'          },
  VERIFIED:  { label: 'Verified',  className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
};

const enrollmentCfg: Record<EnrollmentStatus, { label: string; className: string }> = {
  ASSIGNED:    { label: 'Assigned',    className: 'bg-slate-100 text-slate-600 border-slate-200'        },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-50 text-blue-700 border-blue-100'           },
  COMPLETED:   { label: 'Completed',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100'  },
  CANCELLED:   { label: 'Cancelled',   className: 'bg-red-50 text-red-600 border-red-100'              },
};

const institutions = ['All Institutions', ...Array.from(new Set(mockStudents.map(s => s.institution)))];

const AdminStudents: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Students');
  const {
    studentSearchQuery, studentFormStatusFilter, studentEnrollmentFilter,
    setStudentSearchQuery, setStudentFormStatusFilter, setStudentEnrollmentFilter,
  } = useAdminStore();

  const [institutionFilter, setInstitutionFilter] = React.useState('All Institutions');

  const filtered = useMemo(() => {
    return mockStudents.filter((s) => {
      const q = studentSearchQuery.toLowerCase();
      const matchesSearch  = !q || s.fullName.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
      const matchesForm    = studentFormStatusFilter === 'all' || s.formStatus === studentFormStatusFilter;
      const matchesEnroll  = studentEnrollmentFilter === 'all' || s.enrollmentStatus === studentEnrollmentFilter;
      const matchesInst    = institutionFilter === 'All Institutions' || s.institution === institutionFilter;
      return matchesSearch && matchesForm && matchesEnroll && matchesInst;
    });
  }, [studentSearchQuery, studentFormStatusFilter, studentEnrollmentFilter, institutionFilter]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-students" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-students" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            {/* Page Header */}
            <div>
              <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                <span>Admin</span>
                <span className="text-slate-300">/</span>
                <span className="text-blue-600">Students</span>
              </nav>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Students</h1>
              <p className="text-sm text-slate-500 mt-1">{mockStudents.length} student profiles across all institutions.</p>
            </div>

            {/* Filters */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-900/5 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center gap-3">

                {/* Search */}
                <div className="relative flex-1 max-w-xs">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Institution filter */}
                  <select
                    value={institutionFilter}
                    onChange={(e) => setInstitutionFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                  >
                    {institutions.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>

                  {/* Form Status filter */}
                  <select
                    value={studentFormStatusFilter}
                    onChange={(e) => setStudentFormStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                  >
                    <option value="all">All Form Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="SUBMITTED">Submitted</option>
                    <option value="VERIFIED">Verified</option>
                  </select>

                  {/* Enrollment Status filter */}
                  <select
                    value={studentEnrollmentFilter}
                    onChange={(e) => setStudentEnrollmentFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all"
                  >
                    <option value="all">All Enrollment</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Student</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Institution</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Department</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Year</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Form</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enrollment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-slate-400 font-semibold">
                          No students match your filters.
                        </td>
                      </tr>
                    ) : filtered.map((student) => {
                      const fCfg = formStatusCfg[student.formStatus];
                      const eCfg = enrollmentCfg[student.enrollmentStatus];
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {student.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{student.fullName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 hidden md:table-cell">
                            <p className="text-xs font-semibold text-slate-700">{student.institution}</p>
                          </td>
                          <td className="py-3.5 px-4 hidden lg:table-cell">
                            <p className="text-xs font-semibold text-slate-600">{student.department}</p>
                          </td>
                          <td className="py-3.5 px-4 text-center hidden lg:table-cell">
                            <div className="flex items-center justify-center gap-1">
                              <GraduationCap className="h-3 w-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">Year {student.academicYear}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${fCfg.className}`}>
                              {fCfg.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${eCfg.className}`}>
                              {eCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold">Showing {filtered.length} of {mockStudents.length} students</p>
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminStudents;
