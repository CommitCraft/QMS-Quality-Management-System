import { LmsFormState, LmsItem } from './types';

interface SubmissionModalFormProps {
  form: LmsFormState;
  item: LmsItem | null;
  onChange: (key: keyof LmsFormState, value: any) => void;
}

export const SubmissionModalForm = ({ form, item, onChange }: SubmissionModalFormProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[#d9e0e4] bg-[#f8fbfb] p-4 text-sm font-medium text-slate-700">
        <div className="mb-2 text-xs uppercase text-slate-500">Assignment</div>
        <div>{item?.assignment?.title || 'Submission Review'}</div>
      </div>

      <div className="rounded-lg border border-[#d9e0e4] bg-[#f8fbfb] p-4 text-sm text-slate-600">
        <div className="mb-2 flex justify-between">
          <span>Submitted By:</span>
          <span className="font-medium text-slate-900">{item?.employee?.name || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span>Submitted At:</span>
          <span className="font-medium text-slate-900">
            {item?.submittedAt
              ? new Date(item.submittedAt).toLocaleString()
              : '-'}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
          <select
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.submissionStatus}
            onChange={(e) => onChange('submissionStatus', e.target.value)}
          >
            <option value="submitted">Submitted</option>
            <option value="in_review">In Review</option>
            <option value="checked">Checked</option>
            <option value="failed">Failed</option>
            <option value="resubmit">Resubmit</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Marks Obtained</label>
          <input
            className="h-[42px] w-full rounded-md border border-[#d1d5db] bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            type="number"
            min={0}
            max={item?.assignment?.maxMarks || 100}
            value={form.marksObtained}
            onChange={(e) => onChange('marksObtained', e.target.value)}
            placeholder="0"
          />
          <p className="mt-1 text-xs text-slate-500">
            Out of {item?.assignment?.maxMarks || 100} marks
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-700">Feedback</label>
          <textarea
            className="min-h-[140px] w-full rounded-md border border-[#d1d5db] bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            value={form.feedback}
            onChange={(e) => onChange('feedback', e.target.value)}
            placeholder="Provide constructive feedback for the employee..."
          />
          <p className="mt-1 text-xs text-slate-500">
            Be specific and helpful in your feedback
          </p>
        </div>
      </div>
    </div>
  );
};
