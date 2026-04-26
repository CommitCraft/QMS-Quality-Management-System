import { RoleOption, RoleUserItem } from '../../../../services/roleUserService';

export type RoleUsersState = {
  users: RoleUserItem[];
  roles: RoleOption[];
  loading: boolean;
  savingUserId: number | null;
};
