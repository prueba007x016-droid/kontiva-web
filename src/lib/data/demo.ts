// Demo data generator. Clearly labeled as DEMO in meta().
import type {
  Sale, SaleDetail, SaleItem, CashRegister, Product, Employee,
} from '../types';

// seeded PRNG
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261126);

const registers: CashRegister[] = [
  { id: 'C1', name: 'Caja 1', branch: 'Sucursal Centro', salesToday: 0, ticketsToday: 0, totalToday: 0, lastSync: new Date().toISOString(), syncStatus: 'updated' },
  { id: 'C2', name: 'Caja 2', branch: 'Sucursal Centro', salesToday: 0, ticketsToday: 0, totalToday: 0, lastSync: new Date().toISOString(), syncStatus: 'updated' },
  { id: 'C3', name: 'Caja 3', branch: 'Sucursal Norte', salesToday: 0, ticketsToday: 0, totalToday: 0, lastSync: new Date(Date.now() - 45 * 60000).toISOString(), syncStatus: 'pending' },
  { id: 'C4', name: 'Caja 4', branch: 'Sucursal Norte', salesToday: 0, ticketsToday: 0, totalToday: 0, lastSync: new Date(Date.now() - 10 * 60000).toISOString(), syncStatus: 'updated' },
  { id: 'C5', name: 'Caja 5', branch: 'Sucursal Sur', salesToday: 0, ticketsToday: 0, totalToday: 0, lastSync: new Date(Date.now() - 3 * 3600000).toISOString(), syncStatus: 'error' },
];

const employees = [
  { id: 'E1', name: 'María López', reg: 'C1' },
  { id: 'E2', name: 'Carlos Hernández', reg: 'C2' },
  { id: 'E3', name: 'Ana Torres', reg: 'C3' },
  { id: 'E4', name: 'Jorge Ramírez', reg: 'C4' },
  { id: 'E5', name: 'Lucía Méndez', reg: 'C5' },
  { id: 'E6', name: 'Pedro Sánchez', reg: 'C1' },
];

const products = [
  { code: 'P001', barcode: '750100000001', name: 'Café Americano', category: 'Bebidas', price: 45, cost: 18 },
  { code: 'P002', barcode: '750100000002', name: 'Cappuccino', category: 'Bebidas', price: 55, cost: 22 },
  { code: 'P003', barcode: '750100000003', name: 'Latte', category: 'Bebidas', price: 60, cost: 24 },
  { code: 'P004', barcode: '750100000004', name: 'Jugo de Naranja', category: 'Bebidas', price: 40, cost: 15 },
  { code: 'P005', barcode: '750100000005', name: 'Agua Mineral', category: 'Bebidas', price: 25, cost: 8 },
  { code: 'P006', barcode: '750100000006', name: 'Pan Dulce', category: 'Panadería', price: 20, cost: 7 },
  { code: 'P007', barcode: '750100000007', name: 'Croissant', category: 'Panadería', price: 35, cost: 12 },
  { code: 'P008', barcode: '750100000008', name: 'Sandwich de Jamón', category: 'Comida', price: 75, cost: 30 },
  { code: 'P009', barcode: '750100000009', name: 'Ensalada César', category: 'Comida', price: 95, cost: 40 },
  { code: 'P010', barcode: '750100000010', name: 'Hamburguesa Clásica', category: 'Comida', price: 120, cost: 50 },
  { code: 'P011', barcode: '750100000011', name: 'Papas Fritas', category: 'Comida', price: 45, cost: 15 },
  { code: 'P012', barcode: '750100000012', name: 'Galletas', category: 'Snacks', price: 18, cost: 6 },
  { code: 'P013', barcode: '750100000013', name: 'Chocolate', category: 'Snacks', price: 30, cost: 12 },
  { code: 'P014', barcode: '750100000014', name: 'Chicles', category: 'Snacks', price: 10, cost: 3 },
  { code: 'P015', barcode: '750100000015', name: 'Refresco 355ml', category: 'Bebidas', price: 28, cost: 10 },
  { code: 'P016', barcode: '750100000016', name: 'Té Helado', category: 'Bebidas', price: 38, cost: 14 },
  { code: 'P017', barcode: '750100000017', name: 'Yogurt', category: 'Lácteos', price: 32, cost: 13 },
  { code: 'P018', barcode: '750100000018', name: 'Leche 1L', category: 'Lácteos', price: 28, cost: 18 },
  { code: 'P019', barcode: '750100000019', name: 'Queso Panela', category: 'Lácteos', price: 65, cost: 35 },
  { code: 'P020', barcode: '750100000020', name: 'Tortilla de Harina', category: 'Panadería', price: 15, cost: 5 },
];

const payments = ['Efectivo', 'Tarjeta', 'Transferencia'];
const statuses = ['Completada', 'Completada', 'Completada', 'Cancelada'];

export interface DemoSale extends Sale { items: SaleItem[]; }

let cachedSales: DemoSale[] | null = null;
let lastFetch = new Date().toISOString();

