import { IconProps } from "./types";

const iconClass = "h-[18px] w-[18px]";

export const DashboardIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 3h8v8H3V3Zm10 0h8v8h-8V3ZM3 13h8v8H3v-8Zm10 0h8v8h-8v-8Z" />
  </svg>
);

export const ClipboardIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M9 2h6a2 2 0 0 1 2 2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2-2Zm0 4h6V4H9v2Zm-1 6h8v-2H8v2Zm0 4h8v-2H8v2Z" />
  </svg>
);

export const ShieldIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2 4 5.5V11c0 5.2 3.4 9.7 8 11 4.6-1.3 8-5.8 8-11V5.5L12 2Z" />
  </svg>
);

export const ErrorIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z" />
  </svg>
);

export const FeedbackIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 4h16v12H7l-3 3V4Zm5 5h6V7H9v2Zm0 4h10v-2H9v2Z" />
  </svg>
);

export const WarningIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
  </svg>
);

export const TruckIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 5h12v10h2.5L20 11h-3V8h4l2 4v5h-2a3 3 0 0 1-6 0H9a3 3 0 0 1-6 0H1V7a2 2 0 0 1 2-2Zm3 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm12 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
  </svg>
);

export const SchoolIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-6 9.2V16c0 1.7 3 4 6 4s6-2.3 6-4v-3.8L12 15 6 12.2Z" />
  </svg>
);

export const ArticleIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 5h8V6H8v2Zm0 5h8v-2H8v2Zm0 5h6v-2H8v2Z" />
  </svg>
);

export const RepeatIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 7h10l-3-3 1.4-1.4L21.8 9l-6.4 6.4L14 14l3-3H7V7Zm10 10H7l3 3-1.4 1.4L2.2 15l6.4-6.4L10 10l-3 3h10v4Z" />
  </svg>
);

export const MergeIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M7 3h2v4.6c0 1.3.8 2.5 2 3l2 .9c2 .9 3.2 2.9 3.2 5V21h-2v-4.5c0-1.3-.8-2.5-2-3l-2-.9A5.4 5.4 0 0 1 7 7.6V3Zm8 0 4 4-4 4V8h-3V6h3V3ZM9 16v-3H7v3H4l4 4 4-4H9Z" />
  </svg>
);

export const BellIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm8-6v2H4v-2l2-2V9a6 6 0 1 1 12 0v5l2 2Z" />
  </svg>
);

export const FolderSharedIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M10 4 12 6h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6Zm5 12c2.2 0 4-1 4-2.2 0-1-1.2-1.7-2.6-2a2.5 2.5 0 1 0-2.8 0c-1.4.3-2.6 1-2.6 2 0 1.2 1.8 2.2 4 2.2Z" />
  </svg>
);

export const SettingsIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-2.6-1.5L14 2h-4l-.4 2.9A7.3 7.3 0 0 0 7 6.4l-2.5-1-2 3.5 2.1 1.6c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2.1 1.6 2 3.5 2.5-1a7.3 7.3 0 0 0 2.6 1.5L10 22h4l.4-2.9a7.3 7.3 0 0 0 2.6-1.5l2.5 1 2-3.5-2.1-1.6ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
  </svg>
);

export const ListIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M4 5h16v2H4V5Zm0 6h16v2H4v-2Zm0 6h16v2H4v-2Z" />
  </svg>
);

export const MenuIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const ChevronLeftIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M15 6 9 12l6 6" />
  </svg>
);

export const ChevronRightIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const CloseIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const BuildIcon = ({ className = iconClass }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M14.7 6.3a4 4 0 0 0 4.9 4.9l-9.2 9.2a2 2 0 1 1-2.8-2.8l9.2-9.2a4 4 0 0 0-4.9-4.9l2.1-2.1a4 4 0 0 1 .7 4.9z" />
    <circle cx="18" cy="6" r="2" />
  </svg>
);

export const FullscreenIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
  </svg>
);

export const UserAvatarIcon = ({ className = iconClass }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
