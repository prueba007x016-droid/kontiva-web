import type {
  SaleDetail, SalesResult, SaleFilters, Product, Employee,
  CashRegister, DashboardSummary, HourlyPoint, DailyPoint, PeriodComparison,
  PaymentBreakdown, DateRange, DataSourceMeta,
} from '../types';

export interface DataSource {
  meta(): Promise<DataSourceMeta>;
  refresh(): Promise<void>;
  getCashRegisters(): Promise<CashRegister[]>;
  getSales(filters: SaleFilters): Promise<SalesResult>;
  getSaleDetail(id: string): Promise<SaleDetail | null>;
  getProducts(search?: string, category?: string): Promise<Product[]>;
  getEmployees(range?: DateRange): Promise<Employee[]>;
  getDashboard(range?: DateRange): Promise<{
    summary: DashboardSummary;
    hourly: HourlyPoint[];
    daily: DailyPoint[];
    byRegister: { name: string; value: number }[];
    byPayment: PaymentBreakdown[];
    comparison: PeriodComparison[];
  }>;
  getAnalytics(range?: DateRange): Promise<{
    evolution: DailyPoint[];
    topDays: { date: string; value: number }[];
    topHours: { hour: string; value: number }[];
    topProducts: { name: string; value: number }[];
    registerShare: { name: string; value: number }[];
    avgTicketTrend: DailyPoint[];
    productShare: { name: string; value: number }[];
  }>;
  getReports(params: any): Promise<{ rows: any[]; columns: string[] }>;
}


