import { useEffect, useState } from 'react';
import { getDataSource } from '../lib/data/provider';
import { useSettings } from '../store/settings';
import Topbar from '../components/layout/Topbar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input, Select, Badge } from '../components/ui/Form';
import { currency, number } from '../lib/utils';

export default function Products() {
  const ds = getDataSource();
  const refreshTick = useSettings().refreshTick;
  const [products, setProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todas');
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, m, all] = await Promise.all([ds.getProducts(search, category), ds.meta(), ds.getProducts()]);
    setProducts(p); setMeta(m); setAllProducts(all); setLoading(false);
  };
  useEffect(() => { load(); }, [search, category, refreshTick]);

  const categories = ['Todas', ...Array.from(new Set(allProducts.map(p => p.category)))];

  const sortedByUnits = [...products].sort((a, b) => b.unitsSold - a.unitsSold);
  const top = sortedByUnits.slice(0, 5);
  const bottom = [...products].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 5);
  const topRevenue = [...products].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div>
      <Topbar title="Productos" subtitle="Catálogo y desempeño de productos" onRefresh={load} lastUpdated={meta?.lastFetchAt} connected={meta?.connected} />
      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-3">
          <Input placeholder="Buscar por nombre o código" value={search} onChange={(e: any) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={category} onChange={(e: any) => setCategory(e.target.value)} className="w-48">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Código</th>
                    <th className="px-3 py-2 text-left">Código de barras</th>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Categoría</th>
                    <th className="px-3 py-2 text-right">Precio</th>
                    <th className="px-3 py-2 text-right">Costo</th>
                    <th className="px-3 py-2 text-right">Existencias</th>
                    <th className="px-3 py-2 text-right">Unidades vendidas</th>
                    <th className="px-3 py-2 text-right">Importe vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={9} className="text-center py-8 text-slate-400">Cargando...</td></tr> :
                    products.length === 0 ? <tr><td colSpan={9} className="text-center py-8 text-slate-400">Sin productos</td></tr> :
                    products.map(p => (
                      <tr key={p.code} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-3 py-2 font-medium">{p.code}</td>
                        <td className="px-3 py-2 text-slate-500">{p.barcode}</td>
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2">{p.category}</td>
                        <td className="px-3 py-2 text-right">{currency(p.price)}</td>
                        <td className="px-3 py-2 text-right">{p.cost != null ? currency(p.cost) : '—'}</td>
                        <td className="px-3 py-2 text-right">
                          {p.stock != null ? (
                            <Badge color={p.stock < 20 ? 'red' : p.stock < 40 ? 'amber' : 'green'}>{number(p.stock)}</Badge>
                          ) : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">{number(p.unitsSold)}</td>
                        <td className="px-3 py-2 text-right font-semibold">{currency(p.revenue)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Productos más vendidos</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {top.map(p => <li key={p.code} className="flex justify-between"><span>{p.name}</span><span className="font-medium">{number(p.unitsSold)} uds</span></li>)}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Productos menos vendidos</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {bottom.map(p => <li key={p.code} className="flex justify-between"><span>{p.name}</span><span className="font-medium">{number(p.unitsSold)} uds</span></li>)}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Mayor facturación</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {topRevenue.map(p => <li key={p.code} className="flex justify-between"><span>{p.name}</span><span className="font-medium">{currency(p.revenue)}</span></li>)}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Productos con poco inventario</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {products.filter(p => p.stock != null && p.stock < 30).map(p => (
                <li key={p.code} className="flex justify-between">
                  <span>{p.name}</span>
                  <Badge color="red">{number(p.stock)} unidades</Badge>
                </li>
              ))}
              {products.filter(p => p.stock != null && p.stock < 30).length === 0 && <li className="text-slate-500">Sin productos con poco inventario.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}




