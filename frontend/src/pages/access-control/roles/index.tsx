import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DataTable } from '../../../components/DataTable';
import { TableColumn } from '../../../types';
import {
	PermissionItem,
	RoleOption,
	rolePermissionService,
} from '../../../services/rolePermissionService';

type PermissionGroup = {
	module: string;
	permissions: PermissionItem[];
};

type TableRow = Record<string, unknown> & { id: number };

const toLabel = (permission: PermissionItem) => {
	if (permission.name?.includes('.')) {
		const [module, action] = permission.name.split('.');
		return `${action.charAt(0).toUpperCase()}${action.slice(1)} ${module.charAt(0).toUpperCase()}${module.slice(1)}`;
	}

	return permission.action
		? `${permission.action.charAt(0).toUpperCase()}${permission.action.slice(1)} ${permission.module.charAt(0).toUpperCase()}${permission.module.slice(1)}`
		: permission.name;
};

const createExpandedModules = (items: PermissionItem[]) =>
	items.reduce<Record<string, boolean>>((accumulator, permission) => {
		accumulator[permission.module || 'General'] = false;
		return accumulator;
	}, {});

const RolesPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const isManagePage = location.pathname === '/roles/manage';
	const roleIdParam = Number(searchParams.get('roleId'));
	const editingRoleId = Number.isFinite(roleIdParam) && roleIdParam > 0 ? roleIdParam : null;

	const [roles, setRoles] = useState<RoleOption[]>([]);
	const [permissions, setPermissions] = useState<PermissionItem[]>([]);
	const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
	const [roleName, setRoleName] = useState('');
	const [roleDescription, setRoleDescription] = useState('');
	const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
	const [permissionSearch, setPermissionSearch] = useState('');
	const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const roleColumns = useMemo<TableColumn[]>(
		() => [
			{ key: 'name', label: 'Role' },
			{ key: 'description', label: 'Description', render: (row) => String(row.description || '-') },
		],
		[],
	);

	const roleRows = useMemo<TableRow[]>(() => roles.map((role) => ({ ...role })), [roles]);

	const groups = useMemo<PermissionGroup[]>(() => {
		const map = new Map<string, PermissionItem[]>();

		permissions.forEach((permission) => {
			const moduleName = permission.module || 'General';
			map.set(moduleName, [...(map.get(moduleName) || []), permission]);
		});

		return Array.from(map.entries())
			.map(([module, items]) => ({
				module,
				permissions: items.sort((a, b) => a.name.localeCompare(b.name)),
			}))
			.sort((a, b) => a.module.localeCompare(b.module));
	}, [permissions]);

	const moduleSummary = useMemo(
		() =>
			groups.map((group) => {
				const total = group.permissions.length;
				const selected = group.permissions.filter((permission) => selectedPermissions.includes(permission.id)).length;
				return { module: group.module, selected, total };
			}),
		[groups, selectedPermissions],
	);

	const filteredGroups = useMemo<PermissionGroup[]>(() => {
		const term = permissionSearch.trim().toLowerCase();
		if (!term) {
			return groups;
		}

		return groups
			.map((group) => ({
				module: group.module,
				permissions: group.permissions.filter((permission) => {
					const label = toLabel(permission).toLowerCase();
					return (
						group.module.toLowerCase().includes(term) ||
						permission.name.toLowerCase().includes(term) ||
						permission.action.toLowerCase().includes(term) ||
						label.includes(term)
					);
				}),
			}))
			.filter((group) => group.permissions.length > 0);
	}, [groups, permissionSearch]);

	useEffect(() => {
		const loadListPage = async () => {
			setLoading(true);
			try {
				const roleResponse = await rolePermissionService.listRoles();
				setRoles(roleResponse.data || []);
			} catch {
				toast.error('Failed to load roles');
			} finally {
				setLoading(false);
			}
		};

		if (!isManagePage) {
			void loadListPage();
		}
	}, [isManagePage]);

	useEffect(() => {
		const loadManagePage = async () => {
			setLoading(true);
			try {
				const [roleResponse, permissionResponse] = await Promise.all([
					rolePermissionService.listRoles(),
					rolePermissionService.listPermissions(),
				]);

				const roleData = roleResponse.data || [];
				const permissionData = permissionResponse.data || [];

				setRoles(roleData);
				setPermissions(permissionData);
				setExpandedModules(createExpandedModules(permissionData));

				if (!editingRoleId) {
					setSelectedRoleId(null);
					setRoleName('');
					setRoleDescription('');
					setSelectedPermissions([]);
					return;
				}

				const selectedRole = roleData.find((role) => role.id === editingRoleId);
				if (!selectedRole) {
					toast.error('Role not found');
					navigate('/roles', { replace: true });
					return;
				}

				setSelectedRoleId(editingRoleId);
				setRoleName(selectedRole.name || '');
				setRoleDescription(selectedRole.description || '');

				const permissionPayload = await rolePermissionService.getRolePermissions(editingRoleId);
				setSelectedPermissions(permissionPayload.data?.permissionIds || []);
			} catch {
				toast.error('Failed to load role and permissions');
			} finally {
				setLoading(false);
			}
		};

		if (isManagePage) {
			void loadManagePage();
		}
	}, [editingRoleId, isManagePage, navigate]);

	const togglePermission = (permissionId: number) => {
		setSelectedPermissions((current) =>
			current.includes(permissionId) ? current.filter((id) => id !== permissionId) : [...current, permissionId],
		);
	};

	const toggleModule = (modulePermissionIds: number[]) => {
		const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));

		setSelectedPermissions((current) => {
			if (allSelected) {
				return current.filter((id) => !modulePermissionIds.includes(id));
			}
			return [...new Set([...current, ...modulePermissionIds])];
		});
	};

	const toggleAll = () => {
		if (selectedPermissions.length === permissions.length) {
			setSelectedPermissions([]);
			return;
		}
		setSelectedPermissions(permissions.map((permission) => permission.id));
	};

	const handleDeleteRole = async (row: TableRow) => {
		if (!window.confirm('Delete role?')) {
			return;
		}

		try {
			await rolePermissionService.deleteRole(row.id);
			setRoles((current) => current.filter((role) => role.id !== row.id));
			toast.success('Role deleted');
		} catch {
			toast.error('Unable to delete role');
		}
	};

	const handleSave = async () => {
		if (!roleName.trim()) {
			toast.error('Role Name is required');
			return;
		}

		setSaving(true);

		try {
			if (selectedRoleId) {
				await rolePermissionService.updateRole(selectedRoleId, {
					name: roleName.trim(),
					description: roleDescription.trim(),
				});
				await rolePermissionService.updateRolePermissions(selectedRoleId, selectedPermissions);
				toast.success('Role updated');
			} else {
				await rolePermissionService.createRoleWithPermissions({
					name: roleName.trim(),
					description: roleDescription.trim(),
					permissionIds: selectedPermissions,
				});
				toast.success('Role created with permissions');
			}

			navigate('/roles');
		} catch {
			toast.error('Unable to save role permissions');
		} finally {
			setSaving(false);
		}
	};

	const openAddPage = () => {
		navigate('/roles/manage');
	};

	const openEditPage = (row: TableRow) => {
		navigate(`/roles/manage?roleId=${row.id}`);
	};

	if (loading) {
		return (
			<div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4 text-[15px] text-slate-700">
				{isManagePage ? 'Loading role permission matrix...' : 'Loading roles...'}
			</div>
		);
	}

	if (!isManagePage) {
		return (
			<div className="space-y-4">
				<div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div className="rounded-md border border-[#d9e0e4] bg-white px-4 py-2 text-sm font-medium text-slate-700">
							Total Roles: <span className="font-semibold text-slate-900">{roles.length}</span>
						</div>
						<button
							className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
							onClick={openAddPage}
						>
							Add Role
						</button>
					</div>
				</div>

				<DataTable
					columns={roleColumns}
					rows={roleRows}
					onEdit={openEditPage}
					onDelete={handleDeleteRole}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
				<div>
					<h2 className="text-[18px] font-semibold text-slate-900">
						{selectedRoleId ? 'Update Role' : 'Create Role'}
					</h2>
					<p className="text-[13px] text-slate-700">Manage role details and module permissions here.</p>
				</div>
				<button
					type="button"
					className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-semibold text-slate-800"
					onClick={() => navigate('/roles')}
				>
					Back
				</button>
			</div>

			<div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
				<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
					<div className="rounded-md border border-[#d9e0e4] bg-white p-4">
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">Total Roles</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{roles.length}</div>
					</div>
					<div className="rounded-md border border-[#d9e0e4] bg-white p-4">
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">
							Available Permissions
						</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{permissions.length}</div>
					</div>
					<div className="rounded-md border border-[#d9e0e4] bg-white p-4">
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">
							Selected Permissions
						</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{selectedPermissions.length}</div>
					</div>
					<div className="rounded-md border border-[#d9e0e4] bg-white p-4">
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">Visible Modules</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{filteredGroups.length}</div>
					</div>
				</div>
			</div>

			<div className="rounded-[10px] border border-[#b8c7c7] bg-[#f8fbfb] p-4">
				<div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
					<div className="space-y-4 rounded-md border border-[#d9e0e4] bg-white p-4">
						<h3 className="text-[18px] font-semibold text-slate-900">Role Details</h3>

						<label className="block">
							<span className="mb-2 block text-[14px] font-medium text-slate-800">Role Name *</span>
							<input
								className="h-[38px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-[14px] text-slate-900 outline-none"
								value={roleName}
								onChange={(event) => setRoleName(event.target.value)}
								placeholder="Enter role name"
							/>
						</label>

						<label className="block">
							<span className="mb-2 block text-[14px] font-medium text-slate-800">Description</span>
							<textarea
								className="min-h-[86px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-[14px] text-slate-900 outline-none"
								value={roleDescription}
								onChange={(event) => setRoleDescription(event.target.value)}
								placeholder="Enter role description"
							/>
						</label>

						<button
							className="w-full rounded-md bg-[#008c45] px-5 py-2.5 text-sm font-semibold text-white"
							disabled={saving}
							onClick={() => void handleSave()}
						>
							{saving ? 'Saving...' : selectedRoleId ? 'Update Role' : 'Create Role'}
						</button>

						<div className="overflow-hidden rounded-md border border-[#d9e0e4]">
							<div className="bg-[#eef4f6] px-3 py-2 text-[13px] font-semibold text-slate-800">Module Summary</div>
							<table className="min-w-full divide-y divide-[#e2e8ee] text-left text-[13px]">
								<thead className="bg-[#f8fbfb] text-slate-900">
									<tr>
										<th className="px-3 py-2 font-semibold">Module</th>
										<th className="px-3 py-2 font-semibold">Selected</th>
										<th className="px-3 py-2 font-semibold">Total</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#eef2f5] bg-white text-slate-800">
									{moduleSummary.map((item) => (
										<tr key={item.module}>
											<td className="px-3 py-2 capitalize">{item.module}</td>
											<td className="px-3 py-2">{item.selected}</td>
											<td className="px-3 py-2">{item.total}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="space-y-4 rounded-[10px] border border-[#d9e0e4] bg-white p-4 shadow-sm">
						<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
							<div>
								<h3 className="text-[20px] font-bold text-slate-900">Permission Matrix</h3>
								<p className="mt-1 text-[13px] text-slate-600">
									Assign module-wise permissions using grouped access controls.
								</p>
							</div>

							<button
								className="rounded-lg border border-[#d1d5db] bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
								onClick={toggleAll}
							>
								{selectedPermissions.length === permissions.length ? 'Unselect All' : 'Select All'}
							</button>
						</div>

						<div className="relative">
							<input
								className="h-[42px] w-full rounded-lg border border-[#d1d5db] bg-white px-4 pr-10 text-[14px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								placeholder="Search permissions by module, action, or name"
								value={permissionSearch}
								onChange={(event) => setPermissionSearch(event.target.value)}
							/>
							<span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
						</div>

						<div className="space-y-4">
							{filteredGroups.length ? (
								filteredGroups.map((group) => {
									const modulePermissionIds = group.permissions.map((permission) => permission.id);
									const moduleSelectedCount = modulePermissionIds.filter((id) => selectedPermissions.includes(id)).length;
									const moduleAllSelected =
										modulePermissionIds.length > 0 &&
										modulePermissionIds.every((id) => selectedPermissions.includes(id));
									const expanded = expandedModules[group.module] ?? false;

									return (
										<div
											key={group.module}
											className="rounded-[10px] border border-[#e1e8ec] bg-[#f8fbfb] p-4 shadow-sm"
										>
											<div className="flex items-center justify-between gap-4">
												<label className="flex cursor-pointer items-center gap-3">
													<input
														type="checkbox"
														className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[3px] border-2 border-slate-500 bg-transparent checked:border-blue-600 checked:bg-blue-600 checked:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_16_16%22_fill=%22white%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath_d=%22M12.207_4.793a1_1_0_010_1.414l-5_5a1_1_0_01-1.414_0l-2-2a1_1_0_011.414-1.414L6.5_9.086l4.293-4.293a1_1_0_011.414_0z%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
														checked={moduleAllSelected}
														onChange={() => toggleModule(modulePermissionIds)}
													/>

													<div>
														<div className="text-[15px] font-bold capitalize text-slate-900">{group.module}</div>
														<div className="mt-0.5 text-[12px] font-medium text-slate-500">
															{moduleSelectedCount} of {modulePermissionIds.length} permissions selected
														</div>
													</div>
												</label>

												<button
													type="button"
													className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
													onClick={() =>
														setExpandedModules((current) => ({
															...current,
															[group.module]: !expanded,
														}))
													}
													title={expanded ? 'Collapse' : 'Expand'}
												>
													<svg
														className={`h-5 w-5 transition-transform duration-200 ${
															expanded ? 'rotate-180' : 'rotate-0'
														}`}
														viewBox="0 0 20 20"
														fill="none"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															d="M5 7.5L10 12.5L15 7.5"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												</button>
											</div>

											{expanded ? (
												<div className="mt-4 rounded-[8px] border border-[#e5ebef] bg-white p-5 shadow-sm">
													<div className="mb-5 flex items-center justify-between gap-3">
														<h4 className="text-[18px] font-bold capitalize text-blue-600">{group.module}</h4>

														<button
															type="button"
															className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-[13px] font-bold text-slate-800 shadow-md transition hover:bg-slate-50"
															onClick={() => toggleModule(modulePermissionIds)}
														>
															<input
																type="checkbox"
																readOnly
																checked={moduleAllSelected}
																className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[3px] border-2 border-slate-500 bg-transparent checked:border-blue-600 checked:bg-blue-600 checked:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_16_16%22_fill=%22white%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath_d=%22M12.207_4.793a1_1_0_010_1.414l-5_5a1_1_0_01-1.414_0l-2-2a1_1_0_011.414-1.414L6.5_9.086l4.293-4.293a1_1_0_011.414_0z%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
															/>
															{moduleAllSelected ? 'Unselect All' : 'Select All'}
														</button>
													</div>

													<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
														{group.permissions.map((permission) => {
															const checked = selectedPermissions.includes(permission.id);

															return (
																<label
																	key={permission.id}
																	className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 text-[14px] font-medium text-slate-800 transition hover:border-blue-100 hover:bg-blue-50/50"
																>
																	<input
																		type="checkbox"
																		className="h-[18px] w-[18px] shrink-0 cursor-pointer appearance-none rounded-[3px] border-2 border-slate-500 bg-transparent checked:border-blue-600 checked:bg-blue-600 checked:bg-[url('data:image/svg+xml,%3Csvg_viewBox=%220_0_16_16%22_fill=%22white%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath_d=%22M12.207_4.793a1_1_0_010_1.414l-5_5a1_1_0_01-1.414_0l-2-2a1_1_0_011.414-1.414L6.5_9.086l4.293-4.293a1_1_0_011.414_0z%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat"
																		checked={checked}
																		onChange={() => togglePermission(permission.id)}
																	/>
																	<span>{toLabel(permission)}</span>
																</label>
															);
														})}
													</div>
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
				</div>
			</div>
		</div>
	);
};

export default RolesPage;
