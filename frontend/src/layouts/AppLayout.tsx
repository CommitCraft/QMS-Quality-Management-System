import { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCompanyProfile } from "../hooks/useCompanyProfile";

type IconProps = {
  className?: string;
};

const iconClass = "h-[18px] w-[18px]";

const DashboardIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
  </svg>
);

const ClipboardIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9 2h6a2 2 0 0 1 2 2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2-2Zm0 4h6V4H9v2Zm-1 6h8v-2H8v2Zm0 4h8v-2H8v2Z" />
  </svg>
);

const ShieldIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2 4 5.5V11c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5.5L12 2Z" />
  </svg>
);

const ErrorIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
  </svg>
);

const FeedbackIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 4h16v12H7l-3 3V4Zm5 5h6V7H9v2Zm0 4h10v-2H9v2Z" />
  </svg>
);

const WarningIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
  </svg>
);

const TruckIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 5h12v10h2.5L20 11h-3V8h4l2 4v5h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V7a2 2 0 0 1 2-2Zm3 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  </svg>
);

const SchoolIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-6 9.2V16c0 1.7 3 4 6 4s6-2.3 6-4v-3.8L12 15 6 12.2Z" />
  </svg>
);

const ArticleIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 5h8V6H8v2Zm0 5h8v-2H8v2Zm0 5h6v-2H8v2Z" />
  </svg>
);

const RepeatIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 7h10l-3-3 1.4-1.4L21.8 9l-6.4 6.4L14 14l3-3H7V7Zm10 10H7l3 3-1.4 1.4L2.2 15l6.4-6.4L10 10l-3 3h10v4Z" />
  </svg>
);

const MergeIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 3h2v4.6c0 1.3.8 2.5 2 3l2 .9c2 .9 3.2 2.9 3.2 5V21h-2v-4.5c0-1.3-.8-2.5-2-3l-2-.9A5.4 5.4 0 0 1 7 7.6V3Zm8 0 4 4-4 4V8h-3V6h3V3ZM9 16v-3H7v3H4l4 4 4-4H9Z" />
  </svg>
);

const BellIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6v2H4v-2l2-2V9a6 6 0 1 1 12 0v5l2 2Z" />
  </svg>
);

const FolderSharedIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10 4 12 6h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6Zm5 12c2.2 0 4-1 4-2.2 0-1-1.2-1.7-2.6-2a2.5 2.5 0 1 0-2.8 0c-1.4.3-2.6 1-2.6 2 0 1.2 1.8 2.2 4 2.2Z" />
  </svg>
);

const SettingsIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-2.6-1.5L14 2h-4l-.4 2.9A7.3 7.3 0 0 0 7 6.4l-2.5-1-2 3.5 2.1 1.6c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2.1 1.6 2 3.5 2.5-1a7.3 7.3 0 0 0 2.6 1.5L10 22h4l.4-2.9a7.3 7.3 0 0 0 2.6-1.5l2.5 1 2-3.5-2.1-1.6ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
  </svg>
);

const ListIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z" />
  </svg>
);

const MenuIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const ChevronLeftIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M15 6 9 12l6 6" />
  </svg>
);

const ChevronRightIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="m9 6 6 6-6 6" />
  </svg>
);

const CloseIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const BuildIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Wrench handle */}
    <path d="M14.7 6.3a4 4 0 0 0 4.9 4.9l-9.2 9.2a2 2 0 1 1-2.8-2.8l9.2-9.2a4 4 0 0 0-4.9-4.9l2.1-2.1a4 4 0 0 1 .7 4.9z" />
    
    {/* Small gear circle */}
    <circle cx="18" cy="6" r="2" />
  </svg>
);
const FullscreenIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
  </svg>
);

const UserAvatarIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

type NavChild = {
  label: string;
  to: string;
  children?: NavChild[];
};

