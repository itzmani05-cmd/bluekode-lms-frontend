import { Bell, HelpCircle, Menu, X, LayoutDashboard, BookOpen, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/login';
import logo from '../../assests/logo.svg';

type ViewType = 'dashboard' | 'courses' | 'assignments' | 'learning';

interface HeaderProps {
    activeTab?: ViewType;
    onViewChange?: (view: ViewType) => void;
}

const navItems = [
    { key: 'dashboard' as ViewType, label: 'Dashboard', Icon: LayoutDashboard },
    { key: 'courses' as ViewType, label: 'My Courses', Icon: BookOpen },
    { key: 'assignments' as ViewType, label: 'Assignments', Icon: FileText },

];

const Header = ({ activeTab, onViewChange }: HeaderProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { currentUser } = useAppStore();
    const menuRef = useRef<HTMLDivElement>(null);

    const emailName = currentUser?.email ? currentUser.email.split('@')[0] : 'Sarah';
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

    const handleNavClick = (view: ViewType) => {
        onViewChange?.(view);
        setMobileMenuOpen(false);
    };

    return (
        <header className="w-full h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 sm:px-6 md:px-10 z-50 shrink-0">
            {/*Left*/}
            <div className="flex items-center shrink-0">
                <img src={logo} alt="Bluekode LMS" className="h-8 w-auto" />
            </div>

            {/*Right*/}
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
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs ring-2 ring-blue-100">
                        {displayName.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{displayName}</span>
                </div>
            </div>

            {/*Right*/}
            <div className="sm:hidden relative" ref={menuRef}>
                <button
                    onClick={() => setMobileMenuOpen(prev => !prev)}
                    className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Open menu"
                >
                    {mobileMenuOpen
                        ? <X className="h-5 w-5" />
                        : <Menu className="h-5 w-5" />
                    }
                </button>

                {/*Dropdown*/}
                {mobileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-[100] animate-fade-in">
                        {/*Profile*/}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                            <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs ring-2 ring-blue-100 shrink-0">
                                {displayName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                                <p className="text-[10px] text-slate-400 truncate">{currentUser?.email ?? ''}</p>
                            </div>
                        </div>

                        {/*Navigation Items*/}
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
                                            ${isActive
                                                ? 'bg-blue-50 text-blue-700 font-bold'
                                                : 'text-slate-700 hover:bg-slate-50 font-medium'
                                            }
                                        `}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <span>{label}</span>
                                        {isActive && (
                                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/*Notifications*/}
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors font-medium">
                            <span className="relative">
                                <Bell className="h-4 w-4 text-slate-400" />
                                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-red-500 rounded-full ring-1 ring-white" />
                            </span>
                            <span>Notifications</span>
                            <span className="ml-auto text-[10px] font-bold text-white bg-red-500 rounded-full px-1.5 py-0.5">3</span>
                        </button>

                        {/*Support*/}
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

export default Header;
