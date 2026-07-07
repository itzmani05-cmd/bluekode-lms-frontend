import { useState } from 'react';
import { useAppStore } from './store/login';
import Login from './pages/auth/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import MyCourse from './pages/student/MyCourse';
import Assignments from './pages/student/Assignments';

import Learning from './pages/student/Learning';

function App() {
  const { isAuthenticated, currentUser } = useAppStore();
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'assignments' | 'learning'>('dashboard');

  if (isAuthenticated && currentUser) {
    if (currentUser.role === 'student') {
      if (currentView === 'courses') {
        return <MyCourse onViewChange={setCurrentView} />;
      }
      if (currentView === 'assignments') {
        return <Assignments onViewChange={setCurrentView} />;
      }

      if (currentView === 'learning') {
        return <Learning onViewChange={setCurrentView} />;
      }
      return <StudentDashboard onViewChange={setCurrentView} />;
    }

    // Fallback console for other roles
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
            onClick={() => useAppStore.setState({ isAuthenticated: false, currentUser: null, successMsg: null, error: null })}
            className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-blue-500/10 transition-colors"
          >
            Logout Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <Login />
    </div>
  );
}

export default App;