type NavItem = {
  label: string;
  to?: string;
  icon: (props: IconProps) => JSX.Element;
  children?: NavChild[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: DashboardIcon },

      {
        label: "Audit",
        icon: ClipboardIcon,
        children: [
          { label: "Audit List", to: "/audit/audit-list" },
          { label: "Audit for Review", to: "/audit/audit-for-review" },
          { label: "Manage Audit Template", to: "/audit/audit-template" },
          { label: "Department", to: "/department" },
          { label: "Audit Logs", to: "/audit/logs" },
        ],
      },

      {
        label: "CAPA",
        icon: ShieldIcon,
        children: [
          { label: "CAPA Request", to: "/capa/requests" },
          {
            label: "Root Cause Methodology",
            to: "/capa/root-cause-methodology",
          },
          { label: "CAPA Request Logs", to: "/capa/request/logs" },
          { label: "My CAPA Actions", to: "/capa/actions" },
        ],
      },

      {
        label: "Non Conformance",
        icon: ErrorIcon,
        children: [
          { label: "List", to: "/nc/conformances" },
          { label: "Add New", to: "/nc/conformance/manage" },
          { label: "Non Conformance Logs", to: "/nc/conformance/logs" },
          { label: "Response Type", to: "/nc/conformance/response/type" },
        ],
      },

      {
        label: "Complaint",
        icon: FeedbackIcon,
        children: [
          { label: "List", to: "/complaint/list" },
          { label: "Add New", to: "/complaint/manage" },
          { label: "Complaint Type", to: "/complaint/types" },
          { label: "Complaint Logs", to: "/complaint/logs" },
          { label: "My Complaints", to: "/complaint/actions" },
        ],
      },

      {
        label: "Risk Management",
        icon: WarningIcon,
        children: [
          { label: "List", to: "/risk/list" },
          { label: "Add New", to: "/risk/manage" },
          { label: "Risk Category", to: "/risk/categories" },
          { label: "Risk Logs", to: "/risk/logs" },
          { label: "My Risks", to: "/risk/my-risk-list" },
        ],
      },

      // ✅ NEW 4M CHANGE MANAGEMENT MODULE
      {
        label: "4M Change",
        icon: BuildIcon, // Material UI icon suggestion
        children: [
          { label: "Change Request List", to: "/4m-change/list" },
          { label: "Create Change Request", to: "/4m-change/manage" },
          { label: "Category Setup", to: "/4m-change/categories" },
          { label: "Approval Workflow", to: "/4m-change/workflow" },
          { label: "Risk Assessment", to: "/4m-change/risk-assessment" },
          { label: "Validation Plan", to: "/4m-change/validation" },
          { label: "Implementation Tracker", to: "/4m-change/implementation" },
          { label: "My Change Actions", to: "/4m-change/actions" },
          { label: "Change Logs", to: "/4m-change/logs" },
          { label: "Reports", to: "/4m-change/reports" },
        ],
      },

      {
        label: "Supplier",
        icon: TruckIcon,
        children: [
          { label: "List", to: "/supplier/list" },
          { label: "Add New", to: "/supplier/manage" },
        ],
      },

      {
        label: "Training",
        icon: SchoolIcon,
        children: [
          { label: "Course", to: "/course/list" },
          { label: "My Courses", to: "/course/my-courses" },
          { label: "Assign Course", to: "/course/assign" },
          { label: "Course Summary", to: "/course/summary" },
        ],
      },

      {
        label: "Document Management",
        icon: ArticleIcon,
        children: [
          { label: "My Document View", to: "/assign/list-view" },
          { label: "My Folder View", to: "/assign/folder-view" },
          { label: "All Document View", to: "/documents/list-view" },
          { label: "All Folder View", to: "/documents/folder-view" },
          { label: "Folders", to: "/categories" },
          { label: "Deep Search", to: "/documents/deep-search" },
          { label: "AI Document Generator", to: "/ai-document-generator" },
          { label: "AI Generator List", to: "/ai-document-generator-list" },
          { label: "AI Prompt Templates", to: "/aiprompttemplate" },
          {
            label: "OCR Content Extractor",
            to: "/documents/ocr_content_extractor",
          },
          { label: "Bulk Document Upload", to: "/bulk-document-upload" },
          { label: "File Request Link", to: "/file-request" },
          { label: "Documents Audit Trail", to: "/document-audit-trails" },
          { label: "Recent Activity", to: "/recent-activity" },
          { label: "Archive Documents", to: "/archive-documents" },
          { label: "Archive Folders", to: "/archive-folders" },
          {
            label: "Archive Retention Period",
            to: "/archive-retention-period",
          },
          { label: "Document Status", to: "/document-status" },
        ],
      },

      {
        label: "Workflows",
        icon: RepeatIcon,
        children: [
          { label: "Workflow Setup Settings", to: "/workflow-settings" },
          { label: "All Workflows", to: "/workflows" },
          {
            label: "Request Doc via Workflow",
            to: "/request_document_through_workflow",
          },
          { label: "Workflow Logs", to: "/workflowlogs" },
        ],
      },

      { label: "My Workflows", to: "/current-workflow", icon: MergeIcon },
      { label: "Reminder", to: "/reminders", icon: BellIcon },
      { label: "Clients", to: "/client", icon: FolderSharedIcon },

      {
        label: "Access Control",
        icon: ShieldIcon,
        children: [
          { label: "Roles", to: "/roles" },
          { label: "Users", to: "/users" },
          { label: "Role User", to: "/roles/users" },
        ],
      },

      {
        label: "Settings",
        icon: SettingsIcon,
        children: [
          { label: "Email SMTP Settings", to: "/settings/smtp" },
          { label: "General Settings", to: "/settings" },
          { label: "Storage Settings", to: "/settings/storage" },
          { label: "Company Profile", to: "/settings/company-profile" },
        ],
      },

      {
        label: "Logs",
        icon: ListIcon,
        children: [
          { label: "Login Audits", to: "/login-audit" },
          { label: "Error Logs", to: "/logs" },
        ],
      },
    ],
  },
];

