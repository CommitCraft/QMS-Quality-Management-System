export type CreateUserPayload = {
  name: string;
  username: string;
  email: string;
  password: string;
  roleId: number;
  departmentId?: number;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;
