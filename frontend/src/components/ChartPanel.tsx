import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const ChartPanel = ({ title, description, children }: ChartPanelProps) => (
  <div className="panel p-5">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description ? <p className="mt-1 text-sm text-steel-300">{description}</p> : null}
    </div>
    {children}
  </div>
);
