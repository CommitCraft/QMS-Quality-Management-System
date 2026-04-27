import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { rolePermissionService, PermissionActionNode, PermissionModuleNode, PermissionPageNode } from '../../../../services/rolePermissionService';

const normalize = (value: string) => value.trim().toLowerCase();

const CRUD_ACTIONS = {
  CREATE: /^ADD_/i,
  READ: /^VIEW_/i,
  UPDATE: /^EDIT_/i,
  DELETE: /^DELETE_/i,
  MANAGE: /^MANAGE_/i,
} as const;

type ActionType = keyof typeof CRUD_ACTIONS;

const getActionType = (code: string): ActionType | null => {
  for (const [type, pattern] of Object.entries(CRUD_ACTIONS)) {
    if (pattern.test(code)) {
      return type as ActionType;
    }
  }
  return null;
};

const matchesSearch = (module: PermissionModuleNode, page: PermissionPageNode, term: string) => {
  const normalized = normalize(term);
  if (!normalized) {
    return true;
  }

  const baseMatch = [module.label, page.label].some((value) => normalize(value).includes(normalized));
  if (baseMatch) {
    return true;
  }

  return page.actions.some((action) => [action.label, action.code].some((value) => normalize(value).includes(normalized)));
};

const ACTION_COLUMNS: Array<{ type: ActionType; label: string }> = [
  { type: 'CREATE', label: 'Create' },
  { type: 'READ', label: 'Read' },
  { type: 'UPDATE', label: 'Update' },
  { type: 'DELETE', label: 'Delete' },
];

type PermissionMatrixProps = {
  selectedPermissions: number[];
  onChange: (permissionIds: number[]) => void;
};

const Checkbox = ({
  checked,
  indeterminate,
  onChange,
  title,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  title?: string;
}) => {
  const [ref, setRef] = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (ref) {
      ref.indeterminate = Boolean(indeterminate);
    }
  }, [ref, indeterminate]);

  return (
    <input
      ref={setRef}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      title={title}
      className="h-[18px] w-[18px] cursor-pointer appearance-none rounded-[3px] border-2 border-slate-500 bg-transparent checked:border-blue-600 checked:bg-blue-600 checked:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_16_16%22_fill=%22white%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath_d=%22M12.207_4.793a1_1_0_010_1.414l-5_5a1_1_0_01-1.414_0l-2-2a1_1_0_011.414-1.414L6.5_9.086l4.293-4.293a1_1_0_011.414_0z%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
    />
  );
};

const buildSelection = (ids: number[], shouldSelect: boolean, selected: number[]) => {
  if (shouldSelect) {
    return [...new Set([...selected, ...ids])];
  }

  return selected.filter((id) => !ids.includes(id));
};

