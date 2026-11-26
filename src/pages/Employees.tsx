import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select } from '../components/ui/Form';
import { currency, number } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Employees() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [range, setRange] = useState('30');
  const [employees, setEmployees] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const from = new Date(Date.now() - (parseInt(range) - 1) * 86400000).toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    const [emps, m] = await Promise.all([ds.getEmployees({ from, to }), ds.meta()]);
    setEmployees(emps); setMeta(m); setLoading(false);
  };
  useEffect(() => { load(); }, [range, refreshTick]);

  const chartData = employees.map(e => ({ name: e.name.split(' ')[0], total: e.totalSales, tickets: e.tickets }));

  return (
    <div>
      <Topbar title="Empleados y cajeros" subtitle="Rendimiento del personal" onRefresh={load} lastUpdated={meta?.lastFetchAt} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Periodo:</span>
          <Select value={range} onChange={(e: any) => setRange(e.target.value)} className="w-32">
            <option value="7">7 días</option>
            <option value="30">30 días</option>
            <option value="90">90 días</option>
          </Select>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Empleado</th>
                    <th className="px-3 py-2 text-left">Caja asignada</th>
                    <th className="px-3 py-2 text-right">Tickets</th>
                    <th className="px-3 py-2 text-right">Total de ventas</th>
                    <th className="px-3 py-2 text-right">Ticket promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={5} className="text-center py-8 text-slate-400">Cargando...</td></tr> :
                    employees.map(e => (
                      <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-medium">{e.name}</td>
                        <td className="px-3 py-2">{e.cashRegister}</td>
                        <td className="px-3 py-2 text-right">{number(e.tickets)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{currency(e.totalSales)}</td>
                        <td className="px-3 py-2 text-right">{currency(e.avgTicket)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Ventas por empleado</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => currency(v)} />
                  <Bar dataKey="total" fill="#002060" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Tickets por empleado</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="tickets" fill="#0066cc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


