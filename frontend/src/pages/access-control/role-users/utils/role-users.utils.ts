import { RoleUserItem } from '../../../../services/roleUserService';

export type RoleUsersTableRow = Record<string, unknown> & { id: number };

export const mapRoleUsersToRows = (users: RoleUserItem[]): RoleUsersTableRow[] =>
  users.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    departmentName: user.departmentName || '-',
    roleName: user.roleName || '-',
    roleId: user.roleId,
  }));
