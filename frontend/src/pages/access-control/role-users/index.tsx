import { useMemo } from 'react';
import { useRoleUsers } from './hooks/useRoleUsers';
import { mapRoleUsersToRows } from './utils/role-users.utils';
import { RoleUsersTable } from './components/RoleUsersTable';

const RoleUsersPage = () => {
  const { users, roles, loading, savingUserId, updateUserRole } = useRoleUsers();
  const rows = useMemo(() => mapRoleUsersToRows(users), [users]);

  return (
    <div className="space-y-4">
      <div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
        <h2 className="text-[18px] font-semibold text-slate-900">Role User Management</h2>
        <p className="text-[13px] text-slate-700">Assign and update role mappings for users.</p>
      </div>

      <RoleUsersTable
        rows={rows}
        roles={roles}
        savingUserId={savingUserId}
        onRoleChange={(userId, roleId) => void updateUserRole(userId, roleId)}
        loading={loading}
      />
    </div>
  );
};

export default RoleUsersPage;
