export type PermissionPayload = {
  module: string;
  action: string;
  name: string;
  description?: string;
};

export type PermissionActionNode = {
  id: number;
  code: string;
  label: string;
};

export type PermissionPageNode = {
  label: string;
  actions: PermissionActionNode[];
};

export type PermissionModuleNode = {
  label: string;
  pages: PermissionPageNode[];
};

export type PermissionTreeResponse = {
  modules: PermissionModuleNode[];
};
