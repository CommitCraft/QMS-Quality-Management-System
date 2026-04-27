import { api } from './api';
import { ApiResponse } from '../types';

export type RoleUserItem = {
  id: number;
  name: string;
  username: string;
  email: string;
  roleId: number;
  roleName: string | null;
  departmentName: string | null;
};

export type RoleOption = {
  id: number;
  name: string;
  description?: string | null;
};

export type RoleUserAssignment = {
  userId: number;
  roleId: number;
};

export type RoleUsersPageData = {
  roles: RoleOption[];
  users: RoleUserItem[];
};

export const roleUserService = {
  listRoleUsers: async () =>
    (await api.get<ApiResponse<RoleUserItem[]>>('/roles/users')).data,
  listRoles: async () =>
    (await api.get<ApiResponse<RoleOption[]>>('/roles/users/roles')).data,
  listUsers: async () =>
    (await api.get<ApiResponse<RoleUserItem[]>>('/roles/users/users')).data,
  listUsersByRole: async (roleId: number) =>
    (await api.get<ApiResponse<RoleUserItem[]>>(`/roles/users/${roleId}/users`)).data,
  updateUserRole: async (userId: number, roleId: number) =>
    (await api.put<ApiResponse<{ userId: number; roleId: number; roleName: string }>>(`/roles/users/${userId}/role`, { roleId })).data,
  assignUsersToRole: async (roleId: number, userIds: number[]) =>
    (await api.put<ApiResponse<{ roleId: number; roleName: string; userIds: number[] }>>(`/roles/users/${roleId}/users`, { userIds })).data,
  saveRoleUserMapping: async (roleId: number, assignments: RoleUserAssignment[]) =>
    (await api.put<ApiResponse<{ roleId: number; roleName: string; assignments: RoleUserAssignment[] }>>(`/roles/users/${roleId}/mapping`, { assignments })).data,
};
