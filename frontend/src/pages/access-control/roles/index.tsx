import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DataTable } from '../../../components/DataTable';
import { TableColumn } from '../../../types';
import {
	RoleOption,
	rolePermissionService,
} from '../../../services/rolePermissionService';
import { PermissionMatrix } from './components/PermissionMatrix';

type TableRow = Record<string, unknown> & { id: number };

const RolesPage = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();

	const isManagePage = location.pathname === '/roles/manage';
	const roleIdParam = Number(searchParams.get('roleId'));
	const editingRoleId = Number.isFinite(roleIdParam) && roleIdParam > 0 ? roleIdParam : null;

	const [roles, setRoles] = useState<RoleOption[]>([]);
	const [permissions, setPermissions] = useState<number[]>([]);
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
				const roleResponse = await rolePermissionService.listRoles();

				const roleData = roleResponse.data || [];

				setRoles(roleData);
				setPermissions([]);
				setExpandedModules({});

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
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">Selected Permissions</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{selectedPermissions.length}</div>
					</div>
					<div className="rounded-md border border-[#d9e0e4] bg-white p-4">
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">Mode</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{selectedRoleId ? 'Edit' : 'Create'}</div>
					</div>
					<div className="rounded-md border border-[#d9e0e4] bg-white p-4">
						<div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-900">Status</div>
						<div className="mt-1 text-[24px] font-semibold text-slate-900">{saving ? 'Saving' : 'Ready'}</div>
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
					</div>

					<PermissionMatrix selectedPermissions={selectedPermissions} onChange={setSelectedPermissions} />
				</div>
			</div>
		</div>
	);
};

export default RolesPage;
