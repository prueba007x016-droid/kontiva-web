import { cn } from '../../lib/utils';
export function Input(props: any) { return <input className={cn('w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-kontiva-blue focus:ring-2 focus:ring-kontiva-blue/20 dark:bg-slate-900 dark:border-slate-700', props.className)} {...props} />; }
export function Select(props: any) { return <select className={cn('w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-kontiva-blue focus:ring-2 focus:ring-kontiva-blue/20 dark:bg-slate-900 dark:border-slate-700', props.className)} {...props} />; }
export function Badge({ color='slate', children, className }: any) {
  const colors: any = {
    green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    red: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', colors[color], className)}>{children}</span>;
}
export function Spinner({ className }: any) { return <div className={cn('h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-kontiva-navy', className)} />; }
export function EmptyState({ title, description }: any) {
  return <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-slate-400 mb-2">Sin datos</div>
    <div className="font-medium text-slate-700 dark:text-slate-200">{title}</div>
    <div className="text-sm text-slate-500 mt-1">{description}</div>
  </div>;
}
export function Modal({ open, onClose, title, children, footer }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 shadow-xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="overflow-auto p-5 flex-1">{children}</div>
        {footer && <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}


