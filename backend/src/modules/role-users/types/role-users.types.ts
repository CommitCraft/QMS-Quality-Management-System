export type RoleOption = {
  id: number;
  name: string;
  description: string | null;
};

export type RoleUserItem = {
  id: number;
  name: string;
  username: string;
  email: string;
  roleId: number;
  roleName: string | null;
  departmentName: string | null;
};

export type RoleUserAssignment = {
  userId: number;
  roleId: number;
};

export type RoleUsersPageData = {
  roles: RoleOption[];
  users: RoleUserItem[];
};
