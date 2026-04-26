import { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCompanyProfile } from "../hooks/useCompanyProfile";
import { AppHeader } from "./app-shell/AppHeader";
import { navSections } from "./app-shell/navConfig";
import {
  filterNavSectionsByPermissions,
  getActiveItem,
  getAllLinks,
  getBreadcrumbItems,
  shouldUseExactMatch,
} from "./app-shell/navUtils";
import { Sidebar } from "./app-shell/Sidebar";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { profile } = useCompanyProfile();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const allowedSections = useMemo(
    () => filterNavSectionsByPermissions(navSections, user?.permissions),
    [user?.permissions],
  );

  const navItems = useMemo(
    () => allowedSections.flatMap((section) => section.items),
    [allowedSections],
  );
  const allLinks = useMemo(() => getAllLinks(navItems), [navItems]);

  const activeItem = useMemo(() => getActiveItem(navItems, pathname), [navItems, pathname]);
  const ActiveIcon = activeItem?.icon;

  const breadcrumbItems = useMemo(() => getBreadcrumbItems(pathname), [pathname]);

  useEffect(() => {
    setOpenMenuLabel(activeItem?.children?.length ? activeItem.label : null);
  }, [activeItem]);

  const shouldUseExact = (path?: string) => shouldUseExactMatch(allLinks, path);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setProfileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#f3f6f8] text-slate-900">
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition xl:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div className="relative flex min-h-screen">
        <Sidebar
          navItems={navItems}
          pathname={pathname}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          openMenuLabel={openMenuLabel}
          setOpenMenuLabel={setOpenMenuLabel}
          shouldUseExactMatch={shouldUseExact}
          logoUrl={profile?.logoUrl}
          faviconUrl={profile?.faviconUrl}
        />

        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader
            ActiveIcon={ActiveIcon}
            activeLabel={activeItem?.label || "Dashboard"}
            breadcrumbItems={breadcrumbItems}
            onOpenMobileMenu={() => setMobileOpen(true)}
            onToggleFullscreen={toggleFullscreen}
            profileMenuOpen={profileMenuOpen}
            setProfileMenuOpen={setProfileMenuOpen}
            profileMenuRef={profileMenuRef}
            user={user}
            onOpenProfile={() => {
              setProfileMenuOpen(false);
              navigate("/settings/profile");
            }}
            onLogout={() => {
              setProfileMenuOpen(false);
              void logout();
            }}
          />

          <main className="relative flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
