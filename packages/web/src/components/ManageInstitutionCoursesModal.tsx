import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, Trash2, X } from 'lucide-react';
import { useAdminStore } from '../store/Admin';
import type { Institution } from '../store/Admin';
import {
  assignCourseToInstitutionApi,
  fetchInstitutionCourses,
  removeInstitutionCourseApi,
  type InstitutionCourseLink,
} from '../lib/api/institutionCourses';
import ConfirmDialog from './ConfirmDialog';

interface ManageInstitutionCoursesModalProps {
  institution: Institution;
  onClose: () => void;
}

const statusCfg: Record<string, string> = {
  ACTIVE:   'bg-emerald-50 text-emerald-700 border-emerald-100',
  DRAFT:    'bg-amber-50 text-amber-700 border-amber-100',
  ARCHIVED: 'bg-slate-100 text-slate-600 border-slate-200',
};

const ManageInstitutionCoursesModal: React.FC<ManageInstitutionCoursesModalProps> = ({ institution, onClose }) => {
  const { courses, fetchCourses, fetchInstitutions } = useAdminStore();
  const [links, setLinks]         = useState<InstitutionCourseLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isAssigning, setIsAssigning]           = useState(false);
  const [removing, setRemoving]                 = useState<InstitutionCourseLink | null>(null);

  const loadLinks = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInstitutionCourses(institution.id);
      setLinks(data);
      setError(null);
    } catch {
      setError('Failed to load assigned courses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
    if (courses.length === 0) fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institution.id]);

  const availableCourses = useMemo(() => {
    const assignedIds = new Set(links.map((l) => l.courseId));
    return courses.filter((c) => !assignedIds.has(c.id));
  }, [courses, links]);

  const handleAssign = async () => {
    if (!selectedCourseId) return;
    setIsAssigning(true);
    try {
      await assignCourseToInstitutionApi(institution.id, Number(selectedCourseId));
      await loadLinks();
      await fetchInstitutions();
      setSelectedCourseId('');
      setError(null);
    } catch {
      setError('Failed to assign course.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!removing) return;
    try {
      await removeInstitutionCourseApi(removing.institutionCourseId);
      await loadLinks();
      await fetchInstitutions();
      setError(null);
    } catch {
      setError('Failed to remove course.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <React.Fragment>
      {removing && (
        <ConfirmDialog
          message={`Remove "${removing.courseName}" from ${institution.name}? This cannot be undone.`}
          onConfirm={handleRemove}
          onCancel={() => setRemoving(null)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="font-extrabold text-[#001D6E] text-base">Manage Courses</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Courses available at {institution.name}.</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="flex gap-2">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              >
                <option value="">
                  {availableCourses.length === 0 ? 'No more courses to assign' : 'Select a course to assign...'}
                </option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button
                onClick={handleAssign}
                disabled={!selectedCourseId || isAssigning}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" /> Assign
              </button>
            </div>

            {error && <p className="text-[11px] text-red-500 font-semibold">{error}</p>}

            <div className="border border-slate-200/80 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {isLoading ? (
                <p className="py-8 text-center text-sm text-slate-400 font-semibold">Loading courses...</p>
              ) : links.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400 font-semibold">No courses assigned yet.</p>
              ) : links.map((link) => (
                <div key={link.institutionCourseId} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{link.courseName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Assigned {link.assignedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${statusCfg[link.courseStatus]}`}>
                      {link.courseStatus}
                    </span>
                    <button
                      onClick={() => setRemoving(link)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Remove course"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ManageInstitutionCoursesModal;