export const PermissionMatrix = ({ selectedPermissions, onChange }: PermissionMatrixProps) => {
  const [tree, setTree] = useState<PermissionModuleNode[]>([]);
  const [search, setSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      setLoading(true);
      try {
        const response = await rolePermissionService.listPermissions();
        const modules = response.data?.modules || [];
        setTree(modules);
        setExpandedModules(
          modules.reduce<Record<string, boolean>>((accumulator, module) => {
            accumulator[module.label] = false;
            return accumulator;
          }, {}),
        );
      } catch {
        toast.error('Failed to load permissions');
      } finally {
        setLoading(false);
      }
    };

    void loadPermissions();
  }, []);

  const filteredTree = useMemo(() => {
    const term = normalize(search);
    if (!term) {
      return tree;
    }

    return tree
      .map((module) => {
        if (normalize(module.label).includes(term)) {
          return module;
        }

        const pages = module.pages.filter((page) => matchesSearch(module, page, term));
        return { ...module, pages };
      })
      .filter((module) => module.pages.length > 0);
  }, [search, tree]);

  const allActionIds = useMemo(
    () => tree.flatMap((module) => module.pages.flatMap((page) => page.actions.map((action) => action.id))),
    [tree],
  );

  const totalSelected = selectedPermissions.filter((id) => allActionIds.includes(id)).length;
  const allSelected = allActionIds.length > 0 && totalSelected === allActionIds.length;

  const handleActionToggle = (actionId: number) => {
    onChange(selectedPermissions.includes(actionId) ? selectedPermissions.filter((id) => id !== actionId) : [...selectedPermissions, actionId]);
  };

  const togglePage = (pageIds: number[]) => {
    const shouldSelect = pageIds.some((id) => !selectedPermissions.includes(id));
    onChange(buildSelection(pageIds, shouldSelect, selectedPermissions));
  };

  const toggleModule = (moduleIds: number[]) => {
    const shouldSelect = moduleIds.some((id) => !selectedPermissions.includes(id));
    onChange(buildSelection(moduleIds, shouldSelect, selectedPermissions));
  };

  const expandAllVisibleModules = () => {
    setExpandedModules((current) => {
      const next = { ...current };
      filteredTree.forEach((module) => {
        next[module.label] = true;
      });
      return next;
    });
  };

  const collapseAllVisibleModules = () => {
    setExpandedModules((current) => {
      const next = { ...current };
      filteredTree.forEach((module) => {
        next[module.label] = false;
      });
      return next;
    });
  };

  const getActionByType = (page: PermissionPageNode, type: ActionType) => {
    if (type === 'UPDATE') {
      const editAction = page.actions.find((action) => getActionType(action.code) === 'UPDATE');
      if (editAction) {
        return editAction;
      }

      return page.actions.find((action) => getActionType(action.code) === 'MANAGE');
    }

    return page.actions.find((action) => getActionType(action.code) === type);
  };

  if (loading) {
    return <div className="rounded-[10px] border border-[#d9e0e4] bg-white p-4 text-sm text-slate-600">Loading permissions...</div>;
  }

  return (
    <div className="space-y-4 rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-[20px] font-bold text-slate-900">Permission Matrix</h3>
          <p className="mt-1 text-[13px] text-slate-600">Assign module-wise permissions using grouped access controls.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[13px] text-slate-600">
            {totalSelected} of {allActionIds.length} selected
          </div>
          <button
            type="button"
            className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={expandAllVisibleModules}
          >
            Expand All
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#d1d5db] bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={collapseAllVisibleModules}
          >
            Collapse All
          </button>
          <button
            type="button"
            className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            onClick={() => onChange(allSelected ? [] : allActionIds)}
          >
            {allSelected ? 'Unselect All' : 'Select All'}
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 pr-10 text-[14px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Search by module, page, action, or code"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
      </div>

      <div className="space-y-4">
        {filteredTree.length ? (
          filteredTree.map((module) => {
            const moduleActionIds = module.pages.flatMap((page) => page.actions.map((action) => action.id));
            const moduleSelectedCount = moduleActionIds.filter((id) => selectedPermissions.includes(id)).length;
            const moduleAllSelected = moduleActionIds.length > 0 && moduleSelectedCount === moduleActionIds.length;
            const moduleSomeSelected = moduleSelectedCount > 0 && moduleSelectedCount < moduleActionIds.length;
            const expanded = expandedModules[module.label] ?? false;

            return (
              <div key={module.label} className="rounded-[10px] border border-[#e1e8ec] bg-[#f8fbfb] p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <Checkbox checked={moduleAllSelected} indeterminate={moduleSomeSelected} onChange={() => toggleModule(moduleActionIds)} title={`Select all permissions for ${module.label}`} />
                    <div>
                      <div className="text-[15px] font-bold text-slate-900">{module.label}</div>
                      <div className="mt-0.5 text-[12px] font-medium text-slate-500">
                        {moduleSelectedCount} of {moduleActionIds.length} permissions selected
                      </div>
                    </div>
                  </label>

                  <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    onClick={() =>
                      setExpandedModules((current) => ({
                        ...current,
                        [module.label]: !expanded,
                      }))
                    }
                    title={expanded ? 'Collapse' : 'Expand'}
                    aria-label={`${expanded ? 'Collapse' : 'Expand'} ${module.label}`}
                  >
                    <svg className={`h-5 w-5 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {expanded ? (
                  <div className="mt-4 space-y-4 rounded-[8px] border border-[#e5ebef] bg-white p-5 shadow-sm">
                    {module.pages.map((page) => {
                      const pageIds = page.actions.map((action) => action.id);
                      const pageSelectedCount = pageIds.filter((id) => selectedPermissions.includes(id)).length;
                      const pageAllSelected = pageIds.length > 0 && pageSelectedCount === pageIds.length;
                      const pageSomeSelected = pageSelectedCount > 0 && pageSelectedCount < pageIds.length;
                      const isVisible = page.actions.length > 0;

                      if (!isVisible) {
                        return null;
                      }

                      return (
                        <div key={page.label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <label className="flex cursor-pointer items-center gap-3">
                              <Checkbox checked={pageAllSelected} indeterminate={pageSomeSelected} onChange={() => togglePage(pageIds)} title={`Select all permissions for ${page.label}`} />
                              <div>
                                <div className="text-[14px] font-semibold text-slate-900">{page.label}</div>
                                <div className="text-[12px] text-slate-500">
                                  {pageSelectedCount} of {pageIds.length} actions selected
                                </div>
                              </div>
                            </label>

                            <button
                              type="button"
                              className="rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[12px] font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
                              onClick={() => togglePage(pageIds)}
                            >
                              {pageAllSelected ? 'Unselect All' : 'Select All'}
                            </button>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse text-left">
                              <thead>
                                <tr className="border-b border-slate-200 bg-white">
                                  <th className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Action Code</th>
                                  {ACTION_COLUMNS.map((column) => (
                                    <th key={column.type} className="px-3 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500" title={column.label}>
                                      {column.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-b border-slate-100 bg-white">
                                  <td className="px-3 py-2 text-[12px] font-medium text-slate-700">{page.label}</td>
                                  {ACTION_COLUMNS.map((column) => {
                                    const action = getActionByType(page, column.type);

                                    if (!action) {
                                      return (
                                        <td key={column.type} className="px-3 py-2 text-center text-[12px] text-slate-300">
                                          -
                                        </td>
                                      );
                                    }

                                    const checked = selectedPermissions.includes(action.id);
                                    return (
                                      <td key={column.type} className="px-3 py-2 text-center">
                                        <div className="inline-flex items-center justify-center" title={`${column.label}: ${action.code}`}>
                                          <Checkbox checked={checked} onChange={() => handleActionToggle(action.id)} title={`${column.label}: ${action.code}`} />
                                        </div>
                                      </td>
                                    );
                                  })}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })
        ) : (
          <div className="rounded-lg border border-[#d9e0e4] bg-[#fbfdfd] px-4 py-10 text-center text-sm font-medium text-slate-600">
            No permissions match your search.
          </div>
        )}
      </div>
    </div>
  );
};
