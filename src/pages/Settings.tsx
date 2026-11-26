import { useEffect, useState } from 'react';
import { useSettings } from '../store/settings';
import { useAuth } from '../store/auth';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { Button } from '../components/ui/Button';

export default function SettingsPage() {
  const settings = useSettings();
  const { user } = useAuth();
  const [apiUrl, setApiUrl] = useState(settings.apiBaseUrl);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    import('../lib/data/provider').then(({ getDataSource }) => {
      getDataSource().meta().then(setMeta);
    });
  }, []);

  return (
    <div>
      <Topbar title="Configuración" subtitle="Preferencias y conexión de datos" />
      <div className="p-4 space-y-4 max-w-3xl">
        <Card>
          <CardHeader><CardTitle>Apariencia</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tema</span>
              <Select value={settings.theme} onChange={(e: any) => settings.setTheme(e.target.value)} className="w-32">
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Menú lateral</span>
              <Button variant="secondary" onClick={settings.toggleSidebar}>{settings.sidebarCollapsed ? 'Expandir' : 'Contraer'}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Actualización de datos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Actualización automática</span>
              <Select value={settings.autoRefreshMinutes} onChange={(e: any) => settings.setAutoRefresh(Number(e.target.value))} className="w-40">
                <option value={0}>Manual</option>
                <option value={1}>Cada 1 min</option>
                <option value={5}>Cada 5 min</option>
                <option value={15}>Cada 15 min</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fuente de datos</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tipo de fuente</span>
              <Select value={settings.dataSource} onChange={(e: any) => settings.setDataSource(e.target.value)} className="w-40">
                <option value="demo">Demostración</option>
                <option value="api">API REST</option>
                <option value="sheets">Google Sheets</option>
              </Select>
            </div>
            <div>
              <label className="label mb-1 block">URL base de la API</label>
              <Input value={apiUrl} onChange={(e: any) => setApiUrl(e.target.value)} placeholder="https://tu-servidor/api" />
              <p className="text-xs text-slate-500 mt-1">Se utilizará cuando la fuente sea API REST. No se guardan credenciales en el navegador.</p>
            </div>
            <Button onClick={() => settings.setApiBaseUrl(apiUrl)}>Guardar</Button>
            {meta && (
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-sm">
                <div><strong>Modo:</strong> {meta.mode}</div>
                <div><strong>Conectado:</strong> {meta.connected ? 'Sí' : 'No'}</div>
                {meta.message && <div className="text-slate-500 mt-1">{meta.message}</div>}
                {meta.lastSaleAt && <div>Última venta: {new Date(meta.lastSaleAt).toLocaleString('es-MX')}</div>}
                {meta.lastSyncAt && <div>Última sincronización: {new Date(meta.lastSyncAt).toLocaleString('es-MX')}</div>}
                {meta.lastFetchAt && <div>Última consulta: {new Date(meta.lastFetchAt).toLocaleString('es-MX')}</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Integración con infraestructura existente</CardTitle></CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <p>El panel no modifica las bases SQLite, el POS, el servidor, Google Sheets ni la app Android.</p>
            <p>Para conectar datos reales, exponga endpoints seguros (HTTPS) en el servidor existente o un servicio intermedio autorizado que entregue la información consolidada.</p>
            <p>Configure la URL base en la fuente de datos y reemplace el adaptador demo por el adaptador API en <code>src/lib/data/provider.ts</code>.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Perfil de usuario</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div><strong>Usuario:</strong> {user?.username}</div>
            <div><strong>Nombre:</strong> {user?.name}</div>
            <div><strong>Rol:</strong> {user?.role}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


