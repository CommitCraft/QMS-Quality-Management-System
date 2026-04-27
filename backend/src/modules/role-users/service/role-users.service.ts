import { Op } from 'sequelize';
import { sequelize } from '../../../config/database';
import { AppError } from '../../../common/middleware';
import { Role, User } from '../../../models';
import { RoleOption, RoleUserAssignment, RoleUserItem } from '../types/role-users.types';

type UserEntity = InstanceType<typeof User>;

const mapUser = (user: UserEntity): RoleUserItem => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  roleId: user.roleId,
  roleName: user.role?.name || null,
  departmentName: user.department?.name || null,
});

const findRole = async (roleId: number) => {
  const role = await Role.findByPk(roleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  return role;
};

const findUser = async (userId: number) => {
  const user = await User.findByPk(userId, {
    include: [{ association: 'role' }, { association: 'department' }],
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  return user;
};

export const listRoles = async (): Promise<RoleOption[]> => {
  const roles = await Role.findAll({ order: [['name', 'ASC']] });
  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description,
  }));
};

export const listUsers = async (): Promise<RoleUserItem[]> => {
  const users = await User.findAll({
    include: [{ association: 'role' }, { association: 'department' }],
    order: [['name', 'ASC']],
  });

  return users.map(mapUser);
};

export const listRoleUsers = async () => listUsers();

export const listUsersByRole = async (roleId: number): Promise<RoleUserItem[]> => {
  await findRole(roleId);

  const users = await User.findAll({
    where: { roleId },
    include: [{ association: 'role' }, { association: 'department' }],
    order: [['name', 'ASC']],
  });

  return users.map(mapUser);
};

export const assignUsersToRole = async (roleId: number, userIds: number[]) => {
  const role = await findRole(roleId);
  const uniqueUserIds = Array.from(new Set(userIds));

  await sequelize.transaction(async (transaction) => {
    if (uniqueUserIds.length === 0) {
      return;
    }

    await User.update(
      { roleId: role.id },
      { where: { id: { [Op.in]: uniqueUserIds } }, transaction },
    );
  });

  return {
    roleId: role.id,
    roleName: role.name,
    userIds: uniqueUserIds,
  };
};

export const saveRoleUserMapping = async (roleId: number, assignments: RoleUserAssignment[]) => {
  const role = await findRole(roleId);
  const uniqueAssignments = new Map<number, number>();

  assignments.forEach((assignment) => {
    uniqueAssignments.set(assignment.userId, assignment.roleId);
  });

  const targetRoles = new Set<number>([role.id, ...uniqueAssignments.values()]);
  const roles = await Role.findAll({ where: { id: { [Op.in]: Array.from(targetRoles) } } });
  if (roles.length !== targetRoles.size) {
    throw new AppError('One or more roles were not found', 404);
  }

  await sequelize.transaction(async (transaction) => {
    for (const [userId, targetRoleId] of uniqueAssignments.entries()) {
      const user = await findUser(userId);
      user.roleId = targetRoleId;
      await user.save({ transaction });
    }
  });

  return {
    roleId: role.id,
    roleName: role.name,
    assignments: Array.from(uniqueAssignments.entries()).map(([userId, targetRoleId]) => ({ userId, roleId: targetRoleId })),
  };
};

export const assignUserRole = async (userId: number, roleId: number) => {
  const [user, role] = await Promise.all([findUser(userId), findRole(roleId)]);

  user.roleId = role.id;
  await user.save();

  return {
    userId: user.id,
    roleId: role.id,
    roleName: role.name,
  };
};
