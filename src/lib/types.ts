export type SyncStatus = 'updated' | 'pending' | 'error' | 'unknown';

export interface CashRegister {
  id: string;
  name: string;
  branch?: string;
  salesToday: number;
  ticketsToday: number;
  totalToday: number;
  lastSync: string;
  syncStatus: SyncStatus;
}

export interface SaleItem {
  productId: string;
  code: string;
  barcode?: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Sale {
  id: string;
  ticketNumber: string;
  date: string; // ISO date YYYY-MM-DD
  time: string; // HH:mm
  cashRegisterId: string;
  cashRegisterName?: string;
  branch?: string;
  cashier: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
}

export interface SaleDetail extends Sale {
  items: SaleItem[];
}

export interface Product {
  code: string;
  barcode?: string;
  name: string;
  category: string;
  price: number;
  cost?: number;
  stock?: number;
  unitsSold: number;
  revenue: number;
}

export interface Employee {
  id: string;
  name: string;
  cashRegister?: string;
  tickets: number;
  totalSales: number;
  avgTicket: number;
}

export interface PaymentBreakdown {
  method: string;
  count: number;
  total: number;
}

export interface DashboardSummary {
  today: number;
  yesterday: number;
  week: number;
  month: number;
  year: number;
  tickets: number;
  avgTicket: number;
  productsSold: number;
  estimatedProfit?: number;
  growthToday?: number;
  growthWeek?: number;
  growthMonth?: number;
}

export interface HourlyPoint { hour: string; value: number; }
export interface DailyPoint { date: string; value: number; }
export interface PeriodComparison { label: string; current: number; previous: number; }

export interface SaleFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  cashRegisterId?: string;
  cashier?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  sortField?: keyof Sale;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SalesResult {
  data: Sale[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DataSourceMeta {
  mode: 'DEMO' | 'API' | 'GOOGLE_SHEETS' | 'CUSTOM';
  lastSaleAt?: string;
  lastSyncAt?: string;
  lastFetchAt?: string;
  connected: boolean;
  message?: string;
}

export interface DateRange { from: string; to: string; }


