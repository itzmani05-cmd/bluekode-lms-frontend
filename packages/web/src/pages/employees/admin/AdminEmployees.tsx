import React, { useEffect, useMemo } from 'react';
import { Briefcase, ArrowLeftRight } from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { EmployeeStatus } from '../../../store/Admin';
import useDocumentTitle from '../../../hooks/useDocumentTitle';

interface TrainerSubstitution {
  id: number;
  originalTrainer: string;
  replacementTrainer: string;
  leaveFrom: string;
  leaveTo: string;
  reason: string;
}

const mockSubstitutions: TrainerSubstitution[] = [
  { id: 1, originalTrainer: 'Sneha Nair',  replacementTrainer: 'Ananya Iyer',   leaveFrom: 'Jul 08, 2024', leaveTo: 'Jul 18, 2024', reason: 'Medical leave' },
  { id: 2, originalTrainer: 'Suresh Babu', replacementTrainer: 'Priya Sharma',  leaveFrom: 'Jun 20, 2024', leaveTo: 'Jul 05, 2024', reason: 'Personal leave' },
];

const statusCfg: Record<EmployeeStatus, { label: string; className: string }> = {
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  INACTIVE: { label: 'Inactive', className: 'bg-slate-100 text-slate-600 border-slate-200'      },
};

const roleColors = [
  'bg-indigo-50 text-indigo-700 border-indigo-100',
  'bg-purple-50 text-purple-700 border-purple-100',
  'bg-teal-50 text-teal-700 border-teal-100',
  'bg-amber-50 text-amber-700 border-amber-100',
];
const roleColor = (role: string) => {
  let hash = 0;
  for (let i = 0; i < role.length; i++) hash = role.charCodeAt(i) + ((hash << 5) - hash);
  return roleColors[Math.abs(hash) % roleColors.length];
};

const filterTabs: { key: string; label: string }[] = [
  { key: 'all',      label: 'All'      },
  { key: 'ACTIVE',   label: 'Active'   },
  { key: 'INACTIVE', label: 'Inactive' },
];

const AdminEmployees: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  useDocumentTitle('Employees');
  const {
    employees, isLoading, error, fetchEmployees,
    employeeSearchQuery, employeeStatusFilter, setEmployeeSearchQuery, setEmployeeStatusFilter,
  } = useAdminStore();

  useEffect(() => { fetchEmployees(); }, []);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesStatus = employeeStatusFilter === 'all' || e.status === employeeStatusFilter;
      const q = employeeSearchQuery.toLowerCase();
      const matchesSearch = !q || e.fullName.toLowerCase().includes(q) || e.specialization.toLowerCase().includes(q) || e.institution.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [employeeSearchQuery, employeeStatusFilter, employees]);

  const counts = useMemo(() => ({
    all:      employees.length,
    ACTIVE:   employees.filter(e => e.status === 'ACTIVE').length,
    INACTIVE: employees.filter(e => e.status === 'INACTIVE').length,
  }), [employees]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-employees" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-employees" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-blue-600">Employees</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Employees</h1>
                <p className="text-sm text-slate-500 mt-1">{employees.length} employees · {counts.ACTIVE} active across all institutions.</p>
              </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-900/5 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-1 flex-wrap">
                  {filterTabs.map((tab) => {
                    const count = counts[tab.key as keyof typeof counts];
                    const isActive = employeeStatusFilter === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setEmployeeStatusFilter(tab.key)}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200
                          ${isActive ? 'bg-[#001D6E] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}
                        `}
                      >
                        {tab.label}
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={employeeSearchQuery}
                    onChange={(e) => setEmployeeSearchQuery(e.target.value)}
                    placeholder="Search by name or specialization..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all w-60"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Employee</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Specialization</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Exp.</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Institution</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-slate-400 font-semibold">
                          Loading employees...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-red-500 font-semibold">
                          {error}
                        </td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-slate-400 font-semibold">
                          No employee profiles found. Create employee profiles from the Users page.
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-sm text-slate-400 font-semibold">
                          No employees match your search.
                        </td>
                      </tr>
                    ) : filtered.map((emp) => {
                      const sCfg = statusCfg[emp.status];
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[#001D6E]/10 text-[#001D6E] font-bold text-[10px] flex items-center justify-center shrink-0">
                                {emp.fullName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{emp.fullName}</p>
                                <p className="text-[10px] text-slate-400 font-semibold">{emp.designation}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${roleColor(emp.role)}`}>
                              {emp.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell">
                            <p className="text-xs font-semibold text-slate-600">{emp.specialization}</p>
                          </td>
                          <td className="py-4 px-4 text-center hidden lg:table-cell">
                            <div className="flex items-center justify-center gap-1">
                              <Briefcase className="h-3 w-3 text-slate-400" />
                              <span className="text-xs font-bold text-slate-700">{emp.yearsOfExperience} yrs</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 hidden lg:table-cell">
                            <p className="text-xs font-semibold text-slate-600">{emp.institution}</p>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${sCfg.className}`}>
                              {sCfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold">Showing {filtered.length} of {employees.length} employees</p>
              </div>
            </div>

            {/* Trainer Substitutions */}
            <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-900/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
                <h3 className="font-extrabold text-[#001D6E] text-base">Trainer Substitutions</h3>
                <span className="text-[10px] font-bold text-white bg-amber-500 rounded-full px-2 py-0.5">{mockSubstitutions.length}</span>
              </div>

              {mockSubstitutions.length === 0 ? (
                <p className="text-sm text-slate-400 font-semibold text-center py-6">No active substitutions.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mockSubstitutions.map((sub) => (
                    <div key={sub.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-red-50 border border-red-100 text-red-600 font-bold text-[10px] flex items-center justify-center">
                              {sub.originalTrainer.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-bold text-slate-700">{sub.originalTrainer}</p>
                          </div>
                          <ArrowLeftRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                              {sub.replacementTrainer.slice(0, 2).toUpperCase()}
                            </div>
                            <p className="text-xs font-bold text-slate-700">{sub.replacementTrainer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Period</p>
                            <p className="text-xs font-bold text-slate-800">{sub.leaveFrom} – {sub.leaveTo}</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                            Active
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold mt-2">
                        Reason: {sub.reason}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployees;
