import { Modal } from '../../components/Modal';
import { ContentModalForm } from './ContentModalForm';
import { AssignmentModalForm } from './AssignmentModalForm';
import { SubmissionModalForm } from './SubmissionModalForm';
import { TestSeriesModalForm } from './TestSeriesModalForm';
import { LmsModalMode, LmsFormState, LmsItem, CourseRow } from './types';

interface LmsModalProps {
  open: boolean;
  mode: LmsModalMode | null;
  form: LmsFormState;
  editing: LmsItem | null;
  saving: boolean;
  courses: CourseRow[];
  moduleOptions: string[];
  onClose: () => void;
  onSave: () => Promise<void>;
  onFormChange: (key: keyof LmsFormState, value: any) => void;
}

const getModeTitle = (mode: LmsModalMode | null, editing: LmsItem | null): string => {
  if (mode === 'content') return `${editing ? 'Edit' : 'Add'} Content`;
  if (mode === 'assignment') return `${editing ? 'Edit' : 'Add'} Assignment`;
  if (mode === 'submission') return 'Check Assignment Submission';
  if (mode === 'testSeries') return `${editing ? 'Edit' : 'Add'} Test Series`;
  return '';
};

const getButtonLabel = (mode: LmsModalMode | null): string => {
  if (mode === 'content') return 'Content';
  if (mode === 'assignment') return 'Assignment';
  if (mode === 'submission') return 'Submission Review';
  if (mode === 'testSeries') return 'Test Series';
  return '';
};

export const LmsModal = ({
  open,
  mode,
  form,
  editing,
  saving,
  courses,
  moduleOptions,
  onClose,
  onSave,
  onFormChange,
}: LmsModalProps) => {
  const handleSave = async () => {
    await onSave();
  };

  return (
    <Modal
      open={open}
      title={getModeTitle(mode, editing)}
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
      {mode === 'content' ? (
        <ContentModalForm
          form={form}
          courses={courses}
          onChange={onFormChange}
        />
      ) : null}

      {mode === 'assignment' ? (
        <AssignmentModalForm
          form={form}
          courses={courses}
          moduleOptions={moduleOptions}
          onChange={onFormChange}
        />
      ) : null}

      {mode === 'submission' ? (
        <SubmissionModalForm
          form={form}
          item={editing}
          onChange={onFormChange}
        />
      ) : null}

      {mode === 'testSeries' ? (
        <TestSeriesModalForm
          form={form}
          courses={courses}
          onChange={onFormChange}
        />
      ) : null}
    </Modal>
  );
};
