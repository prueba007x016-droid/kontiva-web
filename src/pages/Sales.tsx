import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardContent } from '../components/ui/Card';
import { Input, Select, Modal, Badge } from '../components/ui/Form';
import { Button } from '../components/ui/Button';
import { currency } from '../lib/utils';
import { Eye, ChevronLeft, ChevronRight, Printer } from 'lucide-react';

export default function Sales() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [filters, setFilters] = useState<any>({ page: 1, pageSize: 20, sortField: 'date', sortDir: 'desc' });
  const [result, setResult] = useState<any>({ data: [], total: 0 });
  const [registers, setRegisters] = useState<any[]>([]);
  const [cashiers, setCashiers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const [r, regs, m] = await Promise.all([ds.getSales(filters), ds.getCashRegisters(), ds.meta()]);
    setResult(r); setRegisters(regs); setMeta(m);
    // cashiers from employees
    const emps = await ds.getEmployees();
    setCashiers(emps.map((e: any) => e.name));
    setLoading(false);
  };
  useEffect(() => { load(); }, [filters, refreshTick]);

  const setF = (patch: any) => setFilters((f: any) => ({ ...f, ...patch, page: 1 }));
  const totalPages = Math.max(1, Math.ceil(result.total / (filters.pageSize || 20)));

  const sort = (field: string) => {
    setFilters((f: any) => ({
      ...f,
      sortField: field,
      sortDir: f.sortField === field && f.sortDir === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  };

  const openDetail = async (id: string) => {
    const d = await ds.getSaleDetail(id);
    setDetail(d);
  };

  return (
    <div>
      <Topbar title="Ventas" subtitle="Consulta de operaciones realizadas" onRefresh={load} lastUpdated={meta?.lastFetchAt} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <Input placeholder="Buscar ticket o cajero" value={filters.search || ''} onChange={(e: any) => setF({ search: e.target.value })} />
              <Input type="date" value={filters.dateFrom || ''} onChange={(e: any) => setF({ dateFrom: e.target.value })} />
              <Input type="date" value={filters.dateTo || ''} onChange={(e: any) => setF({ dateTo: e.target.value })} />
              <Select value={filters.cashRegisterId || ''} onChange={(e: any) => setF({ cashRegisterId: e.target.value || undefined })}>
                <option value="">Todas las cajas</option>
                {registers.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </Select>
              <Select value={filters.cashier || ''} onChange={(e: any) => setF({ cashier: e.target.value || undefined })}>
                <option value="">Todos los cajeros</option>
                {cashiers.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Select value={filters.paymentMethod || ''} onChange={(e: any) => setF({ paymentMethod: e.target.value || undefined })}>
                <option value="">Todos los pagos</option>
                {['Efectivo', 'Tarjeta', 'Transferencia'].map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <Input type="number" placeholder="Importe mínimo" value={filters.minAmount || ''} onChange={(e: any) => setF({ minAmount: e.target.value ? Number(e.target.value) : undefined })} />
              <Input type="number" placeholder="Importe máximo" value={filters.maxAmount || ''} onChange={(e: any) => setF({ maxAmount: e.target.value ? Number(e.target.value) : undefined })} />
              <Select value={filters.pageSize || 20} onChange={(e: any) => setF({ pageSize: Number(e.target.value) })}>
                {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} por página</option>)}
              </Select>
              <Button variant="secondary" onClick={() => setFilters({ page: 1, pageSize: 20, sortField: 'date', sortDir: 'desc' })}>Limpiar filtros</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    {[
                      { f: 'ticketNumber', l: 'Ticket' },
                      { f: 'date', l: 'Fecha' },
                      { f: 'time', l: 'Hora' },
                      { f: 'cashRegisterName', l: 'Caja' },
                      { f: 'cashier', l: 'Cajero' },
                      { f: 'itemCount', l: 'Productos' },
                      { f: 'subtotal', l: 'Subtotal' },
                      { f: 'discount', l: 'Descuento' },
                      { f: 'tax', l: 'Impuesto' },
                      { f: 'total', l: 'Total' },
                      { f: 'paymentMethod', l: 'Pago' },
                      { f: 'status', l: 'Estado' },
                    ].map(col => (
                      <th key={col.f} className="px-3 py-2 text-left cursor-pointer hover:text-kontiva-navy" onClick={() => sort(col.f)}>{col.l}</th>
                    ))}
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={13} className="text-center py-8 text-slate-400">Cargando...</td></tr>
                  ) : result.data.length === 0 ? (
                    <tr><td colSpan={13} className="text-center py-8 text-slate-400">Sin resultados</td></tr>
                  ) : result.data.map((s: any) => (
                    <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2 font-medium">{s.ticketNumber}</td>
                      <td className="px-3 py-2">{s.date}</td>
                      <td className="px-3 py-2">{s.time}</td>
                      <td className="px-3 py-2">{s.cashRegisterName}</td>
                      <td className="px-3 py-2">{s.cashier}</td>
                      <td className="px-3 py-2 text-center">{s.itemCount}</td>
                      <td className="px-3 py-2">{currency(s.subtotal)}</td>
                      <td className="px-3 py-2">{currency(s.discount)}</td>
                      <td className="px-3 py-2">{currency(s.tax)}</td>
                      <td className="px-3 py-2 font-semibold">{currency(s.total)}</td>
                      <td className="px-3 py-2">{s.paymentMethod}</td>
                      <td className="px-3 py-2">
                        <Badge color={s.status === 'Completada' ? 'green' : 'red'}>{s.status}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <button onClick={() => openDetail(s.id)} className="text-kontiva-blue hover:underline"><Eye size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500">Total: {result.total} ventas</span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" disabled={(filters.page || 1) <= 1} onClick={() => setFilters((f: any) => ({ ...f, page: (f.page || 1) - 1 }))}>
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-sm">{filters.page || 1} / {totalPages}</span>
                <Button variant="secondary" size="sm" disabled={(filters.page || 1) >= totalPages} onClick={() => setFilters((f: any) => ({ ...f, page: (f.page || 1) + 1 }))}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Detalle de venta ${detail?.ticketNumber || ''}`}>
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><div className="label">Fecha</div>{detail.date} {detail.time}</div>
              <div><div className="label">Caja</div>{detail.cashRegisterName}</div>
              <div><div className="label">Cajero</div>{detail.cashier}</div>
              <div><div className="label">Pago</div>{detail.paymentMethod}</div>
              <div><div className="label">Subtotal</div>{currency(detail.subtotal)}</div>
              <div><div className="label">Descuento</div>{currency(detail.discount)}</div>
              <div><div className="label">Impuesto</div>{currency(detail.tax)}</div>
              <div><div className="label">Total</div><strong>{currency(detail.total)}</strong></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                <tr><th className="px-2 py-1 text-left">Producto</th><th className="px-2 py-1 text-left">Código</th><th className="px-2 py-1 text-right">Cant</th><th className="px-2 py-1 text-right">P. Unit</th><th className="px-2 py-1 text-right">Desc</th><th className="px-2 py-1 text-right">Imp</th><th className="px-2 py-1 text-right">Total</th></tr>
              </thead>
              <tbody>
                {detail.items.map((it: any, i: number) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-2 py-1">{it.name}</td>
                    <td className="px-2 py-1 text-slate-500">{it.code}</td>
                    <td className="px-2 py-1 text-right">{it.quantity}</td>
                    <td className="px-2 py-1 text-right">{currency(it.unitPrice)}</td>
                    <td className="px-2 py-1 text-right">{currency(it.discount)}</td>
                    <td className="px-2 py-1 text-right">{currency(it.tax)}</td>
                    <td className="px-2 py-1 text-right font-medium">{currency(it.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => window.print()}><Printer size={14} /> Imprimir</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


