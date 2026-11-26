import { Bell, Search, Sun, Moon, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useSettings } from '../../store/settings';
import { useAuth } from '../../store/auth';

export default function Topbar({ title, subtitle, onRefresh, lastUpdated, connected = true }: any) {
  const { theme, toggleTheme } = useSettings();
  const { user } = useAuth();
  return (
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800">
          <Search size={14} className="text-slate-400" />
          <input placeholder="Buscar..." className="bg-transparent outline-none w-40" />
        </div>
        <button onClick={onRefresh} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title="Actualizar">
          <RefreshCw size={16} />
        </button>
        <button className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800 relative" title="Notificaciones">
          <Bell size={16} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <button onClick={toggleTheme} className="rounded-xl p-2 hover:bg-slate-100 dark:hover:bg-slate-800" title="Tema">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1 dark:border-slate-700">
          {connected ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
          <span className="text-xs text-slate-500">{lastUpdated ? `Actualizado ${new Date(lastUpdated).toLocaleTimeString('es-MX')}` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-kontiva-navy text-white flex items-center justify-center text-xs font-bold">{user?.name?.[0] || 'U'}</div>
          <div className="hidden md:block text-xs">
            <div className="font-medium">{user?.name}</div>
            <div className="text-slate-500 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}


