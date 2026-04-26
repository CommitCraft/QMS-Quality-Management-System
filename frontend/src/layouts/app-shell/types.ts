export type IconProps = {
  className?: string;
};

export type NavChild = {
  label: string;
  to: string;
  children?: NavChild[];
  requiredPermissions?: string[];
};

export type NavItem = {
  label: string;
  to?: string;
  icon: (props: IconProps) => JSX.Element;
  children?: NavChild[];
  requiredPermissions?: string[];
};

export type NavSection = {
  title: string;
  items: NavItem[];
};
