import type { ReactNode } from 'react';

interface ChartPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  variant?: 'light' | 'dark';
  className?: string;
  contentClassName?: string;
}

export const ChartPanel = ({
  title,
  description,
  children,
  action,
  variant = 'light',
  className = '',
  contentClassName = '',
}: ChartPanelProps) => {
  const isDark = variant === 'dark';

  return (
    <section
      className={`min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5 ${
        isDark
          ? 'border-white/10 bg-slate-900 text-white'
          : 'border-slate-200 bg-white text-slate-900'
      } ${className}`}
    >
      <div
        className={`mb-4 flex min-w-0 flex-col gap-3 border-b pb-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between ${
          isDark ? 'border-white/10' : 'border-slate-100'
        }`}
      >
        <div className="min-w-0">
          <h3
            className={`truncate text-base font-semibold sm:text-lg ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
            title={title}
          >
            {title}
          </h3>

          {description ? (
            <p
              className={`mt-1 line-clamp-2 text-xs leading-5 sm:text-sm sm:leading-6 ${
                isDark ? 'text-slate-300' : 'text-slate-500'
              }`}
              title={description}
            >
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="flex shrink-0 items-center justify-start sm:justify-end">
            {action}
          </div>
        ) : null}
      </div>

      <div
        className={`min-w-0 overflow-hidden ${
          isDark ? 'text-slate-200' : 'text-slate-700'
        } ${contentClassName}`}
      >
        {children}
      </div>
    </section>
  );
};