import { Op } from 'sequelize';
import { Permission, Role, RolePermission } from '../../../models';
import { AppError } from '../../../common/middleware';

export const rolesCrudConfig = {
  path: '/roles',
  entityName: 'role',
  model: Role,
  permissionBase: 'roles',
  searchFields: ['name', 'description'],
};

export const saveRoleWithPermissions = async (payload: {
  name: string;
  description?: string;
  permissionIds: number[];
}) => {
  const [role] = await Role.findOrCreate({
    where: { name: payload.name.trim() },
    defaults: { name: payload.name.trim(), description: payload.description?.trim() || null },
  });

  if (payload.description !== undefined) {
    role.description = payload.description?.trim() || null;
    await role.save();
  }

  const uniquePermissionIds = [...new Set(payload.permissionIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)))];

  if (uniquePermissionIds.length) {
    const count = await Permission.count({ where: { id: { [Op.in]: uniquePermissionIds } } });
    if (count !== uniquePermissionIds.length) {
      throw new AppError('One or more permission IDs are invalid', 400);
    }
  }

  await RolePermission.destroy({ where: { roleId: role.id } });
  if (uniquePermissionIds.length) {
    await RolePermission.bulkCreate(uniquePermissionIds.map((permissionId) => ({ roleId: role.id, permissionId })));
  }

  return Role.findByPk(role.id, {
    include: [{ association: 'permissions', attributes: ['id', 'module', 'action', 'name'] }],
  });
};

export const getRolePermissionMatrix = async (roleId: number) => {
  const role = await Role.findByPk(roleId, {
    include: [{ association: 'permissions', attributes: ['id', 'module', 'action', 'name'] }],
  });

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  return {
    roleId: role.id,
    roleName: role.name,
    permissionIds: (role.permissions || []).map((permission) => permission.id),
  };
};

export const updateRolePermissionMatrix = async (roleId: number, permissionIds: number[]) => {
  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  const uniquePermissionIds = [...new Set(permissionIds.map((id) => Number(id)).filter((id) => Number.isFinite(id)))];

  if (uniquePermissionIds.length) {
    const count = await Permission.count({ where: { id: { [Op.in]: uniquePermissionIds } } });
    if (count !== uniquePermissionIds.length) {
      throw new AppError('One or more permission IDs are invalid', 400);
    }
  }

  await RolePermission.destroy({ where: { roleId } });
  if (uniquePermissionIds.length) {
    await RolePermission.bulkCreate(uniquePermissionIds.map((permissionId) => ({ roleId, permissionId })));
  }
};
