import { useMemo } from 'react';
import { DataTable } from '../../components/DataTable';
import { CourseRow, formatDate } from './types';

interface CourseTableProps {
  rows: CourseRow[];
  loading: boolean;
  onEdit: (row: CourseRow) => void;
  onDelete: (row: CourseRow) => void;
  onContent: (row: CourseRow) => void;
  onAssignments: (row: CourseRow) => void;
  onChecking: (row: CourseRow) => void;
  onTestSeries: (row: CourseRow) => void;
}

export const CourseTable = ({
  rows,
  loading,
  onEdit,
  onDelete,
  onContent,
  onAssignments,
  onChecking,
  onTestSeries,
}: CourseTableProps) => {
  const columns = useMemo(
    () => [
      { key: 'code', label: 'Code', width: '120px' },
      { key: 'title', label: 'Title', width: '280px' },
      { key: 'category', label: 'Category', width: '140px' },
      { key: 'instructor', label: 'Instructor', width: '160px' },
      {
        key: 'createdAt',
        label: 'Created Date',
        width: '140px',
        render: (item: Record<string, unknown>) => formatDate(item.createdAt as string),
      },
      {
        key: 'autoAssign',
        label: 'Auto Assign',
        width: '120px',
        render: (item: Record<string, unknown>) =>
          String((item as any).autoAssignToNewEmployee || (item as any).autoAssign ? 'Yes' : 'No'),
      },
    ],
    []
  );

  const handleActionClick = (row: CourseRow, action: string) => {
    switch (action) {
      case 'edit':
        onEdit(row);
        break;
      case 'content':
        onContent(row);
        break;
      case 'assignments':
        onAssignments(row);
        break;
      case 'checking':
        onChecking(row);
        break;
      case 'tests':
        onTestSeries(row);
        break;
      case 'delete':
        onDelete(row);
        break;
    }
  };

  return (
    <div className="overflow-x-auto rounded-md border border-[#d9e0e4] bg-white">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#eef4f6] text-slate-700">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: (col as any).width }}
                className="border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em]"
              >
                {col.label}
              </th>
            ))}
            <th className="border-b border-[#d9e0e4] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="border-b border-[#d9e0e4] px-4 py-8 text-center text-slate-500">
                Loading...
              </td>
            </tr>
          ) : rows.length ? (
            rows.map((row) => (
              <tr key={row.id} className="border-b border-[#eef2f5] transition hover:bg-[#f8fbfb]">
                {columns.map((col) => {
                  const value = (row as any)[col.key];
                  const rendered = (col as any).render ? (col as any).render(row) : value || '-';
                  return (
                    <td key={col.key} className="border-b border-[#eef2f5] px-4 py-3 text-slate-700">
                      {rendered}
                    </td>
                  );
                })}
                <td className="border-b border-[#eef2f5] px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="Manage Content"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-slate-600 transition hover:bg-slate-50"
                      onClick={() => handleActionClick(row, 'content')}
                    >
                      📄
                    </button>
                    <button
                      type="button"
                      title="Manage Assignments"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-slate-600 transition hover:bg-slate-50"
                      onClick={() => handleActionClick(row, 'assignments')}
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      title="Check Submissions"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-slate-600 transition hover:bg-slate-50"
                      onClick={() => handleActionClick(row, 'checking')}
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      title="Manage Test Series"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-slate-600 transition hover:bg-slate-50"
                      onClick={() => handleActionClick(row, 'tests')}
                    >
                      ⚡
                    </button>
                    <button
                      type="button"
                      title="Edit"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-slate-600 transition hover:bg-slate-50"
                      onClick={() => handleActionClick(row, 'edit')}
                    >
                      ✎️
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#d1d5db] bg-white text-red-600 transition hover:bg-red-50"
                      onClick={() => handleActionClick(row, 'delete')}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + 1} className="border-b border-[#d9e0e4] px-4 py-8 text-center text-slate-500">
                No courses found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
