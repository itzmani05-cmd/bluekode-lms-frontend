import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Menu, X, LayoutDashboard, ClipboardList, GraduationCap, BookOpen, Settings, Info, CheckCheck } from 'lucide-react';
import { useAppStore } from '../../store/login';
import { useNotificationsStore } from '../../store/notifications';
import type { TrainerViewType } from './TrainerSidebar';
import logo from '../../assests/logo.jpeg';
import LearnMoreModal from './LearnMoreModal';

interface TrainerHeaderProps {
  activeTab?: TrainerViewType;
  onViewChange?: (view: TrainerViewType) => void;
}

const navItems: { key: TrainerViewType; label: string; Icon: React.ElementType }[] = [
  { key: 'trainer-dashboard',   label: 'Dashboard',  Icon: LayoutDashboard },
  { key: 'trainer-submissions', label: 'Submissions', Icon: ClipboardList   },
  { key: 'trainer-students',    label: 'My Students', Icon: GraduationCap   },
  { key: 'trainer-courses',     label: 'My Courses',  Icon: BookOpen        },
  { key: 'trainer-settings',    label: 'Settings',    Icon: Settings        },
];

const TrainerHeader = ({ activeTab, onViewChange }: TrainerHeaderProps) => {
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [notifOpen,       setNotifOpen]       = useState(false);
  const [learnMoreOpen,   setLearnMoreOpen]   = useState(false);

  const { currentUser } = useAppStore();
  const { notifications, unreadCount, fetch, markRead, markAllRead } = useNotificationsStore();

  const menuRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const emailName   = currentUser?.email ? currentUser.email.split('@')[0] : 'Trainer';
  const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

  // Fetch on mount and poll every 30 s
  useEffect(() => {
    fetch();
    const id = setInterval(fetch, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (view: TrainerViewType) => {
    onViewChange?.(view);
    setMobileMenuOpen(false);
  };

  const handleBellClick = () => {
    setNotifOpen((prev) => !prev);
  };

  const handleNotifClick = async (id: number, isRead: boolean) => {
    if (!isRead) await markRead(id);
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="w-full h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6 md:px-10 z-50 shrink-0">

      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <img src={logo} alt="Bluekode LMS" className="h-8 w-auto" />
      </div>

      {/* Desktop right */}
      <div className="hidden sm:flex items-center gap-4">

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-[100] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-extrabold text-slate-800">
                  Notifications {unreadCount > 0 && <span className="text-red-500">({unreadCount})</span>}
                </p>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold text-center py-8">No notifications yet.</p>
                ) : notifications.map((n) => (
                  <button
                    key={n.notification_id}
                    onClick={() => handleNotifClick(n.notification_id, n.is_read)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      {!n.is_read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                      <div className={!n.is_read ? '' : 'ml-3.5'}>
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">{formatTime(n.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setLearnMoreOpen(true)}
          className="flex items-center gap-1 py-1.5 text-xs font-bold text-slate-400 hover:bg-emerald-50 rounded-lg transition-colors"
        >
          <Info className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-slate-200" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs ring-2 ring-emerald-100">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs font-semibold text-slate-700">{displayName}</span>
            <span className="text-[9px] text-slate-400 font-semibold">Trainer</span>
          </div>
        </div>
      </div>

      {/* Mobile right */}
      <div className="sm:hidden relative" ref={menuRef}>
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100]">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <div className="h-9 w-9 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs ring-2 ring-emerald-100 shrink-0">
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
                      ${isActive ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'}
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{label}</span>
                    {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => { setNotifOpen(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              <Bell className="h-4 w-4 text-slate-400" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
              <HelpCircle className="h-4 w-4 text-slate-400" />
              <span>Support</span>
            </button>
            <button
              onClick={() => { setLearnMoreOpen(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium"
            >
              <Info className="h-4 w-4 text-slate-400" />
              <span>Learn More</span>
            </button>
          </div>
        )}
      </div>

      {learnMoreOpen && <LearnMoreModal onClose={() => setLearnMoreOpen(false)} />}
    </header>
  );
};

export default TrainerHeader;
