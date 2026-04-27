export const CORE_PERMISSIONS = {
  roles: {
    read: 'roles.read',
    write: 'roles.write',
    remove: 'roles.delete',
  },
  users: {
    read: 'users.read',
    write: 'users.write',
    remove: 'users.delete',
  },
  roleUsers: {
    view: 'VIEW_ROLE_USER',
    manage: 'MANAGE_ROLE_USER',
  },
} as const;
