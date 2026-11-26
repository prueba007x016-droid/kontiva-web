import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardContent } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Form';
import { Button } from '../components/ui/Button';
import { toCSV, toExcel, toPDF } from '../lib/export';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const REPORTS = [
  { v: 'daily', l: 'Ventas diarias' },
  { v: 'weekly', l: 'Ventas semanales' },
  { v: 'monthly', l: 'Ventas mensuales' },
  { v: 'yearly', l: 'Ventas anuales' },
  { v: 'byRegister', l: 'Ventas por caja' },
  { v: 'byEmployee', l: 'Ventas por empleado' },
  { v: 'byProduct', l: 'Ventas por producto' },
  { v: 'topProducts', l: 'Productos más vendidos' },
  { v: 'bottomProducts', l: 'Productos menos vendidos' },
  { v: 'byCategory', l: 'Ventas por categoría' },
  { v: 'byPayment', l: 'Ventas por método de pago' },
  { v: 'comparison', l: 'Comparación de periodos' },
];

export default function Reports() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [type, setType] = useState('daily');
  const [from, setFrom] = useState(new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10));
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [cashRegisterId, setCashRegisterId] = useState('');
  const [cashier, setCashier] = useState('');
  const [category, setCategory] = useState('Todas');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [registers, setRegisters] = useState<any[]>([]);
  const [cashiers, setCashiers] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['Todas']);
  const [result, setResult] = useState<{ rows: any[]; columns: string[] }>({ rows: [], columns: [] });
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const [regs, emps, prods, m] = await Promise.all([ds.getCashRegisters(), ds.getEmployees(), ds.getProducts(), ds.meta()]);
      setRegisters(regs);
      setCashiers(emps.map((e: any) => e.name));
      setCategories(['Todas', ...Array.from(new Set(prods.map((p: any) => p.category)))]);
      setMeta(m);
    })();
  }, []);

  const generate = async () => {
    setLoading(true);
    const r = await ds.getReports({ type, from, to, cashRegisterId: cashRegisterId || undefined, cashier: cashier || undefined, category, paymentMethod: paymentMethod || undefined });
    setResult(r);
    setLoading(false);
  };
  useEffect(() => { generate(); }, [refreshTick]);

  const cols = result.columns.length ? result.columns : [];
  const rows = result.rows;

  return (
    <div>
      <Topbar title="Reportes" subtitle="Generación y exportación de reportes" onRefresh={generate} lastUpdated={meta?.lastFetchAt} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Select value={type} onChange={(e: any) => setType(e.target.value)}>
                {REPORTS.map(r => <option key={r.v} value={r.v}>{r.l}</option>)}
              </Select>
              <Input type="date" value={from} onChange={(e: any) => setFrom(e.target.value)} />
              <Input type="date" value={to} onChange={(e: any) => setTo(e.target.value)} />
              <Select value={cashRegisterId} onChange={(e: any) => setCashRegisterId(e.target.value)}>
                <option value="">Todas las cajas</option>
                {registers.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
              <Select value={cashier} onChange={(e: any) => setCashier(e.target.value)}>
                <option value="">Todos los cajeros</option>
                {cashiers.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={paymentMethod} onChange={(e: any) => setPaymentMethod(e.target.value)}>
                <option value="">Todos los pagos</option>
                {['Efectivo', 'Tarjeta', 'Transferencia'].map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <Select value={category} onChange={(e: any) => setCategory(e.target.value)} className="w-48">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Button onClick={generate} disabled={loading}>{loading ? 'Generando...' : 'Generar reporte'}</Button>
              <div className="flex-1" />
              <Button variant="secondary" onClick={() => toCSV(rows, cols, 'reporte.csv')}><Download size={14} /> CSV</Button>
              <Button variant="secondary" onClick={() => toExcel(rows, cols, 'reporte.xlsx')}><FileSpreadsheet size={14} /> Excel</Button>
              <Button variant="secondary" onClick={() => toPDF(rows, cols, 'reporte.pdf', 'Reporte KONTIVA')}><FileText size={14} /> PDF</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>{cols.map(c => <th key={c} className="px-3 py-2 text-left">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={cols.length || 1} className="text-center py-8 text-slate-400">Cargando...</td></tr> :
                    rows.length === 0 ? <tr><td colSpan={cols.length || 1} className="text-center py-8 text-slate-400">Sin datos</td></tr> :
                    rows.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                        {cols.map(c => <td key={c} className="px-3 py-2">{String(r[c] ?? '')}</td>)}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-xs text-slate-500">Filas: {rows.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


