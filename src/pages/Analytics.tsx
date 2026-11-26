import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Form';
import { currency } from '../lib/utils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#002060', '#0066cc', '#00b040', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [range, setRange] = useState('30');
  const [data, setData] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const from = new Date(Date.now() - (parseInt(range) - 1) * 86400000).toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    const [a, m] = await Promise.all([ds.getAnalytics({ from, to }), ds.meta()]);
    setData(a); setMeta(m); setLoading(false);
  };
  useEffect(() => { load(); }, [range, refreshTick]);

  return (
    <div>
      <Topbar title="Análisis comercial" subtitle="Estadísticas y tendencias del negocio" onRefresh={load} lastUpdated={meta?.lastFetchAt} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Periodo:</span>
          <Select value={range} onChange={(e: any) => setRange(e.target.value)} className="w-32">
            <option value="7">7 días</option>
            <option value="30">30 días</option>
            <option value="90">90 días</option>
          </Select>
        </div>

        {loading && <div className="text-slate-400">Cargando...</div>}

        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle>Evolución de ventas</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.evolution}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Line type="monotone" dataKey="value" stroke="#002060" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Ticket promedio por día</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.avgTicketTrend}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Line type="monotone" dataKey="value" stroke="#0066cc" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Días con mayores ventas</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.topDays}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Bar dataKey="value" fill="#00b040" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Horarios de mayor actividad</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.topHours}>
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Productos con mejor desempeño</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.topProducts} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={120} />
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Bar dataKey="value" fill="#002060" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Distribución de ventas por caja</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.registerShare} dataKey="value" nameKey="name" outerRadius={90} label>
                      {data.registerShare.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => currency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Participación de productos en las ventas</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={data.productShare} dataKey="value" nameKey="name" outerRadius={90} label>
                      {data.productShare.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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


