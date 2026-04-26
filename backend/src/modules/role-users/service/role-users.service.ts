import { Role, User } from '../../../models';
import { AppError } from '../../../common/middleware';

export const listRoleUsers = async () => {
  const users = await User.findAll({
    include: [{ association: 'role' }, { association: 'department' }],
    order: [['name', 'ASC']],
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    roleName: user.role?.name || null,
    departmentName: user.department?.name || null,
  }));
};

export const assignUserRole = async (userId: number, roleId: number) => {
  const [user, role] = await Promise.all([User.findByPk(userId), Role.findByPk(roleId)]);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!role) {
    throw new AppError('Role not found', 404);
  }

  user.roleId = role.id;
  await user.save();

  return {
    userId: user.id,
    roleId: role.id,
    roleName: role.name,
  };
};
