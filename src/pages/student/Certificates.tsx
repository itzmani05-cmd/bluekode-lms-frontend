import React from 'react';
import { 
  Calendar,
  Download,
  Share2,
  Play,
  CheckCircle,
  Clock,
  TrendingUp,
  Award as AwardIcon
} from 'lucide-react';
import { useAppStore } from '../../store/login';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import { useStudentStore } from '../../store/Student';

interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  previewBg: string; 
  previewContent: React.ReactNode;
}

interface InProgressCredential {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  iconBg: string;
  icon: React.ReactNode;
}

export const Certificates: React.FC<{ onViewChange?: (view: 'dashboard' | 'courses' | 'assignments' | 'certificates') => void }> = ({ onViewChange }) => {
  const { currentUser } = useAppStore();
  const { certificateSearchQuery: searchQuery, setCertificateSearchQuery: setSearchQuery } = useStudentStore();

  const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Sarah';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  const earnedCertificates: Certificate[] = [
    {
      id: '1',
      title: 'Advanced Data Compliance & Ethics',
      issuedDate: 'Issued: Oct 12, 2023',
      previewBg: 'from-blue-900 via-indigo-950 to-slate-900',
      previewContent: (
        <div className="flex flex-col items-center justify-center h-full text-white/90 p-4 text-center select-none">
          <span className="text-[7px] uppercase tracking-[0.2em] font-extrabold text-blue-400">Certificate of Completion</span>
          <h4 className="text-[10px] font-bold mt-1 text-slate-100 max-w-[150px] leading-tight">Advanced Data Compliance & Ethics</h4>
          <div className="w-10 h-[1px] bg-amber-400/50 my-1.5" />
          <span className="text-[6px] text-slate-400 italic">awarded to</span>
          <span className="text-[8px] font-serif font-semibold text-amber-300 mt-0.5">{displayName}</span>
        </div>
      )
    },
    {
      id: '2',
      title: 'Cybersecurity Fundamentals for Leadership',
      issuedDate: 'Issued: Aug 05, 2023',
      previewBg: 'from-slate-800 via-blue-950 to-slate-950',
      previewContent: (
        <div className="flex flex-col items-center justify-center h-full text-white/90 p-4 text-center select-none">
          <span className="text-[7px] uppercase tracking-[0.2em] font-extrabold text-blue-400">Professional Credential</span>
          <h4 className="text-[10px] font-bold mt-1 text-slate-100 max-w-[150px] leading-tight">Cybersecurity Fundamentals</h4>
          <div className="w-10 h-[1px] bg-amber-400/50 my-1.5" />
          <span className="text-[6px] text-slate-400 italic">awarded to</span>
          <span className="text-[8px] font-serif font-semibold text-amber-300 mt-0.5">{displayName}</span>
        </div>
      )
    },
    {
      id: '3',
      title: 'Agile Project Management Essentials',
      issuedDate: 'Issued: Mar 22, 2023',
      previewBg: 'from-slate-100 via-slate-200 to-slate-300',
      previewContent: (
        <div className="flex flex-col items-center justify-center h-full text-slate-700 p-4 text-center select-none">
          <AwardIcon className="h-6 w-6 text-slate-400/80 mb-1" />
          <span className="text-[7px] uppercase tracking-wider font-extrabold text-slate-500">Agile Essentials</span>
          <span className="text-[7px] font-semibold text-slate-400 mt-0.5">Verified Credential</span>
        </div>
      )
    }
  ];

  const inProgressList: InProgressCredential[] = [
    {
      id: '1',
      title: 'Financial Modeling & Forecasting',
      subtitle: 'Expected completion: Next Month',
      progress: 75,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/50',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: '2',
      title: 'Conflict Resolution in Management',
      subtitle: '4 modules remaining',
      progress: 30,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/50',
      icon: <AwardIcon className="h-5 w-5" />
    }
  ];

  const filteredCertificates = earnedCertificates.filter(cert => 
    cert.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#F8FAFC] overflow-hidden">
      <Header activeTab="certificates" onViewChange={onViewChange} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab="certificates" onViewChange={onViewChange} />
        <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-8 overflow-y-auto space-y-8">
          <div className="relative max-w-xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 shadow-sm transition-all"
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-[#001D6E] tracking-tight">My Certificates</h1>
              <p className="text-xs text-slate-500 mt-1 font-medium">View, download, and share your earned credentials.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold border border-blue-100/50">
                <CheckCircle className="h-3 w-3 text-blue-600" />
                <span>4 EARNED</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-extrabold border border-slate-200/40">
                <Clock className="h-3 w-3 text-slate-500" />
                <span>2 IN PROGRESS</span>
              </div>
            </div>
          </div>
          <section className="space-y-5">
            <h3 className="font-extrabold text-[#001D6E] text-base">Earned Credentials</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCertificates.map((cert) => (
                <div 
                  key={cert.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm shadow-slate-900/5 hover:shadow-md hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className={`h-40 bg-gradient-to-br ${cert.previewBg} rounded-xl border border-slate-100/10 shadow-inner relative overflow-hidden flex items-center justify-center p-4 group`}>
                    <div className="absolute inset-2 border border-dashed border-white/10 rounded-lg pointer-events-none" />
                    {cert.previewContent}
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug min-h-[40px]">
                      {cert.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{cert.issuedDate}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button className="py-2 border border-blue-600 text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                      <button className="py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5">
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="space-y-5 pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-[#001D6E] text-base">In Progress</h3>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                View Learning Path
              </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-sm shadow-slate-900/5">
              {inProgressList.map((item) => (
                <div 
                  key={item.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${item.iconBg} shrink-0`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-1">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-1 sm:max-w-md justify-end">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-blue-700">{item.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all shrink-0">
                      <Play className="h-4.5 w-4.5 fill-current" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      </div>
    </div>
  );
};

export default Certificates;
