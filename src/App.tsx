import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettings } from './store/settings';
import { useAuth } from './store/auth';
import AppShell from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import CashRegisters from './pages/CashRegisters';
import Products from './pages/Products';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';

function Guard({ children }: any) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { theme, autoRefreshMinutes, bumpRefresh } = useSettings();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  useEffect(() => {
    if (!autoRefreshMinutes) return;
    const id = setInterval(() => bumpRefresh(), autoRefreshMinutes * 60000);
    return () => clearInterval(id);
  }, [autoRefreshMinutes, bumpRefresh]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<Guard><AppShell><Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ventas" element={<Sales />} />
        <Route path="/cajas" element={<CashRegisters />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/empleados" element={<Employees />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/analisis" element={<Analytics />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></AppShell></Guard>} />
    </Routes>
  );
}


