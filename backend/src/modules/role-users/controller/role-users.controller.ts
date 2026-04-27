import { Response } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware';
import {
  assignUserRole,
  assignUsersToRole,
  listRoleUsers,
  listRoles,
  listUsers,
  listUsersByRole,
  saveRoleUserMapping,
} from '../service/role-users.service';

export const getRoleUsers = async (_req: AuthenticatedRequest, res: Response) => {
  const data = await listRoleUsers();
  res.json({ success: true, data });
};

export const getRoleUsersRoles = async (_req: AuthenticatedRequest, res: Response) => {
  const data = await listRoles();
  res.json({ success: true, data });
};

export const getRoleUsersList = async (_req: AuthenticatedRequest, res: Response) => {
  const data = await listUsers();
  res.json({ success: true, data });
};

export const getUsersByRole = async (req: AuthenticatedRequest, res: Response) => {
  const roleId = Number(req.params.roleId);
  const data = await listUsersByRole(roleId);
  res.json({ success: true, data });
};

export const assignRoleUsers = async (req: AuthenticatedRequest, res: Response) => {
  const roleId = Number(req.params.roleId);
  const { userIds } = req.body as { userIds: number[] };

  const data = await assignUsersToRole(roleId, userIds);
  res.json({ success: true, data, message: 'Users assigned to role successfully' });
};

export const saveRoleUserAssignments = async (req: AuthenticatedRequest, res: Response) => {
  const roleId = Number(req.params.roleId);
  const { assignments } = req.body as { assignments: Array<{ userId: number; roleId: number }> };

  const data = await saveRoleUserMapping(roleId, assignments);
  res.json({ success: true, data, message: 'Role-user mapping saved successfully' });
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const { roleId } = req.body as { roleId: number };

  const data = await assignUserRole(userId, Number(roleId));
  res.json({ success: true, data, message: 'User role updated successfully' });
};
