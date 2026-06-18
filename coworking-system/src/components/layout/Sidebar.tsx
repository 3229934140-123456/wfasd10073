import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../store';
import { cn } from '../../utils';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  CreditCard,
  Users,
  UserCheck,
  MessageSquare,
  QrCode,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Briefcase,
  ClipboardCheck,
} from 'lucide-react';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: '仪表盘', icon: LayoutDashboard, path: '/dashboard', roles: ['operator'] },
  { label: '资源管理', icon: Building2, path: '/resources', roles: ['operator'] },
  { label: '收入管理', icon: TrendingUp, path: '/analytics', roles: ['operator'] },
  { label: '月结对账', icon: ClipboardCheck, path: '/operator-billing', roles: ['operator'] },

  { label: '预订资源', icon: CalendarDays, path: '/booking', roles: ['customer', 'resident'] },
  { label: '我的预订', icon: FileText, path: '/my-bookings', roles: ['customer', 'resident'] },
  { label: '门禁二维码', icon: QrCode, path: '/access', roles: ['customer', 'resident'] },
  { label: '会议室次数包', icon: Users, path: '/meeting-package', roles: ['resident'] },
  { label: '月度协议', icon: Briefcase, path: '/agreements', roles: ['resident'] },

  { label: '访客登记', icon: UserCheck, path: '/visitors', roles: ['receptionist', 'operator'] },

  { label: '社区广场', icon: MessageSquare, path: '/community', roles: ['customer', 'resident', 'operator', 'receptionist'] },

  { label: '我的账单', icon: CreditCard, path: '/billing', roles: ['customer', 'resident'] },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { currentUser, logout } = useAppStore();
  const visibleItems = navItems.filter((item) => currentUser && item.roles.includes(currentUser.role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">共创空间</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3">
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {currentUser.company || currentUser.email}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </button>
        </div>
      </aside>
    </>
  );
}
