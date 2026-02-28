import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  HardHat,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingCart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { authApi } from '@/api/auth.api';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/members', icon: Users, label: 'Membri Famiglia' },
  { to: '/expenses', icon: Receipt, label: 'Spese Mensili' },
  { to: '/renovation', icon: HardHat, label: 'Ristrutturazione' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/shopping', icon: ShoppingCart, label: 'Spesa giornaliera' },
  { to: '/settings', icon: Settings, label: 'Impostazioni' },
];

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  /** Nav links + user footer, used in both desktop and mobile sidebars */
  const SidebarNav = ({ showLabels, onLinkClick }: { showLabels: boolean; onLinkClick?: () => void }) => (
    <>
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {showLabels && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-700 p-3 space-y-2">
        {showLabels && user && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {showLabels && <span>Esci</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Mobile top bar ── */}
      <div className="fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 flex items-center gap-3 px-4 md:hidden flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-white">CRM Familiare</span>
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-700 flex-shrink-0">
          <span className="font-semibold text-white">CRM Familiare</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <SidebarNav showLabels={true} onLinkClick={() => setMobileOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ── */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-slate-900 text-white transition-all duration-300 ease-in-out flex-shrink-0',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        <div className="flex items-center h-16 px-4 border-b border-slate-700">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-slate-400 hover:text-white hover:bg-slate-800 flex-shrink-0"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {sidebarOpen && (
            <span className="ml-3 font-semibold text-white truncate">CRM Familiare</span>
          )}
        </div>
        <SidebarNav showLabels={sidebarOpen} />
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
