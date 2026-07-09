import React from 'react';
import { ChevronRight, RotateCcw, FileCheck } from 'lucide-react';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';
import CourseCard from '../../components/student/CourseCard';
import type { Course } from '../../components/student/CourseCard';



export const MyCourse: React.FC<{ onViewChange?: (view: 'dashboard' | 'courses' | 'assignments' | 'learning') => void }> = ({ onViewChange }) => {
  const { courseSearchQuery: searchQuery, courseActiveTab: activeTab, setCourseSearchQuery: setSearchQuery, setCourseActiveTab: setActiveTab } = useStudentStore();

  const courses: Course[] = [
    {
      id: '1',
      title: 'Advanced Cloud Infrastructure & Security',
      track: 'ARCHITECTURE TRACK',
      imageBg: 'from-blue-600 to-sky-500',
      isRequired: true,
      status: 'in-progress',
      progressLabel: 'Module 4 of 8',
      progressPercent: 65,
      actionLabel: 'Continue Learning',
      imageSvg: (
        <svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      )
    },
    {
      id: '2',
      title: 'Data Privacy & GDPR Essentials',
      track: 'COMPLIANCE TRACK',
      imageBg: 'from-slate-800 to-slate-900',
      status: 'in-progress',
      progressLabel: 'In Progress',
      progressPercent: 30,
      actionLabel: 'Resume',
      imageSvg: (
        <svg className="w-16 h-16 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: '3',
      title: 'Agile Leadership Fundamentals',
      track: 'MANAGEMENT TRACK',
      imageBg: 'from-teal-500 to-emerald-400',
      status: 'completed',
      progressLabel: 'Completed',
      progressPercent: 100,
      completedDate: 'Oct 12, 2023',
      actionLabel: 'Review Material',
      actionIcon: <RotateCcw className="h-3.5 w-3.5" />,
      imageSvg: (
        <svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: '4',
      title: 'Enterprise Network Topology',
      track: 'IT INFRASTRUCTURE',
      imageBg: 'from-blue-500 via-indigo-500 to-sky-400',
      status: 'completed',
      progressLabel: 'Completed',
      progressPercent: 100,
      completedDate: 'Sep 05, 2023',
      actionLabel: 'View Certificate',
      actionIcon: <FileCheck className="h-3.5 w-3.5" />,
      imageSvg: (
        <svg className="w-16 h-16 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      )
    }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.track.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || course.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="courses" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="courses" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto space-y-6">
          <div className="relative max-w-xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search courses by name or track..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span 
                  onClick={() => onViewChange?.('dashboard')}
                  className="hover:text-slate-600 cursor-pointer"
                >
                  Home
                </span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-blue-600">My Courses</span>
              </nav>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">Course Library</h1>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200/40">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All Courses
              </button>
              <button 
                onClick={() => setActiveTab('in-progress')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'in-progress' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                In Progress (3)
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'completed' 
                    ? 'bg-white text-blue-700 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Completed (12)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onAction={() => {
                  if (course.status === 'in-progress') onViewChange?.('learning');
                }}
              />
            ))}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default MyCourse;
