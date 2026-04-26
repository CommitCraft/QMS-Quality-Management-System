import { User } from '../../../models';
import { hashPassword } from '../../../common/utils';

export const usersCrudConfig = {
  path: '/users',
  entityName: 'user',
  model: User,
  permissionBase: 'users',
  searchFields: ['name', 'username', 'email', 'mobile'],
  transformCreate: async (payload: Record<string, unknown>) => ({
    ...payload,
    password: await hashPassword(String(payload.password)),
  }),
  transformUpdate: async (payload: Record<string, unknown>) => {
    if (payload.password) {
      return { ...payload, password: await hashPassword(String(payload.password)) };
    }
    return payload;
  },
  include: [{ association: 'role' }, { association: 'department' }],
};
