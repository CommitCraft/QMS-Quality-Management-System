import { Response } from 'express';
import { AuthenticatedRequest } from '../../../common/middleware';
import { assignUserRole, listRoleUsers } from '../service/role-users.service';

export const getRoleUsers = async (_req: AuthenticatedRequest, res: Response) => {
  const data = await listRoleUsers();
  res.json({ success: true, data });
};

export const updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const { roleId } = req.body as { roleId: number };

  const data = await assignUserRole(userId, Number(roleId));
  res.json({ success: true, data, message: 'User role updated successfully' });
};