function genSales(): DemoSale[] {
  if (cachedSales) return cachedSales;
  const out: DemoSale[] = [];
  const today = new Date();
  let counter = 1;
  for (let d = 89; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(date.getDate() - d);
    const iso = date.toISOString().slice(0, 10);
    // weekend boost
    const dow = date.getDay();
    const base = dow === 0 || dow === 6 ? 70 : 45;
    const n = Math.round(base + rnd() * 40);
    for (let i = 0; i < n; i++) {
      const reg = registers[Math.floor(rnd() * registers.length)];
      const emp = employees.filter(e => e.reg === reg.id);
      const cashier = (emp.length ? emp[Math.floor(rnd() * emp.length)] : employees[Math.floor(rnd() * employees.length)]).name;
      // hour distribution: peak 10-14 and 17-20
      let hour = Math.floor(rnd() * 14) + 7;
      const r = rnd();
      if (r < 0.35) hour = 10 + Math.floor(rnd() * 5);
      else if (r < 0.6) hour = 17 + Math.floor(rnd() * 4);
      const minute = Math.floor(rnd() * 60);
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      // items
      const itemCount = 1 + Math.floor(rnd() * 4);
      const items: SaleItem[] = [];
      const chosen = new Set<number>();
      while (chosen.size < itemCount) chosen.add(Math.floor(rnd() * products.length));
      let subtotal = 0;
      for (const idx of chosen) {
        const p = products[idx];
        const qty = 1 + Math.floor(rnd() * 3);
        const lineSub = p.price * qty;
        const disc = rnd() < 0.15 ? Math.round(lineSub * 0.1) : 0;
        const tax = Math.round((lineSub - disc) * 0.16 * 100) / 100;
        const total = Math.round((lineSub - disc + tax) * 100) / 100;
        subtotal += lineSub;
        items.push({
          productId: p.code, code: p.code, barcode: p.barcode, name: p.name, category: p.category,
          quantity: qty, unitPrice: p.price, discount: disc, tax, total,
        });
      }
      const discount = Math.round(subtotal * (rnd() < 0.2 ? 0.05 : 0) * 100) / 100;
      const tax = Math.round((subtotal - discount) * 0.16 * 100) / 100;
      const total = Math.round((subtotal - discount + tax) * 100) / 100;
      const status = statuses[Math.floor(rnd() * statuses.length)];
      const id = `S${String(counter).padStart(6, '0')}`;
      out.push({
        id,
        ticketNumber: `T-${String(counter).padStart(6, '0')}`,
        date: iso,
        time,
        cashRegisterId: reg.id,
        cashRegisterName: reg.name,
        branch: reg.branch,
        cashier,
        itemCount,
        subtotal: Math.round(subtotal * 100) / 100,
        discount,
        tax,
        total: status === 'Cancelada' ? 0 : total,
        paymentMethod: payments[Math.floor(rnd() * payments.length)],
        status,
        items,
      });
      counter++;
    }
  }
  cachedSales = out;
  lastFetch = new Date().toISOString();
  return out;
}

export function getDemoSales(): DemoSale[] { return genSales(); }
export function getDemoRegisters(): CashRegister[] {
  // compute today totals
  const today = new Date().toISOString().slice(0, 10);
  const sales = genSales().filter(s => s.date === today && s.status !== 'Cancelada');
  for (const r of registers) {
    const rs = sales.filter(s => s.cashRegisterId === r.id);
    r.salesToday = rs.reduce((a, s) => a + s.total, 0);
    r.ticketsToday = rs.length;
    r.totalToday = r.salesToday;
  }
  return registers;
}
export function getDemoProducts(): Product[] {
  const sales = genSales().filter(s => s.status !== 'Cancelada');
  const agg = new Map<string, { units: number; rev: number }>();
  for (const s of sales) for (const it of s.items) {
    const cur = agg.get(it.code) || { units: 0, rev: 0 };
    cur.units += it.quantity;
    cur.rev += it.total;
    agg.set(it.code, cur);
  }
  return products.map(p => {
    const a = agg.get(p.code) || { units: 0, rev: 0 };
    // stock random
    const stock = Math.round(20 + rnd() * 80);
    return {
      code: p.code, barcode: p.barcode, name: p.name, category: p.category,
      price: p.price, cost: p.cost, stock, unitsSold: a.units, revenue: Math.round(a.rev * 100) / 100,
    };
  });
}
export function getDemoEmployees(range?: { from: string; to: string }): Employee[] {
  const sales = genSales().filter(s => s.status !== 'Cancelada');
  const filtered = range ? sales.filter(s => s.date >= range.from && s.date <= range.to) : sales;
  return employees.map(e => {
    const es = filtered.filter(s => s.cashier === e.name);
    const total = es.reduce((a, s) => a + s.total, 0);
    return {
      id: e.id, name: e.name, cashRegister: e.reg,
      tickets: es.length,
      totalSales: Math.round(total * 100) / 100,
      avgTicket: es.length ? Math.round((total / es.length) * 100) / 100 : 0,
    };
  });
}
export function getLastSaleAt(): string {
  const sales = genSales().filter(s => s.status !== 'Cancelada');
  const sorted = [...sales].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const last = sorted[sorted.length - 1];
  return last ? `${last.date}T${last.time}:00` : new Date().toISOString();
}
export function getLastFetchAt(): string { return lastFetch; }
export function markFetched() { lastFetch = new Date().toISOString(); }
export function getDemoSaleDetail(id: string): SaleDetail | null {
  const s = genSales().find(x => x.id === id);
  if (!s) return null;
  const { items, ...rest } = s;
  return { ...rest, items };
}
export { registers, products, employees, payments };


