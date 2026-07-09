import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, BookOpen, Users, MapPin, Plus, Pencil, X, Trash2 } from 'lucide-react';
import AdminHeader from '../../../components/layout/AdminHeader';
import AdminSidebar from '../../../components/layout/AdminSidebar';
import type { AdminViewType } from '../../../components/layout/AdminSidebar';
import { useAdminStore } from '../../../store/Admin';
import type { Institution } from '../../../store/Admin';
import { institutionSchema, type InstitutionFields } from '../../../schemas/institutionSchema';
import ConfirmDialog from '../../../components/ConfirmDialog';

type InstitutionStatus = 'ACTIVE' | 'INACTIVE';

const statusCfg: Record<InstitutionStatus, { label: string; className: string }> = {
  ACTIVE:   { label: 'Active',   className: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  INACTIVE: { label: 'Inactive', className: 'bg-slate-100 text-slate-600 border-slate-200'      },
};

// ── Shared input class helper ─────────────────────────────────────────────────

const inputCls = (hasError: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

// ── Add Institution Modal ─────────────────────────────────────────────────────

interface AddModalProps { onClose: () => void }

const AddInstitutionModal: React.FC<AddModalProps> = ({ onClose }) => {
  const { addInstitution } = useAdminStore();
  const [pending, setPending] = useState<InstitutionFields | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<InstitutionFields>({
    resolver: zodResolver(institutionSchema),
  });

  const onSubmit = (data: InstitutionFields) => setPending(data);

  const handleConfirm = () => {
    if (pending) addInstitution(pending);
    onClose();
  };

  return (
    <React.Fragment>
      {pending && (
        <ConfirmDialog
          message={`Are you sure you want to add "${pending.name}" as a new institution?`}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">Add Institution</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Fill in the details to register a new institution.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Institution Name</label>
              <input {...register('name')} placeholder="e.g. TechCorp Academy" className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Address</label>
              <input {...register('address')} placeholder="e.g. 45 MG Road" className={inputCls(!!errors.address)} />
              {errors.address && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">City</label>
              <input {...register('city')} placeholder="e.g. Bengaluru" className={inputCls(!!errors.city)} />
              {errors.city && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.city.message}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add Institution
              </button>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

// ── Edit Institution Modal ────────────────────────────────────────────────────

interface EditModalProps { institution: Institution; onClose: () => void }

const EditInstitutionModal: React.FC<EditModalProps> = ({ institution, onClose }) => {
  const { updateInstitution, deleteInstitution } = useAdminStore();
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<InstitutionFields>({
    resolver: zodResolver(institutionSchema),
    defaultValues: { name: institution.name, address: institution.address, city: institution.city },
  });

  const onSubmit = (data: InstitutionFields) => {
    setConfirm({
      message: `Are you sure you want to update "${institution.name}"?`,
      onConfirm: () => { updateInstitution({ ...institution, ...data }); onClose(); },
    });
  };

  const handleDelete = () => {
    setConfirm({
      message: `Are you sure you want to delete "${institution.name}"? This cannot be undone.`,
      onConfirm: () => { deleteInstitution(institution.id); onClose(); },
    });
  };

  return (
    <React.Fragment>
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">Edit Institution</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Update the details or delete this institution.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Institution Name</label>
              <input {...register('name')} className={inputCls(!!errors.name)} />
              {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">Address</label>
              <input {...register('address')} className={inputCls(!!errors.address)} />
              {errors.address && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.address.message}</p>}
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">City</label>
              <input {...register('city')} className={inputCls(!!errors.city)} />
              {errors.city && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.city.message}</p>}
            </div>
            <div className="flex items-center justify-between pt-1">
              <button type="button" onClick={handleDelete} className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-xl transition-colors flex items-center gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Update
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </React.Fragment>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const AdminInstitutions: React.FC<{ onViewChange?: (view: AdminViewType) => void }> = ({ onViewChange }) => {
  const { institutions, institutionSearchQuery, setInstitutionSearchQuery } = useAdminStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInst, setEditingInst]   = useState<Institution | null>(null);

  const filtered = useMemo(() => {
    const q = institutionSearchQuery.toLowerCase();
    return institutions.filter(
      (i) => !q || i.name.toLowerCase().includes(q) || i.city.toLowerCase().includes(q),
    );
  }, [institutionSearchQuery, institutions]);

  const activeCount   = institutions.filter(i => i.status === 'ACTIVE').length;
  const totalCourses  = institutions.reduce((s, i) => s + i.coursesAssigned, 0);
  const totalStudents = institutions.reduce((s, i) => s + i.studentsEnrolled, 0);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <AdminHeader activeTab="admin-institutions" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <AdminSidebar activeTab="admin-institutions" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-8 overflow-y-auto space-y-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  <span>Admin</span><span className="text-slate-300">/</span><span className="text-blue-600">Institutions</span>
                </nav>
                <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Institutions</h1>
                <p className="text-sm text-slate-500 mt-1">{institutions.length} institutions registered on the platform.</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-colors shrink-0">
                <Plus className="h-4 w-4" /> Add Institution
              </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <Building2 className="h-5 w-5" />, label: 'Total Institutions', value: String(institutions.length), iconClass: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                { icon: <Building2 className="h-5 w-5" />, label: 'Active',             value: String(activeCount),         iconClass: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                { icon: <BookOpen  className="h-5 w-5" />, label: 'Courses Assigned',   value: String(totalCourses),        iconClass: 'bg-blue-50 text-blue-600 border-blue-100' },
                { icon: <Users     className="h-5 w-5" />, label: 'Total Students',     value: String(totalStudents),       iconClass: 'bg-amber-50 text-amber-600 border-amber-100' },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm shadow-slate-900/5 flex items-start gap-4">
                  <div className={`p-3 rounded-xl border ${s.iconClass}`}>{s.icon}</div>
                  <div>
                    <p className="text-2xl font-extrabold text-[#001D6E] tracking-tight">{s.value}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm shadow-slate-900/5 overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <h3 className="font-extrabold text-[#001D6E] text-base">All Institutions</h3>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={institutionSearchQuery}
                    onChange={(e) => setInstitutionSearchQuery(e.target.value)}
                    placeholder="Search by name or city..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10 transition-all w-56"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Institution</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">City</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Courses</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Employees</th>
                      <th className="text-center py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Students</th>
                      <th className="text-left py-3 px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-right py-3 px-5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-400 font-semibold">No institutions match your search.</td></tr>
                    ) : filtered.map((inst) => {
                      const sCfg = statusCfg[inst.status];
                      return (
                        <tr key={inst.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{inst.name}</p>
                                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="h-2.5 w-2.5" />{inst.address}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 hidden md:table-cell"><span className="text-xs font-semibold text-slate-600">{inst.city}</span></td>
                          <td className="py-4 px-4 text-center"><span className="text-xs font-bold text-[#001D6E]">{inst.coursesAssigned}</span></td>
                          <td className="py-4 px-4 text-center"><span className="text-xs font-bold text-[#001D6E]">{inst.employeesAssigned}</span></td>
                          <td className="py-4 px-4 text-center hidden lg:table-cell"><span className="text-xs font-bold text-[#001D6E]">{inst.studentsEnrolled}</span></td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${sCfg.className}`}>{sCfg.label}</span>
                          </td>
                          <td className="py-4 px-5">
                            <div className="flex items-center justify-end">
                              <button onClick={() => setEditingInst(inst)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-extrabold border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-colors flex items-center gap-1">
                                <Pencil className="h-3 w-3" />Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 font-semibold">Showing {filtered.length} of {institutions.length} institutions</p>
              </div>
            </div>

          </main>
        </div>
      </div>

      {showAddModal  && <AddInstitutionModal  onClose={() => setShowAddModal(false)} />}
      {editingInst   && <EditInstitutionModal institution={editingInst} onClose={() => setEditingInst(null)} />}
    </div>
  );
};

export default AdminInstitutions;
