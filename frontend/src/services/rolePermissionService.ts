import { api } from './api';
import { ApiResponse } from '../types';

export interface RoleOption {
  id: number;
  name: string;
  description?: string | null;
}

export interface PermissionItem {
  id: number;
  module: string;
  action: string;
  name: string;
}

export const rolePermissionService = {
  listRoles: async () => (await api.get<{ success: boolean; data: RoleOption[] }>('/roles?limit=200')).data,
  listPermissions: async () => (await api.get<{ success: boolean; data: PermissionItem[] }>('/permissions?limit=1000')).data,
  getRolePermissions: async (roleId: number) =>
    (await api.get<ApiResponse<{ roleId: number; roleName: string; permissionIds: number[] }>>(`/roles/${roleId}/permissions`)).data,
  createRoleWithPermissions: async (payload: { name: string; description?: string; permissionIds: number[] }) =>
    (await api.post<ApiResponse<unknown>>('/roles/with-permissions', payload)).data,
  updateRole: async (roleId: number, payload: { name: string; description?: string }) =>
    (await api.put<ApiResponse<unknown>>(`/roles/${roleId}`, payload)).data,
  deleteRole: async (roleId: number) => (await api.delete<ApiResponse<null>>(`/roles/${roleId}`)).data,
  updateRolePermissions: async (roleId: number, permissionIds: number[]) =>
    (await api.put<ApiResponse<unknown>>(`/roles/${roleId}/permissions`, { permissionIds })).data,
};
