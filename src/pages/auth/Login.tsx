import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { Shield, Eye, EyeOff, Lock, Mail, AlertTriangle, ShieldCheck, RefreshCw, GraduationCap } from 'lucide-react';
import { loginSchema } from '../../schemas/login';
import type { LoginFields } from '../../schemas/login';
import { useAppStore } from '../../store/login';

export const Login: React.FC = () => {
  const {
    login,
    isLoading,
    error: storeError,
    successMsg,
    clearStatus
  } = useAppStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'trainer' | 'technical head' | 'project head' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFields, string>>>({});

  useEffect(() => {
    clearStatus();
  }, [clearStatus]);

  const handleStudentBypass = () => {
    useAppStore.setState({
      isAuthenticated: true,
      currentUser: { email: 'student@bluekode.com', role: 'student' },
      successMsg: 'Access Authorized! Redirecting...'
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    clearStatus();

    const validationResult = loginSchema.safeParse({ email, password, role });
    if (!validationResult.success) {
      const fieldErrors: Partial<Record<keyof LoginFields, string>> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof LoginFields;
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    await login(email, password, role);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-white via-slate-50 to-blue-50/40 login-page">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-md border-slate-200/80 bg-white shadow-xl shadow-slate-900/5 relative overflow-hidden transition-all duration-300 hover:border-blue-500/20">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue-600" />         
          <CardHeader className="text-center pb-2 pt-8">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-blue-600 rounded-2xl blur opacity-15 group-hover:opacity-25 transition duration-300" />
                <div className="relative bg-blue-50 border border-blue-100 p-3 rounded-2xl text-blue-600 flex items-center justify-center">
                  <Shield className="h-8 w-8 animate-pulse text-blue-600" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-black">Bluekode LMS</CardTitle>
            <CardDescription className="text-slate-500 mt-1.5 text-xs sm:text-sm">
              Verify identity and secure access tokens for LMS modules
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 pb-8 px-6 sm:px-8">
            {storeError && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl animate-shake">
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold leading-normal">Security Alert</p>
                  <p className="mt-0.5 opacity-90">{storeError}</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-start gap-2.5 p-3.5 mb-5 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl">
                <ShieldCheck className="h-4 w-4 mt-0.5 flex-shrink-0 animate-bounce" />
                <div>
                  <p className="font-semibold leading-normal">Access Authorized</p>
                  <p className="mt-0.5 opacity-90">{successMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {}<div className="relative">
                <Select
                  label="Required Access Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  options={[
                    { value: 'student', label: 'Student Portal' },
                    { value: 'trainer', label: 'Trainer Workspace' },
                    { value: 'technical head', label: 'Technical Head Console' },
                    { value: 'project head', label: 'Project Head Management' },
                    { value: 'admin', label: 'System Admin Console' },
                  ]}
                  disabled={isLoading}
                  error={errors.role}
                  className="bg-white border-slate-200 hover:border-blue-300 focus:border-blue-500 text-black transition-all"
                />
              </div>

              <div className="space-y-1 relative">
                <div className="absolute right-3 top-9 text-slate-400 pointer-events-none z-10">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@bluekode.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  error={errors.email}
                  required
                  maxLength={100}
                  className="bg-white border-slate-200 hover:border-blue-300 focus:border-blue-500 text-black pr-10 transition-all"
                />
              </div>

              <div className="space-y-1 relative">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none z-10"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  error={errors.password}
                  required
                  maxLength={50}
                  className="bg-white border-slate-200 hover:border-blue-300 focus:border-blue-500 text-black pr-10 transition-all"
                />
              </div>

              <div className="pt-3 flex flex-col gap-2.5">
                <Button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10 border-0"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Validating Payload...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Login
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleStudentBypass}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 transition-all font-semibold"
                  disabled={isLoading}
                >
                  <GraduationCap className="h-4.5 w-4.5" />
                  Student Portal Access
                </Button>
              </div>
            </form>            
          </CardContent>         
        </Card>

      </div>
      <Footer />
    </div>
  );
};

export default Login;
