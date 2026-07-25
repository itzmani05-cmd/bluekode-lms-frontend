import { useState } from 'react';
import { useAppStore } from './store/login';
import Login            from './pages/auth/Login';
import ChangePassword   from './pages/auth/ChangePassword';
import CompleteProfile  from './pages/auth/CompleteProfile';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourse         from './pages/student/MyCourse';
import Assignments      from './pages/student/Assignments';
import Learning         from './pages/student/Learning';
import StudentSettings  from './pages/student/StudentSettings';
import AdminDashboard from './pages/employees/admin/AdminDashboard';
import AdminUsers from './pages/employees/admin/AdminUsers';
import AdminInstitutions from './pages/employees/admin/AdminInstitutions';
import AdminCourses from './pages/employees/admin/AdminCourses';
import AdminStudents from './pages/employees/admin/AdminStudents';
import AdminEmployees    from './pages/employees/admin/AdminEmployees';
import AdminCourseDetail from './pages/employees/admin/AdminCourseDetail';
import AdminSettings            from './pages/employees/admin/AdminSettings';
import AdminTrainerAssignments  from './pages/employees/admin/AdminTrainerAssignments';
import TrainerDashboard   from './pages/employees/trainer/TrainerDashboard';
import TrainerSubmissions from './pages/employees/trainer/TrainerSubmissions';
import TrainerStudents    from './pages/employees/trainer/TrainerStudents';
import TrainerCourses     from './pages/employees/trainer/TrainerCourses';
import TrainerSettings    from './pages/employees/trainer/TrainerSettings';
import type { AdminViewType }   from './components/layout/AdminSidebar';
import type { TrainerViewType } from './components/layout/TrainerSidebar';

type StudentViewType = 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';

function App() {
  const { isAuthenticated, currentUser } = useAppStore();
  const [studentView, setStudentView] = useState<StudentViewType>('dashboard');
  const [adminView, setAdminView]     = useState<AdminViewType>('admin-dashboard');
  const [trainerView, setTrainerView] = useState<TrainerViewType>('trainer-dashboard');

  if (isAuthenticated && currentUser) {

    // Onboarding gate — must run before role-based routing
    if (currentUser.accountStatus === 'PENDING')  return <ChangePassword />;
    if (currentUser.accountStatus === 'APPROVED') return <CompleteProfile />;

    if (currentUser.role === 'student') {
      if (studentView === 'courses')     return <MyCourse        onViewChange={setStudentView} />;
      if (studentView === 'assignments') return <Assignments     onViewChange={setStudentView} />;
      if (studentView === 'learning')    return <Learning        onViewChange={setStudentView} />;
      if (studentView === 'settings')    return <StudentSettings onViewChange={setStudentView} />;
      return <StudentDashboard onViewChange={setStudentView} />;
    }

    if (currentUser.role === 'admin') {
      if (adminView === 'admin-users')        return <AdminUsers        onViewChange={setAdminView} />;
      if (adminView === 'admin-institutions') return <AdminInstitutions onViewChange={setAdminView} />;
      if (adminView === 'admin-courses')      return <AdminCourses      onViewChange={setAdminView} />;
      if (adminView === 'admin-students')     return <AdminStudents     onViewChange={setAdminView} />;
      if (adminView === 'admin-employees')           return <AdminEmployees           onViewChange={setAdminView} />;
      if (adminView === 'admin-course-detail')       return <AdminCourseDetail        onViewChange={setAdminView} />;
      if (adminView === 'admin-trainer-assignments') return <AdminTrainerAssignments  onViewChange={setAdminView} />;
      if (adminView === 'admin-settings')            return <AdminSettings            onViewChange={setAdminView} />;
      return <AdminDashboard onViewChange={setAdminView} />;
    }

    if (currentUser.role === 'trainer') {
      if (trainerView === 'trainer-submissions') return <TrainerSubmissions onViewChange={setTrainerView} />;
      if (trainerView === 'trainer-students')    return <TrainerStudents    onViewChange={setTrainerView} />;
      if (trainerView === 'trainer-courses')     return <TrainerCourses     onViewChange={setTrainerView} />;
      if (trainerView === 'trainer-settings')    return <TrainerSettings    onViewChange={setTrainerView} />;
      return <TrainerDashboard onViewChange={setTrainerView} activeTab={trainerView} />;
    }

    return (
      <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">
            {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)} Dashboard
          </h1>
          <p className="mt-2 text-slate-500 max-w-md">
            The {currentUser.role} console is authorized for {currentUser.email}.
          </p>
          <button
            onClick={() => useAppStore.getState().logout()}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/10 transition-colors"
          >
            Logout Session
          </button>
        </div>
      </div>
    );
  }

  return <Login />;
}

export default App;
