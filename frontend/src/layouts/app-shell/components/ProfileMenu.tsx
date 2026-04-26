import { MutableRefObject } from 'react';
import { UserAvatarIcon } from '../icons';

type HeaderUser = {
  name?: string;
  email?: string;
  roleName?: string;
};

type ProfileMenuProps = {
  profileMenuOpen: boolean;
  setProfileMenuOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  profileMenuRef: MutableRefObject<HTMLDivElement | null>;
  user?: HeaderUser | null;
  onOpenProfile: () => void;
  onLogout: () => void;
};

export const ProfileMenu = ({
  profileMenuOpen,
  setProfileMenuOpen,
  profileMenuRef,
  user,
  onOpenProfile,
  onLogout,
}: ProfileMenuProps) => {
  return (
    <div className="relative" ref={profileMenuRef}>
      <button
        className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-[#d1d5db] bg-white text-slate-700 shadow-sm transition hover:bg-slate-50"
        title={user?.name || 'User'}
        onClick={() => setProfileMenuOpen((value) => !value)}
      >
        <UserAvatarIcon />
      </button>

      {profileMenuOpen ? (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-[#d9e0e4] bg-white p-1.5 shadow-xl">
          <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fbfb] px-3 py-2.5">
            <div className="truncate text-sm font-semibold text-slate-900">{user?.name || 'User'}</div>
            <div className="truncate text-xs text-slate-500">{user?.email || 'No email available'}</div>
            <div className="mt-2 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">
              {user?.roleName || 'User'}
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
  );
};
