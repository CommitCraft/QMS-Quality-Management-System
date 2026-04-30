import { TableColumn } from '../types';
import { Spinner } from './Spinner';

type TableRow = Record<string, unknown> & { id: number };

interface DataTableProps {
  columns: TableColumn[];
  rows: TableRow[];
  loading?: boolean;
  onEdit?: (row: TableRow) => void;
  onDelete?: (row: TableRow) => void;
  onRowClick?: (row: TableRow) => void;
}

export const DataTable = ({
  columns,
  rows,
  loading,
  onEdit,
  onDelete,
  onRowClick,
}: DataTableProps) => {
  const colSpan = columns.length + (onEdit || onDelete ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-md border border-[#d9e0e4] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e2e8ee] text-left text-sm">
          <thead className="bg-[#eef4f6] text-xs uppercase tracking-[0.12em] text-slate-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800"
                >
                  {column.label}
                </th>
              ))}

              {(onEdit || onDelete) && (
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-slate-800">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eef2f5] bg-white">
            {loading ? (
              <tr>
                <td colSpan={colSpan} className="px-4 py-12 text-center">
                  <Spinner />
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row, index) => (
                <tr
                  key={`${String(row.id ?? index)}`}
                  onClick={() => onRowClick?.(row)}
                  className={`transition hover:bg-[#f8fbfb] ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="whitespace-nowrap px-4 py-3 align-top text-[14px] text-slate-800"
                    >
                      {column.render ? column.render(row) : String(row[column.key] ?? '-')}
                    </td>
                  ))}

                  {(onEdit || onDelete) && (
                    <td
                      className="whitespace-nowrap px-4 py-3"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className="flex flex-wrap gap-2">
                        {onEdit && (
                          <button
                            className="rounded-md border border-[#d1d5db] bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                            onClick={() => onEdit(row)}
                          >
                            Edit
                          </button>
                        )}

                        {onDelete && (
                          <button
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                            onClick={() => onDelete(row)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={colSpan}
                  className="px-4 py-12 text-center text-sm font-medium text-slate-500"
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};