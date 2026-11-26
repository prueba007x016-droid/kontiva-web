import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Select, Badge } from '../components/ui/Form';
import { currency, number } from '../lib/utils';
import { Monitor, Clock, CheckCircle, HelpCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const statusInfo: any = {
  updated: { label: 'Actualizada', color: 'green', icon: CheckCircle },
  pending: { label: 'Pendiente', color: 'amber', icon: Clock },
  error: { label: 'Error', color: 'red', icon: XCircle },
  unknown: { label: 'Desconocido', color: 'slate', icon: HelpCircle },
};

export default function CashRegisters() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [registers, setRegisters] = useState<any[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [history, setHistory] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);

  const load = async () => {
    const [regs, m] = await Promise.all([ds.getCashRegisters(), ds.meta()]);
    setRegisters(regs); setMeta(m);
  };
  useEffect(() => { load(); }, [refreshTick]);

  useEffect(() => {
    if (!selected) { setHistory([]); return; }
    const from = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
    const to = new Date().toISOString().slice(0, 10);
    ds.getSales({ cashRegisterId: selected, dateFrom: from, dateTo: to, pageSize: 10000 }).then(r => {
      const map = new Map<string, number>();
      for (const s of r.data) if (s.status !== 'Cancelada') map.set(s.date, (map.get(s.date) || 0) + s.total);
      setHistory(Array.from(map, ([date, value]) => ({ date, value: Math.round(value * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date)));
    });
  }, [selected]);

  const compareData = registers.map(r => ({ name: r.name, value: Math.round(r.totalToday * 100) / 100 }));

  return (
    <div>
      <Topbar title="Cajas y máquinas" subtitle="Supervisión de cajas conectadas" onRefresh={load} lastUpdated={meta?.lastFetchAt} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {registers.map(r => {
            const info = statusInfo[r.syncStatus] || statusInfo.unknown;
            const Icon = info.icon;
            return (
              <Card key={r.id} className="p-0">
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Monitor size={18} className="text-kontiva-navy" />
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs text-slate-500">{r.branch || '—'}</div>
                      </div>
                    </div>
                    <Badge color={info.color}><Icon size={12} className="mr-1" />{info.label}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><div className="label">Ventas hoy</div><div className="font-bold">{currency(r.salesToday)}</div></div>
                    <div><div className="label">Tickets</div><div className="font-bold">{number(r.ticketsToday)}</div></div>
                    <div><div className="label">Total vendido</div><div className="font-bold">{currency(r.totalToday)}</div></div>
                    <div><div className="label">Última sync</div><div className="text-xs">{new Date(r.lastSync).toLocaleString('es-MX')}</div></div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setSelected(r.id)} className="text-xs text-kontiva-blue hover:underline">Ver historial</button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader><CardTitle>Comparación de ventas entre cajas (hoy)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={compareData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: any) => currency(v)} />
                <Bar dataKey="value" fill="#001637" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historial por caja</CardTitle>
              <Select value={selected} onChange={(e: any) => setSelected(e.target.value)} className="w-48">
                <option value="">Seleccionar caja</option>
                {registers.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? <div className="text-sm text-slate-500">Selecciona una caja para ver su historial.</div> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={history}>
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => currency(v)} />
                  <Bar dataKey="value" fill="#0160c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


