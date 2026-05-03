import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export const PageHeader = ({ title, description, action }: PageHeaderProps) => (
  <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 lg:flex-row lg:items-end lg:justify-between">
    <div>
      {/* <div className="text-xs uppercase tracking-[0.35em] text-copper-400">QMS</div> */}
      <h2 className="mt-2 text-3xl font-semibold text-black">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm text-steel-300">{description}</p>
    </div>
    {action}
  </div>
);
