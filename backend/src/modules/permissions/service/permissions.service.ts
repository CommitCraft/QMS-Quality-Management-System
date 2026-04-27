import { Permission } from '../../../models';
import { findPermissionMeta, PERMISSION_CATALOG } from '../../../common/constants/permissions';
import { PermissionActionNode, PermissionModuleNode, PermissionPageNode } from '../types/permissions.types';

export const permissionsCrudConfig = {
  path: '/permissions',
  entityName: 'permission',
  model: Permission,
  permissionBase: 'permissions',
  searchFields: ['module', 'action', 'name', 'description'],
};

export const buildPermissionTree = async () => {
  const permissions = await Permission.findAll({ order: [['module', 'ASC'], ['action', 'ASC'], ['name', 'ASC']] });
  const permissionMap = new Map(permissions.map((permission) => [permission.name, permission]));

  const modules: PermissionModuleNode[] = PERMISSION_CATALOG.map((module) => ({
    label: module.label,
    pages: module.pages
      .map<PermissionPageNode>((page) => ({
        label: page.label,
        actions: page.actions
          .map<PermissionActionNode | null>((action) => {
            const record = permissionMap.get(action.code);
            return record ? { id: record.id, code: record.name, label: action.label } : null;
          })
          .filter((action): action is PermissionActionNode => Boolean(action)),
      }))
      .filter((page) => page.actions.length > 0),
  })).filter((module) => module.pages.length > 0);

  return { modules };
};

export const getPermissionMeta = (code: string) => findPermissionMeta(code);
