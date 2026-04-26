import { MutableRefObject } from "react";
import { FullscreenIcon, MenuIcon } from "./icons";
import { IconProps } from "./types";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { ProfileMenu } from "./components/ProfileMenu";

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
              <Breadcrumbs items={breadcrumbItems} />
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

          <ProfileMenu
            profileMenuOpen={profileMenuOpen}
            setProfileMenuOpen={setProfileMenuOpen}
            profileMenuRef={profileMenuRef}
            user={user}
            onOpenProfile={onOpenProfile}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
};
