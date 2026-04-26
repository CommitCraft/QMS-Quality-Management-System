import { NavLink } from 'react-router-dom';

type Breadcrumb = {
  label: string;
  to: string;
};

type BreadcrumbsProps = {
  items: Breadcrumb[];
};

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => (
  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
    {items.map((crumb, index) => (
      <span key={`${crumb.to}-${index}`} className="flex items-center gap-2">
        {index > 0 ? <span className="text-slate-400">/</span> : null}

        {index === items.length - 1 ? (
          <span className="font-medium text-slate-700">{crumb.label}</span>
        ) : (
          <NavLink to={crumb.to} className="transition hover:text-blue-700">
            {crumb.label}
          </NavLink>
        )}
      </span>
    ))}
  </div>
);
