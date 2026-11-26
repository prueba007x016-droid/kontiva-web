import {
  getDemoSales, getDemoRegisters, getDemoProducts, getDemoEmployees,
  getLastSaleAt, getLastFetchAt, markFetched, getDemoSaleDetail,
} from './demo';
import type { DataSource } from './source';
import type {
  SaleFilters, SalesResult, DashboardSummary, HourlyPoint, DailyPoint,
  PeriodComparison, PaymentBreakdown,
} from '../types';
import { daysAgoISO, todayISO } from '../utils';

function inRange(date: string, from?: string, to?: string) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export const demoSource: DataSource = {
  async meta() {
    markFetched();
    return {
      mode: 'DEMO',
      lastSaleAt: getLastSaleAt(),
      lastSyncAt: getDemoRegisters().reduce((a, r) => (r.lastSync > a ? r.lastSync : a), ''),
      lastFetchAt: getLastFetchAt(),
      connected: true,
      message: 'Modo demostración: los datos mostrados son generados localmente para validar el panel. Conecte una fuente real en Configuración.',
    };
  },
  async refresh() { markFetched(); },
  async getCashRegisters() { return getDemoRegisters(); },
  async getSales(filters: SaleFilters): Promise<SalesResult> {
    let data = getDemoSales().filter(s => s.status !== undefined);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(s => s.ticketNumber.toLowerCase().includes(q) || s.cashier.toLowerCase().includes(q));
    }
    if (filters.dateFrom) data = data.filter(s => s.date >= filters.dateFrom!);
    if (filters.dateTo) data = data.filter(s => s.date <= filters.dateTo!);
    if (filters.cashRegisterId) data = data.filter(s => s.cashRegisterId === filters.cashRegisterId);
    if (filters.cashier) data = data.filter(s => s.cashier === filters.cashier);
    if (filters.paymentMethod) data = data.filter(s => s.paymentMethod === filters.paymentMethod);
    if (filters.minAmount != null) data = data.filter(s => s.total >= filters.minAmount!);
    if (filters.maxAmount != null) data = data.filter(s => s.total <= filters.maxAmount!);
    const field = filters.sortField || 'date';
    const dir = filters.sortDir || 'desc';
    data = [...data].sort((a, b) => {
      const av = a[field] as any; const bv = b[field] as any;
      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    // secondary sort by time desc when date
    const total = data.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 25;
    const start = (page - 1) * pageSize;
    return { data: data.slice(start, start + pageSize), total, page, pageSize };
  },
  async getSaleDetail(id) { return getDemoSaleDetail(id); },
  async getProducts(search, category) {
    let p = getDemoProducts();
    if (search) {
      const q = search.toLowerCase();
      p = p.filter(x => x.name.toLowerCase().includes(q) || x.code.toLowerCase().includes(q) || (x.barcode || '').includes(q));
    }
    if (category && category !== 'Todas') p = p.filter(x => x.category === category);
    return p;
  },
  async getEmployees(range) { return getDemoEmployees(range); },
  async getDashboard(range) {
    const from = range?.from || daysAgoISO(29);
    const to = range?.to || todayISO();
    const sales = getDemoSales().filter(s => s.status !== 'Cancelada' && inRange(s.date, from, to));
    const today = todayISO();
    const yesterday = daysAgoISO(1);
    const weekFrom = daysAgoISO(6);
    const monthFrom = daysAgoISO(29);
    const yearFrom = daysAgoISO(364);
    const sum = (f: string, t: string) => getDemoSales().filter(s => s.status !== 'Cancelada' && inRange(s.date, f, t)).reduce((a, s) => a + s.total, 0);
    const todayVal = sum(today, today);
    const yesterdayVal = sum(yesterday, yesterday);
    const weekVal = sum(weekFrom, today);
    const monthVal = sum(monthFrom, today);
    const yearVal = sum(yearFrom, today);
    const tickets = sales.length;
    const avgTicket = tickets ? sales.reduce((a, s) => a + s.total, 0) / tickets : 0;
    const productsSold = sales.reduce((a, s) => a + s.itemCount, 0);
    // estimated profit
    const prods = getDemoProducts();
    const costMap = new Map(prods.map(p => [p.code, p.cost || 0]));
    let cost = 0;
    for (const s of sales) {
      const detail = getDemoSaleDetail(s.id);
      if (detail) for (const it of detail.items) cost += (costMap.get(it.code) || 0) * it.quantity;
    }
    const revenue = sales.reduce((a, s) => a + s.total, 0);
    const estimatedProfit = Math.round((revenue - cost) * 100) / 100;

    // hourly
    const hourMap = new Map<string, number>();
    for (let h = 0; h < 24; h++) hourMap.set(`${String(h).padStart(2, '0')}:00`, 0);
    for (const s of sales) hourMap.set(`${s.time.slice(0, 2)}:00`, (hourMap.get(`${s.time.slice(0, 2)}:00`) || 0) + s.total);
    const hourly: HourlyPoint[] = Array.from(hourMap, ([hour, value]) => ({ hour, value: Math.round(value * 100) / 100 }));

    // daily
    const dayMap = new Map<string, number>();
    for (const s of sales) dayMap.set(s.date, (dayMap.get(s.date) || 0) + s.total);
    const daily: DailyPoint[] = Array.from(dayMap, ([date, value]) => ({ date, value: Math.round(value * 100) / 100 })).sort((a, b) => a.date.localeCompare(b.date));

    // by register
    const regMap = new Map<string, number>();
    for (const s of sales) regMap.set(s.cashRegisterName || s.cashRegisterId, (regMap.get(s.cashRegisterName || s.cashRegisterId) || 0) + s.total);
    const byRegister = Array.from(regMap, ([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));

    // by payment
    const payMap = new Map<string, { count: number; total: number }>();
    for (const s of sales) {
      const cur = payMap.get(s.paymentMethod) || { count: 0, total: 0 };
      cur.count++; cur.total += s.total; payMap.set(s.paymentMethod, cur);
    }
    const byPayment: PaymentBreakdown[] = Array.from(payMap, ([method, v]) => ({ method, count: v.count, total: Math.round(v.total * 100) / 100 }));

    const growth = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : 0);
    const comparison: PeriodComparison[] = [
      { label: 'Hoy vs Ayer', current: todayVal, previous: yesterdayVal },
      { label: 'Esta semana vs anterior', current: weekVal, previous: sum(daysAgoISO(13), daysAgoISO(7)) },
      { label: 'Este mes vs anterior', current: monthVal, previous: sum(daysAgoISO(59), daysAgoISO(30)) },
    ];

    const summary: DashboardSummary = {
      today: Math.round(todayVal * 100) / 100,
      yesterday: Math.round(yesterdayVal * 100) / 100,
      week: Math.round(weekVal * 100) / 100,
      month: Math.round(monthVal * 100) / 100,
      year: Math.round(yearVal * 100) / 100,
      tickets,
      avgTicket: Math.round(avgTicket * 100) / 100,
      productsSold,
      estimatedProfit,
      growthToday: Math.round(growth(todayVal, yesterdayVal) * 10) / 10,
      growthWeek: Math.round(growth(weekVal, sum(daysAgoISO(13), daysAgoISO(7))) * 10) / 10,
      growthMonth: Math.round(growth(monthVal, sum(daysAgoISO(59), daysAgoISO(30))) * 10) / 10,
    };
    return { summary, hourly, daily, byRegister, byPayment, comparison };
  },
  async getAnalytics(range) {
    const from = range?.from || daysAgoISO(29);
    const to = range?.to || todayISO();
    const d = await this.getDashboard(range);
    const sales = getDemoSales().filter(s => s.status !== 'Cancelada' && inRange(s.date, from, to));
    // top days
    const topDays = [...d.daily].sort((a, b) => b.value - a.value).slice(0, 7);
    // top hours
    const topHours = [...d.hourly].sort((a, b) => b.value - a.value).slice(0, 6);
    // top products
    const prodMap = new Map<string, number>();
    for (const s of sales) {
      const det = getDemoSaleDetail(s.id);
      if (det) for (const it of det.items) prodMap.set(it.name, (prodMap.get(it.name) || 0) + it.total);
    }
    const topProducts = Array.from(prodMap, ([name, value]) => ({ name, value: Math.round(value * 100) / 100 })).sort((a, b) => b.value - a.value).slice(0, 10);
    // product share (top 6 + otros)
    const sorted = [...topProducts];
    const top6 = sorted.slice(0, 6);
    const rest = sorted.slice(6).reduce((a, p) => a + p.value, 0);
    const productShare = rest > 0 ? [...top6, { name: 'Otros', value: Math.round(rest * 100) / 100 }] : top6;
    const registerShare = d.byRegister;
    const evolution = d.daily;
    // avg ticket trend by day
    const dayGroups = new Map<string, { total: number; tickets: number }>();
    for (const s of sales) {
      const cur = dayGroups.get(s.date) || { total: 0, tickets: 0 };
      cur.total += s.total; cur.tickets++; dayGroups.set(s.date, cur);
    }
    const avgTicketTrend: DailyPoint[] = Array.from(dayGroups, ([date, v]) => ({ date, value: v.tickets ? Math.round((v.total / v.tickets) * 100) / 100 : 0 })).sort((a, b) => a.date.localeCompare(b.date));
    return { evolution, topDays, topHours, topProducts, registerShare, avgTicketTrend, productShare };
  },
  async getReports(params) {
    const { type, from, to, cashRegisterId, cashier, category, paymentMethod } = params || {};
    let rows: any[] = [];
    let columns: string[] = [];
    const sales = getDemoSales().filter(s => s.status !== 'Cancelada' && inRange(s.date, from || daysAgoISO(29), to || todayISO()));
    const filtered = sales.filter(s =>
      (!cashRegisterId || s.cashRegisterId === cashRegisterId) &&
      (!cashier || s.cashier === cashier) &&
      (!paymentMethod || s.paymentMethod === paymentMethod)
    );
    if (type === 'daily' || type === 'weekly' || type === 'monthly' || type === 'yearly') {
      const keyFn = (s: any) => type === 'daily' ? s.date : type === 'weekly' ? s.date.slice(0, 7) + '-W' + Math.ceil(parseInt(s.date.slice(8)) / 7) : type === 'monthly' ? s.date.slice(0, 7) : s.date.slice(0, 4);
      const map = new Map<string, { tickets: number; total: number }>();
      for (const s of filtered) { const k = keyFn(s); const c = map.get(k) || { tickets: 0, total: 0 }; c.tickets++; c.total += s.total; map.set(k, c); }
      rows = Array.from(map, ([periodo, v]) => ({ periodo, tickets: v.tickets, total: Math.round(v.total * 100) / 100 }));
      columns = ['periodo', 'tickets', 'total'];
    } else if (type === 'byRegister') {
      const map = new Map<string, { tickets: number; total: number }>();
      for (const s of filtered) { const k = s.cashRegisterName || s.cashRegisterId; const c = map.get(k) || { tickets: 0, total: 0 }; c.tickets++; c.total += s.total; map.set(k, c); }
      rows = Array.from(map, ([caja, v]) => ({ caja, tickets: v.tickets, total: Math.round(v.total * 100) / 100 }));
      columns = ['caja', 'tickets', 'total'];
    } else if (type === 'byEmployee') {
      const map = new Map<string, { tickets: number; total: number }>();
      for (const s of filtered) { const c = map.get(s.cashier) || { tickets: 0, total: 0 }; c.tickets++; c.total += s.total; map.set(s.cashier, c); }
      rows = Array.from(map, ([empleado, v]) => ({ empleado, tickets: v.tickets, total: Math.round(v.total * 100) / 100, ticketPromedio: v.tickets ? Math.round((v.total / v.tickets) * 100) / 100 : 0 }));
      columns = ['empleado', 'tickets', 'total', 'ticketPromedio'];
    } else if (type === 'byProduct' || type === 'topProducts' || type === 'bottomProducts') {
      const map = new Map<string, { name: string; category: string; units: number; total: number }>();
      for (const s of filtered) {
        const det = getDemoSaleDetail(s.id);
        if (!det) continue;
        for (const it of det.items) {
          if (category && category !== 'Todas' && it.category !== category) continue;
          const cur = map.get(it.code) || { name: it.name, category: it.category || '', units: 0, total: 0 };
          cur.units += it.quantity; cur.total += it.total; map.set(it.code, cur);
        }
      }
      let arr = Array.from(map, ([code, v]) => ({ codigo: code, producto: v.name, categoria: v.category, unidades: v.units, total: Math.round(v.total * 100) / 100 }));
      arr.sort((a, b) => type === 'bottomProducts' ? a.unidades - b.unidades : b.total - a.total);
      if (type === 'topProducts') arr = arr.slice(0, 10);
      if (type === 'bottomProducts') arr = arr.slice(0, 10);
      rows = arr; columns = ['codigo', 'producto', 'categoria', 'unidades', 'total'];
    } else if (type === 'byCategory') {
      const map = new Map<string, { units: number; total: number }>();
      for (const s of filtered) {
        const det = getDemoSaleDetail(s.id);
        if (!det) continue;
        for (const it of det.items) {
          const cur = map.get(it.category || 'Sin categoría') || { units: 0, total: 0 };
          cur.units += it.quantity; cur.total += it.total; map.set(it.category || 'Sin categoría', cur);
        }
      }
      rows = Array.from(map, ([categoria, v]) => ({ categoria, unidades: v.units, total: Math.round(v.total * 100) / 100 }));
      columns = ['categoria', 'unidades', 'total'];
    } else if (type === 'byPayment') {
      const map = new Map<string, { tickets: number; total: number }>();
      for (const s of filtered) { const c = map.get(s.paymentMethod) || { tickets: 0, total: 0 }; c.tickets++; c.total += s.total; map.set(s.paymentMethod, c); }
      rows = Array.from(map, ([metodo, v]) => ({ metodo, tickets: v.tickets, total: Math.round(v.total * 100) / 100 }));
      columns = ['metodo', 'tickets', 'total'];
    } else if (type === 'comparison') {
      const prevFrom = daysAgoISO(60); const prevTo = daysAgoISO(31);
      const curTotal = filtered.reduce((a, s) => a + s.total, 0);
      const prev = getDemoSales().filter(s => s.status !== 'Cancelada' && inRange(s.date, prevFrom, prevTo)).reduce((a, s) => a + s.total, 0);
      rows = [{ periodo: 'Actual', total: Math.round(curTotal * 100) / 100 }, { periodo: 'Anterior', total: Math.round(prev * 100) / 100 }];
      columns = ['periodo', 'total'];
    } else {
      // default sales list
      rows = filtered.slice(0, 500).map(s => ({ ticket: s.ticketNumber, fecha: s.date, hora: s.time, caja: s.cashRegisterName, cajero: s.cashier, total: s.total, pago: s.paymentMethod, estado: s.status }));
      columns = ['ticket', 'fecha', 'hora', 'caja', 'cajero', 'total', 'pago', 'estado'];
    }
    return { rows, columns };
  },
};


