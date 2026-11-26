import { cn } from '../../lib/utils';

export function Button({ variant='primary', size='md', className, children, ...props }: any) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes: any = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-base' };
  const variants: any = {
    primary: 'bg-gradient-to-r from-kontiva-blue to-kontiva-green text-white shadow-md hover:shadow-lg hover:brightness-110',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...props}>{children}</button>;
}
export default Button;


