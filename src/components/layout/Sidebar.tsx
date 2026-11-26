import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Monitor, Package, Users, BarChart3, TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth, can } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { cn } from '../../lib/utils';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard' },
  { to: '/ventas', label: 'Ventas', icon: Receipt, perm: 'sales' },
  { to: '/cajas', label: 'Cajas', icon: Monitor, perm: 'registers' },
  { to: '/productos', label: 'Productos', icon: Package, perm: 'products' },
  { to: '/empleados', label: 'Empleados', icon: Users, perm: 'employees' },
  { to: '/reportes', label: 'Reportes', icon: BarChart3, perm: 'reports' },
  { to: '/analisis', label: 'Análisis', icon: TrendingUp, perm: 'analytics' },
  { to: '/configuracion', label: 'Configuración', icon: Settings, perm: 'settings.view' },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useSettings();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className={cn('flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 dark:border-slate-800 dark:bg-slate-900', sidebarCollapsed ? 'w-16' : 'w-64')}>
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <img src={`${import.meta.env.BASE_URL}kontiva_icono.jpg`} alt="KONTIVA" className="h-9 w-9 rounded-lg object-contain" />
        {!sidebarCollapsed && <div className="leading-tight">
          <div className="font-bold text-kontiva-navy dark:text-white">KONTIVA</div>
          <div className="text-[10px] text-slate-500">Panel de ventas</div>
        </div>}
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {nav.map(item => {
          if (!can(user, item.perm)) return null;
          const active = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all', active ? 'bg-gradient-to-r from-kontiva-blue to-kontiva-green text-white shadow-md' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800', sidebarCollapsed && 'justify-center')}>
              <Icon size={18} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 space-y-1">
        <button onClick={toggleSidebar} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" title="Contraer menú">
          {sidebarCollapsed ? <ChevronRight size={18} /> : <><ChevronLeft size={18} /><span>Contraer</span></>}
        </button>
        <button onClick={() => { logout(); navigate('/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
          <LogOut size={18} /> {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}


