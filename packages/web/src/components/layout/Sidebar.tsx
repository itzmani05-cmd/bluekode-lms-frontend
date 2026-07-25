import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../store/login';
import logo from '../../assests/logo.jpeg';

interface SidebarProps {
  activeTab: 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings';
  onViewChange?: (view: 'dashboard' | 'courses' | 'assignments' | 'learning' | 'settings') => void;
}

const navItems = [
  { key: 'dashboard' as const,     label: 'Dashboard',    Icon: LayoutDashboard },
  { key: 'courses' as const,       label: 'My Courses',   Icon: BookOpen },
  { key: 'assignments' as const,   label: 'Assignments',  Icon: FileText },

];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onViewChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    useAppStore.setState({ 
      isAuthenticated: false, currentUser: null, successMsg: null, error: null 
    });
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
      {/*Toggle Arrow Button*/}
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

      {/*Nav Items*/}
      <div className="overflow-hidden">
       
        <nav className="p-3 space-y-1.5 mt-2">
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

      {/* ── Bottom Items ── */}
      <div className={`p-3 border-t border-white/10 space-y-1.5`}>
        <button
          onClick={() => onViewChange?.('settings')}
          title={collapsed ? 'Settings' : undefined}
          className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold
            transition-all duration-200
            ${activeTab === 'settings'
              ? 'bg-white/10 text-white shadow-sm border border-white/5'
              : 'text-white/70 hover:bg-white/5 hover:text-white'
            }
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
          {!collapsed && <span className="whitespace-nowrap">LogOut</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
