import { DataTable } from '../../../../components/DataTable';
import { TableColumn } from '../../../../types';
import { RoleOption } from '../../../../services/roleUserService';
import { RoleUsersTableRow } from '../utils/role-users.utils';

type RoleUsersTableProps = {
  rows: RoleUsersTableRow[];
  roles: RoleOption[];
  savingUserId: number | null;
  onRoleChange: (userId: number, roleId: number) => void;
  loading?: boolean;
};

export const RoleUsersTable = ({ rows, roles, savingUserId, onRoleChange, loading }: RoleUsersTableProps) => {
  const columns: TableColumn[] = [
    { key: 'name', label: 'Name' },
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'departmentName', label: 'Department' },
    {
      key: 'roleName',
      label: 'Assigned Role',
      render: (row) => {
        const rowId = Number(row.id);
        const currentRoleId = Number(row.roleId);
        const disabled = savingUserId === rowId;

        return (
          <select
            className="h-[34px] min-w-[180px] rounded-md border border-[#d1d5db] bg-white px-2 text-[13px] text-slate-900"
            value={currentRoleId}
            disabled={disabled}
            onChange={(event) => onRoleChange(rowId, Number(event.target.value))}
          >
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        );
      },
    },
  ];

  return <DataTable columns={columns} rows={rows} loading={loading} />;
};
