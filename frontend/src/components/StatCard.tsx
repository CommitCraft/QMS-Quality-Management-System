interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  tone?: 'accent' | 'copper' | 'neutral';
}

const toneClasses = {
  accent: 'from-accent-500/25 to-accent-500/5 text-accent-400',
  copper: 'from-copper-500/25 to-copper-500/5 text-copper-400',
  neutral: 'from-white/10 to-white/5 text-white',
};

export const StatCard = ({ title, value, subtext, tone = 'neutral' }: StatCardProps) => {
  return (
    <div className="panel border-white/10 bg-gradient-to-br p-5" style={{ backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))` }}>
      <div className={`inline-flex rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${toneClasses[tone]}`}>{title}</div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      {subtext ? <div className="mt-2 text-sm text-steel-300">{subtext}</div> : null}
    </div>
  );
};
