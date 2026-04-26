import { NavChild, NavItem, NavSection } from "./types";

export const getAllLinks = (items: NavItem[]): NavChild[] => {
  return items.flatMap((item) => {
    const ownLink = item.to ? [{ label: item.label, to: item.to }] : [];
    const childLinks = item.children || [];
    return [...ownLink, ...childLinks];
  });
};

export const normalizePath = (path: string) => {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
};

export const isPathActive = (pathname: string, to?: string) => {
  if (!to) {
    return false;
  }

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(to);

  if (targetPath === "/settings") {
    return currentPath === "/settings";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

export const shouldUseExactMatch = (allLinks: NavChild[], path?: string) => {
  if (!path) {
    return false;
  }

  return allLinks.some((item) => item.to !== path && item.to.startsWith(`${path}/`));
};

const hasRequiredPermission = (requiredPermissions: string[] | undefined, userPermissions: string[]) => {
  if (!requiredPermissions?.length) {
    return true;
  }

  return requiredPermissions.some((permission) => userPermissions.includes(permission));
};

export const filterNavSectionsByPermissions = (
  sections: NavSection[],
  permissions: string[] | undefined,
): NavSection[] => {
  if (!permissions?.length) {
    return sections;
  }

  return sections
    .map((section) => {
      const items: NavItem[] = section.items.reduce<NavItem[]>((accumulator, item) => {
        const filteredChildren = (item.children || []).filter((child) =>
          hasRequiredPermission(child.requiredPermissions, permissions),
        );

        const canSeeItem = hasRequiredPermission(item.requiredPermissions, permissions);
        const hasVisibleChildren = filteredChildren.length > 0;

        if (!canSeeItem) {
          return accumulator;
        }

        if (item.children?.length && !hasVisibleChildren && !item.to) {
          return accumulator;
        }

        accumulator.push({
          ...item,
          children: item.children ? filteredChildren : item.children,
        });

        return accumulator;
      }, []);

      return { ...section, items };
    })
    .filter((section) => section.items.length > 0);
};

export const getActiveItem = (allItems: NavItem[], pathname: string): NavItem | null => {
  if (!allItems.length) {
    return null;
  }

  const currentPath = pathname === "/" ? "/dashboard" : pathname;

  const directItem = allItems.find((item) => isPathActive(currentPath, item.to));
  if (directItem) {
    return directItem;
  }

  const parentItem = allItems.find((item) =>
    item.children?.some((child) => isPathActive(currentPath, child.to)),
  );

  return parentItem || allItems[0];
};

export const getBreadcrumbItems = (pathname: string) => {
  const currentPath = pathname === "/" ? "/dashboard" : pathname;
  const parts = currentPath.split("/").filter(Boolean);

  return [
    { label: "Home", to: "/dashboard" },
    ...parts.map((part, index) => {
      const to = `/${parts.slice(0, index + 1).join("/")}`;
      return {
        label: part.replace(/-/g, " ").replace(/^./, (value) => value.toUpperCase()),
        to,
      };
    }),
  ];
};
