export const currency = (value: number | undefined | null) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(value ?? 0);

export const number = (value: number | undefined | null) =>
  new Intl.NumberFormat('es-MX').format(value ?? 0);

export const percent = (value: number | undefined | null) => `${(value ?? 0).toFixed(1)}%`;

export const formatDate = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

export const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ');


