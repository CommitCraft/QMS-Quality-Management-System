import { DragEvent, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { roleUserService, RoleOption, RoleUserAssignment, RoleUserItem } from '../../../services/roleUserService';

type RoleUserCard = RoleUserItem & {
  originalRoleId: number;
  currentRoleId: number;
};

const roleUserPageNote = "Note: In order to add a user to a role, please drag them from 'All Users' to 'Role Users'.";

const RoleUsersPage = () => {
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [users, setUsers] = useState<RoleUserCard[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draggingUserId, setDraggingUserId] = useState<number | null>(null);

  const fallbackRoleId = useMemo(() => {
    const employeeRole = roles.find((role) => role.name === 'Employee' && role.id !== selectedRoleId);
    if (employeeRole) {
      return employeeRole.id;
    }

    const anyOtherRole = roles.find((role) => role.id !== selectedRoleId);
    return anyOtherRole?.id ?? selectedRoleId;
  }, [roles, selectedRoleId]);

  const selectedRole = useMemo(() => roles.find((role) => role.id === selectedRoleId) || null, [roles, selectedRoleId]);
  const roleUsers = useMemo(() => users.filter((user) => user.currentRoleId === selectedRoleId), [users, selectedRoleId]);
  const allUsers = useMemo(() => users.filter((user) => user.currentRoleId !== selectedRoleId), [users, selectedRoleId]);

  const loadData = async (nextRoleId?: number | null) => {
    setLoading(true);
    try {
      const [rolesResponse, usersResponse] = await Promise.all([roleUserService.listRoles(), roleUserService.listUsers()]);
      const roleData = rolesResponse.data || [];
      const userData = usersResponse.data || [];
      const resolvedRoleId = nextRoleId ?? roleData[0]?.id ?? null;
      const assignedIds = resolvedRoleId ? new Set((await roleUserService.listUsersByRole(resolvedRoleId)).data?.map((user) => user.id) || []) : new Set<number>();

      setRoles(roleData);
      setSelectedRoleId(resolvedRoleId);
      setUsers(
        userData.map((user) => ({
          ...user,
          originalRoleId: user.roleId,
          currentRoleId: resolvedRoleId && assignedIds.has(user.id) ? resolvedRoleId : user.roleId,
        })),
      );
    } catch {
      toast.error('Failed to load role user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateUserRole = (userId: number, roleId: number) => {
    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, currentRoleId: roleId } : user)),
    );
  };

  const handleDragStart = (userId: number) => {
    setDraggingUserId(userId);
  };

  const handleDropToRoleUsers = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingUserId || !selectedRoleId) {
      return;
    }

    updateUserRole(draggingUserId, selectedRoleId);
    setDraggingUserId(null);
  };

  const handleDropToAllUsers = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!draggingUserId || fallbackRoleId == null) {
      return;
    }

    const user = users.find((item) => item.id === draggingUserId);
    if (!user) {
      setDraggingUserId(null);
      return;
    }

    const revertRoleId = user.originalRoleId !== selectedRoleId ? user.originalRoleId : fallbackRoleId;
    updateUserRole(draggingUserId, revertRoleId ?? user.currentRoleId);
    setDraggingUserId(null);
  };

  const handleSave = async () => {
    if (!selectedRoleId) {
      return;
    }

    const assignments: RoleUserAssignment[] = users
      .filter((user) => user.currentRoleId !== user.roleId)
      .map((user) => ({ userId: user.id, roleId: user.currentRoleId }));

    if (!assignments.length) {
      toast.success('No changes to save');
      return;
    }

    setSaving(true);
    try {
      await roleUserService.saveRoleUserMapping(selectedRoleId, assignments);
      toast.success('Role users updated');
      await loadData(selectedRoleId);
    } catch {
      toast.error('Unable to save role users');
    } finally {
      setSaving(false);
    }
  };

  const renderUserCard = (user: RoleUserCard) => (
    <button
      key={user.id}
      type="button"
      draggable
      onDragStart={() => handleDragStart(user.id)}
      onDragEnd={() => setDraggingUserId(null)}
      className="group flex w-full cursor-grab items-start justify-between gap-4 rounded-xl border border-[#dbe2e7] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md active:cursor-grabbing"
    >
      <div>
        <div className="text-[15px] font-semibold text-slate-900">{user.name}</div>
        <div className="mt-1 text-[13px] text-slate-600">{user.username}</div>
        <div className="mt-0.5 text-[12px] text-slate-500">{user.email}</div>
        <div className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {user.departmentName || 'No Department'}
        </div>
      </div>
      <div className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
        Current Role
        <div className="mt-1 text-[13px] font-semibold text-blue-700">{user.currentRoleId === selectedRoleId ? selectedRole?.name : roles.find((role) => role.id === user.currentRoleId)?.name || 'Unassigned'}</div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4 text-[15px] text-slate-700">
        Loading role user editor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <h2 className="text-[18px] font-semibold text-slate-900">Role User</h2>
        <p className="text-[13px] text-slate-700">Drag users between the two panels to stage role assignments.</p>
      </div>

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <div className="grid gap-3 md:grid-cols-[280px_1fr_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-[13px] font-semibold text-slate-800">Role</span>
            <select
              className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-[14px] text-slate-900 outline-none"
              value={selectedRoleId ?? ''}
              onChange={(event) => void loadData(Number(event.target.value))}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>

          <div className="text-[13px] text-slate-700 md:pb-1">
            {selectedRole ? `Managing users for ${selectedRole.name}` : 'Select a role to edit its members'}
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !selectedRoleId}
            className="h-[42px] rounded-lg bg-[#008c45] px-5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] px-4 py-3 text-[13px] text-slate-700">
        {roleUserPageNote}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div
          className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropToAllUsers}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[18px] font-semibold text-slate-900">All Users</h3>
              <p className="text-[13px] text-slate-600">Users not staged for the selected role</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[12px] font-semibold text-slate-700">{allUsers.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {allUsers.length ? allUsers.map(renderUserCard) : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Drop users here to move them out of the role.</div>}
          </div>
        </div>

        <div
          className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDropToRoleUsers}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[18px] font-semibold text-slate-900">Role Users</h3>
              <p className="text-[13px] text-slate-600">Users currently staged for the selected role</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-[12px] font-semibold text-blue-700">{roleUsers.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {roleUsers.length ? roleUsers.map(renderUserCard) : <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">Drag users here to add them to this role.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleUsersPage;
