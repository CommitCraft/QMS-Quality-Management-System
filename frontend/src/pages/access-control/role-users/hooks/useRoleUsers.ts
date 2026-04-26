import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { roleUserService, RoleOption, RoleUserItem } from '../../../../services/roleUserService';

export const useRoleUsers = () => {
  const [users, setUsers] = useState<RoleUserItem[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        roleUserService.listRoleUsers(),
        roleUserService.listRoles(),
      ]);
      setUsers(usersResponse.data || []);
      setRoles(rolesResponse.data || []);
    } catch {
      toast.error('Failed to load role user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const updateUserRole = async (userId: number, roleId: number) => {
    setSavingUserId(userId);
    try {
      await roleUserService.updateUserRole(userId, roleId);
      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, roleId, roleName: roles.find((role) => role.id === roleId)?.name || null } : user,
        ),
      );
      toast.success('Role updated');
    } catch {
      toast.error('Unable to update role');
    } finally {
      setSavingUserId(null);
    }
  };

  return {
    users,
    roles,
    loading,
    savingUserId,
    updateUserRole,
  };
};
