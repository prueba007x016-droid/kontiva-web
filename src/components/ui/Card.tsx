import { cn } from '../../lib/utils';
export function Card({ className, children, ...props }: any) {
  return <div className={cn('rounded-2xl bg-white shadow-card border border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 transition-shadow hover:shadow-lg', className)} {...props}>{children}</div>;
}
export function CardHeader({ className, children }: any) { return <div className={cn('px-5 pt-5 pb-2', className)}>{children}</div>; }
export function CardTitle({ className, children }: any) { return <h3 className={cn('text-base font-semibold text-slate-900 dark:text-slate-100', className)}>{children}</h3>; }
export function CardContent({ className, children }: any) { return <div className={cn('px-5 pb-5', className)}>{children}</div>; }


