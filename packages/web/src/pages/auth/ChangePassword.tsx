import React, { useState } from 'react';
import { z } from 'zod';
import { Eye, EyeOff, Lock, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store/login';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import logo from '../../assests/logo.jpeg';

const schema = z
  .object({
    newPassword:     z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

type Fields = z.infer<typeof schema>;

const inputCls = (err: boolean) =>
  `w-full px-4 py-3 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
    err
      ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10'
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/10'
  }`;

const ChangePassword: React.FC = () => {
  useDocumentTitle('Set Your Password');
  const { changePassword, isLoading, error, clearStatus } = useAppStore();

  const [fields, setFields]     = useState<Fields>({ newPassword: '', confirmPassword: '' });
  const [show, setShow]         = useState({ new: false, confirm: false });
  const [errors, setErrors]     = useState<Partial<Record<keyof Fields, string>>>({});
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setErrors({});

    const result = schema.safeParse(fields);
    if (!result.success) {
      const fe: Partial<Record<keyof Fields, string>> = {};
      result.error.issues.forEach((i) => {
        const k = i.path[0] as keyof Fields;
        if (!fe[k]) fe[k] = i.message;
      });
      setErrors(fe);
      return;
    }

    const ok = await changePassword(fields.newPassword);
    if (ok) setSuccess(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-br from-white via-slate-50 to-blue-50/40">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/5 border border-slate-200/80 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />

            <div className="px-8 pt-8 pb-2 text-center">
              <img src={logo} alt="Bluekode LMS" className="h-9 w-auto mx-auto mb-4" />

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">1</span>
                  <span className="text-xs font-bold text-blue-600">Set Password</span>
                </div>
                <div className="h-px w-8 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 text-[10px] font-extrabold flex items-center justify-center">2</span>
                  <span className="text-xs font-semibold text-slate-400">Your Details</span>
                </div>
              </div>

              <h1 className="text-xl font-extrabold text-[#001D6E]">Set your new password</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1.5">
                Your account was created by an administrator. Set a personal password to continue.
              </p>
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
                  <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                  <p className="font-semibold">Password set! Loading next step...</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={show.new ? 'text' : 'password'}
                      value={fields.newPassword}
                      onChange={(e) => setFields((f) => ({ ...f, newPassword: e.target.value }))}
                      placeholder="Minimum 8 characters"
                      className={`${inputCls(!!errors.newPassword)} pr-10`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {show.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.newPassword}</p>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={show.confirm ? 'text' : 'password'}
                      value={fields.confirmPassword}
                      onChange={(e) => setFields((f) => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Re-enter your password"
                      className={`${inputCls(!!errors.confirmPassword)} pr-10`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {show.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Password rules hint */}
                <ul className="space-y-1 pl-1">
                  {[
                    { ok: fields.newPassword.length >= 8,                     text: 'At least 8 characters' },
                    { ok: /[A-Z]/.test(fields.newPassword),                   text: 'One uppercase letter' },
                    { ok: /[0-9]/.test(fields.newPassword),                   text: 'One number' },
                    { ok: fields.newPassword === fields.confirmPassword && fields.confirmPassword !== '', text: 'Passwords match' },
                  ].map((rule) => (
                    <li key={rule.text} className={`flex items-center gap-1.5 text-[10px] font-semibold transition-colors ${rule.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${rule.ok ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      {rule.text}
                    </li>
                  ))}
                </ul>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-colors mt-2"
                >
                  {isLoading ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Lock className="h-4 w-4" /> Set Password & Continue</>
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

export default ChangePassword;
