interface StatusBadgeProps {
  value: string;
}

const formatStatusLabel = (value: string) =>
  value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const colorMap: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  inactive: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
  published: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  'not started': 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
  open: 'bg-red-500/15 text-red-200 ring-1 ring-red-500/30',
  closed: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30',
  draft: 'bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30',
  approved: 'bg-accent-500/15 text-accent-200 ring-1 ring-accent-500/30',
  'in progress': 'bg-copper-500/15 text-copper-200 ring-1 ring-copper-500/30',
  investigating: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
};

export const StatusBadge = ({ value }: StatusBadgeProps) => {
  const key = value.toLowerCase();
  const className = colorMap[key] || 'bg-white/10 text-white ring-1 ring-white/10';
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{formatStatusLabel(value)}</span>;
};
