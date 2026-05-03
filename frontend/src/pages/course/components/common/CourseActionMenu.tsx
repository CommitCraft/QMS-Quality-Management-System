import { CourseRow } from '../../types';

interface CourseActionMenuProps {
  isOpen: boolean;
  row: CourseRow;
  onEdit: (row: CourseRow) => void;
  onManageContent: (row: CourseRow) => void;
  onManageAssignments: (row: CourseRow) => void;
  onManageChecking: (row: CourseRow) => void;
  onManageTestSeries: (row: CourseRow) => void;
  onDelete: (row: CourseRow) => void;
  onClose: () => void;
}

export const CourseActionMenu = ({
  isOpen,
  row,
  onEdit,
  onManageContent,
  onManageAssignments,
  onManageChecking,
  onManageTestSeries,
  onDelete,
  onClose,
}: CourseActionMenuProps) => {
  if (!isOpen) return null;

  const actionClass = 'block w-full rounded px-3 py-2 text-left text-sm transition';

  const actions = [
    { label: 'Edit course', handler: onEdit, className: 'text-slate-700 hover:bg-slate-50' },
    { label: 'Manage content', handler: onManageContent, className: 'text-slate-700 hover:bg-slate-50' },
    { label: 'Manage assignments', handler: onManageAssignments, className: 'text-slate-700 hover:bg-slate-50' },
    { label: 'Assignment checking', handler: onManageChecking, className: 'text-slate-700 hover:bg-slate-50' },
    { label: 'Test series', handler: onManageTestSeries, className: 'text-slate-700 hover:bg-slate-50' },
    { label: 'Delete course', handler: onDelete, className: 'text-red-600 hover:bg-red-50' },
  ];

  return (
    <div
      className="absolute right-0 top-10 z-30 min-w-[240px] rounded-xl border border-[#d1d5db] bg-white p-2 shadow-xl"
      onClick={(event) => event.stopPropagation()}
    >
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={`${actionClass} ${action.className}`}
          onClick={() => {
            action.handler(row);
            onClose();
          }}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};
