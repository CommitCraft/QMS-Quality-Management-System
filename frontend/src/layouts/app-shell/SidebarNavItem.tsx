import { Dispatch, SetStateAction } from "react";
import { NavLink } from "react-router-dom";
import { ChevronRightIcon } from "./icons";
import { isPathActive } from "./navUtils";
import { NavItem } from "./types";

type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
  isMobile?: boolean;
  pathname: string;
  isOpen: boolean;
  setOpenMenuLabel: Dispatch<SetStateAction<string | null>>;
  setMobileOpen: (value: boolean) => void;
  shouldUseExactMatch: (path?: string) => boolean;
};

export const SidebarNavItem = ({
  item,
  collapsed,
  isMobile = false,
  pathname,
  isOpen,
  setOpenMenuLabel,
  setMobileOpen,
  shouldUseExactMatch,
}: SidebarNavItemProps) => {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;

  const isParentActive = hasChildren
    ? item.children?.some((child) => isPathActive(pathname, child.to))
    : isPathActive(pathname, item.to);

  if (hasChildren) {
    return (
      <div key={item.label} className="relative">
        <button
          type="button"
          className={`group flex w-full items-center rounded-[8px] text-[16px] font-semibold tracking-wide transition ${
            collapsed && !isMobile
              ? "justify-center px-2 py-3"
              : "justify-between px-6 py-3.5"
          } ${
            isParentActive
              ? "bg-[#4351b8] text-white shadow-sm"
              : "text-[#e6e8ec] hover:bg-[#3a404d] hover:text-white"
          }`}
          onClick={() =>
            setOpenMenuLabel((current) => (current === item.label ? null : item.label))
          }
          title={collapsed && !isMobile ? item.label : undefined}
        >
          <span className={`flex items-center ${collapsed && !isMobile ? "" : "gap-4"}`}>
            <span className="grid h-6 w-6 place-items-center text-white">
              <Icon className="h-[18px] w-[18px]" />
            </span>

            {collapsed && !isMobile ? null : (
              <span className="whitespace-nowrap">{item.label}</span>
            )}
          </span>

          {collapsed && !isMobile ? null : (
            <ChevronRightIcon
              className={`h-[18px] w-[18px] text-white/90 transition-transform duration-200 ${
                isOpen ? "rotate-90" : "rotate-0"
              }`}
            />
          )}

          {collapsed && !isMobile ? (
            <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#2f3440] px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
              {item.label}
            </span>
          ) : null}
        </button>

        {collapsed && !isMobile && isOpen ? (
          <div className="absolute left-[calc(100%+12px)] top-0 z-50 w-64 rounded-xl border border-white/10 bg-[#2f3440] p-2 shadow-2xl">
            <div className="mb-2 rounded-md bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4351b8]">
              {item.label}
            </div>

            <div className="space-y-1">
              {item.children?.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end={child.to === "/settings"}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-[#4351b8] text-white shadow-sm"
                        : "text-[#cfd3dc] hover:bg-[#3a404d] hover:text-white"
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          </div>
        ) : null}

        {!(collapsed && !isMobile) && isOpen ? (
          <div className="mt-1 space-y-1 pl-[58px]">
            {item.children?.map((child) => (
              <NavLink
                key={child.to}
                to={child.to}
                end={child.to === "/settings"}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-[14px] font-medium transition ${
                    isActive
                      ? "bg-[#3f4bb0] text-white"
                      : "text-[#cfd3dc] hover:bg-[#3a404d] hover:text-white"
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <NavLink
      key={item.to}
      to={item.to || "#"}
      end={shouldUseExactMatch(item.to)}
      className={({ isActive }) =>
        `group relative flex items-center rounded-[8px] text-[16px] font-semibold tracking-wide transition ${
          collapsed && !isMobile ? "justify-center px-2 py-3" : "justify-between px-6 py-3.5"
        } ${
          isActive
            ? "bg-[#4351b8] text-white shadow-sm"
            : "text-[#e6e8ec] hover:bg-[#3a404d] hover:text-white"
        }`
      }
      onClick={() => setMobileOpen(false)}
      title={collapsed && !isMobile ? item.label : undefined}
    >
      <span className={`flex items-center ${collapsed && !isMobile ? "" : "gap-4"}`}>
        <span className="grid h-6 w-6 place-items-center text-white">
          <Icon className="h-[18px] w-[18px]" />
        </span>

        {collapsed && !isMobile ? null : (
          <span className="whitespace-nowrap">{item.label}</span>
        )}
      </span>

      {collapsed && !isMobile ? null : (
        <ChevronRightIcon className="h-[18px] w-[18px] text-white/90" />
      )}

      {collapsed && !isMobile ? (
        <span className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#2f3440] px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition group-hover:opacity-100">
          {item.label}
        </span>
      ) : null}
    </NavLink>
  );
};
