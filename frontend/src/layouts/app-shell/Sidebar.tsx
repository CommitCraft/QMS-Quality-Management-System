import { Dispatch, SetStateAction } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";
import { SidebarNavItem } from "./SidebarNavItem";
import { NavItem } from "./types";

type SidebarProps = {
  navItems: NavItem[];
  pathname: string;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: (value: boolean) => void;
  openMenuLabel: string | null;
  setOpenMenuLabel: Dispatch<SetStateAction<string | null>>;
  shouldUseExactMatch: (path?: string) => boolean;
  logoUrl?: string | null;
  faviconUrl?: string | null;
};

export const Sidebar = ({
  navItems,
  pathname,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  openMenuLabel,
  setOpenMenuLabel,
  shouldUseExactMatch,
  logoUrl,
  faviconUrl,
}: SidebarProps) => {
  return (
    <>
      <aside
        className={`relative z-40 hidden shrink-0 overflow-visible bg-[#2f3440] px-3 py-3 xl:flex xl:flex-col xl:transition-all ${
          collapsed ? "xl:w-20" : "xl:w-[315px]"
        }`}
      >
        <div className="sticky top-0 z-20 mb-3 flex items-center justify-between bg-[#2f3440] py-1">
          {!collapsed ? (
            <div className="flex min-h-[48px] items-center">
              {logoUrl ? (
                <img src={logoUrl} alt="Company Logo" className="h-[44px] w-auto object-contain" />
              ) : (
                <div className="text-xl font-bold text-white">QMS</div>
              )}
            </div>
          ) : (
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              {faviconUrl ? (
                <img src={faviconUrl} alt="Company Icon" className="h-8 w-8 rounded-lg object-contain" />
              ) : (
                <span className="text-sm font-bold text-white">Q</span>
              )}
            </div>
          )}

          <button
            className="absolute -right-7 top-2 z-[9999] grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-[#252a34] text-white shadow-lg transition hover:bg-[#3a404d]"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-visible pr-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
              isOpen={openMenuLabel ? openMenuLabel === item.label : false}
              setOpenMenuLabel={setOpenMenuLabel}
              setMobileOpen={setMobileOpen}
              shouldUseExactMatch={shouldUseExactMatch}
            />
          ))}
        </nav>
      </aside>

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[315px] flex-col bg-[#2f3440] px-3 py-3 transition-transform xl:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-3 flex min-h-[48px] items-center justify-between">
          {logoUrl ? (
            <img src={logoUrl} alt="Company Logo" className="h-[44px] w-auto object-contain" />
          ) : (
            <div className="text-xl font-bold text-white">QMS</div>
          )}

          <button
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
            onClick={() => setMobileOpen(false)}
            title="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => (
            <SidebarNavItem
              key={`mobile-${item.label}`}
              item={item}
              collapsed={false}
              isMobile
              pathname={pathname}
              isOpen={openMenuLabel ? openMenuLabel === item.label : false}
              setOpenMenuLabel={setOpenMenuLabel}
              setMobileOpen={setMobileOpen}
              shouldUseExactMatch={shouldUseExactMatch}
            />
          ))}
        </nav>
      </aside>
    </>
  );
};
