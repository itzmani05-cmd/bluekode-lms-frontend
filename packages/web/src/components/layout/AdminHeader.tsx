import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Menu, X, LayoutDashboard, Users, Building2, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import { useAppStore } from '../../store/login';
import type { AdminViewType } from './AdminSidebar';
import logo from '../../assests/logo.svg';

interface AdminHeaderProps {
  activeTab?: AdminViewType;
  onViewChange?: (view: AdminViewType) => void;
}

const navItems: { key: AdminViewType; label: string; Icon: React.ElementType }[] = [
  { key: 'admin-dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { key: 'admin-users',        label: 'Users',        Icon: Users           },
  { key: 'admin-institutions', label: 'Institutions', Icon: Building2       },
  { key: 'admin-courses',      label: 'Courses',      Icon: BookOpen        },
  { key: 'admin-students',     label: 'Students',     Icon: GraduationCap   },
  { key: 'admin-employees',    label: 'Employees',    Icon: Briefcase       },
];

const AdminHeader = ({ activeTab, onViewChange }: AdminHeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentUser } = useAppStore();
  const menuRef = useRef<HTMLDivElement>(null);

  const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Admin';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  const handleNavClick = (view: AdminViewType) => {
    onViewChange?.(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6 md:px-10 z-50 shrink-0">

      {/* ── Left: Brand ── */}
      <div className="flex items-center gap-2 shrink-0">
        <img src={logo} alt="Bluekode LMS" className="h-8 w-auto" />
        <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Admin Console</span>
      </div>

      {/* ── Right: Desktop ── */}
      <div className="hidden sm:flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-[#001D6E] text-white font-bold flex items-center justify-center text-xs ring-2 ring-blue-100">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-700">{displayName}</span>
            <span className="text-[9px] text-slate-400 font-semibold">Administrator</span>
          </div>
        </div>
      </div>

      {/* ── Right: Mobile ── */}
      <div className="sm:hidden relative" ref={menuRef}>
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] animate-fade-in">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <div className="h-9 w-9 rounded-full bg-[#001D6E] text-white font-bold flex items-center justify-center text-xs ring-2 ring-blue-100 shrink-0">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email ?? ''}</p>
              </div>
            </div>

            <div className="border-b border-slate-100 py-1">
              <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
              {navItems.map(({ key, label, Icon }) => {
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleNavClick(key)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                      ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'}
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />}
                  </button>
                );
              })}
            </div>

            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <Bell className="h-4 w-4 text-slate-400" />
              <span>Notifications</span>
              <span className="ml-auto text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5">3</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>Support</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;