const getAllLinks = (items: NavItem[]): NavChild[] => {
  return items.flatMap((item) => {
    const ownLink = item.to ? [{ label: item.label, to: item.to }] : [];
    const childLinks = item.children || [];
    return [...ownLink, ...childLinks];
  });
};

const normalizePath = (path: string) => {
  if (!path || path === "/") {
    return "/";
  }

  return path.replace(/\/+$/, "");
};

const isPathActive = (pathname: string, to?: string) => {
  if (!to) {
    return false;
  }

  const currentPath = normalizePath(pathname);
  const targetPath = normalizePath(to);

  // Important:
  // /settings should match only /settings
  // otherwise it becomes active for /settings/smtp, /settings/storage, etc.
  if (targetPath === "/settings") {
    return currentPath === "/settings";
  }

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

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

  const allItems = navSections.flatMap((section) => section.items);
  const allLinks = getAllLinks(allItems);

  const activeItem = useMemo(() => {
    const currentPath = pathname === "/" ? "/dashboard" : pathname;

    const directItem = allItems.find((item) =>
      isPathActive(currentPath, item.to),
    );

    if (directItem) {
      return directItem;
    }

    const parentItem = allItems.find((item) =>
      item.children?.some((child) => isPathActive(currentPath, child.to)),
    );

    return parentItem || allItems[0];
  }, [allItems, pathname]);

  const ActiveIcon = activeItem.icon;

  useEffect(() => {
    setOpenMenuLabel(activeItem.children?.length ? activeItem.label : null);
  }, [activeItem]);

  const shouldUseExactMatch = (path?: string) => {
    if (!path) {
      return false;
    }

    return allLinks.some(
      (item) => item.to !== path && item.to.startsWith(`${path}/`),
    );
  };

  const breadcrumbItems = useMemo(() => {
    const currentPath = pathname === "/" ? "/dashboard" : pathname;
    const parts = currentPath.split("/").filter(Boolean);

    return [
      { label: "Home", to: "/dashboard" },
      ...parts.map((part, index) => {
        const to = `/${parts.slice(0, index + 1).join("/")}`;
        return {
          label: part
            .replace(/-/g, " ")
            .replace(/^./, (value) => value.toUpperCase()),
          to,
        };
      }),
    ];
  }, [pathname]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const Icon = item.icon;
    const hasChildren = !!item.children?.length;

    const isParentActive = hasChildren
      ? item.children?.some((child) => isPathActive(pathname, child.to))
      : isPathActive(pathname, item.to);

    const isOpen = openMenuLabel ? openMenuLabel === item.label : !!isParentActive;

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
            onClick={() => setOpenMenuLabel((current) => (current === item.label ? null : item.label))}
            title={collapsed && !isMobile ? item.label : undefined}
          >
            <span
              className={`flex items-center ${collapsed && !isMobile ? "" : "gap-4"}`}
            >
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
              <div className="mb-2 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#4351b8] bg-white rounded-md">
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
            collapsed && !isMobile
              ? "justify-center px-2 py-3"
              : "justify-between px-6 py-3.5"
          } ${
            isActive
              ? "bg-[#4351b8] text-white shadow-sm"
              : "text-[#e6e8ec] hover:bg-[#3a404d] hover:text-white"
          }`
        }
        onClick={() => setMobileOpen(false)}
        title={collapsed && !isMobile ? item.label : undefined}
      >
        <span
          className={`flex items-center ${collapsed && !isMobile ? "" : "gap-4"}`}
        >
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
        {/* Desktop Sidebar */}
        <aside
          className={`relative z-40 hidden shrink-0 overflow-visible bg-[#2f3440] px-3 py-3 xl:flex xl:flex-col xl:transition-all ${
            collapsed ? "xl:w-20" : "xl:w-[315px]"
          }`}
        >
          <div className="sticky top-0 z-20 mb-3 flex items-center justify-between bg-[#2f3440] py-1">
            {!collapsed ? (
              <div className="flex min-h-[48px] items-center">
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Company Logo"
                    className="h-[44px] w-auto object-contain"
                  />
                ) : (
                  <div className="text-xl font-bold text-white">QMS</div>
                )}
              </div>
            ) : (
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                {profile?.faviconUrl ? (
                  <img
                    src={profile.faviconUrl}
                    alt="Company Icon"
                    className="h-8 w-8 rounded-lg object-contain"
                  />
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
            {navSections
              .flatMap((section) => section.items)
              .map((item) => renderNavItem(item))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-0 top-0 z-50 flex h-screen w-[315px] flex-col bg-[#2f3440] px-3 py-3 transition-transform xl:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-3 flex min-h-[48px] items-center justify-between">
            {profile?.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt="Company Logo"
                className="h-[44px] w-auto object-contain"
              />
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
            {navSections
              .flatMap((section) => section.items)
              .map((item) => renderNavItem(item, true))}
          </nav>
        </aside>

        {/* Main Area */}
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[#d9e0e4] bg-white/95 px-4 py-3 shadow-sm backdrop-blur md:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 xl:hidden"
                  onClick={() => setMobileOpen(true)}
                  title="Open menu"
                >
                  <MenuIcon />
                </button>

                <div className="hidden items-center gap-3 sm:flex">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                    <ActiveIcon />
                  </span>

                  <div>
                    <div className="text-base font-bold tracking-wide text-slate-900">
                      {activeItem.label}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                      {breadcrumbItems.map((crumb, index) => (
                        <span
                          key={`${crumb.to}-${index}`}
                          className="flex items-center gap-2"
                        >
                          {index > 0 ? (
                            <span className="text-slate-400">/</span>
                          ) : null}

                          {index === breadcrumbItems.length - 1 ? (
                            <span className="font-medium text-slate-700">
                              {crumb.label}
                            </span>
                          ) : (
                            <NavLink
                              to={crumb.to}
                              className="transition hover:text-blue-700"
                            >
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
                  onClick={toggleFullscreen}
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
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {user?.name || "User"}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {user?.email || "No email available"}
                        </div>
                        <div className="mt-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">
                          {user?.roleName || "User"}
                        </div>
                      </div>

                      <div className="my-1 border-t border-[#e5e7eb]" />

                      <button
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          navigate("/settings/profile");
                        }}
                      >
                        My Profile
                      </button>

                      <button
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          void logout();
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="relative flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
