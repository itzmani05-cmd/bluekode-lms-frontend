import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { User, RefreshCw, CheckCircle2, AlertTriangle, ChevronRight, Building2 } from 'lucide-react';
import { useAppStore } from '../../store/login';
import type { CompleteProfilePayload } from '../../lib/api/auth';
import { fetchInstitutions } from '../../lib/api/institutions';
import type { Institution } from '../../store/Admin';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import logo from '../../assests/logo.jpeg';

/* ── Zod schemas ── */

const baseSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName:  z.string().optional(),
  phone:     z.string().optional(),
});

const studentSchema = baseSchema.extend({
  institutionId: z.string().min(1, 'Please select your institution.'),
  department:    z.string().optional(),
  academicYear:  z.string().optional(),
});

const staffSchema = baseSchema.extend({
  designation:       z.string().optional(),
  specialization:    z.string().optional(),
  yearsOfExperience: z.string().optional(),
  joiningDate:       z.string().optional(),
});

const adminSchema = baseSchema;

type AnyFields = z.infer<typeof studentSchema> & z.infer<typeof staffSchema>;

/* ── Shared input helpers ── */

const inputCls = (err?: boolean) =>
  `w-full px-4 py-3 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    err
      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

const labelCls = 'text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5';

interface FieldProps {
  label:       string;
  name:        keyof AnyFields;
  placeholder: string;
  type?:       string;
  value:       string;
  error?:      string;
  disabled?:   boolean;
  onChange:    (name: keyof AnyFields, value: string) => void;
}

const Field: React.FC<FieldProps> = ({ label, name, placeholder, type = 'text', value, error, disabled, onChange }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(name, e.target.value)}
      className={inputCls(!!error)}
    />
    {error && <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

/* ── Role helpers ── */

const STAFF_ROLES = ['trainer', 'technical head', 'project head'];
const isStudentRole = (role: string) => role === 'student';
const isStaffRole   = (role: string) => STAFF_ROLES.includes(role);

/* ── Component ── */

const CompleteProfile: React.FC = () => {
  useDocumentTitle('Complete Your Profile');
  const { completeProfile, currentUser, isLoading, error, clearStatus } = useAppStore();

  const role   = currentUser?.role ?? 'student';
  const isStud = isStudentRole(role);
  const isStf  = isStaffRole(role);

  const [fields, setFields] = useState<AnyFields>({
    firstName:         '',
    lastName:          '',
    phone:             '',
    institutionId:     '',
    department:        '',
    academicYear:      '',
    designation:       '',
    specialization:    '',
    yearsOfExperience: '',
    joiningDate:       '',
  });
  const [errors, setErrors]       = useState<Partial<Record<keyof AnyFields, string>>>({});
  const [success, setSuccess]     = useState(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [instLoading, setInstLoading]   = useState(false);

  useEffect(() => {
    if (!isStud) return;
    setInstLoading(true);
    fetchInstitutions()
      .then(setInstitutions)
      .catch(() => {/* non-critical — dropdown stays empty */})
      .finally(() => setInstLoading(false));
  }, [isStud]);

  const setField = (name: keyof AnyFields, value: string) =>
    setFields((f) => ({ ...f, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setErrors({});

    const schema = isStud ? studentSchema : isStf ? staffSchema : adminSchema;
    const result = schema.safeParse(fields);
    if (!result.success) {
      const fe: Partial<Record<keyof AnyFields, string>> = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0] as keyof AnyFields;
        if (!fe[k]) fe[k] = i.message;
      });
      setErrors(fe);
      return;
    }

    const payload: CompleteProfilePayload = {
      firstName: fields.firstName,
      ...(fields.lastName && { lastName: fields.lastName }),
      ...(fields.phone    && { phone:    fields.phone }),
    };

    if (isStud) {
      if (fields.institutionId)     payload.institutionId = Number(fields.institutionId);
      if (fields.department)        payload.department    = fields.department;
      if (fields.academicYear)      payload.academicYear  = Number(fields.academicYear);
    } else if (isStf) {
      if (fields.designation)       payload.designation       = fields.designation;
      if (fields.specialization)    payload.specialization    = fields.specialization;
      if (fields.yearsOfExperience) payload.yearsOfExperience = Number(fields.yearsOfExperience);
      if (fields.joiningDate)       payload.joiningDate       = fields.joiningDate;
    }

    const ok = await completeProfile(payload);
    if (ok) setSuccess(true);
  };

  const roleLabel  = role.charAt(0).toUpperCase() + role.slice(1);
  const roleColour =
    isStud ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
           : isStf ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
           : 'bg-blue-50 text-blue-700 border-blue-100';

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-white via-slate-50 to-blue-50/40">
      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-lg">

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

            <div className="px-8 pt-8 pb-2 text-center">
              <img src={logo} alt="Bluekode LMS" className="h-9 w-auto mx-auto mb-4" />

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold flex items-center justify-center">✓</span>
                  <span className="text-xs font-semibold text-emerald-600">Password Set</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                <div className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">2</span>
                  <span className="text-xs font-bold text-blue-600">Your Details</span>
                </div>
              </div>

              <h1 className="text-xl font-extrabold text-[#001D6E]">Complete your profile</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1.5 mb-3">
                Tell us a bit about yourself to finish setting up your account.
              </p>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border ${roleColour}`}>
                <User className="h-3 w-3" />
                {roleLabel}
              </span>
            </div>

            <div className="px-8 py-6">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-semibold">{error}</p>
                </div>
              )}
              {success && (
                <div className="flex items-start gap-2.5 p-3.5 mb-4 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-semibold">Profile saved! Taking you to your dashboard...</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── Common fields ── */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First Name *" name="firstName" placeholder="e.g. Priya"
                    value={fields.firstName} error={errors.firstName} disabled={isLoading} onChange={setField} />
                  <Field label="Last Name" name="lastName" placeholder="e.g. Sharma"
                    value={fields.lastName ?? ''} disabled={isLoading} onChange={setField} />
                </div>

                <Field label="Phone Number" name="phone" placeholder="+91 98765 43210" type="tel"
                  value={fields.phone ?? ''} disabled={isLoading} onChange={setField} />

                {/* ── Student-specific ── */}
                {isStud && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Academic Details</p>

                    {/* Institution dropdown */}
                    <div>
                      <label className={labelCls}>
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3 w-3" />
                          Institution *
                        </span>
                      </label>
                      <select
                        value={fields.institutionId}
                        disabled={isLoading || instLoading}
                        onChange={(e) => setField('institutionId', e.target.value)}
                        className={inputCls(!!errors.institutionId)}
                      >
                        <option value="">
                          {instLoading ? 'Loading institutions...' : 'Select your institution'}
                        </option>
                        {institutions.map((inst) => (
                          <option key={inst.id} value={inst.id}>
                            {inst.name}{inst.city ? ` — ${inst.city}` : ''}
                          </option>
                        ))}
                      </select>
                      {errors.institutionId && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.institutionId}</p>
                      )}
                      {!instLoading && institutions.length === 0 && (
                        <p className="text-[10px] text-amber-500 font-semibold mt-1">
                          No institutions found. Please contact your administrator.
                        </p>
                      )}
                    </div>

                    <Field label="Department" name="department" placeholder="e.g. Computer Science"
                      value={fields.department ?? ''} disabled={isLoading} onChange={setField} />

                    <div>
                      <label className={labelCls}>Academic Year</label>
                      <select
                        value={fields.academicYear ?? ''}
                        disabled={isLoading}
                        onChange={(e) => setField('academicYear', e.target.value)}
                        className={inputCls()}
                      >
                        <option value="">Select year...</option>
                        {[1, 2, 3, 4, 5].map((y) => (
                          <option key={y} value={y}>Year {y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* ── Staff-specific ── */}
                {isStf && (
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Professional Details</p>
                    <Field label="Designation" name="designation" placeholder="e.g. Senior Trainer"
                      value={fields.designation ?? ''} disabled={isLoading} onChange={setField} />
                    <Field label="Specialization" name="specialization" placeholder="e.g. Full Stack Development"
                      value={fields.specialization ?? ''} disabled={isLoading} onChange={setField} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Years of Experience" name="yearsOfExperience" placeholder="e.g. 5" type="number"
                        value={fields.yearsOfExperience ?? ''} disabled={isLoading} onChange={setField} />
                      <Field label="Joining Date" name="joiningDate" placeholder="" type="date"
                        value={fields.joiningDate ?? ''} disabled={isLoading} onChange={setField} />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors mt-2"
                >
                  {isLoading ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> Save & Go to Dashboard</>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
