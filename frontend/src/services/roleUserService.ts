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

export const roleUserService = {
  listRoleUsers: async () =>
    (await api.get<ApiResponse<RoleUserItem[]>>('/roles/users')).data,
  updateUserRole: async (userId: number, roleId: number) =>
    (await api.put<ApiResponse<{ userId: number; roleId: number; roleName: string }>>(`/roles/users/${userId}/role`, { roleId })).data,
  listRoles: async () =>
    (await api.get<{ success: boolean; data: RoleOption[] }>('/roles?limit=200')).data,
};
