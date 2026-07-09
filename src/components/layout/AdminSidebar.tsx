import React, { useState } from 'react';
import {
  LayoutDashboard, Users, Building2, BookOpen,
  GraduationCap, Briefcase, Settings, LogOut,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useAppStore } from '../../store/login';

export type AdminViewType =
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-institutions'
  | 'admin-courses'
  | 'admin-students'
  | 'admin-employees';

interface AdminSidebarProps {
  activeTab: AdminViewType;
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

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    useAppStore.setState({ isAuthenticated: false, currentUser: null, successMsg: null, error: null });
  };

  return (
    <aside
      className={`
        hidden sm:flex
        relative bg-[#001D6E] flex-col justify-between text-white shrink-0
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[68px]' : 'w-64'}
      `}
    >
      <button
        onClick={() => setCollapsed(prev => !prev)}
        className="
          absolute -right-3 top-6 z-10
          h-6 w-6 rounded-full
          bg-[#001D6E] border-2 border-white/20
          flex items-center justify-center
          text-white hover:bg-blue-700
          transition-colors duration-200 shadow-md
        "
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="h-3.5 w-3.5" />
          : <ChevronLeft  className="h-3.5 w-3.5" />
        }
      </button>

      <div className="overflow-hidden">
        {!collapsed && (
          <div className="px-4 pt-5 pb-2">
            <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-widest">Admin Console</span>
          </div>
        )}
        <nav className={`p-3 space-y-1.5 ${collapsed ? 'mt-8' : 'mt-1'}`}>
          {navItems.map(({ key, label, Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onViewChange?.(key)}
                title={collapsed ? label : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-200
                  ${isActive
                    ? 'bg-white/10 text-white shadow-sm border border-white/5'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden transition-all duration-300">
                    {label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-white/10 space-y-1.5">
        <button
          title={collapsed ? 'Settings' : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
            text-white/70 hover:bg-white/5 hover:text-white transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Settings</span>}
        </button>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
            text-red-200 hover:bg-red-500/10 hover:text-red-100 transition-all duration-200 text-left
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
