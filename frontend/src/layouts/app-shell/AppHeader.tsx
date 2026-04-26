import { MutableRefObject } from "react";
import { NavLink } from "react-router-dom";
import { FullscreenIcon, MenuIcon, UserAvatarIcon } from "./icons";
import { IconProps } from "./types";

type Breadcrumb = {
  label: string;
  to: string;
};

type HeaderUser = {
  name?: string;
  email?: string;
  roleName?: string;
};

type AppHeaderProps = {
  ActiveIcon?: (props: IconProps) => JSX.Element;
  activeLabel: string;
  breadcrumbItems: Breadcrumb[];
  onOpenMobileMenu: () => void;
  onToggleFullscreen: () => void;
  profileMenuOpen: boolean;
  setProfileMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  profileMenuRef: MutableRefObject<HTMLDivElement | null>;
  user?: HeaderUser | null;
  onOpenProfile: () => void;
  onLogout: () => void;
};

export const AppHeader = ({
  ActiveIcon,
  activeLabel,
  breadcrumbItems,
  onOpenMobileMenu,
  onToggleFullscreen,
  profileMenuOpen,
  setProfileMenuOpen,
  profileMenuRef,
  user,
  onOpenProfile,
  onLogout,
}: AppHeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#d9e0e4] bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            className="grid h-10 w-10 place-items-center rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 xl:hidden"
            onClick={onOpenMobileMenu}
            title="Open menu"
          >
            <MenuIcon />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
              {ActiveIcon ? <ActiveIcon /> : <MenuIcon />}
            </span>

            <div>
              <div className="text-base font-bold tracking-wide text-slate-900">{activeLabel}</div>

              <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                {breadcrumbItems.map((crumb, index) => (
                  <span key={`${crumb.to}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span className="text-slate-400">/</span> : null}

                    {index === breadcrumbItems.length - 1 ? (
                      <span className="font-medium text-slate-700">{crumb.label}</span>
                    ) : (
                      <NavLink to={crumb.to} className="transition hover:text-blue-700">
                        {crumb.label}
                      </NavLink>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleFullscreen}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
            title="Fullscreen"
          >
            <FullscreenIcon />
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
              title={user?.name || "User"}
              onClick={() => setProfileMenuOpen((value) => !value)}
            >
              <UserAvatarIcon />
            </button>

            {profileMenuOpen ? (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#d9e0e4] bg-white p-1.5 shadow-xl">
                <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fbfb] px-3 py-2.5">
                  <div className="truncate text-sm font-semibold text-slate-900">{user?.name || "User"}</div>
                  <div className="truncate text-xs text-slate-500">{user?.email || "No email available"}</div>
                  <div className="mt-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">
                    {user?.roleName || "User"}
                  </div>
                </div>

                <div className="my-1 border-t border-[#e5e7eb]" />

                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  onClick={onOpenProfile}
                >
                  My Profile
                </button>

                <button
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                  onClick={onLogout}
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
