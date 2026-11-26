import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { currency, number } from '../lib/utils';
import { RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#002060', '#0066cc', '#00b040', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [range, setRange] = useState('30');
  const [data, setData] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();

  const load = async () => {
    setLoading(true);
    try {
      const from = range === '1' ? new Date().toISOString().slice(0, 10) : new Date(Date.now() - (parseInt(range) - 1) * 86400000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      const [d, m] = await Promise.all([ds.getDashboard({ from, to }), ds.meta()]);
      setData(d); setMeta(m); setLastUpdated(m.lastFetchAt);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [range, refreshTick]);

  const s = data?.summary;
  const trendCard = (label: string, value: number, growth?: number) => (
    <Card>
      <CardContent className="pt-5">
        <div className="label mb-1">{label}</div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{currency(value)}</div>
        {growth != null && (
          <div className={`text-xs mt-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)}% vs periodo anterior
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Resumen de ventas y desempeño" onRefresh={load} lastUpdated={lastUpdated} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        {meta?.mode === 'DEMO' && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200">
            Modo demostración: datos generados localmente. Conecte una fuente real en Configuración.
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Periodo:</span>
          {[
            { v: '1', l: 'Hoy' }, { v: '7', l: '7 días' }, { v: '30', l: '30 días' }, { v: '90', l: '90 días' },
          ].map(o => (
            <button key={o.v} onClick={() => setRange(o.v)} className={`rounded-xl px-3 py-1.5 text-sm ${range === o.v ? 'bg-kontiva-navy text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{o.l}</button>
          ))}
          {loading && <RefreshCw className="animate-spin text-slate-400" size={16} />}
        </div>

        {s && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendCard('Ventas de hoy', s.today, s.growthToday)}
            {trendCard('Ventas de la semana', s.week, s.growthWeek)}
            {trendCard('Ventas del mes', s.month, s.growthMonth)}
            {trendCard('Ventas del año', s.year)}
            <Card><CardContent className="pt-5"><div className="label mb-1">Ventas de ayer</div><div className="text-2xl font-bold">{currency(s.yesterday)}</div></CardContent></Card>
            <Card><CardContent className="pt-5"><div className="label mb-1">Número de tickets</div><div className="text-2xl font-bold">{number(s.tickets)}</div></CardContent></Card>
            <Card><CardContent className="pt-5"><div className="label mb-1">Ticket promedio</div><div className="text-2xl font-bold">{currency(s.avgTicket)}</div></CardContent></Card>
            <Card><CardContent className="pt-5"><div className="label mb-1">Productos vendidos</div><div className="text-2xl font-bold">{number(s.productsSold)}</div></CardContent></Card>
            {s.estimatedProfit != null && (
              <Card><CardContent className="pt-5"><div className="label mb-1">Ganancia estimada</div><div className="text-2xl font-bold">{currency(s.estimatedProfit)}</div><div className="text-xs text-slate-500 mt-1">Requiere costos reales</div></CardContent></Card>
            )}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Ventas por hora</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.hourly}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Bar dataKey="value" fill="#0066cc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Ventas por día</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.daily}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Line type="monotone" dataKey="value" stroke="#002060" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Distribución por caja</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.byRegister} dataKey="value" nameKey="name" outerRadius={90} label>
                      {data.byRegister.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Distribución por método de pago</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.byPayment} dataKey="total" nameKey="method" outerRadius={90} label>
                      {data.byPayment.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


