import { Modal } from '../../components/Modal';
import { CourseRow, CourseFormState, DEFAULT_COURSE_FORM } from './types';

interface CourseFormModalProps {
  open: boolean;
  editing: CourseRow | null;
  form: CourseFormState;
  saving: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
  onFormChange: (key: keyof CourseFormState, value: string | boolean) => void;
}

export const CourseFormModal = ({
  open,
  editing,
  form,
  saving,
  onClose,
  onSave,
  onFormChange,
}: CourseFormModalProps) => {
  const handleSave = async () => {
    await onSave();
  };

  return (
    <Modal
      open={open}
      title={`${editing ? 'Edit' : 'Add'} Course`}
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            className="rounded-md border border-[#d1d5db] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Code</label>
          <input
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.code}
            onChange={(event) => onFormChange('code', event.target.value)}
            placeholder="TRN-001"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Title</label>
          <input
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.title}
            onChange={(event) => onFormChange('title', event.target.value)}
            placeholder="Course title"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Duration (minutes)</label>
          <input
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="number"
            min={0}
            value={form.duration}
            onChange={(event) => onFormChange('duration', event.target.value)}
            placeholder="90"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Category</label>
          <input
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.category}
            onChange={(event) => onFormChange('category', event.target.value)}
            placeholder="Compliance"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Instructor</label>
          <input
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.instructor}
            onChange={(event) => onFormChange('instructor', event.target.value)}
            placeholder="Instructor name"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.description}
            onChange={(event) => onFormChange('description', event.target.value)}
            placeholder="Course description"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.status}
            onChange={(event) => onFormChange('status', event.target.value as 'Active' | 'Inactive')}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-3 rounded-md border border-[#d1d5db] bg-white px-3 py-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.autoAssignToNewEmployee}
              onChange={(event) => onFormChange('autoAssignToNewEmployee', event.target.checked)}
            />
            Auto assign to new employee
          </label>
        </div>
      </div>
    </Modal>
  );
};
