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
} as const;
